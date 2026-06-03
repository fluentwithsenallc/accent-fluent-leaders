import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type ApplicationStatus = "pending" | "reviewed" | "accepted" | "rejected";

type ApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  status: ApplicationStatus;
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "there";
}

function normalizeStatus(value: unknown): ApplicationStatus {
  if (value === "pending" || value === "reviewed" || value === "accepted" || value === "rejected") {
    return value;
  }
  throw new Error("Unsupported application status.");
}

async function sendStatusEmail(application: ApplicationRow, status: ApplicationStatus) {
  if (status !== "accepted" && status !== "rejected") return;

  const token = Deno.env.get("MAILTRAP_API_TOKEN");
  if (!token) {
    throw new Error("Missing Mailtrap email token.");
  }

  const fromEmail = Deno.env.get("MAILTRAP_FROM_EMAIL") ?? "hello@fluentwithsena.com";
  const fromName = Deno.env.get("MAILTRAP_FROM_NAME") ?? "Fluent with Sena";
  const safeName = escapeHtml(firstName(application.full_name));

  const isAccepted = status === "accepted";
  const subject = isAccepted
    ? "Next step for your Fluent with Sena application"
    : "Update on your Fluent with Sena application";
  const headline = isAccepted ? "You're invited to the next step" : "Thank you for applying";
  const body = isAccepted
    ? "We've reviewed your application and would love to invite you to a consult call with Sena. Watch your inbox for the next-step details."
    : "We've reviewed your application and won't be moving forward at this time. Thank you for the time and care you put into your application.";
  const footer = isAccepted
    ? "We'll follow up soon with the consult details."
    : "We truly appreciate your interest in Fluent with Sena.";

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#07101d;padding:0;font-family:Arial,sans-serif;color:#f4f1ec;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#07101d;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#0e1825;border:1px solid rgba(255,255,255,0.08);">
            <tr>
              <td style="padding:34px 32px 10px;">
                <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;">Fluent with Sena</div>
                <h1 style="margin:14px 0 0;font-size:28px;line-height:1.15;color:#f4f1ec;">${headline}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(244,241,236,0.78);">Hi ${safeName},</p>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:rgba(244,241,236,0.78);">${body}</p>
                <div style="margin:0 0 18px;border:1px solid rgba(201,168,76,0.2);background:rgba(201,168,76,0.08);padding:18px 20px;">
                  <div style="font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#c9a84c;font-weight:700;">Application status</div>
                  <div style="margin-top:10px;font-size:18px;font-weight:700;color:#f4f1ec;">${isAccepted ? "Accepted for consult" : "Not moving forward"}</div>
                  <div style="margin-top:8px;font-size:14px;line-height:1.7;color:rgba(244,241,236,0.78);">${footer}</div>
                </div>
                <p style="margin:0;font-size:12px;line-height:1.7;color:rgba(244,241,236,0.48);">(c) 2026 Fluent with Sena. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Hi ${firstName(application.full_name)},`,
    "",
    body,
    footer,
    "",
    "(c) 2026 Fluent with Sena. All rights reserved.",
  ].join("\n");

  const response = await fetch("https://send.api.mailtrap.io/api/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email: application.email }],
      subject,
      text,
      html,
      category: "Application Status",
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Mailtrap could not send the application email.");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing server configuration.");
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) throw new Error("You must be signed in as an admin.");

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: userData, error: userError } = await adminClient.auth.getUser(jwt);
    if (userError || !userData.user) throw new Error("Invalid admin session.");

    const { data: adminProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();
    if (profileError || adminProfile?.role !== "admin") {
      throw new Error("Only admins can update applications.");
    }

    const body = (await req.json()) as { applicationId?: string; status?: unknown };
    const applicationId = typeof body.applicationId === "string" ? body.applicationId : "";
    const status = normalizeStatus(body.status);
    if (!applicationId) throw new Error("applicationId is required.");

    const { data: application, error: applicationError } = await adminClient
      .from("applications")
      .select("id, full_name, email, status")
      .eq("id", applicationId)
      .single();
    if (applicationError || !application) {
      throw new Error("Application not found.");
    }

    await sendStatusEmail(application as ApplicationRow, status);

    const reviewedPayload =
      status === "pending"
        ? { reviewed_at: null, reviewed_by: null }
        : { reviewed_at: new Date().toISOString(), reviewed_by: userData.user.id };

    const { error: updateError } = await adminClient
      .from("applications")
      .update({ status, ...reviewedPayload })
      .eq("id", applicationId);
    if (updateError) throw updateError;

    return jsonResponse({
      ok: true,
      status,
      emailSent: status === "accepted" || status === "rejected",
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Could not update application." },
      400,
    );
  }
});
