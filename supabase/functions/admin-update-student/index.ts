import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type StudentStatus = "active" | "paused" | "completed" | "cancelled";

type UpdateStudentBody = {
  studentId?: string;
  firstName?: string;
  lastName?: string;
  timezone?: string;
  phone?: string;
  whatsapp?: string;
  tierId?: string;
  industry?: string;
  currentWeek?: number;
  status?: StudentStatus;
  cefrLevel?: string;
  confidenceScore?: number | null;
  startDate?: string;
  endDate?: string;
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

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }
  return value.trim();
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
      throw new Error("Only admins can update students.");
    }

    const body = (await req.json()) as UpdateStudentBody;
    const studentId = requiredString(body.studentId, "studentId");
    const firstName = requiredString(body.firstName, "first name");
    const lastName = optionalString(body.lastName);
    const timezone = optionalString(body.timezone) ?? "America/New_York";
    const phone = optionalString(body.phone);
    const whatsapp = optionalString(body.whatsapp);
    const tierId = optionalString(body.tierId);
    const industry = optionalString(body.industry);
    const currentWeek =
      typeof body.currentWeek === "number" && Number.isFinite(body.currentWeek)
        ? Math.max(1, Math.round(body.currentWeek))
        : 1;
    const status = body.status ?? "active";
    const cefrLevel = optionalString(body.cefrLevel);
    const confidenceScore =
      typeof body.confidenceScore === "number" && Number.isFinite(body.confidenceScore)
        ? body.confidenceScore
        : null;
    const startDate = optionalString(body.startDate);
    const endDate = optionalString(body.endDate);
    const notes = optionalString(body.notes);

    const [{ data: authUserData, error: authUserError }, { data: existingProfile, error: existingProfileError }] =
      await Promise.all([
        adminClient.auth.admin.getUserById(studentId),
        adminClient
          .from("profiles")
          .select("id, role, email")
          .eq("id", studentId)
          .maybeSingle(),
      ]);

    if (authUserError || !authUserData.user) {
      throw new Error("Could not find the student's auth account.");
    }
    if (existingProfileError) throw existingProfileError;

    const email = existingProfile?.email ?? authUserData.user.email ?? null;
    if (!email) {
      throw new Error("Could not determine the student's email address.");
    }

    const { error: profileUpsertError } = await adminClient.from("profiles").upsert({
      id: studentId,
      role: existingProfile?.role ?? "student",
      email,
      first_name: firstName,
      last_name: lastName,
      timezone,
      phone,
      whatsapp,
    });
    if (profileUpsertError) throw profileUpsertError;

    const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(studentId, {
      user_metadata: {
        ...(authUserData.user.user_metadata ?? {}),
        first_name: firstName,
        last_name: lastName,
        role: existingProfile?.role ?? "student",
      },
    });
    if (authUpdateError) throw authUpdateError;

    const { error: studentUpdateError } = await adminClient
      .from("students")
      .update({
        tier_id: tierId,
        industry,
        current_week: currentWeek,
        status,
        cefr_level: cefrLevel,
        confidence_score: confidenceScore,
        start_date: startDate,
        end_date: endDate,
        notes,
      })
      .eq("id", studentId);
    if (studentUpdateError) throw studentUpdateError;

    return jsonResponse({ ok: true, studentId, firstName, lastName, email });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Could not update student." },
      400,
    );
  }
});
