import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
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

const levels = [
  "I know some words and phrases but can't hold a real conversation yet",
  "I can communicate but often hesitate, search for words, or avoid certain topics",
  "I'm comfortable in most situations but want more polish, precision, and authority",
];

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
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.8rem] font-medium tracking-wide text-[#f4f1ec]/70">
        {label}{" "}
        {optional ? (
          <span className="text-[0.75rem] font-light text-[#f4f1ec]/35">(Optional)</span>
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
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.8rem] font-medium tracking-wide text-[#f4f1ec]/70">
        {label}{" "}
        {optional ? (
          <span className="text-[0.75rem] font-light text-[#f4f1ec]/35">(Optional)</span>
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
  const [selectedLevel, setSelectedLevel] = useState(2);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    if (!hasSupabaseEnv || !supabase) {
      setStatus("error");
      setMessage("Application system is not configured yet. Please contact Sena directly.");
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
      setMessage(error.message || "Something went wrong. Please try again.");
      return;
    }

    form.reset();
    setSelectedLevel(2);
    setStatus("success");
    setMessage("Application submitted. Sena will review it and follow up within 48 hours.");
  };

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
                <Link
                  to="/"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f4f1ec]/35 transition hover:text-[#c9a84c]"
                >
                  Home
                </Link>
              </div>

              <h1 className="max-w-xl text-[clamp(2rem,3.2vw,2.9rem)] font-bold leading-[1.1] tracking-[-0.025em] text-[#f4f1ec]">
                Master professional English through a personalized roadmap and intensive 1:1
                coaching.
              </h1>

              <p className="mt-6 max-w-sm text-[0.9rem] font-light leading-7 text-[#f4f1ec]/50">
                For Spanish-speaking professionals who need English to advance their careers.
              </p>

              <div className="mt-14 flex flex-col gap-7">
                <Feature
                  number="01"
                  title="Personalized learning"
                  body="A custom roadmap created for you, based on your current level and professional goals."
                />
                <Feature
                  number="02"
                  title="Built for your career"
                  body="A blend of AI tools, a curated immersion library, and live Zoom coaching that teaches the professional English your career demands."
                />
                <Feature
                  number="03"
                  title="Innovative learning"
                  body="Instead of traditional grammar and worksheets, we combine AI tools and modern learning methods to teach you real, applicable English."
                />
              </div>
            </div>

            <p className="text-[0.7rem] tracking-wide text-[#f4f1ec]/20">
              © 2026 Fluent with Sena LLC
            </p>
          </div>
        </aside>

        <section className="bg-[#0f1b2d] px-8 py-12 lg:px-14 lg:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#f4f1ec]">
              Apply for coaching
            </h2>
            <p className="mt-2 max-w-lg text-[0.875rem] font-light leading-7 text-[#f4f1ec]/50">
              Share your current situation and goals. Sena will respond within 48 hours with the
              next steps.
            </p>

            <form className="mt-12 flex flex-col gap-7" onSubmit={handleSubmit}>
              <TextField name="full_name" label="Full name" placeholder="Maria Rodriguez" />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="maria@example.com"
                />
                <TextField
                  name="linkedin_url"
                  label="LinkedIn URL"
                  type="url"
                  optional
                  placeholder="linkedin.com/in/..."
                />
              </div>

              <TextField
                name="current_role"
                label="Current role & industry"
                placeholder="Senior HR Business Partner, Tech"
              />
              <input type="hidden" name="industry" value="" />

              <div className="h-px bg-white/10" />

              <div className="flex flex-col gap-3">
                <span className="text-[0.8rem] font-medium tracking-wide text-[#f4f1ec]/70">
                  Where are you with English right now? <span className="text-[#c9a84c]">*</span>
                </span>
                <div className="flex flex-col gap-2.5">
                  {levels.map((level, index) => {
                    const selected = selectedLevel === index;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSelectedLevel(index)}
                        className={`flex items-start gap-3 rounded-lg border p-4 text-left text-sm font-light leading-6 transition ${
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
                label="What's your primary goal?"
                hint="Promotion - International role - Client-facing communication - Presentations - Negotiations - Other"
              >
                <option value="" disabled>
                  Select one...
                </option>
                <option value="promotion_or_leadership">Promotion or leadership role</option>
                <option value="international_role">International role or relocation</option>
                <option value="client_communication">Client-facing communication</option>
                <option value="presentations">Presentations and public speaking</option>
                <option value="negotiations">Negotiations</option>
                <option value="other">Other</option>
              </SelectField>

              <TextAreaField
                name="motivation"
                label="What's prompting you to invest in this now?"
                placeholder="Promoted to a regional role last quarter - need to lead reviews in English by Q2..."
              />

              <div className="h-px bg-white/10" />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField
                  name="preferred_start"
                  label="Preferred start date"
                  hint="Within 30 days - 1-3 months - 3+ months - Not sure yet"
                >
                  <option value="" disabled>
                    Select one...
                  </option>
                  <option value="within_30_days">Within 30 days</option>
                  <option value="1_3_months">1-3 months</option>
                  <option value="3_plus_months">3+ months</option>
                  <option value="not_sure">Not sure yet</option>
                </SelectField>
                <SelectField
                  name="weekly_hours"
                  label="Weekly in-session hours available"
                  hint="Minimum four 60-minute sessions per week"
                >
                  <option value="" disabled>
                    Select one...
                  </option>
                  <option value="3_4">3-4 hours</option>
                  <option value="4_5">4-5 hours</option>
                  <option value="5_plus">5+ hours</option>
                </SelectField>
              </div>

              <TextField
                name="referral_source"
                label="How did you hear about Fluent with Sena?"
                placeholder="LinkedIn, referral, search..."
              />

              <TextAreaField
                name="additional_notes"
                label="Anything else relevant to your application?"
                optional
                placeholder="Additional context, scheduling notes, or anything you'd like Sena to know..."
              />

              <div className="rounded-lg border border-[#c9a84c]/20 bg-[#c9a84c]/[0.06] px-5 py-4">
                <h3 className="mb-2 text-[0.8rem] font-semibold tracking-wide text-[#c9a84c]">
                  Program structure
                </h3>
                <p className="text-[0.82rem] font-light leading-7 text-[#f4f1ec]/55">
                  Programs include 4 weekly live sessions on Zoom. Investment starts at $500 USD per
                  program, with flexible payment plans available. Pricing and time commitment vary
                  based on the personalized nature of the program.
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#c9a84c] px-8 py-4 text-[0.82rem] font-bold uppercase tracking-[0.1em] text-[#070d18] transition hover:-translate-y-0.5 hover:bg-[#e2c97e] hover:shadow-[0_12px_32px_rgba(201,168,76,0.28)]"
                >
                  {status === "submitting" ? "Submitting..." : "Submit application"}
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
                  Already a client?{" "}
                  <Link
                    to="/signin"
                    className="text-[#f4f1ec]/55 underline underline-offset-4 transition hover:text-[#c9a84c]"
                  >
                    Sign in
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
