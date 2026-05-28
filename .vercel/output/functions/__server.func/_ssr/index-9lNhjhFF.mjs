import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { X, d as Menu, S as Sparkles, C as CircleCheck, A as ArrowRight, b as Compass, M as Map, f as Mic, T as Trophy, L as LayoutDashboard, c as Library, a as Bot, B as BookOpen, e as MessageSquareText, Q as Quote } from "../_libs/lucide-react.mjs";
function useReveal() {
  reactExports.useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, {
      threshold: 0.12
    });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}
function GoldButton({
  children,
  href = "#apply",
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href, className: `group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-7 py-3.5 text-sm font-semibold tracking-wide text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_50px_-15px_oklch(0.82_0.13_80_/_.6)] active:scale-95 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10", children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" })
  ] });
}
function GhostButton({
  children,
  href = "#program"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href, className: "group inline-flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "border-b border-foreground/20 pb-0.5 group-hover:border-primary", children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-1" })
  ] });
}
function SectionLabel({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reveal flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px w-10 bg-primary/60" }),
    children
  ] });
}
function HeroMetric({
  value,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-l border-primary/35 pl-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-serif text-2xl italic leading-none text-primary", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50", children: label })
  ] });
}
function Landing() {
  useReveal();
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = reactExports.useState(false);
  const navLinks = [{
    href: "#home",
    label: "Home"
  }, {
    href: "#program",
    label: "Program"
  }, {
    href: "#results",
    label: "Results"
  }, {
    href: "#apply",
    label: "Apply"
  }];
  const headlineWords = ["The", "English", "Mastery", "Program", "for", "Hispanic", "Leaders"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen overflow-x-hidden bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: `fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-white/5 bg-background/80 backdrop-blur-xl" : "bg-transparent"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "#home", className: "flex items-baseline gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-serif text-xl italic text-primary", children: "Fluent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-serif text-xl tracking-tight", children: "with Sena" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "hidden items-center gap-9 md:flex", children: navLinks.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: l.href, className: "text-xs font-medium uppercase tracking-[0.18em] text-foreground/70 transition-colors hover:text-primary", children: l.label }) }, l.href)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GoldButton, { children: "Apply for Coaching" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-label": "Toggle menu", onClick: () => setMenuOpen((v) => !v), className: "rounded-full p-2 md:hidden", children: menuOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5" }) })
      ] }),
      menuOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-white/5 bg-background/95 px-6 py-6 backdrop-blur-xl md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "flex flex-col gap-4", children: [
        navLinks.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: l.href, onClick: () => setMenuOpen(false), className: "text-sm font-medium uppercase tracking-[0.18em] text-foreground/80", children: l.label }) }, l.href)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GoldButton, { children: "Apply for Coaching" }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "home", className: "relative grain isolate flex min-h-screen items-center pt-28", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 -z-10 bg-[linear-gradient(115deg,oklch(0.12_0.04_265),oklch(0.18_0.05_265)_48%,oklch(0.24_0.08_50))]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,oklch(0.82_0.13_80_/_0.18),transparent_42%)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 px-6 py-20 lg:grid-cols-12 lg:px-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "order-2 lg:order-1 lg:col-span-7", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary", style: {
            animation: "fadeUp .9s .1s both"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px w-10 bg-primary/60" }),
            "Executive English Coaching"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-[clamp(2.8rem,7vw,6rem)] font-medium leading-[1.02] tracking-tight", children: headlineWords.map((w, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hero-word mr-[0.25em]", style: {
            animationDelay: `${0.15 + i * 0.08}s`,
            color: w === "Hispanic" || w === "Mastery" ? "var(--primary)" : void 0,
            fontStyle: w === "Hispanic" || w === "Mastery" ? "italic" : void 0
          }, children: w }, w)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-8 max-w-2xl font-serif text-xl italic text-foreground/85 md:text-2xl", style: {
            animation: "fadeUp .9s .9s both"
          }, children: "Stop translating in your head and start leading in English." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 max-w-xl text-base text-foreground/65 md:text-lg", style: {
            animation: "fadeUp .9s 1.05s both"
          }, children: "A personalized English program built for your voice, your industry, and the rooms you are ready to lead." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 flex flex-wrap items-center gap-6", style: {
            animation: "fadeUp .9s 1.2s both"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(GoldButton, { children: "Apply for Coaching" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(GhostButton, { href: "#program", children: "Inside the Program" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-14 grid max-w-xl grid-cols-3 gap-4", style: {
            animation: "fadeUp .9s 1.35s both"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(HeroMetric, { value: "1:1", label: "Live Coaching" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(HeroMetric, { value: "4x", label: "Weekly Sessions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(HeroMetric, { value: "90", label: "Day Sprint" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "relative order-1 lg:order-2 lg:col-span-5", style: {
          animation: "fadeUp .9s .75s both"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto flex min-h-[520px] max-w-md items-start justify-center overflow-visible px-4 pt-2 sm:min-h-[620px] lg:min-h-[680px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-10 bottom-8 h-44 rounded-full bg-primary/20 blur-3xl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/2 top-10 h-[78%] w-[82%] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,oklch(0.82_0.13_80_/_0.18),transparent_70%)] blur-2xl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-hero-float relative z-10 flex h-[500px] w-full items-start justify-center sm:h-[600px] lg:h-[650px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "https://ebecd6d012a4750b05cf2b81c1b867a7.cdn.bubble.io/f1777542118760x615048179195580800/Gemini_Generated_Image_494b3o494b3o494b%20%281%29%201.svg", alt: "Sena, the Fluent with Sena English instructor", className: "h-full w-full drop-shadow-[0_40px_70px_oklch(0.02_0.02_265_/_0.45)] object-contain object-top" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-float-slow absolute left-0 top-[16%] z-20 rounded-full bg-primary px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-[0_18px_40px_-18px_oklch(0.82_0.13_80_/_0.9)] sm:left-2", children: "1:1 coaching" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-float-medium absolute right-0 top-[42%] z-20 max-w-[8.5rem] rounded-2xl bg-background/80 px-4 py-3 text-sm text-foreground/82 shadow-[0_20px_55px_-35px_black] backdrop-blur-xl sm:right-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-serif text-2xl italic text-primary", children: "AI" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 leading-snug", children: "practice between sessions" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-float-fast absolute bottom-10 left-3 z-20 max-w-[9rem] rounded-2xl bg-background/80 px-4 py-3 text-sm text-foreground/82 shadow-[0_20px_55px_-35px_black] backdrop-blur-xl sm:left-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-serif text-2xl italic text-primary", children: "CEO" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 leading-snug", children: "level speaking drills" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-float-slow absolute bottom-[24%] right-[30%] z-0 h-2 w-2 rounded-full bg-primary/70 shadow-[0_0_30px_10px_oklch(0.82_0.13_80_/_0.35)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-float-fast absolute right-[12%] top-[18%] z-0 h-1.5 w-1.5 rounded-full bg-accent/80 shadow-[0_0_28px_8px_oklch(0.65_0.18_45_/_0.35)]" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-foreground/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
        animation: "shimmer 2.5s ease-in-out infinite"
      }, children: "Scroll" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "program", className: "relative border-t border-white/5 py-28 lg:py-36", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 lg:grid-cols-12 lg:px-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-7", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "The Complete Learning System" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "reveal mt-6 font-serif text-4xl font-medium leading-[1.08] tracking-tight md:text-6xl", children: [
          "More than just ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { className: "text-primary", children: "English lessons." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reveal mt-8 space-y-5 text-lg leading-relaxed text-foreground/75", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Fluent with Sena is a fully personalized coaching experience designed exclusively for Hispanic professionals who refuse to let language hold them back from the rooms - and the careers - they belong in." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You'll work directly with Sena to build an English roadmap shaped around your industry, your accent, your communication style, and the level of authority you want to project. This is not a course. It's a system - built around you." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "reveal mt-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GoldButton, { children: "Apply for Coaching" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "reveal relative lg:col-span-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-white/10 bg-card p-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[linear-gradient(135deg,oklch(0.82_0.13_80_/_0.22),transparent_42%),linear-gradient(315deg,oklch(0.65_0.18_45_/_0.20),transparent_48%)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-8 w-8 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.3em] text-foreground/50", children: "A note from Sena" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 font-serif text-2xl italic leading-snug text-foreground/95", children: [
              `"You don't need more grammar.`,
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              'You need a voice the room listens to."'
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-xs uppercase tracking-[0.24em] text-primary", children: "- Sena" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 space-y-4 border-t border-white/10 pt-8", children: ["Accent confidence without losing your identity", "Executive vocabulary for meetings, pitches, and interviews", "Real-time correction in high-pressure conversation"].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 text-sm text-foreground/72", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item })
          ] }, item)) })
        ] })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Steps, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Features, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Testimonials, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FinalCta, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-white/5 bg-background py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-sm text-foreground/55 md:flex-row lg:px-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-serif text-lg italic text-primary", children: "Fluent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-serif text-lg tracking-tight text-foreground", children: "with Sena" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "flex flex-wrap items-center gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", className: "hover:text-primary", children: "Terms & Conditions" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30", children: "." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", className: "hover:text-primary", children: "Privacy Policy" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30", children: "." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", className: "hover:text-primary", children: "Disclaimer" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs uppercase tracking-[0.22em] text-foreground/40", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Fluent with Sena"
      ] })
    ] }) })
  ] });
}
const STEPS = [{
  n: "01",
  title: "Assess",
  when: "Week 1",
  icon: Compass,
  body: "A deep dive into your current English, your industry vocabulary, and where confidence breaks down."
}, {
  n: "02",
  title: "Build Your Roadmap",
  when: "Week 1-2",
  icon: Map,
  body: "Sena designs a personalized program - your goals, your weak points, your accent, your voice."
}, {
  n: "03",
  title: "Speak Live",
  when: "Full Program",
  icon: Mic,
  body: "Four live sessions per week. Real conversations, real boardrooms, real pressure - coached in real time."
}, {
  n: "04",
  title: "Deliver",
  when: "Program End",
  icon: Trophy,
  body: "You walk into meetings, interviews, and pitches leading the room - in English, in your voice."
}];
function Steps() {
  const ref = reactExports.useRef(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative border-t border-white/5 bg-[oklch(0.14_0.04_265)] py-28 lg:py-36", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6 lg:px-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "How It Works" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "reveal mt-6 max-w-2xl font-serif text-4xl font-medium leading-[1.08] tracking-tight md:text-6xl", children: [
          "The 4 steps to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { className: "text-primary", children: "fluency." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "reveal max-w-md text-foreground/65", children: "A clear path from translating in your head to thinking, leading, and selling - in English." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref, className: "relative mt-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8", children: STEPS.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reveal relative", style: {
        transitionDelay: `${i * 120}ms`
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-serif text-3xl italic text-primary", children: s.n }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-foreground/45", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "h-3.5 w-3.5 text-primary" }),
          s.when
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 font-serif text-2xl font-medium tracking-tight", children: s.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-relaxed text-foreground/65", children: s.body })
      ] }, s.n)) })
    ] })
  ] }) });
}
const FEATURES = [{
  icon: Map,
  title: "Personalized Roadmap",
  body: "A program designed around your industry, voice, and goals - not a generic curriculum."
}, {
  icon: LayoutDashboard,
  title: "Student Dashboard",
  body: "Track sessions, progress, and assignments in one place built for executives."
}, {
  icon: Library,
  title: "Immersion Library",
  body: "Curated videos, articles, and scripts to surround you with the English you actually need."
}, {
  icon: Bot,
  title: "AI Conversation Partner",
  body: "Practice anytime with a voice-based partner trained for real professional dialogue.",
  badge: "Powered by ChatGPT Voice"
}, {
  icon: BookOpen,
  title: "NotebookLM Study Guides",
  body: "Personalized study notes generated from your real coaching sessions.",
  badge: "Powered by NotebookLM"
}, {
  icon: MessageSquareText,
  title: "Executive Scripts",
  body: "Meeting openings, objection responses, and pitch language for your real workday."
}];
function Features() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative border-t border-white/5 py-28 lg:py-36", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6 lg:px-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "The Full System" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "reveal mt-6 max-w-2xl font-serif text-4xl font-medium leading-[1.08] tracking-tight md:text-6xl", children: [
        "Everything you ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { className: "text-primary", children: "need." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3", children: FEATURES.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group reveal relative overflow-hidden rounded-2xl border border-white/8 bg-card/60 p-8 transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:gold-glow", style: {
      transitionDelay: `${i * 80}ms`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(f.icon, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-2xl font-medium tracking-tight", children: f.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-relaxed text-foreground/65", children: f.body }),
      f.badge && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-background/40 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground/55", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3 text-primary" }),
        f.badge
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" })
    ] }, f.title)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "reveal mt-14 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GoldButton, { children: "Apply for Coaching" }) })
  ] }) });
}
const QUOTES = [{
  q: "For the first time in fifteen years, I led a board meeting in English without rehearsing every line in my head. Sena gave me my voice back.",
  name: "María González",
  role: "VP of Operations, Fintech"
}, {
  q: "I stopped sounding like I was translating and started sounding like I was leading. Clients hear me differently now.",
  name: "Andrés Castillo",
  role: "Director of Strategy"
}, {
  q: "This is not an English class. It's an executive transformation. Worth every dollar - and every session.",
  name: "Lucía Ramírez",
  role: "Senior Counsel, BigLaw"
}];
function Testimonials() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "results", className: "relative border-t border-white/5 bg-[oklch(0.14_0.04_265)] py-28 lg:py-36", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6 lg:px-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Testimonials" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "reveal max-w-2xl font-serif text-4xl font-medium leading-[1.08] tracking-tight md:text-6xl", children: [
        "True ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { className: "text-primary", children: "fluency." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "reveal max-w-md text-foreground/65", children: "Real Hispanic leaders. Real boardrooms. Real results." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 grid grid-cols-1 gap-5 md:grid-cols-3", children: QUOTES.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("figure", { className: "reveal relative flex flex-col justify-between rounded-2xl border border-white/8 bg-card/60 p-8", style: {
      transitionDelay: `${i * 100}ms`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Quote, { className: "h-7 w-7 text-primary/70" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("blockquote", { className: "mt-6 font-serif text-xl italic leading-snug text-foreground/90", children: [
        '"',
        t.q,
        '"'
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("figcaption", { className: "mt-8 flex items-center gap-3 border-t border-white/8 pt-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-serif text-primary", children: t.name.charAt(0) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: t.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-[0.18em] text-foreground/45", children: t.role })
        ] })
      ] })
    ] }, t.name)) })
  ] }) });
}
function FinalCta() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "apply", className: "relative isolate overflow-hidden border-t border-white/5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 -z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[linear-gradient(135deg,oklch(0.22_0.08_45),oklch(0.13_0.04_265)_46%,oklch(0.18_0.05_265))]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grain" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl flex-col items-center px-6 py-32 text-center lg:px-10 lg:py-44", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Apply Now" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "reveal mt-8 font-serif text-5xl font-medium leading-[1.02] tracking-tight md:text-7xl lg:text-8xl", children: [
        "Stop translating.",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { className: "text-primary", children: "Start leading." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "reveal mt-8 max-w-2xl font-serif text-xl italic text-foreground/85 md:text-2xl", children: "4 sessions a week, professional live coaching, and a program built around you." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "reveal mt-4 text-sm uppercase tracking-[0.22em] text-primary", children: "Apply for coaching today - spots are limited." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "reveal mt-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GoldButton, { children: "Apply for Coaching" }) })
    ] })
  ] });
}
export {
  Landing as component
};
