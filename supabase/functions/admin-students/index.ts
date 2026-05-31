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

    const rawSiteUrl = Deno.env.get("SITE_URL") ?? req.headers.get("origin") ?? "";
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

    const { data: created, error: createError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      { data: linkOptions.data, redirectTo: linkOptions.redirectTo },
    );
    if (createError || !created.user) {
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

    return jsonResponse({ id: studentId, email, inviteSent: true });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Could not create student." },
      400,
    );
  }
});
