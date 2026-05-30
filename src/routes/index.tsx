import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  BookOpen,
  LayoutDashboard,
  Library,
  Linkedin,
  Map,
  Menu,
  Star,
  X,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fluent with Sena" },
      {
        name: "description",
        content:
          "Personalized English coaching for Hispanic professionals ready to lead in English.",
      },
      { property: "og:title", content: "Fluent with Sena" },
      {
        property: "og:description",
        content:
          "Stop translating in your head and start leading in English with a program built around your voice, industry, and goals.",
      },
    ],
  }),
  component: Landing,
});

function useReveal() {
  useEffect(() => {
    const items = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
}

function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

function GoldButton({
  children,
  href = "/apply",
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-7 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground shadow-[0_16px_42px_-22px_var(--primary)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-bright hover:shadow-[0_18px_44px_-20px_var(--primary)] active:translate-y-0 ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

function TextButton({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-12 items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-foreground/82 transition-colors hover:text-foreground"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

function SectionRule({
  children,
  centered = false,
}: {
  children: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <div
      className={`reveal flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary ${
        centered ? "justify-center" : ""
      }`}
    >
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-primary/60" />
      <span>{children}</span>
      {centered && <span className="h-px w-14 bg-gradient-to-r from-primary/60 to-transparent" />}
    </div>
  );
}

function Landing() {
  useReveal();
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "#home", label: "Home" },
    { href: "#program", label: "Program" },
    { href: "#results", label: "Results" },
    { href: "/signin", label: "Sign In" },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-white/5 bg-background/92 backdrop-blur-xl"
            : "bg-background/55"
        }`}
      >
        <nav className="mx-auto flex min-h-[70px] max-w-7xl items-center justify-between px-5 md:px-8">
          <a href="#home" className="text-xl font-semibold tracking-tight text-foreground">
            Fluent with Sena
          </a>

          <div className="hidden items-center gap-9 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/64 transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <GoldButton className="min-h-10 px-5">Apply for Coaching</GoldButton>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-md border border-white/10 text-foreground md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-white/5 bg-background px-5 py-5 md:hidden">
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/74"
                >
                  {link.label}
                </a>
              ))}
              <GoldButton className="w-full">Apply for Coaching</GoldButton>
            </div>
          </div>
        )}
      </header>

      <Hero />
      <ProgramIntro />
      <ProcessSteps />
      <FullSystem />
      <Testimonials />
      <FinalCta />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section id="home" className="hero-surface relative overflow-hidden pt-[70px]">
      <div className="mx-auto grid min-h-[650px] max-w-7xl grid-cols-1 items-center gap-10 px-5 py-16 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-10">
        <div className="reveal pt-8 lg:pt-0">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            English coaching for Hispanic professionals
          </p>
          <h1 className="max-w-3xl font-sans text-[clamp(2.8rem,6.2vw,5.9rem)] font-bold leading-[0.98] tracking-tight">
            The <span className="text-primary">English mastery program</span> for Hispanic Leaders
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-foreground/70 md:text-lg">
            Stop translating in your head and start leading in English. A personalized English
            program built for your voice, your industry, and your goals.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <GoldButton>Apply for Coaching</GoldButton>
            <TextButton href="#program">Inside the Program</TextButton>
          </div>
        </div>

        <div className="reveal relative flex min-h-[440px] items-end justify-center lg:min-h-[590px]">
          <img
            src="https://ebecd6d012a4750b05cf2b81c1b867a7.cdn.bubble.io/f1777542118760x615048179195580800/Gemini_Generated_Image_494b3o494b3o494b%20%281%29%201.svg"
            alt="Sena, English fluency coach"
            className="h-[430px] w-full object-contain object-bottom drop-shadow-[0_42px_70px_rgba(0,0,0,0.42)] md:h-[560px] lg:h-[620px]"
          />
        </div>
      </div>
    </section>
  );
}

function ProgramIntro() {
  return (
    <section id="program" className="section-dark relative border-t border-white/5 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 md:px-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="reveal">
          <SectionRule>The Complete Learning System</SectionRule>
          <h2 className="mt-5 max-w-xl text-[clamp(2.5rem,4.5vw,4.45rem)] font-bold leading-[1.02] tracking-tight">
            More Than Just English Lessons
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-7 text-foreground/66 md:text-base">
            Fluent with Sena is an intensive English fluency program built for career professionals.
            It combines personalized 1:1 coaching, real-world simulations, and practical AI tools to
            create a learning experience that is entirely your own.
          </p>
          <div className="mt-8">
            <GoldButton>Apply for Coaching</GoldButton>
          </div>
        </div>

        <div className="reveal overflow-hidden rounded-lg border border-white/8 bg-card shadow-[0_28px_80px_rgba(0,0,0,0.32)]">
          <img
            src="https://ebecd6d012a4750b05cf2b81c1b867a7.cdn.bubble.io/f1779272153887x513859800857069400/DASHBOARD%282%29.svg"
            alt="Fluent with Sena student dashboard"
            className="h-full min-h-[330px] w-full object-cover object-left-top"
          />
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Assess",
    tag: "Week 1",
    body: "We map your starting point, goals, and timeline together.",
  },
  {
    n: "02",
    title: "Build Your Roadmap",
    tag: "Week 1-2",
    body: "Your program is built around your industry, real situations, and leadership goals.",
  },
  {
    n: "03",
    title: "Speak Live",
    tag: "Full Program",
    body: "Meet on Zoom 4 times every week for live coaching, then use AI tools for customized practice.",
  },
  {
    n: "04",
    title: "Deliver",
    tag: "Program End",
    body: "See outcomes in conversations, calls, interviews, presentations, and higher-stakes rooms.",
  },
];

function ProcessSteps() {
  const [completedStep, setCompletedStep] = useState(-1);
  const [glowingStep, setGlowingStep] = useState(-1);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = document.getElementById("process-steps");
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.28 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const timers = STEPS.flatMap((_, index) => [
      window.setTimeout(
        () => {
          setCompletedStep(index);
          setGlowingStep(index);
        },
        450 + index * 760,
      ),
      window.setTimeout(() => setGlowingStep(-1), 980 + index * 760),
    ]);
    return () => timers.forEach(window.clearTimeout);
  }, [started]);

  const trackWidth =
    completedStep < 0 ? 0 : completedStep === STEPS.length - 1 ? 100 : 12.5 + completedStep * 25;

  return (
    <section
      id="process-steps"
      className="process-section relative border-t border-white/5 py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionRule centered>How It Works</SectionRule>
        <h2 className="reveal mx-auto mt-5 max-w-3xl text-center text-[clamp(2.4rem,4.2vw,4rem)] font-bold leading-[1.04] tracking-tight">
          The 4 Steps to Fluency
        </h2>

        <div className="relative mt-16 md:mt-20">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {STEPS.map((step, index) => {
              const isActive = glowingStep === index;
              const hasPlayed = started && completedStep >= index;
              return (
                <div
                  key={step.n}
                  className={`step-wrap ${isActive ? "is-glowing" : ""} ${
                    hasPlayed ? "is-visible" : ""
                  }`}
                >
                  <article className="step-card">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[11px] font-bold tracking-[0.06em] text-primary">
                      {step.n}
                    </div>
                    <h3 className="mt-5 text-lg font-bold tracking-tight">{step.title}</h3>
                    <p className="mt-3 min-h-[5.5rem] text-sm font-light leading-7 text-foreground/58">
                      {step.body}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-primary/70">
                      <span className="h-px w-3 bg-primary/55" />
                      {step.tag}
                    </div>
                  </article>
                  <span className="step-stem" />
                  <span className="step-dot" />
                </div>
              );
            })}
          </div>

          <div className="track-road" aria-hidden="true">
            <div className="track-fill" style={{ width: `${trackWidth}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Map,
    title: "Personalized Roadmap",
    body: "Your custom roadmap is a living plan designed to keep you organized and guide you to fluency.",
    badge: "All Tiers",
  },
  {
    icon: LayoutDashboard,
    title: "Student Dashboard",
    body: "Your full program in one place: weekly objectives, session notes, progress tracking, and rewards.",
    badge: "All Tiers",
  },
  {
    icon: Library,
    title: "Immersion Library",
    body: "A library of native English media, shows, podcasts, books, and guided practice prompts.",
    badge: "All Tiers",
  },
  {
    icon: Bot,
    title: "AI Conversation Partner",
    body: "Practice speaking between sessions, simulate real scenarios, and build confidence out loud.",
    badge: "Powered by ChatGPT Voice",
    wide: true,
  },
  {
    icon: BookOpen,
    title: "NotebookLM Study Guides",
    body: "Turn your source materials into custom audio lessons, summaries, and personalized study tools.",
    badge: "Powered by NotebookLM",
    wide: true,
  },
];

function FullSystem() {
  return (
    <section className="system-section relative border-t border-white/5 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionRule centered>The Full System</SectionRule>
        <h2 className="reveal mt-5 text-center text-[clamp(2.35rem,4.4vw,4rem)] font-bold leading-tight tracking-tight">
          Everything You Need
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
          {FEATURES.map((feature, index) => (
            <article
              key={feature.title}
              className={`feature-card reveal ${feature.wide ? "lg:col-span-3" : "lg:col-span-2"}`}
              style={{ transitionDelay: `${index * 85}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/[0.05] text-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-7 text-xl font-bold tracking-tight">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-foreground/58">{feature.body}</p>
              <div className="mt-6 inline-flex rounded-md bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-primary/80">
                {feature.badge}
              </div>
            </article>
          ))}
        </div>

        <div className="reveal mt-12 flex justify-center">
          <GoldButton>Apply for Coaching</GoldButton>
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    quote: "The setup was effortless, and I started seeing real results within the first week.",
    name: "David Chen",
    role: "Head of Supply Chain, CargoLink",
    initials: "DC",
  },
  {
    quote:
      "I finally stopped freezing in meetings. My manager noticed before I even said anything.",
    name: "Maria Lopez",
    role: "Sales Manager, Hospitality Group",
    initials: "ML",
  },
  {
    quote:
      "I gave my first presentation in English and it went better than anything I had done before.",
    name: "Ricardo Vargas",
    role: "Project Lead, Construction",
    initials: "RV",
  },
  {
    quote:
      "Within two months I was leading calls I used to avoid entirely. This changed my career.",
    name: "Aiko Kimura",
    role: "Operations Director, TechBridge",
    initials: "AK",
  },
];

function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCurrent((item) => (item + 1) % TESTIMONIALS.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      id="results"
      className="testimonials-section relative border-t border-white/5 py-24 md:py-32"
    >
      <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
        <SectionRule centered>Testimonials</SectionRule>
        <h2 className="reveal mt-5 text-[clamp(2.4rem,4vw,3.8rem)] font-bold leading-tight tracking-tight">
          True Fluency
        </h2>

        <div className="reveal relative mx-auto mt-14 min-h-[330px] max-w-[620px]">
          {TESTIMONIALS.map((item, index) => {
            const offset = (index - current + TESTIMONIALS.length) % TESTIMONIALS.length;
            const state =
              offset === 0
                ? "active"
                : offset === 1
                  ? "behind-one"
                  : offset === 2
                    ? "behind-two"
                    : "hidden";
            return (
              <article key={item.name} className={`review-card ${state}`}>
                <div className="flex justify-center gap-1.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-7 text-lg font-light italic leading-8 text-foreground/82">
                  "{item.quote}"
                </p>
                <div className="mx-auto mt-8 h-px w-10 bg-white/10" />
                <div className="mt-7 flex items-center justify-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/35 bg-primary text-xs font-bold text-primary-foreground">
                    {item.initials}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold">{item.name}</div>
                    <div className="mt-1 text-xs text-foreground/42">{item.role}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {TESTIMONIALS.map((item, index) => (
            <button
              key={item.name}
              type="button"
              aria-label={`Show testimonial ${index + 1}`}
              onClick={() => setCurrent(index)}
              className={`h-1.5 rounded-full transition-all ${
                current === index ? "w-6 bg-primary" : "w-1.5 bg-foreground/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="section-dark border-t border-white/5 px-5 py-24 text-center md:px-8 md:py-32">
      <SectionRule centered>Start Today</SectionRule>
      <h2 className="reveal mx-auto mt-6 max-w-4xl text-[clamp(2.4rem,5.6vw,5.5rem)] font-bold leading-[1.02] tracking-tight">
        Stop Translating.
        <br />
        <span className="text-primary">Start Leading.</span>
      </h2>
      <p className="reveal mx-auto mt-7 max-w-2xl text-sm leading-7 text-foreground/68 md:text-base">
        4 sessions a week, professional live coaching, and a program built around you. Apply for
        coaching today - spots are limited.
      </p>
      <div className="reveal mt-10">
        <GoldButton>Apply for Coaching</GoldButton>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-7">
        <div className="flex gap-3">
          <a
            href="https://www.linkedin.com/in/fluentwithsena"
            aria-label="LinkedIn"
            target="_blank"
            rel="noreferrer"
            className="grid h-11 w-11 place-items-center rounded-md border border-white/8 bg-accent/10 text-foreground transition-all hover:-translate-y-0.5 hover:border-accent/50"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground/50">
          <a href="/terms" className="transition-colors hover:text-primary">
            Terms & Conditions
          </a>
          <span className="text-foreground/25">.</span>
          <a href="/privacy" className="transition-colors hover:text-primary">
            Privacy Policy
          </a>
          <span className="text-foreground/25">.</span>
          <a href="/cookies" className="transition-colors hover:text-primary">
            Cookie Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
