import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type CreateStudentBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  timezone?: string;
  phone?: string;
  whatsapp?: string;
  tierId?: string;
  industry?: string;
  currentWeek?: number;
  startDate?: string;
  applicationId?: string;
  notes?: string;
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

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function addWeeks(date: string | null, weeks: number | null) {
  if (!date || !weeks) return null;
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + weeks * 7);
  return result.toISOString().slice(0, 10);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendStudentInviteEmail({
  email,
  firstName,
  actionLink,
}: {
  email: string;
  firstName: string;
  actionLink: string;
}) {
  const token = Deno.env.get("MAILTRAP_API_TOKEN");
  if (!token) {
    throw new Error("Missing Mailtrap email token.");
  }

  const fromEmail = Deno.env.get("MAILTRAP_FROM_EMAIL") ?? "hello@fluentwithsena.com";
  const fromName = Deno.env.get("MAILTRAP_FROM_NAME") ?? "Fluent with Sena";
  const safeName = escapeHtml(firstName);
  const safeLink = escapeHtml(actionLink);

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
                <h1 style="margin:14px 0 0;font-size:28px;line-height:1.15;color:#f4f1ec;">Your student dashboard is ready</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(244,241,236,0.78);">Hi ${safeName},</p>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:rgba(244,241,236,0.78);">Sena has created your Fluent with Sena student dashboard. Use the button below to create your password and sign in.</p>
                <p style="margin:28px 0;">
                  <a href="${safeLink}" style="display:inline-block;background:#c9a84c;color:#07101d;text-decoration:none;font-weight:700;font-size:14px;padding:14px 20px;">Create my password</a>
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

  const res = await fetch("https://send.api.mailtrap.io/api/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email }],
      subject: "Create your Fluent with Sena dashboard password",
      text: `Hi ${firstName},\n\nSena has created your Fluent with Sena student dashboard. Create your password here:\n\n${actionLink}\n\n(c) 2026 Fluent with Sena. All rights reserved.`,
      html,
      category: "Student Dashboard Invite",
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || "Mailtrap could not send the invite email.");
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
      throw new Error("Only admins can create students.");
    }

    const body = (await req.json()) as CreateStudentBody;
    const email = requiredString(body.email, "email").toLowerCase();

    const firstName = requiredString(body.firstName, "first name");
    const lastName = optionalString(body.lastName);
    const tierId = optionalString(body.tierId);
    const startDate = optionalString(body.startDate);
    const currentWeek =
      typeof body.currentWeek === "number" && Number.isFinite(body.currentWeek)
        ? Math.max(1, Math.round(body.currentWeek))
        : 1;

    let endDate: string | null = null;
    if (tierId) {
      const { data: tier } = await adminClient
        .from("program_tiers")
        .select("duration_weeks")
        .eq("id", tierId)
        .single();
      endDate = addWeeks(startDate, tier?.duration_weeks ?? null);
    }

    const rawSiteUrl = Deno.env.get("SITE_URL") ?? "https://www.fluentwithsena.com";
    const siteUrl = rawSiteUrl.replace(/\/$/, "");
    const redirectTo =
      Deno.env.get("STUDENT_DASHBOARD_URL") ?? (siteUrl ? `${siteUrl}/student` : undefined);
    const linkOptions: {
      data: Record<string, string | null>;
      redirectTo?: string;
    } = {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: "student",
      },
    };
    if (redirectTo) linkOptions.redirectTo = redirectTo;

    const { data: created, error: createError } = await adminClient.auth.admin.generateLink({
      type: "invite",
      email,
      options: { data: linkOptions.data, redirectTo: linkOptions.redirectTo },
    });
    const actionLink = created?.properties?.action_link;
    if (createError || !created.user || !actionLink) {
      throw new Error(createError?.message ?? "Could not create student invite.");
    }

    const studentId = created.user.id;

    const { error: profileUpdateError } = await adminClient.from("profiles").upsert({
      id: studentId,
      role: "student",
      first_name: firstName,
      last_name: lastName,
      email,
      timezone: optionalString(body.timezone) ?? "America/New_York",
      phone: optionalString(body.phone),
      whatsapp: optionalString(body.whatsapp),
    });

    if (profileUpdateError) {
      await adminClient.auth.admin.deleteUser(studentId);
      throw profileUpdateError;
    }

    const { error: studentError } = await adminClient.from("students").insert({
      id: studentId,
      tier_id: tierId,
      industry: optionalString(body.industry),
      current_week: currentWeek,
      start_date: startDate,
      end_date: endDate,
      status: "active",
      application_id: optionalString(body.applicationId),
      notes: optionalString(body.notes),
    });

    if (studentError) {
      await adminClient.auth.admin.deleteUser(studentId);
      throw studentError;
    }

    try {
      await sendStudentInviteEmail({ email, firstName, actionLink });
    } catch (emailError) {
      await adminClient.from("students").delete().eq("id", studentId);
      await adminClient.auth.admin.deleteUser(studentId);
      throw emailError;
    }

    return jsonResponse({ id: studentId, email, inviteSent: true });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Could not create student." },
      400,
    );
  }
});
