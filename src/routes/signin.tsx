import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { LanguageToggle, useTranslate } from "../lib/language";
import { hasSupabaseEnv, supabase } from "../lib/supabase";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign In - Fluent with Sena" },
      {
        name: "description",
        content: "Sign in to Fluent with Sena.",
      },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const tr = useTranslate();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResetMessage("");

    if (!supabase) {
      setError(
        tr(
          "Sign in is not ready yet. Please contact Sena for access.",
          "El inicio de sesion aun no esta listo. Contacta a Sena para obtener acceso.",
        ),
      );
      return;
    }

    setLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setLoading(false);
      setError(
        tr(
          "Sign-in succeeded, but no user session was returned.",
          "El inicio de sesion fue exitoso, pero no se devolvio ninguna sesion de usuario.",
        ),
      );
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    setLoading(false);

    if (profileError) {
      setError(
        tr(
          "We could not confirm your account access. Please contact Sena for help.",
          "No pudimos confirmar el acceso de tu cuenta. Contacta a Sena para recibir ayuda.",
        ),
      );
      return;
    }

    if (profile?.role === "admin") {
      await navigate({ to: "/admin" });
    } else {
      await navigate({ to: "/student" });
    }
  }

  async function handleForgotPassword() {
    setError("");
    setResetMessage("");

    if (!supabase) {
      setError(
        tr(
          "Password reset is not ready yet. Please contact Sena for access.",
          "El restablecimiento de contrasena aun no esta listo. Contacta a Sena para obtener acceso.",
        ),
      );
      return;
    }

    if (!email.trim()) {
      setError(
        tr(
          "Enter your email address first so we know where to send the reset link.",
          "Ingresa primero tu correo electronico para saber a donde enviar el enlace de recuperacion.",
        ),
      );
      return;
    }

    setResetLoading(true);

    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/set-password` : undefined;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setResetLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setResetMessage(
      tr(
        "Password reset email sent. Open the link to choose a new password.",
        "Correo de recuperacion enviado. Abre el enlace para elegir una nueva contrasena.",
      ),
    );
  }

  return (
    <main className="min-h-screen bg-[#070d18] text-[#f4f1ec]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative overflow-hidden border-r border-white/5 bg-[#080f1a] px-8 py-10 md:px-14">
          <div className="relative z-10 flex min-h-full flex-col justify-between gap-12">
            <div>
              <div className="mb-14 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c9a84c]">
                  Fluent with Sena
                </span>
                <div className="flex items-center gap-3">
                  <LanguageToggle dark />
                  <Link
                    to="/"
                    className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35 transition hover:text-[#c9a84c]"
                  >
                    {tr("Home", "Inicio")}
                  </Link>
                </div>
              </div>

              <div className="grid h-12 w-12 place-items-center rounded-lg border border-[#c9a84c]/25 bg-[#c9a84c]/10 text-[#c9a84c]">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <h1 className="mt-8 max-w-lg text-[clamp(2.2rem,4vw,4.4rem)] font-bold leading-[1.02] tracking-tight">
                {tr(
                  "Master professional English through a personalized roadmap and intensive 1:1 coaching.",
                  "Domina el ingles profesional con una hoja de ruta personalizada y coaching intensivo 1:1.",
                )}
              </h1>
              <p className="mt-6 max-w-sm text-sm leading-7 text-white/48">
                {tr(
                  "For Spanish-speaking professionals who need English to advance their career.",
                  "Para profesionales hispanohablantes que necesitan ingles para avanzar en su carrera.",
                )}
              </p>

              <div className="mt-14 flex flex-col gap-7">
                <Feature
                  number="01"
                  title={tr("Personalized Learning", "Aprendizaje personalizado")}
                  body={tr(
                    "A custom roadmap created for you, based on your current level and professional goals.",
                    "Una hoja de ruta personalizada creada para ti, basada en tu nivel actual y tus metas profesionales.",
                  )}
                />
                <Feature
                  number="02"
                  title={tr("Built for your Career", "Construido para tu carrera")}
                  body={tr(
                    "A blend of personalized AI materials, a curated course library, and live Zoom coaching that will teach you the professional English you need for your career.",
                    "Una combinacion de materiales personalizados con IA, una biblioteca curada de cursos y coaching en vivo por Zoom que te ensenaran el ingles profesional que necesitas para tu carrera.",
                  )}
                />
                <Feature
                  number="03"
                  title={tr("Innovative Learning", "Aprendizaje innovador")}
                  body={tr(
                    "Instead of traditional grammar and worksheets, we combine AI tools and modern learning to teach you real, applicable English.",
                    "En lugar de gramatica tradicional y hojas de trabajo, combinamos IA y aprendizaje moderno para ensenarte ingles real y aplicable.",
                  )}
                />
              </div>
            </div>

            <p className="text-xs text-white/22">
              {tr(
                "Copyright 2026 Fluent with Sena. All rights reserved.",
                "Copyright 2026 Fluent with Sena. Todos los derechos reservados.",
              )}
            </p>
          </div>
        </aside>

        <section className="flex items-center justify-center bg-[#0f1b2d] px-6 py-12">
          <div className="w-full max-w-md rounded-lg border border-white/8 bg-[#0e1825] p-7 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
            <h2 className="text-2xl font-bold tracking-tight">
              {tr("Welcome back", "Bienvenido de nuevo")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/45">
              {tr(
                "Use your Fluent with Sena email and password. First time here? Open your setup link to create one.",
                "Usa tu correo y contrasena de Fluent with Sena. Es tu primera vez? Abre tu enlace de configuracion para crear una.",
              )}
            </p>

            {!hasSupabaseEnv && (
              <div className="mt-6 rounded-lg border border-red-300/20 bg-red-400/7 p-4 text-sm text-red-200">
                <ShieldAlert className="mb-2 h-4 w-4" />
                {tr(
                  "Sign in is not ready yet. Please contact Sena for access.",
                  "El inicio de sesion aun no esta listo. Contacta a Sena para obtener acceso.",
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/42">
                  {tr("Email", "Correo electronico")}
                </span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  autoComplete="email"
                  className="h-12 w-full rounded-lg border border-white/10 bg-[#0a1422] px-4 text-sm text-white outline-none transition focus:border-[#c9a84c]/50 focus:ring-4 focus:ring-[#c9a84c]/10"
                  placeholder={tr("sena@example.com", "sena@ejemplo.com")}
                />
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-white/42">
                    {tr("Password", "Contrasena")}
                  </span>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading || loading}
                    className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#c9a84c] transition hover:text-[#e2c97e] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resetLoading
                      ? tr("Sending...", "Enviando...")
                      : tr("Forgot password?", "Olvidaste tu contrasena?")}
                  </button>
                </div>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="h-12 w-full rounded-lg border border-white/10 bg-[#0a1422] px-4 pr-20 text-sm text-white outline-none transition focus:border-[#c9a84c]/50 focus:ring-4 focus:ring-[#c9a84c]/10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/48 transition hover:text-[#c9a84c]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  {showPassword ? tr("Hide", "Ocultar") : tr("Show", "Mostrar")}
                  </button>
                </div>
              </label>

              {error && (
                <div className="rounded-lg border border-red-300/20 bg-red-400/7 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {resetMessage && (
                <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                  {resetMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !hasSupabaseEnv}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#c9a84c] text-xs font-bold uppercase tracking-[0.14em] text-[#070d18] transition hover:bg-[#e2c97e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : tr("Sign in", "Iniciar sesion")}
                {!loading && (
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                )}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
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
