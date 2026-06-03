import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { LanguageToggle, useTranslate } from "../lib/language";
import { hasSupabaseEnv, supabase } from "../lib/supabase";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Apply for Coaching - Fluent with Sena" },
      {
        name: "description",
        content: "Apply for personalized professional English coaching with Fluent with Sena.",
      },
    ],
  }),
  component: ApplyPage,
});

function TextField({
  label,
  name,
  optional,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  optional?: boolean;
  type?: string;
  placeholder: string;
}) {
  const tr = useTranslate();
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.8rem] font-medium tracking-wide text-[#f4f1ec]/70">
        {label}{" "}
        {optional ? (
          <span className="text-[0.75rem] font-light text-[#f4f1ec]/35">
            ({tr("Optional", "Opcional")})
          </span>
        ) : (
          <span className="text-[#c9a84c]">*</span>
        )}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={!optional}
        className="h-12 rounded-lg border border-white/10 bg-[#0a1422] px-4 text-sm font-light text-[#f4f1ec] outline-none transition placeholder:text-[#f4f1ec]/25 focus:border-[#c9a84c]/45 focus:ring-4 focus:ring-[#c9a84c]/10"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  hint,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const tr = useTranslate();
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.8rem] font-medium tracking-wide text-[#f4f1ec]/70">
        {label} <span className="text-[#c9a84c]">*</span>
      </span>
      <select
        name={name}
        defaultValue=""
        required
        className="h-12 cursor-pointer rounded-lg border border-white/10 bg-[#0a1422] px-4 text-sm font-light text-[#f4f1ec] outline-none transition focus:border-[#c9a84c]/45 focus:ring-4 focus:ring-[#c9a84c]/10"
      >
        {children}
      </select>
      {hint && <p className="-mt-1 text-xs leading-5 text-[#f4f1ec]/30">{hint}</p>}
    </label>
  );
}

function TextAreaField({
  label,
  name,
  optional,
  placeholder,
}: {
  label: string;
  name: string;
  optional?: boolean;
  placeholder: string;
}) {
  const tr = useTranslate();
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.8rem] font-medium tracking-wide text-[#f4f1ec]/70">
        {label}{" "}
        {optional ? (
          <span className="text-[0.75rem] font-light text-[#f4f1ec]/35">
            ({tr("Optional", "Opcional")})
          </span>
        ) : (
          <span className="text-[#c9a84c]">*</span>
        )}
      </span>
      <textarea
        name={name}
        placeholder={placeholder}
        required={!optional}
        className="min-h-24 resize-y rounded-lg border border-white/10 bg-[#0a1422] px-4 py-3 text-sm font-light leading-7 text-[#f4f1ec] outline-none transition placeholder:text-[#f4f1ec]/25 focus:border-[#c9a84c]/45 focus:ring-4 focus:ring-[#c9a84c]/10"
      />
    </label>
  );
}

function Feature({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="flex items-start gap-5">
      <span className="mt-0.5 w-5 shrink-0 text-[0.67rem] font-bold tracking-[0.1em] text-[#c9a84c]">
        {number}
      </span>
      <div>
        <h2 className="mb-1.5 text-sm font-semibold text-[#f4f1ec]">{title}</h2>
        <p className="text-[0.82rem] font-light leading-6 text-[#f4f1ec]/50">{body}</p>
      </div>
    </div>
  );
}

function ApplyPage() {
  const tr = useTranslate();
  const levels = [
    tr(
      "I know some words and phrases but can't hold a real conversation yet",
      "Conozco algunas palabras y frases, pero todavia no puedo mantener una conversacion real.",
    ),
    tr(
      "I can communicate but often hesitate, search for words, or avoid certain topics",
      "Puedo comunicarme, pero a menudo dudo, busco palabras o evito ciertos temas.",
    ),
    tr(
      "I'm comfortable in most situations but want more polish, precision, and authority",
      "Me siento comodo en la mayoria de las situaciones, pero quiero mas soltura, precision y autoridad.",
    ),
  ];
  const [selectedLevel, setSelectedLevel] = useState(2);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    if (!hasSupabaseEnv || !supabase) {
      setStatus("error");
      setMessage(
        tr(
          "Application system is not configured yet. Please contact Sena directly.",
          "El sistema de aplicacion todavia no esta configurado. Contacta a Sena directamente.",
        ),
      );
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const englishLevels = ["beginner", "intermediate", "advanced"] as const;
    const value = (key: string) => {
      const item = formData.get(key);
      return typeof item === "string" && item.trim() ? item.trim() : null;
    };

    const { error } = await supabase.from("applications").insert({
      full_name: value("full_name"),
      email: value("email"),
      linkedin_url: value("linkedin_url"),
      current_role: value("current_role"),
      industry: value("industry"),
      english_level: englishLevels[selectedLevel],
      primary_goal: value("primary_goal"),
      motivation: value("motivation"),
      preferred_start: value("preferred_start"),
      weekly_hours: value("weekly_hours"),
      referral_source: value("referral_source"),
      additional_notes: value("additional_notes"),
      status: "pending",
    });

    if (error) {
      setStatus("error");
      setMessage(
        error.message ||
          tr(
            "Something went wrong. Please try again.",
            "Algo salio mal. Intentalo de nuevo.",
          ),
      );
      return;
    }

    form.reset();
    setSelectedLevel(2);
    setStatus("success");
    setMessage("");
  };

  if (status === "success") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#070d18] px-6 py-12 font-sans text-[#f4f1ec]">
        <div className="w-full max-w-xl rounded-xl border border-white/8 bg-[#0f1b2d] p-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.35)] md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c9a84c]">
            {tr("Application received", "Aplicacion recibida")}
          </p>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.02em] md:text-4xl">
            {tr("Thank you for applying.", "Gracias por aplicar.")}
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm font-light leading-7 text-[#f4f1ec]/58">
            {tr(
              "Sena will review your application and reply within 48 hours to let you know if the program may be a good fit and whether the next step is a consult call.",
              "Sena revisara tu aplicacion y respondera dentro de 48 horas para decirte si el programa puede ser una buena opcion y si el siguiente paso es una llamada de consulta.",
            )}
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center rounded-none bg-[#c9a84c] px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#070d18] transition hover:bg-[#e2c97e]"
          >
            {tr("Back to Home", "Volver al inicio")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070d18] font-sans text-[#f4f1ec]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_1.15fr]">
        <aside className="relative overflow-hidden bg-[#070d18] px-8 py-12 lg:sticky lg:top-0 lg:h-screen lg:px-14 lg:py-16">
          <div className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(201,168,76,0.08)_0%,transparent_65%)]" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 hidden w-px bg-[linear-gradient(180deg,transparent_0%,rgba(201,168,76,0.25)_30%,rgba(201,168,76,0.25)_70%,transparent_100%)] lg:block" />

          <div className="relative z-10 flex min-h-full flex-col justify-between gap-12">
            <div>
              <div className="mb-12 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#c9a84c]">
                  Fluent with Sena
                </span>
                <div className="flex items-center gap-3">
                  <LanguageToggle dark />
                  <Link
                    to="/"
                    className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f4f1ec]/35 transition hover:text-[#c9a84c]"
                  >
                    {tr("Home", "Inicio")}
                  </Link>
                </div>
              </div>

              <h1 className="max-w-xl text-[clamp(2rem,3.2vw,2.9rem)] font-bold leading-[1.1] tracking-[-0.025em] text-[#f4f1ec]">
                {tr(
                  "Master professional English through a personalized roadmap and intensive 1:1 coaching.",
                  "Domina el ingles profesional con una hoja de ruta personalizada y coaching intensivo 1:1.",
                )}
              </h1>

              <p className="mt-6 max-w-sm text-[0.9rem] font-light leading-7 text-[#f4f1ec]/50">
                {tr(
                  "For Spanish-speaking professionals who need English to advance their careers.",
                  "Para profesionales hispanohablantes que necesitan ingles para avanzar en sus carreras.",
                )}
              </p>

              <div className="mt-14 flex flex-col gap-7">
                <Feature
                  number="01"
                  title={tr("Personalized learning", "Aprendizaje personalizado")}
                  body={tr(
                    "A custom roadmap created for you, based on your current level and professional goals.",
                    "Una hoja de ruta personalizada creada para ti, basada en tu nivel actual y tus metas profesionales.",
                  )}
                />
                <Feature
                  number="02"
                  title={tr("Built for your career", "Construido para tu carrera")}
                  body={tr(
                    "A blend of AI tools, a curated immersion library, and live Zoom coaching that teaches the professional English your career demands.",
                    "Una combinacion de herramientas de IA, una biblioteca de inmersion curada y coaching en vivo por Zoom que ensena el ingles profesional que tu carrera exige.",
                  )}
                />
                <Feature
                  number="03"
                  title={tr("Innovative learning", "Aprendizaje innovador")}
                  body={tr(
                    "Instead of traditional grammar and worksheets, we combine AI tools and modern learning methods to teach you real, applicable English.",
                    "En lugar de gramatica tradicional y hojas de trabajo, combinamos herramientas de IA y metodos modernos para ensenarte ingles real y aplicable.",
                  )}
                />
              </div>
            </div>

            <p className="text-[0.7rem] tracking-wide text-[#f4f1ec]/20">
              {tr(
                "Copyright 2026 Fluent with Sena LLC",
                "Copyright 2026 Fluent with Sena LLC",
              )}
            </p>
          </div>
        </aside>

        <section className="bg-[#0f1b2d] px-8 py-12 lg:px-14 lg:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#f4f1ec]">
              {tr("Apply for coaching", "Aplicar a coaching")}
            </h2>
            <p className="mt-2 max-w-lg text-[0.875rem] font-light leading-7 text-[#f4f1ec]/50">
              {tr(
                "Share your current situation and goals. Sena will respond within 48 hours with the next steps.",
                "Comparte tu situacion actual y tus metas. Sena respondera dentro de 48 horas con los siguientes pasos.",
              )}
            </p>

            <form className="mt-12 flex flex-col gap-7" onSubmit={handleSubmit}>
              <TextField
                name="full_name"
                label={tr("Full name", "Nombre completo")}
                placeholder="Maria Rodriguez"
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextField
                  name="email"
                  label={tr("Email", "Correo electronico")}
                  type="email"
                  placeholder="maria@example.com"
                />
                <TextField
                  name="linkedin_url"
                  label={tr("LinkedIn URL", "URL de LinkedIn")}
                  type="url"
                  optional
                  placeholder="linkedin.com/in/..."
                />
              </div>

              <TextField
                name="current_role"
                label={tr("Current role and industry", "Rol actual e industria")}
                placeholder={tr(
                  "Senior HR Business Partner, Tech",
                  "Senior HR Business Partner, Tecnologia",
                )}
              />
              <input type="hidden" name="industry" value="" />

              <div className="h-px bg-white/10" />

              <div className="flex flex-col gap-3">
                <span className="text-[0.8rem] font-medium tracking-wide text-[#f4f1ec]/70">
                  {tr(
                    "Where are you with English right now?",
                    "¿Cómo te sientes con tu inglés en este momento?",
                  )}{" "}
                  <span className="text-[#c9a84c]">*</span>
                </span>
                <div className="flex flex-col gap-2.5">
                  {levels.map((level, index) => {
                    const selected = selectedLevel === index;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSelectedLevel(index)}
                        className={`flex items-start gap-3 rounded-none border p-4 text-left text-sm font-light leading-6 transition ${
                          selected
                            ? "border-[#c9a84c]/50 bg-[#c9a84c]/[0.06] text-[#f4f1ec]"
                            : "border-white/10 bg-[#0a1422] text-[#f4f1ec]/65 hover:border-[#c9a84c]/30 hover:bg-[#c9a84c]/[0.04] hover:text-[#f4f1ec]"
                        }`}
                      >
                        <span
                          className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            selected ? "border-[#c9a84c] bg-[#c9a84c]/10" : "border-white/20"
                          }`}
                        >
                          {selected && <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c]" />}
                        </span>
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              <SelectField
                name="primary_goal"
                label={tr("What's your primary goal?", "¿Cuál es tu objetivo principal?")}
                hint={tr(
                  "Promotion - International role - Client-facing communication - Presentations - Negotiations - Other",
                  "Ascenso - Rol internacional - Comunicacion con clientes - Presentaciones - Negociaciones - Otro",
                )}
              >
                <option value="" disabled>
                  {tr("Select one...", "Selecciona una opcion...")}
                </option>
                <option value="promotion_or_leadership">
                  {tr("Promotion or leadership role", "Ascenso o rol de liderazgo")}
                </option>
                <option value="international_role">
                  {tr("International role or relocation", "Rol internacional o reubicacion")}
                </option>
                <option value="client_communication">
                  {tr("Client-facing communication", "Comunicacion con clientes")}
                </option>
                <option value="presentations">
                  {tr("Presentations and public speaking", "Presentaciones y hablar en publico")}
                </option>
                <option value="negotiations">{tr("Negotiations", "Negociaciones")}</option>
                <option value="other">{tr("Other", "Otro")}</option>
              </SelectField>

              <TextAreaField
                name="motivation"
                label={tr(
                  "What's prompting you to invest in this now?",
                  "¿Qué te impulsa a invertir en esto ahora?",
                )}
                placeholder={tr(
                  "Promoted to a regional role last quarter - need to lead reviews in English by Q2...",
                  "Me ascendieron a un rol regional el trimestre pasado y necesito liderar reuniones en ingles para el segundo trimestre...",
                )}
              />

              <div className="h-px bg-white/10" />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField
                  name="preferred_start"
                  label={tr("Preferred start date", "Fecha ideal para empezar")}
                  hint={tr(
                    "Within 30 days - 1-3 months - 3+ months - Not sure yet",
                    "Dentro de 30 dias - 1 a 3 meses - Mas de 3 meses - Aun no estoy seguro",
                  )}
                >
                  <option value="" disabled>
                    {tr("Select one...", "Selecciona una opcion...")}
                  </option>
                  <option value="within_30_days">{tr("Within 30 days", "Dentro de 30 dias")}</option>
                  <option value="1_3_months">{tr("1-3 months", "1 a 3 meses")}</option>
                  <option value="3_plus_months">{tr("3+ months", "Mas de 3 meses")}</option>
                  <option value="not_sure">{tr("Not sure yet", "Aun no estoy seguro")}</option>
                </SelectField>
                <SelectField
                  name="weekly_hours"
                  label={tr(
                    "Weekly live-session hours available",
                    "Horas disponibles por semana para sesiones en vivo",
                  )}
                  hint={tr(
                    "Minimum four 60-minute sessions per week",
                    "Minimo de cuatro sesiones de 60 minutos por semana",
                  )}
                >
                  <option value="" disabled>
                    {tr("Select one...", "Selecciona una opcion...")}
                  </option>
                  <option value="3_4">3-4 hours</option>
                  <option value="4_5">4-5 hours</option>
                  <option value="5_plus">5+ hours</option>
                </SelectField>
              </div>

              <TextField
                name="referral_source"
                label={tr(
                  "How did you hear about Fluent with Sena?",
                  "¿Cómo supiste de Fluent with Sena?",
                )}
                placeholder={tr("LinkedIn, referral, search...", "LinkedIn, referido, busqueda...")}
              />

              <TextAreaField
                name="additional_notes"
                label={tr(
                  "Anything else relevant to your application?",
                  "¿Hay algo más relevante para tu aplicación?",
                )}
                optional
                placeholder={tr(
                  "Additional context, scheduling notes, or anything you'd like Sena to know...",
                  "Contexto adicional, notas de horario o cualquier cosa que quieras que Sena sepa...",
                )}
              />

              <div className="rounded-lg border border-[#c9a84c]/20 bg-[#c9a84c]/[0.06] px-5 py-4">
                <h3 className="mb-2 text-[0.8rem] font-semibold tracking-wide text-[#c9a84c]">
                  {tr("Program structure", "Estructura del programa")}
                </h3>
                <p className="text-[0.82rem] font-light leading-7 text-[#f4f1ec]/55">
                  {tr(
                    "Programs include 4 weekly live sessions on Zoom. Investment starts at $500 USD per program, with flexible payment plans available. Pricing and time commitment vary based on the personalized nature of the program.",
                    "Los programas incluyen 4 sesiones en vivo por Zoom cada semana. La inversion comienza en 500 USD por programa y hay planes de pago flexibles. El precio y el tiempo de dedicacion varian segun la naturaleza personalizada del programa.",
                  )}
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="group flex w-full items-center justify-center gap-2 rounded-none bg-[#c9a84c] px-8 py-4 text-[0.82rem] font-bold uppercase tracking-[0.1em] text-[#070d18] transition hover:-translate-y-0.5 hover:bg-[#e2c97e] hover:shadow-[0_12px_32px_rgba(201,168,76,0.28)]"
                >
                  {status === "submitting"
                    ? tr("Submitting...", "Enviando...")
                    : tr("Submit application", "Enviar aplicacion")}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
                {message && (
                  <p
                    className={`mt-4 rounded-lg border px-4 py-3 text-center text-sm ${
                      status === "success"
                        ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                        : "border-red-300/20 bg-red-400/10 text-red-100"
                    }`}
                  >
                    {message}
                  </p>
                )}
                <p className="mt-4 text-center text-[0.78rem] text-[#f4f1ec]/30">
                  {tr("Already a client?", "¿Ya eres cliente?")}{" "}
                  <Link
                    to="/signin"
                    className="text-[#f4f1ec]/55 underline underline-offset-4 transition hover:text-[#c9a84c]"
                  >
                    {tr("Sign in", "Iniciar sesion")}
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
