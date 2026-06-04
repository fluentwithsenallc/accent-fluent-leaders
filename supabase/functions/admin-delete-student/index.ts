import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
      throw new Error("Only admins can delete student accounts.");
    }

    const body = (await req.json()) as { studentId?: string };
    const studentId = typeof body.studentId === "string" ? body.studentId.trim() : "";
    if (!studentId) throw new Error("studentId is required.");

    const { data: studentProfile, error: studentProfileError } = await adminClient
      .from("profiles")
      .select("id, role, email")
      .eq("id", studentId)
      .maybeSingle();
    if (studentProfileError) throw studentProfileError;

    if (studentProfile?.role === "admin") {
      throw new Error("Admin accounts cannot be deleted from the student roster.");
    }

    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(studentId);
    if (
      deleteAuthError &&
      !/not found|no user/i.test(deleteAuthError.message)
    ) {
      throw deleteAuthError;
    }

    if (deleteAuthError) {
      const { error: deleteProfileError } = await adminClient.from("profiles").delete().eq("id", studentId);
      if (deleteProfileError) {
        const { error: deleteStudentError } = await adminClient.from("students").delete().eq("id", studentId);
        if (deleteStudentError) throw deleteStudentError;
      }
    }

    return jsonResponse({
      ok: true,
      studentId,
      email: studentProfile?.email ?? null,
      authDeleted: !deleteAuthError,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Could not delete student." },
      400,
    );
  }
});
