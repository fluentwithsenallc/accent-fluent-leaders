type ZoomMeetingBody = {
  action: "create" | "update" | "delete";
  meetingId?: string;
  topic?: string;
  startTime?: string;
  duration?: number;
  timezone?: string;
};

type ZoomMeetingResponse = {
  uuid?: string;
  id?: number | string;
  host_id?: string;
  host_email?: string;
  topic?: string;
  type?: number;
  status?: string;
  start_time?: string;
  duration?: number;
  timezone?: string;
  created_at?: string;
  start_url?: string;
  join_url?: string;
  chat_join_url?: string;
  password?: string;
  h323_password?: string;
  pstn_password?: string;
  encrypted_password?: string;
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

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }
  return value.trim();
}

function requiredDuration(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error("duration must be a positive number.");
  }
  return Math.round(value);
}

async function parseZoomError(response: Response) {
  const text = await response.text();
  try {
    const json = JSON.parse(text) as { message?: string; code?: number };
    return json.message ?? `Zoom API error ${response.status}`;
  } catch {
    return text || `Zoom API error ${response.status}`;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    const zoomToken = Deno.env.get("ZOOM_BEARER_TOKEN");
    if (!zoomToken) throw new Error("Missing ZOOM_BEARER_TOKEN Supabase secret.");

    const body = (await req.json()) as ZoomMeetingBody;

    if (body.action === "create") {
      const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${zoomToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: requiredString(body.topic, "topic"),
          type: 2,
          start_time: requiredString(body.startTime, "startTime"),
          duration: requiredDuration(body.duration),
          timezone: body.timezone || "America/New_York",
          settings: {
            auto_recording: "cloud",
          },
        }),
      });

      if (!response.ok) throw new Error(await parseZoomError(response));
      const meeting = (await response.json()) as ZoomMeetingResponse;

      return jsonResponse({
        meetingId: meeting.id ? String(meeting.id) : null,
        uuid: meeting.uuid ?? null,
        joinUrl: meeting.join_url ?? null,
        startUrl: meeting.start_url ?? null,
        chatJoinUrl: meeting.chat_join_url ?? null,
        password: meeting.password ?? null,
        raw: meeting,
      });
    }

    if (body.action === "update") {
      const meetingId = requiredString(body.meetingId, "meetingId");
      const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${zoomToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: requiredString(body.topic, "topic"),
          start_time: requiredString(body.startTime, "startTime"),
          duration: requiredDuration(body.duration),
          timezone: body.timezone || "America/New_York",
        }),
      });

      if (!response.ok) throw new Error(await parseZoomError(response));
      return jsonResponse({ ok: true });
    }

    if (body.action === "delete") {
      const meetingId = requiredString(body.meetingId, "meetingId");
      const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${zoomToken}`,
        },
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(await parseZoomError(response));
      }

      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "Invalid action." }, 400);
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Zoom function failed." },
      400,
    );
  }
});
