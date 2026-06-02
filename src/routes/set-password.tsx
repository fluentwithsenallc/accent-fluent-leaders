import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { hasSupabaseEnv, supabase } from "../lib/supabase";

export const Route = createFileRoute("/set-password")({
  head: () => ({
    meta: [
      { title: "Set Password - Fluent with Sena" },
      {
        name: "description",
        content: "Create or reset your Fluent with Sena dashboard password.",
      },
    ],
  }),
  component: SetPasswordPage,
});

type PasswordFlow = "invite" | "recovery";
type PasswordPageStatus = "verifying" | "ready" | "submitting" | "success" | "error";

function readPasswordLinkParams() {
  if (typeof window === "undefined") {
    return {
      type: null as PasswordFlow | null,
      tokenHash: "",
      accessToken: "",
      refreshToken: "",
      email: "",
    };
  }

  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const rawType = search.get("type") ?? hash.get("type");
  const type = rawType === "invite" || rawType === "recovery" ? rawType : null;

  return {
    type,
    tokenHash: search.get("token_hash") ?? "",
    accessToken: hash.get("access_token") ?? "",
    refreshToken: hash.get("refresh_token") ?? "",
    email: search.get("email") ?? hash.get("email") ?? "",
  };
}

async function resolveDashboardPath(userId: string) {
  if (!supabase) return "/signin" as const;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  return profile?.role === "admin" ? ("/admin" as const) : ("/student" as const);
}

function SetPasswordPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PasswordPageStatus>("verifying");
  const [flow, setFlow] = useState<PasswordFlow>("invite");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (!supabase) {
        if (!cancelled) {
          setStatus("error");
          setError("Password setup is not ready yet. Please contact Sena for access.");
        }
        return;
      }

      try {
        const params = readPasswordLinkParams();
        if (!params.type) {
          throw new Error("This password link is missing setup details. Request a fresh email link.");
        }

        setFlow(params.type);
        if (params.email) setEmail(params.email);

        if (params.accessToken && params.refreshToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: params.accessToken,
            refresh_token: params.refreshToken,
          });

          if (sessionError) throw sessionError;

          if (!cancelled) {
            setEmail(data.user?.email ?? params.email);
            setStatus("ready");
            setIsReady(true);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          return;
        }

        if (params.tokenHash) {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: params.tokenHash,
            type: params.type,
          });

          if (verifyError) throw verifyError;

          if (!cancelled) {
            setEmail(data.user?.email ?? params.email);
            setStatus("ready");
            setIsReady(true);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          throw new Error("This password link has expired. Request a fresh email link.");
        }

        if (!cancelled) {
          setEmail(session.user.email ?? params.email);
          setStatus("ready");
          setIsReady(true);
        }
      } catch (authError) {
        if (!cancelled) {
          setStatus("error");
          setError(
            authError instanceof Error
              ? authError.message
              : "We couldn't verify this password link.",
          );
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  const title = flow === "invite" ? "Create your password" : "Choose a new password";
  const subtitle = useMemo(
    () =>
      flow === "invite"
        ? "Set the password you want to use for future sign-ins. You can change it later in Settings."
        : "Choose a fresh password for your Fluent with Sena dashboard.",
    [flow],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setStatus("error");
      setError("Password setup is not ready yet. Please contact Sena for access.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setError("Use at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setStatus("error");
      setError("Passwords do not match.");
      return;
    }

    setStatus("submitting");
    setError("");

    const { data: updateData, error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setStatus("error");
      setError(updateError.message);
      return;
    }

    const userId = updateData.user?.id;
    if (!userId) {
      setStatus("error");
      setError("Your password was saved, but we couldn't finish opening the dashboard.");
      return;
    }

    setStatus("success");

    const destination = await resolveDashboardPath(userId);
    await navigate({ to: destination });
  }

  return (
    <main className="min-h-screen bg-[#070d18] text-[#f4f1ec]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="relative overflow-hidden border-r border-white/5 bg-[#080f1a] px-8 py-10 md:px-14">
          <div className="relative z-10 flex min-h-full flex-col justify-between gap-12">
            <div>
              <div className="mb-14 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c9a84c]">
                  Fluent with Sena
                </span>
                <Link
                  to="/signin"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35 transition hover:text-[#c9a84c]"
                >
                  Sign in
                </Link>
              </div>

              <div className="grid h-12 w-12 place-items-center rounded-lg border border-[#c9a84c]/25 bg-[#c9a84c]/10 text-[#c9a84c]">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h1 className="mt-8 max-w-lg text-[clamp(2.1rem,4vw,4rem)] font-bold leading-[1.02] tracking-tight">
                {title}
              </h1>
              <p className="mt-6 max-w-md text-sm leading-7 text-white/48">{subtitle}</p>

              <div className="mt-10 rounded-lg border border-[#c9a84c]/20 bg-[#c9a84c]/[0.08] p-5">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#e3c46a]">
                  First-login note
                </p>
                <p className="mt-3 text-sm leading-6 text-[#f4f1ec]/75">
                  PLEASE CREATE A NEW PASSWORD WHEN YOU LOG IN FOR THE FIRST TIME. THIS CAN BE
                  FOUND IN THE SETTINGS TAB.
                </p>
              </div>
            </div>

            <p className="text-xs text-white/22">© 2026 Fluent with Sena. All rights reserved.</p>
          </div>
        </aside>

        <section className="flex items-center justify-center bg-[#0f1b2d] px-6 py-12">
          <div className="w-full max-w-md rounded-lg border border-white/8 bg-[#0e1825] p-7 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/45">
              {email ? `Account: ${email}` : "Finish securing your dashboard access."}
            </p>

            {!hasSupabaseEnv && (
              <div className="mt-6 rounded-lg border border-red-300/20 bg-red-400/7 p-4 text-sm text-red-200">
                <ShieldAlert className="mb-2 h-4 w-4" />
                Password setup is not ready yet. Please contact Sena for access.
              </div>
            )}

            {status === "verifying" && (
              <div className="mt-8 flex items-center gap-3 rounded-lg border border-white/8 bg-[#0a1422] px-4 py-4 text-sm text-white/65">
                <Loader2 className="h-4 w-4 animate-spin text-[#c9a84c]" />
                Verifying your password link...
              </div>
            )}

            {status === "error" && error && (
              <div className="mt-6 rounded-lg border border-red-300/20 bg-red-400/7 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {isReady && (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <PasswordField
                  label={flow === "invite" ? "Create Password" : "New Password"}
                  value={password}
                  onChange={setPassword}
                  visible={showPassword}
                  onToggle={() => setShowPassword((current) => !current)}
                  autoComplete="new-password"
                />

                <PasswordField
                  label="Confirm Password"
                  value={confirm}
                  onChange={setConfirm}
                  visible={showConfirm}
                  onToggle={() => setShowConfirm((current) => !current)}
                  autoComplete="new-password"
                />

                <p className="rounded-lg border border-white/8 bg-[#0a1422] px-4 py-3 text-xs leading-6 text-white/45">
                  Use the <strong className="text-white">Show</strong> button if you want to check
                  what you typed before saving.
                </p>

                <button
                  type="submit"
                  disabled={status === "submitting" || !hasSupabaseEnv}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#c9a84c] text-xs font-bold uppercase tracking-[0.14em] text-[#070d18] transition hover:bg-[#e2c97e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "submitting" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Save password
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/42">
        {label}
      </span>
      <div className="relative">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          className="h-12 w-full rounded-lg border border-white/10 bg-[#0a1422] px-4 pr-20 text-sm text-white outline-none transition focus:border-[#c9a84c]/50 focus:ring-4 focus:ring-[#c9a84c]/10"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/48 transition hover:text-[#c9a84c]"
        >
          {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}
