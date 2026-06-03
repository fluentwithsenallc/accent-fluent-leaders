import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Library,
  Linkedin,
  Map,
  Menu,
  Star,
  X,
} from "lucide-react";
import { LanguageToggle, useAppLanguage, useTranslate } from "../lib/language";

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

function useReveal(languageKey?: string) {
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
  }, [languageKey]);
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
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-none bg-primary px-7 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground shadow-[0_16px_42px_-22px_var(--primary)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-bright hover:shadow-[0_18px_44px_-20px_var(--primary)] active:translate-y-0 ${className}`}
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
  const { language } = useAppLanguage();
  const tr = useTranslate();
  useReveal(language);
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "#home", label: tr("Home", "Inicio") },
    { href: "#program", label: tr("Program", "Programa") },
    { href: "#results", label: tr("Results", "Resultados") },
    { href: "/signin", label: tr("Sign In", "Iniciar sesion") },
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

          <div className="hidden items-center gap-3 md:flex">
            <LanguageToggle />
            <GoldButton className="min-h-10 px-5">
              {tr("Apply for Coaching", "Aplicar a coaching")}
            </GoldButton>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-none border border-white/10 text-foreground md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-white/5 bg-background px-5 py-5 md:hidden">
            <div className="flex flex-col gap-4">
              <LanguageToggle />
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
              <GoldButton className="w-full">
                {tr("Apply for Coaching", "Aplicar a coaching")}
              </GoldButton>
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
  const tr = useTranslate();
  return (
    <section id="home" className="hero-surface relative overflow-hidden pt-[70px]">
      <div className="mx-auto grid min-h-[650px] max-w-7xl grid-cols-1 items-center gap-8 px-5 py-16 md:min-h-[calc(100vh-70px)] md:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)] md:px-8 md:pb-0 md:pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:pt-10">
        <div className="reveal pt-8 lg:pt-0">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            {tr(
              "English coaching for Hispanic professionals",
              "Coaching de ingles para profesionales hispanos",
            )}
          </p>
          <h1 className="max-w-3xl font-sans text-[clamp(2.8rem,6.2vw,5.9rem)] font-bold leading-[0.98] tracking-tight">
            {tr("The ", "El ")}
            <span className="text-primary">
              {tr("English mastery program", "programa de dominio del ingles")}
            </span>
            {tr(" for Hispanic Leaders", " para lideres hispanos")}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-foreground/70 md:text-lg">
            {tr(
              "Stop translating in your head and start leading in English. A personalized English program built for your voice, your industry, and your goals.",
              "Deja de traducir en tu cabeza y empieza a liderar en ingles. Un programa personalizado construido para tu voz, tu industria y tus metas.",
            )}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <GoldButton>{tr("Apply for Coaching", "Aplicar a coaching")}</GoldButton>
            <TextButton href="#program">{tr("Inside the Program", "Dentro del programa")}</TextButton>
          </div>
        </div>

        <div className="reveal relative flex min-h-[440px] items-end justify-center self-end md:min-h-[610px] lg:min-h-[650px]">
          <img
            src="https://ebecd6d012a4750b05cf2b81c1b867a7.cdn.bubble.io/f1777542118760x615048179195580800/Gemini_Generated_Image_494b3o494b3o494b%20%281%29%201.svg"
            alt="Sena, English fluency coach"
            className="h-[430px] w-full max-w-[520px] object-contain object-bottom drop-shadow-[0_42px_70px_rgba(0,0,0,0.42)] md:h-[640px] md:max-w-none lg:h-[710px] xl:h-[calc(100vh-70px)] xl:max-h-[860px] xl:min-h-[760px]"
          />
        </div>
      </div>
    </section>
  );
}

function ProgramIntro() {
  const tr = useTranslate();
  return (
    <section id="program" className="section-dark relative border-t border-white/5 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 md:px-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="reveal">
          <SectionRule>{tr("The Complete Learning System", "El sistema completo de aprendizaje")}</SectionRule>
          <h2 className="mt-5 max-w-xl text-[clamp(2.5rem,4.5vw,4.45rem)] font-bold leading-[1.02] tracking-tight">
            {tr("More Than Just English Lessons", "Mucho mas que clases de ingles")}
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-7 text-foreground/66 md:text-base">
            {tr(
              "Fluent with Sena is an intensive English fluency program built for career professionals. It combines personalized 1:1 coaching, real-world simulations, and practical AI tools to create a learning experience that is entirely your own.",
              "Fluent with Sena es un programa intensivo de fluidez en ingles construido para profesionales. Combina coaching 1:1 personalizado, simulaciones reales y herramientas practicas de IA para crear una experiencia de aprendizaje totalmente tuya.",
            )}
          </p>
          <div className="mt-8">
            <GoldButton>{tr("Apply for Coaching", "Aplicar a coaching")}</GoldButton>
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

function ProcessSteps() {
  const tr = useTranslate();
  const [completedStep, setCompletedStep] = useState(-1);
  const [glowingStep, setGlowingStep] = useState(-1);
  const [started, setStarted] = useState(false);
  const steps = [
    {
      n: "01",
      title: tr("Assess", "Evaluar"),
      tag: tr("Week 1", "Semana 1"),
      body: tr(
        "We map your starting point, goals, and timeline together.",
        "Trazamos juntos tu punto de partida, tus metas y tu linea de tiempo.",
      ),
    },
    {
      n: "02",
      title: tr("Build Your Roadmap", "Construye tu hoja de ruta"),
      tag: tr("Week 1-2", "Semanas 1-2"),
      body: tr(
        "Your program is built around your industry, real situations, and leadership goals.",
        "Tu programa se construye alrededor de tu industria, situaciones reales y metas de liderazgo.",
      ),
    },
    {
      n: "03",
      title: tr("Speak Live", "Habla en vivo"),
      tag: tr("Full Program", "Programa completo"),
      body: tr(
        "Meet on Zoom 4 times every week for live coaching, then use AI tools for customized practice.",
        "Reunete por Zoom 4 veces por semana para coaching en vivo y despues usa herramientas de IA para practica personalizada.",
      ),
    },
    {
      n: "04",
      title: tr("Deliver", "Ejecuta"),
      tag: tr("Program End", "Fin del programa"),
      body: tr(
        "See outcomes in conversations, calls, interviews, presentations, and higher-stakes rooms.",
        "Ve resultados en conversaciones, llamadas, entrevistas, presentaciones y espacios de mayor exigencia.",
      ),
    },
  ];

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
    const timers = steps.flatMap((_, index) => [
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
    completedStep < 0 ? 0 : completedStep === steps.length - 1 ? 100 : 12.5 + completedStep * 25;

  return (
    <section
      id="process-steps"
      className="process-section relative border-t border-white/5 py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionRule centered>{tr("How It Works", "Como funciona")}</SectionRule>
        <h2 className="reveal mx-auto mt-5 max-w-3xl text-center text-[clamp(2.4rem,4.2vw,4rem)] font-bold leading-[1.04] tracking-tight">
          {tr("The 4 Steps to Fluency", "Los 4 pasos hacia la fluidez")}
        </h2>

        <div className="relative mt-16 md:mt-20">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {steps.map((step, index) => {
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

function FullSystem() {
  const tr = useTranslate();
  const features = [
    {
      icon: Map,
      title: tr("Personalized Roadmap", "Hoja de ruta personalizada"),
      body: tr(
        "Your custom roadmap is a living plan designed to keep you organized and guide you to fluency.",
        "Tu hoja de ruta personalizada es un plan vivo disenado para mantenerte organizado y guiarte hacia la fluidez.",
      ),
      badge: tr("All Tiers", "Todos los niveles"),
    },
    {
      icon: LayoutDashboard,
      title: tr("Student Dashboard", "Panel del estudiante"),
      body: tr(
        "Your full program in one place: weekly objectives, session notes, progress tracking, and rewards.",
        "Todo tu programa en un solo lugar: objetivos semanales, notas de sesion, seguimiento de progreso y recompensas.",
      ),
      badge: tr("All Tiers", "Todos los niveles"),
    },
    {
      icon: Library,
      title: tr("Immersion Library", "Biblioteca de inmersion"),
      body: tr(
        "A library of native English media, shows, podcasts, books, and guided practice prompts.",
        "Una biblioteca de contenido nativo en ingles, series, podcasts, libros y guias de practica.",
      ),
      badge: tr("All Tiers", "Todos los niveles"),
    },
    {
      icon: Bot,
      title: tr("AI Conversation Partner", "Companero de conversacion con IA"),
      body: tr(
        "Practice speaking between sessions, simulate real scenarios, and build confidence out loud.",
        "Practica hablar entre sesiones, simula escenarios reales y construye confianza en voz alta.",
      ),
      badge: tr("Powered by ChatGPT Voice", "Impulsado por ChatGPT Voice"),
      wide: true,
    },
    {
      icon: BookOpen,
      title: tr("NotebookLM Study Guides", "Guias de estudio con NotebookLM"),
      body: tr(
        "Turn your source materials into custom audio lessons, summaries, and personalized study tools.",
        "Convierte tus materiales en lecciones de audio, resumenes y herramientas de estudio personalizadas.",
      ),
      badge: tr("Powered by NotebookLM", "Impulsado por NotebookLM"),
      wide: true,
    },
  ];

  return (
    <section className="system-section relative border-t border-white/5 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionRule centered>{tr("The Full System", "El sistema completo")}</SectionRule>
        <h2 className="reveal mt-5 text-center text-[clamp(2.35rem,4.4vw,4rem)] font-bold leading-tight tracking-tight">
          {tr("Everything You Need", "Todo lo que necesitas")}
        </h2>

        <div className="feature-grid mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={`feature-card reveal ${feature.wide ? "lg:col-span-3" : "lg:col-span-2"}`}
              style={{ transitionDelay: `${index * 85}ms` }}
            >
              <div className="feature-card-icon">
                <feature.icon className="h-5 w-5" />
              </div>
              <div className="feature-card-copy">
                <h3 className="mt-7 text-xl font-bold tracking-tight">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-foreground/58">{feature.body}</p>
              </div>
              <div className="feature-card-badge">
                {feature.badge}
              </div>
            </article>
          ))}
        </div>

        <div className="reveal mt-12 flex justify-center">
          <GoldButton>{tr("Apply for Coaching", "Aplicar a coaching")}</GoldButton>
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
  const tr = useTranslate();
  const [current, setCurrent] = useState(0);

  const showPrevious = () => {
    setCurrent((item) => (item - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const showNext = () => {
    setCurrent((item) => (item + 1) % TESTIMONIALS.length);
  };

  return (
    <section
      id="results"
      className="testimonials-section relative border-t border-white/5 py-24 md:py-32"
    >
      <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
        <SectionRule centered>{tr("Testimonials", "Testimonios")}</SectionRule>
        <h2 className="reveal mt-5 text-[clamp(2.4rem,4vw,3.8rem)] font-bold leading-tight tracking-tight">
          {tr("True Fluency", "Fluidez real")}
        </h2>

        <div
          className="reveal relative mx-auto mt-14 min-h-[330px] max-w-[620px]"
          aria-live="polite"
        >
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

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={showPrevious}
            className="grid h-11 w-11 place-items-center rounded-none border border-white/8 bg-white/4 text-foreground transition hover:-translate-y-0.5 hover:border-primary/45 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex justify-center gap-2">
            {TESTIMONIALS.map((item, index) => (
              <button
                key={item.name}
                type="button"
                aria-label={`Show testimonial ${index + 1}`}
                onClick={() => setCurrent(index)}
                className={`h-1.5 rounded-none transition-all ${
                  current === index ? "w-6 bg-primary" : "w-1.5 bg-foreground/20"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next testimonial"
            onClick={showNext}
            className="grid h-11 w-11 place-items-center rounded-none border border-white/8 bg-white/4 text-foreground transition hover:-translate-y-0.5 hover:border-primary/45 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const tr = useTranslate();
  return (
    <section className="section-dark border-t border-white/5 px-5 py-24 text-center md:px-8 md:py-32">
      <SectionRule centered>{tr("Start Today", "Empieza hoy")}</SectionRule>
      <h2 className="reveal mx-auto mt-6 max-w-4xl text-[clamp(2.4rem,5.6vw,5.5rem)] font-bold leading-[1.02] tracking-tight">
        {tr("Stop Translating.", "Deja de traducir.")}
        <br />
        <span className="text-primary">{tr("Start Leading.", "Empieza a liderar.")}</span>
      </h2>
      <p className="reveal mx-auto mt-7 max-w-2xl text-sm leading-7 text-foreground/68 md:text-base">
        {tr(
          "4 sessions a week, professional live coaching, and a program built around you. Apply for coaching today - spots are limited.",
          "4 sesiones por semana, coaching profesional en vivo y un programa construido para ti. Aplica hoy: los espacios son limitados.",
        )}
      </p>
      <div className="reveal mt-10">
        <GoldButton>{tr("Apply for Coaching", "Aplicar a coaching")}</GoldButton>
      </div>
    </section>
  );
}

function Footer() {
  const tr = useTranslate();
  return (
    <footer className="border-t border-white/5 bg-background px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-7">
        <div className="flex gap-3">
          <a
            href="https://www.linkedin.com/in/fluentwithsena"
            aria-label="LinkedIn"
            target="_blank"
            rel="noreferrer"
            className="grid h-11 w-11 place-items-center rounded-none border border-white/8 bg-accent/10 text-foreground transition-all hover:-translate-y-0.5 hover:border-accent/50"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground/50">
          <a href="/terms" className="transition-colors hover:text-primary">
            {tr("Terms & Conditions", "Terminos y condiciones")}
          </a>
          <span className="text-foreground/25">.</span>
          <a href="/privacy" className="transition-colors hover:text-primary">
            {tr("Privacy Policy", "Politica de privacidad")}
          </a>
          <span className="text-foreground/25">.</span>
          <a href="/cookies" className="transition-colors hover:text-primary">
            {tr("Cookie Policy", "Politica de cookies")}
          </a>
        </div>
      </div>
    </footer>
  );
}
