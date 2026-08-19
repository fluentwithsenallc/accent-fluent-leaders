import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Linkedin,
  Map,
  Menu,
  Star,
  StickyNote,
  X,
} from "lucide-react";
import { LanguageToggle, useAppLanguage, useTranslate } from "../lib/language";
import comboSlideNotes from "../assets/landing/combo-slide-notes.png";

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

function GhostButton({
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
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-none border border-white/15 bg-transparent px-7 text-xs font-bold uppercase tracking-[0.16em] text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

function TextButton({
  children,
  href,
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-12 items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-foreground/82 transition-colors hover:text-foreground ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

function SectionRule({
  children,
  centered = false,
  trailingLine = false,
}: {
  children: React.ReactNode;
  centered?: boolean;
  trailingLine?: boolean;
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
    { href: "#guarantee", label: tr("Guarantee", "Garantia") },
    { href: "#program", label: tr("Program", "Programa") },
    { href: "#pricing", label: tr("Pricing", "Precios") },
    { href: "#results", label: tr("Results", "Resultados") },
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
          <a
            href="#home"
            className="text-xl font-semibold uppercase tracking-[0.16em] text-foreground"
          >
            FLUENT WITH SENA
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
              {tr("Apply for Coaching", "Solicita coaching")}
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
                {tr("Apply for Coaching", "Solicita coaching")}
              </GoldButton>
            </div>
          </div>
        )}
      </header>

      <Hero />
      <GuaranteeSection />
      <ProcessSteps />
      <CompleteSystem />
      <PricingTiers />
      <PilotWeek />
      <BonusSection />
      <Testimonials />
      <FaqSection />
      <RosterSection />
      <FinalCta />
      <Footer />
    </main>
  );
}

function Hero() {
  const tr = useTranslate();
  const { language } = useAppLanguage();
  return (
    <section id="home" className="hero-surface relative overflow-hidden pt-[70px]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-5 pt-6 pb-0 md:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)] md:px-8 md:pb-0 md:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:pt-16">
        <div className="reveal">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            {tr(
              "1:1 English coaching for commercial professionals",
              "Coaching de ingles 1:1 para profesionales comerciales",
            )}
          </p>
          <h1 className="max-w-3xl font-sans text-[clamp(2.8rem,6.2vw,5.2rem)] font-bold leading-[0.98] tracking-tight">
            {language === "es" ? (
              <>
                Lidera tu primera reunión{" "}
                <span className="text-primary">completamente en inglés</span> en 12 semanas
              </>
            ) : (
              <>
                Lead your first meeting{" "}
                <span className="text-primary">completely in English</span> in 12 weeks
              </>
            )}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-foreground/82 md:text-lg">
            {language === "es" ? (
              <>
                Deja de traducir en tu cabeza y{" "}
                <span className="font-bold text-white">empieza a liderar en inglés</span>. Un
                programa de coaching privado para profesionales comerciales de habla hispana.
              </>
            ) : (
              <>
                Stop translating in your head and{" "}
                <span className="font-bold text-white">start leading in English</span>. A private
                coaching program for Spanish-speaking commercial professionals.
              </>
            )}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5 md:flex-nowrap">
            <GoldButton>{tr("Stop Translating In Your Head", "Deja de traducir en tu cabeza")}</GoldButton>
            <TextButton href="#pilot" className="border border-white/15 px-6">
              {tr("Try a Pilot Week · $50", "Prueba una semana piloto · $50")}
            </TextButton>
          </div>
        </div>

        <div className="reveal relative flex min-h-[430px] items-end justify-center self-end md:min-h-[610px] lg:min-h-[650px]">
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

function GuaranteeSection() {
  const tr = useTranslate();
  const { language } = useAppLanguage();
  return (
    <section
      id="guarantee"
      className="guarantee-section relative border-t border-white/5 py-24 text-center md:py-32"
    >
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionRule centered trailingLine>
          {tr("Results Guaranteed", "Resultados garantizados")}
        </SectionRule>
        <h2 className="reveal mt-5 text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-tight tracking-tight">
          {tr("The Fluency Guarantee", "La garantia de fluidez")}
        </h2>
        <p className="guarantee-lead reveal mx-auto mt-7 max-w-xl text-[1.35rem] font-bold leading-snug text-foreground md:text-[1.62rem]">
          {language === "es" ? (
            <>
              Alcanzas tu meta, o te sigo ayudando <span className="gold">gratis</span>
            </>
          ) : (
            <>
              You reach your milestone, or I help you for <span className="gold">free</span>
            </>
          )}
        </p>
        <p className="reveal mx-auto mt-6 max-w-xl text-base leading-8 text-foreground/85">
          {tr(
            "In week one we define your milestone together and record a baseline of your English on video. If you attend every session, complete your weekly objectives, and still don't reach your milestone by the end of your program, I continue coaching you at no cost until you do.",
            "En la primera semana definimos juntos tu meta y grabamos un video de referencia de tu ingles actual. Si asistes a cada sesion, completas tus objetivos semanales y aun asi no alcanzas tu meta al final del programa, sigo dandote coaching sin costo hasta que la logres.",
          )}
        </p>
        <p className="reveal mx-auto mt-5 max-w-lg text-xs leading-7 text-foreground/55">
          {tr(
            "The program demands real work from both of us - if you're looking for a low-effort course, this isn't it. Full terms are outlined in the client contract.",
            "El programa exige trabajo real de ambos lados - si buscas un curso de bajo esfuerzo, este no es para ti. Los terminos completos estan en el contrato del cliente.",
          )}
        </p>
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
      title: tr("Diagnose", "Diagnosticar"),
      tag: tr("Week 1", "Semana 1"),
      body: tr(
        "We record your baseline video on day one and define your milestone together. The milestone is the standard we measure your Fluency Guarantee against.",
        "Grabamos tu video de referencia el primer dia y definimos tu meta juntos. Esa meta es el estandar con el que medimos tu Garantia de Fluidez.",
      ),
    },
    {
      n: "02",
      title: tr("Build Your Roadmap", "Construir tu plan"),
      tag: tr("Week 1-2", "Semana 1-2"),
      body: tr(
        "Your program is built around your industry, role, and leadership goals.",
        "Tu programa se construye alrededor de tu industria, tu rol y tus metas de liderazgo.",
      ),
    },
    {
      n: "03",
      title: tr("Speak Live, Daily", "Habla en vivo, cada dia"),
      tag: tr("Full Program", "Todo el programa"),
      body: tr(
        "Private Zoom sessions each week, plus objectives that keep you speaking out loud every day.",
        "Sesiones privadas por Zoom cada semana, mas objetivos que te mantienen hablando en voz alta todos los dias.",
      ),
    },
    {
      n: "04",
      title: tr("Deliver", "Entregar resultados"),
      tag: tr("Program End", "Fin del programa"),
      body: tr(
        "Speak English confidently in every conversation, meeting, and presentation. Use your fluency to go after the opportunities you've been ready for.",
        "Habla ingles con confianza en cada conversacion, reunion y presentacion. Usa tu fluidez para ir por las oportunidades para las que ya estás listo.",
      ),
    },
  ];

  useEffect(() => {
    const el = document.getElementById("program");
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
      id="program"
      className="process-section relative border-t border-white/5 py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <SectionRule centered trailingLine>
            {tr("How It Works", "Como funciona")}
          </SectionRule>
          <h2 className="reveal mt-5 text-[clamp(2.4rem,4.2vw,4rem)] font-bold leading-[1.04] tracking-tight">
            {tr("The 4 Steps to Fluency", "Los 4 pasos hacia la fluidez")}
          </h2>
        </div>

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

const MILESTONE_ITEMS: Array<{
  n: number;
  side: "l" | "r";
  date: string;
  title: string;
  desc: React.ReactNode;
  goal: string;
}> = [
  {
    n: 1,
    side: "l",
    date: "Semana 1 · 9 de mayo",
    title: "Preguntas simples",
    desc: "Puedes hacer preguntas simples y responder correctamente sin vacilación ni traducción.",
    goal: "Hacer y responder preguntas simples con confianza en una sesión de 50 minutos.",
  },
  {
    n: 2,
    side: "r",
    date: "Semana 2 · 16 de mayo",
    title: "Artículos y preposiciones",
    desc: (
      <>
        Conoces artículos y preposiciones como <b>a, the, in, on, at,</b> y <b>to.</b> Entiendes
        cuándo usarlos.
      </>
    ),
    goal: "Demuestra una comprensión básica sólida de artículos y preposiciones.",
  },
  {
    n: 3,
    side: "l",
    date: "Semana 3 · 23 de mayo",
    title: "Tercera persona",
    desc: (
      <>
        <b>He works. She has. It takes.</b> Esta es la semana que dominas la tercera persona
        singular en presente y pasado simples.
      </>
    ),
    goal: "Usa la tercera persona correctamente con 85% de precisión en una sesión de 50 minutos.",
  },
  {
    n: 4,
    side: "r",
    date: "Semana 4 · 30 de mayo",
    title: "Pasado simple",
    desc: (
      <>
        Dejarás de vivir solo en el presente: <b>I went. She said. We had.</b> Regular e
        irregular, sin volver al presente al hablar.
      </>
    ),
    goal: "Usa el pasado con 95% de precisión en una sesión de 50 minutos.",
  },
  {
    n: 5,
    side: "l",
    date: "Semana 5 · 6 de junio",
    title: "Negación",
    desc: (
      <>
        <b>I don't. He doesn't. I didn't.</b> No <b>I no like</b> o <b>I didn't do nothing.</b>{" "}
        Usarás patrones de negación en inglés en lugar de traducir del español.
      </>
    ),
    goal: "Usa la negación correctamente con 95% de precisión en una sesión de 50 minutos.",
  },
  {
    n: 6,
    side: "r",
    date: "Semana 6 · 13 de junio",
    title: "Comandos",
    desc: (
      <>
        <b>Do this. Read that. Tell me.</b> No <b>you do this,</b> solo el comando, directo y
        claro.
      </>
    ),
    goal: "Usa comandos correctamente al hablar y reconoce indicaciones durante la sesión de 50 minutos.",
  },
  {
    n: 7,
    side: "l",
    date: "Semana 7 · 20 de junio",
    title: "Pronunciación",
    desc: "Así es como suena el inglés cuando los hablantes nativos hablan rápido. Lo escucharás, lo entenderás y lo usarás en tu comunicación diaria.",
    goal: "Habla con sonidos conectados y contracciones naturalmente durante toda la sesión de 50 minutos.",
  },
  {
    n: 8,
    side: "r",
    date: "Semana 8 · 27 de junio · La línea de llegada",
    title: "Confianza e independencia",
    desc: "Hablarás con la confianza de alguien que ha pasado 8 semanas construyendo habilidades reales.",
    goal: "Mantén una conversación genuina en inglés con fluidez y confianza, usando cada habilidad que construiste.",
  },
];

function MilestoneCard({
  item,
  done,
  onToggle,
}: {
  item: (typeof MILESTONE_ITEMS)[number];
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`mtl-card ${done ? "done" : ""}`} onClick={onToggle}>
      <div className="mtl-accent" />
      <div className="mtl-cdate">{item.date}</div>
      <div className="mtl-ctitle">{item.title}</div>
      <div className="mtl-cdesc">{item.desc}</div>
      <div className="mtl-cgoal-row">
        <span className="mtl-gdot" />
        {item.goal}
      </div>
      <div className="mtl-done-stamp">✓ Logrado</div>
    </div>
  );
}

function MilestoneTimeline() {
  const [done, setDone] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const toggle = (n: number) => setDone((current) => ({ ...current, [n]: !current[n] }));
  const doneCount = MILESTONE_ITEMS.filter((item) => done[item.n]).length;
  const pct = Math.round((doneCount / MILESTONE_ITEMS.length) * 100);

  return (
    <div className="mtl">
      <div className="mtl-hdr">
        <div className="mtl-pretitle">Logros de ejemplo</div>
        <div className="mtl-badge">Logros de Fluidez</div>
        <div className="mtl-cname">Juan</div>
        <div className="mtl-cgoal">
          Habla inglés con confianza y facilidad — en cualquier sala, con cualquier persona.
        </div>
        <div className="mtl-prog-wrap">
          <span className="mtl-prog-lbl">Progreso del viaje</span>
          <div className="mtl-prog-bg">
            <div className="mtl-prog-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="mtl-prog-pct">{pct}%</span>
        </div>
      </div>
      <div className="mtl-tl">
        <div className="mtl-spine" />
        <div className="mtl-hint">Toca una tarjeta para marcarla como completada</div>
        {MILESTONE_ITEMS.map((item) => (
          <Fragment key={item.n}>
            <div className="mtl-row">
              <div className="mtl-side mtl-sl">
                {item.side === "l" && (
                  <MilestoneCard item={item} done={!!done[item.n]} onToggle={() => toggle(item.n)} />
                )}
              </div>
              <div
                className={`mtl-node ${done[item.n] ? "done" : ""}`}
                onClick={() => toggle(item.n)}
              />
              <div className="mtl-side mtl-sr">
                {item.side === "r" && (
                  <MilestoneCard item={item} done={!!done[item.n]} onToggle={() => toggle(item.n)} />
                )}
              </div>
            </div>
            <div className="mtl-spacer" />
          </Fragment>
        ))}
      </div>
      <div className="mtl-finish-wrap">
        <div className="mtl-finish-line">
          <div className="mtl-finish-icon">★</div>
          <div className="mtl-finish-title">La línea de llegada</div>
          <div className="mtl-finish-name">Juan · Semana 8 · 27 de junio</div>
          <div className="mtl-finish-desc">
            Mantén una conversación genuina en inglés con fluidez y confianza, usando cada
            habilidad que construiste.
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="dash-mock" aria-hidden="true">
      <div className="dash-chrome">
        <span className="dash-dot dash-dot-red" />
        <span className="dash-dot dash-dot-yellow" />
        <span className="dash-dot dash-dot-green" />
        <span className="dash-url">app.fluentwithsena.com/dashboard</span>
      </div>
      <div className="dash-body">
        <div className="dash-sidebar">
          <div>
            <div className="dash-brand-name">FLUENT WITH SENA</div>
            <div className="dash-brand-sub">Student Portal</div>
          </div>
          <div className="dash-user">
            <div className="dash-avatar">J</div>
            <div>
              <div className="dash-user-name">Juan</div>
              <div className="dash-user-sub">Build · Week 4</div>
            </div>
          </div>
        </div>
        <div className="dash-main">
          <div className="dash-main-hdr">
            <div>
              <h3 className="dash-greet">Good morning, Juan.</h3>
              <p className="dash-greet-sub">Week 4 · Build Program · 12 weeks remaining</p>
            </div>
            <div className="dash-hdr-btns">
              <span className="dash-btn dash-btn-ghost">Weekly check-in →</span>
              <span className="dash-btn dash-btn-gold">This week's objectives</span>
            </div>
          </div>
          <div className="dash-stats">
            <div className="dash-stat">
              <span className="dash-stat-label">Sessions This Week</span>
              <span className="dash-stat-value">
                3<span className="dash-stat-of"> / 4</span>
              </span>
              <span className="dash-stat-note">1 remaining</span>
            </div>
            <div className="dash-stat">
              <span className="dash-stat-label">Confidence Rating</span>
              <span className="dash-stat-value dash-stat-gold">8.2</span>
              <span className="dash-stat-note dash-stat-up">↑ 1.4 since week 1</span>
            </div>
            <div className="dash-stat">
              <span className="dash-stat-label">Lessons Completed</span>
              <span className="dash-stat-value dash-stat-blue">17</span>
              <span className="dash-stat-note">of 60 total</span>
            </div>
          </div>
          <div className="dash-objectives">
            <div className="dash-obj-hdr">
              <span className="dash-obj-title">This Week's Objectives</span>
              <span className="dash-obj-viewall">View all →</span>
            </div>
            <div className="dash-obj-item done">
              <span className="dash-check">✓</span>Complete Business Email Writing module
            </div>
            <div className="dash-obj-item done">
              <span className="dash-check">✓</span>Submit weekly self-evaluation
            </div>
            <div className="dash-obj-item">
              <span className="dash-check" />
              Practice shadowing — presentation audio (15 min)
            </div>
            <div className="dash-obj-item">
              <span className="dash-check" />
              Listen to custom podcast - B2B Negotiation
            </div>
          </div>
          <div className="dash-progress-row">
            <div className="dash-progress-card">
              <span className="dash-progress-label">Program Progress</span>
              <div className="dash-progress-bar">
                <div className="dash-progress-fill" style={{ width: "27%" }} />
              </div>
              <div className="dash-progress-footer">
                <span>Week 4 of 16</span>
                <span>27%</span>
              </div>
            </div>
            <div className="dash-progress-card">
              <span className="dash-progress-label">Fluency Milestone</span>
              <div className="dash-progress-bar">
                <div className="dash-progress-fill dash-progress-blue" style={{ width: "62%" }} />
              </div>
              <div className="dash-progress-footer">
                <span>Intermediate B2</span>
                <span>62%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompleteSystem() {
  const tr = useTranslate();
  const { language } = useAppLanguage();
  const [slide, setSlide] = useState(0);
  const totalSlides = 3;

  const features = [
    {
      icon: LayoutDashboard,
      title: tr("Your Client Dashboard", "Tu panel de cliente"),
      body: tr(
        "Every session, objective, and milestone lives in one place, so your progress is always visible.",
        "Cada sesion, objetivo y meta vive en un solo lugar, asi que tu progreso siempre es visible.",
      ),
      badge: tr("All Packages", "Todos los paquetes"),
    },
    {
      icon: Map,
      title: tr("Personalized Roadmap", "Plan personalizado"),
      body: tr(
        "Your custom roadmap is a living plan built around your goals, industry, and timeline — not a fixed syllabus.",
        "Tu plan personalizado es un documento vivo, construido alrededor de tus metas, tu industria y tu tiempo — no un curriculo fijo.",
      ),
      badge: tr("All Packages", "Todos los paquetes"),
    },
    {
      icon: StickyNote,
      title: tr("Session Notes", "Notas de sesion"),
      body: tr(
        "During sessions, we work together on a whiteboard, keeping all our notes in one place that you can reference whenever you need.",
        "Durante las sesiones, trabajamos juntos en una pizarra, manteniendo todas nuestras notas en un solo lugar que puedes consultar cuando lo necesites.",
      ),
      badge: tr("All Packages", "Todos los paquetes"),
    },
  ];

  return (
    <section className="combo-section relative border-t border-white/5 py-24 text-center md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionRule centered trailingLine>
          {tr("The Complete Learning System", "El sistema completo de aprendizaje")}
        </SectionRule>
        <h2 className="reveal mt-5 text-[clamp(2.35rem,4.4vw,4rem)] font-bold leading-tight tracking-tight">
          {tr("Everything You Need in One Place", "Todo lo que necesitas en un solo lugar")}
        </h2>
        <p className="reveal mx-auto mt-4 max-w-lg text-base text-foreground/85">
          {language === "es" ? (
            <>
              Cada cliente trabaja dentro de un <b className="text-foreground">panel privado</b>{" "}
              construido alrededor de su programa.
            </>
          ) : (
            <>
              Every client works inside a <b className="text-foreground">private dashboard</b>{" "}
              built around their program.
            </>
          )}
        </p>

        <div className="reveal mt-14 grid grid-cols-1 items-center gap-11 text-left md:grid-cols-[0.72fr_1.28fr] md:gap-12">
          <div className="flex flex-col justify-center gap-10">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-[10px] bg-white/5 text-primary shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-foreground/85">{feature.body}</p>
                  <span className="mt-2 inline-block rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-primary">
                    {feature.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto w-full max-w-[860px]">
            <div className="combo-carousel-frame">
              <div data-combo-slide="0" className={`combo-slide ${slide === 0 ? "active" : ""}`}>
                <div className="combo-dashboard-shot">
                  <img
                    src="https://ebecd6d012a4750b05cf2b81c1b867a7.cdn.bubble.io/f1779272153887x513859800857069400/DASHBOARD%282%29.svg"
                    alt="Fluent with Sena student dashboard"
                  />
                </div>
                <DashboardMock />
              </div>
              <div data-combo-slide="1" className={`combo-slide ${slide === 1 ? "active" : ""}`}>
                <MilestoneTimeline />
              </div>
              <div data-combo-slide="2" className={`combo-slide ${slide === 2 ? "active" : ""}`}>
                <div className="combo-notes-shot">
                  <img src={comboSlideNotes} alt="Session notes from a live coaching session" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => setSlide((current) => (current - 1 + totalSlides) % totalSlides)}
                className="grid h-11 w-11 cursor-pointer place-items-center rounded-none border border-white/8 bg-white/4 text-foreground transition hover:-translate-y-0.5 hover:border-primary/45 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="combo-dots flex gap-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <span
                    key={index}
                    className={index === slide ? "active" : ""}
                    onClick={() => setSlide(index)}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Next"
                onClick={() => setSlide((current) => (current + 1) % totalSlides)}
                className="grid h-11 w-11 cursor-pointer place-items-center rounded-none border border-white/8 bg-white/4 text-foreground transition hover:-translate-y-0.5 hover:border-primary/45 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="reveal mt-11 flex justify-center">
          <GoldButton>{tr("Start Leading in English Today", "Empieza a liderar en ingles hoy")}</GoldButton>
        </div>
      </div>
    </section>
  );
}

function PricingTiers() {
  const tr = useTranslate();
  const { language } = useAppLanguage();

  return (
    <section
      id="pricing"
      className="tiers-section relative border-t border-white/5 py-24 text-center md:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionRule centered trailingLine>
          {tr("Programs", "Programas")}
        </SectionRule>
        <h2 className="reveal mt-4 text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-tight tracking-tight">
          {language === "es" ? (
            <>
              Elige el paquete que se ajusta a{" "}
              <span className="text-primary">lo que necesitas</span>
            </>
          ) : (
            <>
              Choose the package that fits <span className="text-primary">what you need</span>
            </>
          )}
        </h2>
        <p className="reveal mx-auto mt-5 max-w-2xl text-sm leading-7 text-foreground/85 md:text-base">
          {tr(
            "Every package includes private 1:1 sessions, a personalized roadmap, and an interactive client dashboard. Your milestone is established with you in week one and covered by the guarantee above, no matter which package you choose. The difference between packages is the number of sessions, the benefits, and the depth of support you receive.",
            "Cada paquete incluye sesiones privadas 1:1, un plan personalizado y un panel de cliente interactivo. Tu meta se establece contigo en la primera semana y queda cubierta por la garantia anterior, sin importar el paquete que elijas. La diferencia entre paquetes está en el numero de sesiones, los beneficios y la profundidad de apoyo que recibes.",
          )}
        </p>

        <div className="mt-14 grid grid-cols-1 gap-6 text-left md:grid-cols-3">
          <div className="tier reveal">
            <h3 className="text-xl font-bold tracking-tight">Launch</h3>
            <p className="mb-5 mt-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
              {tr("12 sessions/mo", "12 sesiones/mes")}
            </p>
            <ul>
              <li>{tr("Up to 3 private sessions per week", "Hasta 3 sesiones privadas por semana")}</li>
              <li>
                {tr(
                  "Weekly objectives built from your real work",
                  "Objetivos semanales construidos desde tu trabajo real",
                )}
              </li>
              <li>{tr("Regular check-ins to measure growth", "Revisiones regulares para medir tu progreso")}</li>
              <li>{tr("Personalized roadmap", "Plan personalizado")}</li>
            </ul>
            <div className="mb-6">
              <div className="text-sm text-foreground/90">
                <b className="text-base font-bold text-foreground">$425 USD</b>/{tr("mo", "mes")}
              </div>
              <div className="mt-1 text-xs text-foreground/70">
                {language === "es" ? (
                  <>
                    Paga 3 meses por adelantado y{" "}
                    <b className="text-foreground">ahorra $130 USD</b>
                  </>
                ) : (
                  <>
                    Pay 3 months upfront and <b className="text-foreground">save $130 USD</b>
                  </>
                )}
              </div>
            </div>
            <GhostButton className="w-full">{tr("Apply for Coaching", "Solicita coaching")}</GhostButton>
          </div>

          <div className="tier featured reveal">
            <span className="tier-tag">{tr("Most Popular", "El mas elegido")}</span>
            <h3 className="text-xl font-bold tracking-tight">Build</h3>
            <p className="mb-5 mt-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
              {tr("16 sessions/mo", "16 sesiones/mes")}
            </p>
            <ul>
              <li>
                {language === "es" ? (
                  <>
                    Todo lo de <b>Launch</b>
                  </>
                ) : (
                  <>
                    Everything in <b>Launch</b>
                  </>
                )}
              </li>
              <li>{tr("Up to 4 private sessions per week", "Hasta 4 sesiones privadas por semana")}</li>
              <li>
                {tr("Leadership communication coaching", "Coaching de comunicacion para liderazgo")}
              </li>
              <li>{tr("Real Negotiation Simulations", "Simulaciones de negociacion real")}</li>
              <li>
                {tr(
                  "Option to purchase additional sessions for only $20 each",
                  "Opcion de comprar sesiones adicionales por solo $20 cada una",
                )}
              </li>
            </ul>
            <div className="mb-6">
              <div className="text-sm text-foreground/90">
                <b className="text-base font-bold text-foreground">$550 USD</b>/{tr("mo", "mes")}
              </div>
              <div className="mt-1 text-xs text-foreground/70">
                {language === "es" ? (
                  <>
                    Paga 3 meses por adelantado y{" "}
                    <b className="text-foreground">ahorra $165 USD</b>
                  </>
                ) : (
                  <>
                    Pay 3 months upfront and <b className="text-foreground">save $165 USD</b>
                  </>
                )}
              </div>
            </div>
            <GoldButton className="w-full">{tr("Apply for Coaching", "Solicita coaching")}</GoldButton>
          </div>

          <div className="tier reveal">
            <h3 className="text-xl font-bold tracking-tight">Lead</h3>
            <p className="mb-5 mt-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
              {tr("20 sessions/mo", "20 sesiones/mes")}
            </p>
            <ul>
              <li>
                {language === "es" ? (
                  <>
                    Todo lo de <b>Build</b>
                  </>
                ) : (
                  <>
                    Everything in <b>Build</b>
                  </>
                )}
              </li>
              <li>{tr("Up to 5 private sessions per week", "Hasta 5 sesiones privadas por semana")}</li>
              <li>
                {tr(
                  "Unlimited flexible rescheduling, 12+ hours notice",
                  "Reagenda con flexibilidad ilimitada, con 12+ horas de aviso",
                )}
              </li>
              <li>{tr("Accent reduction coaching", "Coaching de reduccion de acento")}</li>
              <li>{tr("Monthly progress report", "Reporte de progreso mensual")}</li>
              <li>
                {tr(
                  "Option to purchase additional sessions for only $20 each",
                  "Opcion de comprar sesiones adicionales por solo $20 cada una",
                )}
              </li>
            </ul>
            <div className="mb-6">
              <div className="text-sm text-foreground/90">
                <b className="text-base font-bold text-foreground">$675 USD</b>/{tr("mo", "mes")}
              </div>
              <div className="mt-1 text-xs text-foreground/70">
                {language === "es" ? (
                  <>
                    Paga 3 meses por adelantado y{" "}
                    <b className="text-foreground">ahorra $205 USD</b>
                  </>
                ) : (
                  <>
                    Pay 3 months upfront and <b className="text-foreground">save $205 USD</b>
                  </>
                )}
              </div>
            </div>
            <GhostButton className="w-full">{tr("Apply for Coaching", "Solicita coaching")}</GhostButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function PilotWeek() {
  const tr = useTranslate();
  const { language } = useAppLanguage();
  return (
    <section id="pilot" className="pilot-section relative border-t border-white/5 py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <div className="reveal flex flex-wrap items-center justify-center gap-10 text-center md:justify-between md:text-left">
          <div className="mx-auto max-w-xl md:mx-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              {tr("Want to try before you commit?", "¿Quieres probar antes de comprometerte?")}
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-[1.6rem]">
              {language === "es" ? (
                <>
                  Conoce el método primero - <span className="text-primary">semana piloto</span>
                </>
              ) : (
                <>
                  See the Method First - <span className="text-primary">Pilot Week</span>
                </>
              )}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-foreground/90 md:mx-0">
              {tr(
                "The pilot week gives you three private 1:1 sessions and a starter roadmap that we build together. You can experience firsthand what a week inside the program looks like, and if you continue, the full amount is credited toward your program. If not, you keep everything we already built.",
                "La semana piloto te da tres sesiones 1:1 y un plan inicial que construimos juntos. Puedes experimentar de primera mano como es una semana dentro del programa, y si continuas, el monto total se acredita hacia tu programa. Si no, te quedas con todo lo que ya construimos.",
              )}
            </p>
          </div>
          <div className="mx-auto flex-shrink-0 text-center">
            <div className="pilot-price">
              <span className="big">$50</span>
            </div>
            <div className="mb-4 mt-1 text-xs text-foreground/85">
              {tr("three sessions · credited if you enroll", "tres sesiones · se acredita si te inscribes")}
            </div>
            <GoldButton href="/apply">{tr("Apply for Coaching", "Solicita coaching")}</GoldButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function BonusSection() {
  const tr = useTranslate();
  const { language } = useAppLanguage();
  const bonuses: Array<{ mark: string; name: string; desc: string; pill?: string }> = [
    {
      mark: "◆",
      name: tr("Early access: business novel", "Acceso anticipado: novela de negocios"),
      desc: tr(
        "The first chapters of my upcoming business novel in English, before its public release.",
        "Los primeros capitulos de mi proxima novela de negocios en ingles, antes de su lanzamiento público.",
      ),
    },
    {
      mark: "✎",
      name: tr("Movie guides", "Guias de pelicula"),
      desc: tr(
        "Access to learning guides built around relevant films: vocabulary, key phrases, and fluency exercises organized by scene.",
        "Acceso a guias de aprendizaje basadas en peliculas relevantes: vocabulario, frases clave y ejercicios de fluidez organizados por escena.",
      ),
    },
    {
      mark: "♪",
      name: tr("Your personal fluency podcast", "Tu podcast de fluidez personal"),
      desc: tr(
        "Exclusive episodes created for your industry. Not available anywhere else.",
        "Episodios exclusivos creados para tu industria. No estan disponibles en ningun otro lugar.",
      ),
    },
    {
      mark: "+1",
      name: tr("Extra coaching week", "Semana adicional de coaching"),
      desc: tr(
        "One additional week of support at the end of your program — 3 live sessions — to reinforce your progress right when you need it most.",
        "Una semana adicional de apoyo al final del programa — 3 sesiones en vivo — para reforzar tu avance justo cuando mas lo necesitas.",
      ),
      pill: tr("3 extra sessions", "3 sesiones extra"),
    },
    {
      mark: "〜",
      name: tr("Accent coaching", "Coaching de acento"),
      desc: tr(
        "Dedicated work on pronunciation and rhythm, focused on your highest-stakes moments: presentations, meetings, and negotiations.",
        "Trabajo dedicado de pronunciacion y ritmo, enfocado en los momentos de mayor exposicion: presentaciones, juntas y negociaciones.",
      ),
    },
  ];

  return (
    <section
      id="bonuses"
      className="bonus-section section-dark relative border-t border-white/5 py-16 md:py-20"
    >
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionRule centered trailingLine>
          {tr("Included at no extra cost", "Incluido sin costo adicional")}
        </SectionRule>
        <h2 className="bonus-title reveal mt-5 text-center text-[clamp(1.8rem,3.6vw,2.6rem)] font-bold leading-tight tracking-tight">
          {language === "es" ? (
            <>
              Todo lo que recibes <span className="accent">además del programa</span>
            </>
          ) : (
            <>
              Everything you get <span className="accent">beyond the program</span>
            </>
          )}
        </h2>

        <div className="bonus-stack mt-12">
          {bonuses.map((bonus) => (
            <div key={bonus.name} className="bonus-row reveal">
              <div className="bonus-mark">{bonus.mark}</div>
              <div>
                <p className="text-[17px] font-semibold text-foreground">{bonus.name}</p>
                <p className="mt-1 max-w-xl text-sm font-light leading-6 text-foreground">
                  {bonus.desc}
                </p>
              </div>
              {bonus.pill && (
                <div className="bonus-value text-right">
                  <span className="bonus-pill">{bonus.pill}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bonus-total reveal">
          <div />
          <div className="bonus-total-content">
            <div className="text-sm font-medium text-foreground">
              {tr("Total bonus value", "Valor total en bonificaciones")}
            </div>
            <div className="bonus-total-amount">$800</div>
          </div>
        </div>

        <p className="reveal mt-6 text-center text-xs text-foreground/90">
          {tr(
            "Included automatically in your program. No extra cost or fine print.",
            "Incluido automaticamente en tu programa. Sin costos adicionales ni letra pequena.",
          )}
        </p>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    quote:
      "Me encanta Sena!! Es una gran profesional y una excelente persona. Sus clases son dinámicas y hacen que aprender sea mucho más fácil y ameno. Siempre está dispuesta a ayudar y a explicar las cosas de forma clara hasta que las entiendes.",
    name: "María C",
    role: "España",
    initials: "MC",
  },
  {
    quote:
      "Sena te da esa confianza que necesitas para hablar en inglés. Sea cual sea tu objetivo, Sena es tu profesora.",
    name: "Qurro S",
    role: "España",
    initials: "QS",
  },
  {
    quote:
      "Muy buena profesora. Se adapta perfectamente a lo que necesitas y explica todo de forma clara y sencilla. Tiene muchísima paciencia y hace que aprender sea fácil y agradable. Sin duda, la recomendaría.",
    name: "Paula M",
    role: "España",
    initials: "PM",
  },
  {
    quote:
      "Es una gran profesora de inglés... Siempre una gran actitud e interés por qué aprenda y por preparar cada una de sus clases. La recomiendo mucho.",
    name: "Mónica T",
    role: "México",
    initials: "MT",
  },
  {
    quote:
      "Me gusta mucho su forma de enseñar. Ha elaborado un plan claro y bien estructurado para que pueda alcanzar mi objetivo y ha definido unos indicadores de éxito, lo cual me parece muy valioso. Es muy agradable trabajar con ella.",
    name: "Dana A",
    role: undefined as string | undefined,
    initials: "DA",
  },
  {
    quote:
      "He avanzado mucho en cuanto a mi comprensión auditiva... Ahora tengo más conocimientos de cómo estructurar mis ideas, lo que es muy importante para mí... Es una excelente inversión.",
    name: "Héctor V",
    role: "México",
    initials: "HV",
  },
  {
    quote:
      "Es muy excelente profesora, tiene paciencia para enseñar, ayuda mucho a practicar la pronunciación y su material de clase es muy bueno.",
    name: "Paulina M",
    role: "México",
    initials: "PM",
  },
  {
    quote:
      "Antes mi otro profesor enseñó de forma muy tradicional. Con ella es más conversacional... Ahora es dinámico, no es aburrido.",
    name: "Melissa G",
    role: "Colombia",
    initials: "MG",
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
          className="reveal relative mx-auto mt-14 min-h-[520px] max-w-[760px] md:min-h-[440px]"
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
                <div className="flex h-full flex-col">
                  <div className="flex justify-center gap-1.5 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-6 text-center text-[1.4rem] font-light leading-[1.85] text-foreground md:text-[1.56rem]">
                    "{item.quote}"
                  </p>
                  <div className="mt-auto pt-6">
                    <div className="mx-auto h-px w-10 bg-white/10" />
                    <div className="mt-5 flex items-center justify-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/35 bg-primary text-xs font-bold text-primary-foreground">
                        {item.initials}
                      </div>
                      <div className="text-left">
                        <div className="text-[15px] font-bold text-foreground">{item.name}</div>
                        {item.role && (
                          <div className="mt-1 text-xs text-foreground/42">{item.role}</div>
                        )}
                      </div>
                    </div>
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
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-none border border-white/8 bg-white/4 text-foreground transition hover:-translate-y-0.5 hover:border-primary/45 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                className={`h-1.5 cursor-pointer rounded-none transition-all ${
                  current === index ? "w-6 bg-primary" : "w-1.5 bg-foreground/20"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next testimonial"
            onClick={showNext}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-none border border-white/8 bg-white/4 text-foreground transition hover:-translate-y-0.5 hover:border-primary/45 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const tr = useTranslate();
  const { language } = useAppLanguage();
  const [openIndex, setOpenIndex] = useState(0);

  const faqs: Array<{ question: string; answer: React.ReactNode }> = [
    {
      question: tr("Who is this for?", "¿Para quien es esto?"),
      answer: (
        <p>
          {tr(
            "Commercial professionals at multinational businesses across Latin America and Spain. If English is what stands between you and career growth, this program was built for you.",
            "Profesionales comerciales en empresas multinacionales en Latinoamerica y Espana. Si el ingles es lo unico entre tu y nuevas oportunidades profesionales, este programa fue creado para ti.",
          )}
        </p>
      ),
    },
    {
      question: tr("How does the guarantee actually work?", "¿Cómo funciona realmente la garantia?"),
      answer:
        language === "es" ? (
          <>
            <p>
              Grabamos tu video de referencia en inglés el primer día y creamos tu meta por
              escrito. Tu meta es un resultado real y específico — algo como liderar una reunión
              de 30 minutos con un cliente en inglés, o dar una presentación a tu equipo. La meta
              coincide con tu nivel inicial y la duración de tu programa, así que es realmente
              alcanzable.
            </p>
            <p style={{ marginTop: 14 }}>
              Si asistes a cada sesión programada, completas tus objetivos semanales y aun así no
              has alcanzado esa meta al final de tu programa,{" "}
              <b className="text-foreground">
                sigo dándote coaching sin costo adicional hasta que la logres.
              </b>
            </p>
            <p style={{ marginTop: 14 }}>
              Las condiciones completas — incluyendo cómo se definen las metas, que cuenta como
              asistencia y que pasa si surge un imprevisto — están descritas en el contrato del
              cliente que se firma antes de iniciar el programa.
            </p>
          </>
        ) : (
          <>
            <p>
              We record your baseline video in English on day one and create your milestone in
              writing. Your milestone is a real, specific outcome — something like leading a
              30-minute client meeting in English, or delivering a presentation to your team. The
              milestone matches your starting level and the length of your program, so it's
              genuinely achievable.
            </p>
            <p style={{ marginTop: 14 }}>
              If you attend every scheduled session, complete your weekly objectives, and you
              still haven't reached that milestone by the end of your program,{" "}
              <b className="text-foreground">
                I will continue coaching you at no additional cost until you do.
              </b>
            </p>
            <p style={{ marginTop: 14 }}>
              The full conditions — including how milestones are defined, what counts as
              attendance, and what happens if life gets in the way — are outlined in the client
              contract that is signed before the program starts.
            </p>
          </>
        ),
    },
    {
      question: tr("What is the time commitment?", "¿Cual es el compromiso de tiempo?"),
      answer: (
        <p>
          {tr(
            "Your live sessions are 50 minutes, 3 to 5 times per week depending on your package. I give you personalized objectives to complete after each session, built from your actual work. Most of your practice happens either within sessions or your daily work life, like meetings and emails you already have. You are not adding a second job.",
            "Tus sesiones en vivo son de 50 minutos, de 3 a 5 veces por semana segun tu paquete. Te doy objetivos personalizados para completar despues de cada sesion, construidos desde tu trabajo real. La mayor parte de tu practica ocurre dentro de las sesiones o en tu vida laboral diaria, como reuniones y correos que ya tienes. No estás agregando un segundo trabajo.",
          )}
        </p>
      ),
    },
    {
      question: tr("How do I get started?", "¿Como empiezo?"),
      answer: (
        <p>
          {tr(
            "Click 'Apply for Coaching' and complete the application form. From there, we'll schedule a discovery call where I learn about your goals, your industry, and where you're at right now. If it's a good fit, we'll either start the pilot week or jump into your chosen program.",
            "Haz clic en 'Solicita coaching' y completa el formulario de solicitud. A partir de ahi, agendamos una llamada de descubrimiento donde conozco tus metas, tu industria y en que punto estás ahora. Si es un buen encaje, empezamos la semana piloto o directamente tu programa elegido.",
          )}
        </p>
      ),
    },
    {
      question: tr("How much does it cost?", "¿Cuánto cuesta?"),
      answer:
        language === "es" ? (
          <p>
            La mayoría de los clientes paga mensualmente, con bajo compromiso. Los pagos comienzan
            en $425 USD por mes (para Launch). Acepto Link, todas las tarjetas de crédito
            principales y transferencias bancarias. Si quieres probar antes de comprometerte,
            puedes completar{" "}
            <b className="text-foreground">
              la semana piloto por $50, y ese pago se acredita completamente al programa que
              elijas después.
            </b>
          </p>
        ) : (
          <p>
            Most clients pay monthly with low commitment. Payments start at $425 USD per month
            (for Launch). I accept Link, all major credit cards, and bank transfers. If you want
            to try before committing, you can complete{" "}
            <b className="text-foreground">
              the pilot week for $50, and that payment will be fully credited toward the program
              you choose after.
            </b>
          </p>
        ),
    },
    {
      question: tr("What is the schedule?", "¿Cual es el horario?"),
      answer: (
        <p>
          {tr(
            "Sessions run Monday through Saturday, 7AM to 7PM EST. At the start of your program, we set your recurring schedule together and book every session for the full duration upfront. Launch and Build clients can reschedule up to 4 times per month with at least 12 hours' notice, as long as the session is completed within that same week. Lead clients get unlimited reschedules with 12 hours' notice, subject to availability, and sessions must still be completed within that same week. Full terms are in the client contract.",
            "Las sesiones son de lunes a sabado, de 7AM a 7PM EST. Al inicio de tu programa, definimos juntos tu horario recurrente y agendamos cada sesion para toda la duracion del programa. Los clientes de Launch y Build pueden reagendar hasta 4 veces por mes con al menos 12 horas de aviso, siempre que completen la sesion dentro de esa misma semana. Los clientes de Lead tienen reagendamientos ilimitados con 12 horas de aviso, sujeto a disponibilidad, y tambien deben completar sus sesiones dentro de esa misma semana. Los terminos completos estan en el contrato del cliente.",
          )}
        </p>
      ),
    },
  ];

  return (
    <section className="faq-section relative border-t border-white/5 py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <SectionRule centered>{tr("FAQ", "Preguntas frecuentes")}</SectionRule>
        <h2 className="reveal mt-5 text-center text-[clamp(2.35rem,4.1vw,3.8rem)] font-bold leading-tight tracking-tight">
          {tr("Everything You Need to Know", "Todo lo que necesitas saber")}
        </h2>
        <p className="reveal mx-auto mt-5 max-w-3xl text-center text-sm leading-7 text-foreground/64 md:text-base">
          {tr(
            "A few of the most common questions about the program, schedule, investment, and results.",
            "Aqui tienes algunas de las preguntas mas comunes sobre el programa, el horario, la inversion y los resultados.",
          )}
        </p>

        <div className="faq-list reveal mt-14">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <article key={faq.question} className={`faq-card ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="faq-trigger"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(index)}
                >
                  <span className="faq-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="faq-question">{faq.question}</span>
                  <span className={`faq-chevron ${isOpen ? "open" : ""}`}>
                    <ChevronRight className="h-5 w-5" />
                  </span>
                </button>
                <div className={`faq-answer ${isOpen ? "open" : ""}`}>
                  <div className="faq-answer-inner">{faq.answer}</div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RosterSection() {
  const tr = useTranslate();
  const { language } = useAppLanguage();
  // Manually maintained as clients enroll — not derived from live booking data.
  const totalSlots = 5;
  const filledSlots = 2;

  return (
    <section className="roster-section relative border-t border-white/5 px-5 py-16 text-center md:py-20">
      <div className="mx-auto max-w-xl">
        <p className="reveal text-base leading-7 text-foreground/90">
          {language === "es" ? (
            <>
              Soy una sola coach, no una plataforma. Cada plan, sesión y recurso personalizado lo
              construyo yo misma, lo que significa que trabajo con{" "}
              <b className="text-foreground">un máximo de 5 clientes a la vez.</b> Cuando el cupo
              está lleno, el siguiente espacio pasa a una lista de espera.
            </>
          ) : (
            <>
              I am one coach, not a platform. Every roadmap, session, and custom resource is built
              by me personally, which means I work with{" "}
              <b className="text-foreground">a maximum of 5 clients at a time.</b> When the roster
              is full, the next opening goes to a waitlist.
            </>
          )}
        </p>
        <div className="reveal mt-7 flex justify-center gap-2.5">
          {Array.from({ length: totalSlots }).map((_, i) => (
            <div key={i} className={`roster-slot ${i < filledSlots ? "filled" : ""}`} />
          ))}
        </div>
        <p className="reveal mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-foreground/85">
          {tr(
            `${totalSlots - filledSlots} of ${totalSlots} client spots open`,
            `${totalSlots - filledSlots} de ${totalSlots} espacios disponibles`,
          )}
        </p>
      </div>
    </section>
  );
}

function FinalCta() {
  const tr = useTranslate();
  const { language } = useAppLanguage();
  return (
    <section className="section-dark border-t border-white/5 px-5 py-24 text-center md:px-8 md:py-32">
      <SectionRule centered trailingLine>
        {tr("Limited Spots · Guaranteed Results*", "Cupos limitados · Resultados garantizados*")}
      </SectionRule>
      <h2 className="reveal mx-auto mt-6 max-w-4xl text-[clamp(2.4rem,5.6vw,5.5rem)] font-bold leading-[1.02] tracking-tight">
        {language === "es" ? (
          <>
            Las nuevas oportunidades{" "}
            <span className="text-primary">no van a esperar</span> a tu inglés.
          </>
        ) : (
          <>
            New opportunities <span className="text-primary">aren't going to wait</span> on your
            English.
          </>
        )}
      </h2>
      <p className="reveal mx-auto mt-7 max-w-2xl text-sm leading-7 text-foreground/68 md:text-base">
        {tr(
          "Professional live coaching, a custom program, and guaranteed results. Apply for coaching today.",
          "Coaching profesional en vivo, un programa a tu medida y resultados garantizados. Solicita coaching hoy.",
        )}
      </p>
      <div className="reveal mt-10">
        <GoldButton>{tr("Apply for Coaching", "Solicita coaching")}</GoldButton>
      </div>
      <p className="reveal mt-5 text-xs text-foreground/50">
        {tr("*Full terms outlined in the client contract.", "*Terminos completos en el contrato del cliente.")}
      </p>
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
          <a href="/signin" className="transition-colors hover:text-primary">
            {tr("Client Login", "Acceso de clientes")}
          </a>
          <span className="text-foreground/25">.</span>
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
