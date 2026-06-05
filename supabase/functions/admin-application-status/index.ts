import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type ApplicationStatus = "pending" | "reviewed" | "accepted" | "rejected";

type ApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  status: ApplicationStatus;
};

type AdminSettingsTemplates = {
  application_accept_subject: string | null;
  application_accept_body: string | null;
  application_reject_subject: string | null;
  application_reject_body: string | null;
};

const LINKEDIN_URL = "https://www.linkedin.com/in/fluentwithsena";
const BOOKING_URL = "https://luccna.ca/fluentwithsena";
const DEFAULT_ACCEPT_APPLICATION_SUBJECT = "Estás dentro/a — reservemos tu llamada";
const DEFAULT_ACCEPT_APPLICATION_BODY = `Hola [Nombre],

Buenas noticias — ¡me encantaría tener una llamada de consulta contigo!

Adjunté el resumen de The Fluency Program para que lo revises antes de que hablemos. Cubre la metodología, los tres niveles y cómo se ve el programa semana a semana.

Nuestra llamada será de 30 a 45 minutos, en español o inglés (lo que prefieras). Profundizaremos en tu situación actual y tus metas específicas, repasaremos The Fluency Program juntos y determinaremos qué nivel y plan de pago tiene más sentido para ti.

Reserva tu llamada aquí:

[Booking URL]

¡Quedo a la espera de hablar contigo!

Sena
Fluent with Sena`;

const DEFAULT_REJECT_APPLICATION_SUBJECT = "Tu solicitud — The Fluency Program";
const DEFAULT_REJECT_APPLICATION_BODY = `Hola [Nombre],

Gracias por dedicar tu tiempo a enviar tu solicitud para The Fluency Program.

Tras revisar detenidamente tu solicitud, he llegado a la conclusión de que el programa no es la mejor opción para ti en este momento.

Mientras tanto, te animo a que eches un vistazo a The Fluency Library, una selección cuidada de películas, series, libros y mucho más en inglés original. Es una forma estupenda de aprender inglés con contenidos originales que realmente te gusten. (Nota: el acceso a cualquier contenido multimedia debe ser adquirido por el usuario y no lo proporciona Fluent with Sena).

También te invito a seguirme en LinkedIn:

[LinkedIn URL]

Espero que nuestros caminos vuelvan a cruzarse en el futuro. ¡Mucha suerte en tu aprendizaje del inglés!

Sena
Fluent with Sena`;

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

function resolveTemplate(template: string, application: ApplicationRow) {
  return template
    .replaceAll("[Nombre completo]", application.full_name)
    .replaceAll("[Nombre]", firstName(application.full_name))
    .replaceAll("[Email]", application.email)
    .replaceAll("[Booking URL]", BOOKING_URL)
    .replaceAll("[Booking_URL]", BOOKING_URL)
    .replaceAll("[LinkedIn URL]", LINKEDIN_URL)
    .replaceAll("[LinkedIn_URL]", LINKEDIN_URL);
}

function bodyToHtml(body: string) {
  const paragraphs = body
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs
    .map((paragraph) => {
      const withLinks = paragraph.replace(
        /https?:\/\/[^\s<]+/g,
        (url) =>
          `<a href="${escapeHtml(url)}" style="color:#e2c97e;text-decoration:none;word-break:break-all;">${escapeHtml(url)}</a>`,
      );
      return `<p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:rgba(244,241,236,0.78);">${withLinks.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}

async function sendStatusEmail(
  application: ApplicationRow,
  status: ApplicationStatus,
  templates?: AdminSettingsTemplates | null,
) {
  if (status !== "accepted" && status !== "rejected") return;

  const token = Deno.env.get("MAILTRAP_API_TOKEN");
  if (!token) {
    throw new Error("Missing Mailtrap email token.");
  }

  const fromEmail = Deno.env.get("MAILTRAP_FROM_EMAIL") ?? "hello@fluentwithsena.com";
  const fromName = Deno.env.get("MAILTRAP_FROM_NAME") ?? "Fluent with Sena";
  const isAccepted = status === "accepted";
  const subjectTemplate = isAccepted
    ? templates?.application_accept_subject?.trim() || DEFAULT_ACCEPT_APPLICATION_SUBJECT
    : templates?.application_reject_subject?.trim() || DEFAULT_REJECT_APPLICATION_SUBJECT;
  const bodyTemplate = isAccepted
    ? templates?.application_accept_body?.trim() || DEFAULT_ACCEPT_APPLICATION_BODY
    : templates?.application_reject_body?.trim() || DEFAULT_REJECT_APPLICATION_BODY;
  const subject = resolveTemplate(subjectTemplate, application);
  const resolvedBody = resolveTemplate(bodyTemplate, application);

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
                <h1 style="margin:14px 0 0;font-size:28px;line-height:1.15;color:#f4f1ec;">${escapeHtml(subject)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px;">
                ${bodyToHtml(resolvedBody)}
                <p style="margin:0;font-size:12px;line-height:1.7;color:rgba(244,241,236,0.48);">(c) 2026 Fluent with Sena. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${resolvedBody}\n\n(c) 2026 Fluent with Sena. All rights reserved.`;

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

    const { data: templates, error: templatesError } = await adminClient
      .from("admin_settings")
      .select(
        "application_accept_subject, application_accept_body, application_reject_subject, application_reject_body",
      )
      .eq("profile_id", userData.user.id)
      .maybeSingle();
    if (templatesError) throw templatesError;

    await sendStatusEmail(application as ApplicationRow, status, templates as AdminSettingsTemplates | null);

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
