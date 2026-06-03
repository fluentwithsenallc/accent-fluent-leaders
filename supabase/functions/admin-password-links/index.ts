import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type ProfileRow = {
  id: string;
  role: "admin" | "student";
  first_name: string | null;
  email: string;
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

function firstName(profile: ProfileRow) {
  return profile.first_name?.trim() || profile.email.split("@")[0] || "there";
}

async function sendPasswordResetEmail({
  profile,
  actionLink,
  isAdminSelf,
}: {
  profile: ProfileRow;
  actionLink: string;
  isAdminSelf: boolean;
}) {
  const token = Deno.env.get("MAILTRAP_API_TOKEN");
  if (!token) {
    throw new Error("Missing Mailtrap email token.");
  }

  const fromEmail = Deno.env.get("MAILTRAP_FROM_EMAIL") ?? "hello@fluentwithsena.com";
  const fromName = Deno.env.get("MAILTRAP_FROM_NAME") ?? "Fluent with Sena";
  const safeName = escapeHtml(firstName(profile));
  const safeLink = escapeHtml(actionLink);
  const title = isAdminSelf ? "Reset your admin password" : "Reset your dashboard password";
  const bodyCopy = isAdminSelf
    ? "Use the button below to choose a new password for your Fluent with Sena admin dashboard."
    : "Use the button below to choose a new password for your Fluent with Sena student dashboard.";

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
                <h1 style="margin:14px 0 0;font-size:28px;line-height:1.15;color:#f4f1ec;">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(244,241,236,0.78);">Hi ${safeName},</p>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:rgba(244,241,236,0.78);">${bodyCopy}</p>
                <p style="margin:28px 0;">
                  <a href="${safeLink}" style="display:inline-block;background:#c9a84c;color:#07101d;text-decoration:none;font-weight:700;font-size:14px;padding:14px 20px;">Choose a new password</a>
                </p>
                <p style="margin:0;font-size:12px;line-height:1.7;color:rgba(244,241,236,0.48);">If the button does not work, copy and paste this link into your browser:<br><a href="${safeLink}" style="color:#e2c97e;word-break:break-all;">${safeLink}</a></p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid rgba(255,255,255,0.08);padding:18px 32px 30px;font-size:12px;line-height:1.7;color:rgba(244,241,236,0.42);">&copy; 2026 Fluent with Sena. All rights reserved.</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Hi ${firstName(profile)},`,
    "",
    bodyCopy,
    "",
    actionLink,
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
      to: [{ email: profile.email }],
      subject: title,
      text,
      html,
      category: "Password Reset",
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Mailtrap could not send the password reset email.");
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

    const { data: adminProfile, error: adminProfileError } = await adminClient
      .from("profiles")
      .select("id, role, first_name, email")
      .eq("id", userData.user.id)
      .single();
    if (adminProfileError || adminProfile?.role !== "admin") {
      throw new Error("Only admins can send password reset links.");
    }

    const body = (await req.json()) as { email?: string };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) throw new Error("email is required.");

    const { data: targetProfile, error: targetProfileError } = await adminClient
      .from("profiles")
      .select("id, role, first_name, email")
      .eq("email", email)
      .single();
    if (targetProfileError || !targetProfile) {
      throw new Error("No dashboard user was found for that email.");
    }

    const isAdminSelf = targetProfile.id === adminProfile.id;
    if (targetProfile.role === "admin" && !isAdminSelf) {
      throw new Error("Admins can only send password reset links to themselves.");
    }

    const rawSiteUrl = Deno.env.get("SITE_URL") ?? "https://www.fluentwithsena.com";
    const siteUrl = rawSiteUrl.replace(/\/$/, "");
    const redirectTo = `${siteUrl}/set-password`;

    const { data: generated, error: generateError } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });
    const tokenHash = generated?.properties?.hashed_token;
    const actionLink =
      tokenHash && siteUrl
        ? `${siteUrl}/set-password?type=recovery&token_hash=${encodeURIComponent(tokenHash)}&email=${encodeURIComponent(email)}`
        : null;

    if (generateError || !generated?.user || !actionLink) {
      throw new Error(generateError?.message ?? "Could not create the password reset link.");
    }

    await sendPasswordResetEmail({
      profile: targetProfile as ProfileRow,
      actionLink,
      isAdminSelf,
    });

    return jsonResponse({
      ok: true,
      email,
      role: targetProfile.role,
      emailSent: true,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Could not send the password link." },
      400,
    );
  }
});
