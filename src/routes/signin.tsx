import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, LockKeyhole, ShieldAlert } from "lucide-react";
import { useState } from "react";
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
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("Sign in is not ready yet. Please contact Sena for access.");
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
      setError("Sign-in succeeded, but no user session was returned.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    setLoading(false);

    if (profileError) {
      setError("We could not confirm your account access. Please contact Sena for help.");
      return;
    }

    if (profile?.role === "admin") {
      await navigate({ to: "/admin" });
    } else {
      await navigate({ to: "/" });
    }
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
                <Link
                  to="/"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35 transition hover:text-[#c9a84c]"
                >
                  Home
                </Link>
              </div>

              <div className="grid h-12 w-12 place-items-center rounded-lg border border-[#c9a84c]/25 bg-[#c9a84c]/10 text-[#c9a84c]">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <h1 className="mt-8 max-w-lg text-[clamp(2.2rem,4vw,4.4rem)] font-bold leading-[1.02] tracking-tight">
                Master professional English through a personalized roadmap and intensive 1:1
                Coaching.
              </h1>
              <p className="mt-6 max-w-sm text-sm leading-7 text-white/48">
                For Spanish-speaking professionals who need English to advance their career.
              </p>

              <div className="mt-14 flex flex-col gap-7">
                <Feature
                  number="01"
                  title="Personalized Learning"
                  body="A custom roadmap created for you, based on your current level and professional goals."
                />
                <Feature
                  number="02"
                  title="Built for your Career"
                  body="A blend of personalized AI materials, a curated course library, and live Zoom coaching that will teach you the professional English you need for your career."
                />
                <Feature
                  number="03"
                  title="Innovative Learning"
                  body="Instead of traditional grammar and worksheets, we combine AI tools and modern learning to teach you real, applicable English."
                />
              </div>
            </div>

            <p className="text-xs text-white/22">© 2026 Fluent with Sena. All rights reserved.</p>
          </div>
        </aside>

        <section className="flex items-center justify-center bg-[#0f1b2d] px-6 py-12">
          <div className="w-full max-w-md rounded-lg border border-white/8 bg-[#0e1825] p-7 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-white/45">
              Use the email and password provided by Fluent with Sena.
            </p>

            {!hasSupabaseEnv && (
              <div className="mt-6 rounded-lg border border-red-300/20 bg-red-400/7 p-4 text-sm text-red-200">
                <ShieldAlert className="mb-2 h-4 w-4" />
                Sign in is not ready yet. Please contact Sena for access.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/42">
                  Email
                </span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  autoComplete="email"
                  className="h-12 w-full rounded-lg border border-white/10 bg-[#0a1422] px-4 text-sm text-white outline-none transition focus:border-[#c9a84c]/50 focus:ring-4 focus:ring-[#c9a84c]/10"
                  placeholder="sena@example.com"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/42">
                  Password
                </span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  required
                  autoComplete="current-password"
                  className="h-12 w-full rounded-lg border border-white/10 bg-[#0a1422] px-4 text-sm text-white outline-none transition focus:border-[#c9a84c]/50 focus:ring-4 focus:ring-[#c9a84c]/10"
                  placeholder="••••••••"
                />
              </label>

              {error && (
                <div className="rounded-lg border border-red-300/20 bg-red-400/7 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !hasSupabaseEnv}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#c9a84c] text-xs font-bold uppercase tracking-[0.14em] text-[#070d18] transition hover:bg-[#e2c97e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
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
