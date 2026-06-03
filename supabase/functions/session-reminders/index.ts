import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type LiveSessionRow = {
  id: string;
  student_id: string;
  week_number: number;
  session_number: number;
  scheduled_at: string;
  duration_minutes: number;
  focus_topic: string | null;
  zoom_join_url: string | null;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  timezone: string | null;
};

type ExistingNotificationRow = {
  recipient_id: string;
  related_id: string | null;
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

function fullName(profile: ProfileRow) {
  return [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email;
}

function sessionLabel(session: LiveSessionRow) {
  return `Week ${session.week_number} · Session ${session.session_number}`;
}

function formatSessionDate(value: string, timezone?: string | null) {
  const date = new Date(value);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone ?? "UTC",
    timeZoneName: "short",
  };

  try {
    return new Intl.DateTimeFormat("en-US", options).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone: "UTC",
    }).format(date);
  }
}

async function sendSessionReminderEmail({
  email,
  profile,
  session,
  dashboardUrl,
  reminderMinutes,
}: {
  email: string;
  profile: ProfileRow;
  session: LiveSessionRow;
  dashboardUrl: string;
  reminderMinutes: number;
}) {
  const token = Deno.env.get("MAILTRAP_API_TOKEN");
  if (!token) {
    throw new Error("Missing Mailtrap email token.");
  }

  const fromEmail = Deno.env.get("MAILTRAP_FROM_EMAIL") ?? "hello@fluentwithsena.com";
  const fromName = Deno.env.get("MAILTRAP_FROM_NAME") ?? "Fluent with Sena";
  const safeFirstName = escapeHtml(firstName(profile));
  const safeSessionTitle = escapeHtml(session.focus_topic?.trim() || sessionLabel(session));
  const safeSessionTime = escapeHtml(formatSessionDate(session.scheduled_at, profile.timezone));
  const safeJoinUrl = escapeHtml(session.zoom_join_url ?? dashboardUrl);
  const safeDashboardUrl = escapeHtml(dashboardUrl);
  const safeReminderMinutes = escapeHtml(String(reminderMinutes));

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
                <h1 style="margin:14px 0 0;font-size:28px;line-height:1.15;color:#f4f1ec;">Your live session starts soon</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(244,241,236,0.78);">Hi ${safeFirstName},</p>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:rgba(244,241,236,0.78);">This is your reminder that your next Fluent with Sena session starts in about ${safeReminderMinutes} minutes.</p>
                <div style="margin:0 0 18px;border:1px solid rgba(201,168,76,0.2);background:rgba(201,168,76,0.08);padding:18px 20px;">
                  <div style="font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#c9a84c;font-weight:700;">Upcoming session</div>
                  <div style="margin-top:10px;font-size:18px;font-weight:700;color:#f4f1ec;">${safeSessionTitle}</div>
                  <div style="margin-top:8px;font-size:14px;line-height:1.7;color:rgba(244,241,236,0.78);">${safeSessionTime}</div>
                  <div style="margin-top:6px;font-size:13px;line-height:1.7;color:rgba(244,241,236,0.55);">${escapeHtml(sessionLabel(session))} · ${escapeHtml(String(session.duration_minutes))} min</div>
                </div>
                <p style="margin:28px 0 14px;">
                  <a href="${safeJoinUrl}" style="display:inline-block;background:#c9a84c;color:#07101d;text-decoration:none;font-weight:700;font-size:14px;padding:14px 20px;margin-right:10px;">Join session</a>
                  <a href="${safeDashboardUrl}" style="display:inline-block;border:1px solid rgba(255,255,255,0.14);color:#f4f1ec;text-decoration:none;font-weight:600;font-size:14px;padding:14px 20px;">Open dashboard</a>
                </p>
                <p style="margin:0;font-size:12px;line-height:1.7;color:rgba(244,241,236,0.48);">If the join button does not work, open your dashboard here:<br><a href="${safeDashboardUrl}" style="color:#e2c97e;word-break:break-all;">${safeDashboardUrl}</a></p>
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
    `This is your reminder that your next Fluent with Sena session starts in about ${reminderMinutes} minutes.`,
    `${session.focus_topic?.trim() || sessionLabel(session)}`,
    formatSessionDate(session.scheduled_at, profile.timezone),
    `${sessionLabel(session)} · ${session.duration_minutes} min`,
    "",
    `Join here: ${session.zoom_join_url ?? dashboardUrl}`,
    `Dashboard: ${dashboardUrl}`,
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
      to: [{ email }],
      subject: "Your Fluent with Sena session starts soon",
      text,
      html,
      category: "Student Session Reminder",
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Mailtrap could not send the reminder email.");
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

    const acceptedSecretKeys = new Set<string>([serviceRoleKey]);
    const singleSecretKey = Deno.env.get("SUPABASE_SECRET_KEY");
    if (singleSecretKey) acceptedSecretKeys.add(singleSecretKey);

    const namedSecretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
    if (namedSecretKeys) {
      try {
        const parsed = JSON.parse(namedSecretKeys) as Record<string, string>;
        for (const value of Object.values(parsed)) {
          if (typeof value === "string" && value) acceptedSecretKeys.add(value);
        }
      } catch {
        // Ignore malformed secret-key metadata and fall back to the known keys above.
      }
    }

    const requestKey =
      req.headers.get("apikey") ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
      "";
    if (!requestKey || !acceptedSecretKeys.has(requestKey)) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: settingsRows, error: settingsError } = await adminClient
      .from("admin_settings")
      .select("notify_session_reminder_min")
      .order("updated_at", { ascending: false })
      .limit(1);
    if (settingsError) throw settingsError;

    const configuredReminderMinutes = Math.round(
      settingsRows?.[0]?.notify_session_reminder_min ?? 30,
    );
    if (configuredReminderMinutes <= 0) {
      return jsonResponse({
        ok: true,
        disabled: true,
        reminderMinutes: configuredReminderMinutes,
        sent: 0,
        skipped: 0,
      });
    }

    const reminderMinutes = Math.max(1, configuredReminderMinutes);
    const now = Date.now();
    const windowStart = new Date(now + reminderMinutes * 60_000);
    const windowEnd = new Date(windowStart.getTime() + 2 * 60_000);

    const { data: sessions, error: sessionsError } = await adminClient
      .from("live_sessions")
      .select(
        "id, student_id, week_number, session_number, scheduled_at, duration_minutes, focus_topic, zoom_join_url",
      )
      .eq("status", "scheduled")
      .gte("scheduled_at", windowStart.toISOString())
      .lt("scheduled_at", windowEnd.toISOString())
      .order("scheduled_at", { ascending: true });
    if (sessionsError) throw sessionsError;

    const upcomingSessions = (sessions ?? []) as LiveSessionRow[];
    if (!upcomingSessions.length) {
      return jsonResponse({
        ok: true,
        reminderMinutes,
        candidates: 0,
        sent: 0,
        skipped: 0,
      });
    }

    const studentIds = [...new Set(upcomingSessions.map((session) => session.student_id))];
    const sessionIds = upcomingSessions.map((session) => session.id);

    const [{ data: profiles, error: profilesError }, { data: existing, error: existingError }] =
      await Promise.all([
        adminClient.from("profiles").select("id, first_name, last_name, email, timezone").in(
          "id",
          studentIds,
        ),
        adminClient
          .from("notifications")
          .select("recipient_id, related_id")
          .eq("type", "session_reminder")
          .eq("related_table", "live_sessions")
          .in("related_id", sessionIds),
      ]);

    if (profilesError) throw profilesError;
    if (existingError) throw existingError;

    const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile as ProfileRow]));
    const existingKeys = new Set(
      ((existing ?? []) as ExistingNotificationRow[])
        .filter((item) => item.related_id)
        .map((item) => `${item.recipient_id}:${item.related_id}`),
    );

    const rawSiteUrl = Deno.env.get("SITE_URL") ?? "https://www.fluentwithsena.com";
    const siteUrl = rawSiteUrl.replace(/\/$/, "");
    const dashboardUrl = Deno.env.get("STUDENT_DASHBOARD_URL") ?? `${siteUrl}/student`;

    let sent = 0;
    let skipped = 0;
    const failed: string[] = [];

    for (const session of upcomingSessions) {
      const profile = profileById.get(session.student_id);
      if (!profile?.email) {
        skipped += 1;
        continue;
      }

      const duplicateKey = `${profile.id}:${session.id}`;
      if (existingKeys.has(duplicateKey)) {
        skipped += 1;
        continue;
      }

      try {
        await sendSessionReminderEmail({
          email: profile.email,
          profile,
          session,
          dashboardUrl,
          reminderMinutes,
        });

        const { error: notificationError } = await adminClient.from("notifications").insert({
          recipient_id: profile.id,
          type: "session_reminder",
          title: "Upcoming live session",
          body: `${session.focus_topic?.trim() || sessionLabel(session)} starts at ${formatSessionDate(
            session.scheduled_at,
            profile.timezone,
          )}.`,
          related_table: "live_sessions",
          related_id: session.id,
        });

        if (
          notificationError &&
          !notificationError.message.toLowerCase().includes("duplicate")
        ) {
          throw notificationError;
        }

        sent += 1;
        existingKeys.add(duplicateKey);
      } catch (error) {
        const label = `${fullName(profile)} (${profile.email})`;
        failed.push(
          `${label}: ${error instanceof Error ? error.message : "Could not send reminder."}`,
        );
      }
    }

    return jsonResponse({
      ok: failed.length === 0,
      reminderMinutes,
      candidates: upcomingSessions.length,
      sent,
      skipped,
      failed,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error." },
      500,
    );
  }
});
