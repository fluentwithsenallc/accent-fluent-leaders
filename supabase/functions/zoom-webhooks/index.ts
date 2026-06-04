import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type ZoomWebhookBody = {
  event?: string;
  event_ts?: number;
  payload?: {
    plainToken?: string;
    object?: {
      id?: number | string;
      uuid?: string;
    };
  };
};

type LiveSessionRow = {
  id: string;
  status: "scheduled" | "live" | "completed" | "cancelled" | "no_show";
  recording_url: string | null;
  session_notes: string | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

async function hmacSha256Hex(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyZoomSignature(req: Request, rawBody: string, secretToken: string) {
  const timestamp = req.headers.get("x-zm-request-timestamp");
  const receivedSignature = req.headers.get("x-zm-signature");
  if (!timestamp || !receivedSignature) return false;

  const computedSignature = `v0=${await hmacSha256Hex(
    secretToken,
    `v0:${timestamp}:${rawBody}`,
  )}`;
  return timingSafeEqual(computedSignature, receivedSignature);
}

function shouldDeleteSession(session: LiveSessionRow) {
  return session.status !== "completed" && !session.recording_url && !session.session_notes?.trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody) as ZoomWebhookBody;
    const secretToken = Deno.env.get("ZOOM_WEBHOOK_SECRET_TOKEN");
    if (!secretToken) {
      throw new Error("Missing Zoom webhook secret token.");
    }

    if (!(await verifyZoomSignature(req, rawBody, secretToken))) {
      return jsonResponse({ error: "Invalid Zoom webhook signature." }, 401);
    }

    if (body.event === "endpoint.url_validation") {
      const plainToken = body.payload?.plainToken;
      if (!plainToken) return jsonResponse({ error: "Missing plainToken." }, 400);

      return jsonResponse({
        plainToken,
        encryptedToken: await hmacSha256Hex(secretToken, plainToken),
      });
    }

    if (body.event !== "meeting.deleted") {
      return jsonResponse({ ok: true, ignored: true, event: body.event ?? null });
    }

    const meetingId = body.payload?.object?.id ? String(body.payload.object.id) : null;
    if (!meetingId) {
      return jsonResponse({ ok: true, ignored: true, reason: "Missing meeting id." });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase server configuration.");
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: sessions, error: sessionsError } = await adminClient
      .from("live_sessions")
      .select("id, status, recording_url, session_notes")
      .eq("zoom_meeting_id", meetingId);
    if (sessionsError) throw sessionsError;

    const matchedSessions = (sessions ?? []) as LiveSessionRow[];
    if (!matchedSessions.length) {
      return jsonResponse({ ok: true, event: body.event, meetingId, matched: 0 });
    }

    const deleteIds = matchedSessions.filter(shouldDeleteSession).map((session) => session.id);
    const preserveSessions = matchedSessions.filter((session) => !shouldDeleteSession(session));

    if (deleteIds.length) {
      const { error: deleteError } = await adminClient.from("live_sessions").delete().in("id", deleteIds);
      if (deleteError) throw deleteError;
    }

    for (const session of preserveSessions) {
      const nextStatus = session.status === "completed" ? "completed" : "cancelled";
      const { error: updateError } = await adminClient
        .from("live_sessions")
        .update({
          status: nextStatus,
          zoom_meeting_id: null,
          zoom_join_url: null,
          zoom_start_url: null,
          zoom_password: null,
        })
        .eq("id", session.id);
      if (updateError) throw updateError;
    }

    return jsonResponse({
      ok: true,
      event: body.event,
      meetingId,
      matched: matchedSessions.length,
      deleted: deleteIds.length,
      preserved: preserveSessions.length,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Zoom webhook failed." },
      400,
    );
  }
});
