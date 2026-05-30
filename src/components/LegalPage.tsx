import { useState, type ReactNode } from "react";

type LegalSection = {
  title: string;
  body?: string[];
  bullets?: string[];
};

type LegalContent = {
  title: string;
  eyebrow: string;
  effective?: string;
  updated?: string;
  intro: string[];
  sections: LegalSection[];
  after?: ReactNode;
};

export type LegalPageProps = LegalContent & {
  spanish?: LegalContent;
};

export function LegalPage({ spanish, ...english }: LegalPageProps) {
  const [language, setLanguage] = useState<"en" | "es">("en");
  const isSpanish = language === "es" && !!spanish;
  const content = isSpanish && spanish ? spanish : english;

  return (
    <main className="legal-page" lang={isSpanish ? "es" : "en"}>
      <nav className="legal-nav">
        <a href="/" className="legal-brand">
          Fluent with Sena
        </a>
        <div className="legal-nav-actions">
          <div className="legal-nav-links">
            <a href="/terms">{isSpanish ? "Términos" : "Terms"}</a>
            <a href="/privacy">{isSpanish ? "Privacidad" : "Privacy"}</a>
            <a href="/cookies">{isSpanish ? "Cookies" : "Cookies"}</a>
          </div>
          {spanish && (
            <div className="legal-lang-toggle" aria-label="Language selector">
              <button
                type="button"
                className={language === "en" ? "active" : ""}
                onClick={() => setLanguage("en")}
              >
                English
              </button>
              <button
                type="button"
                className={language === "es" ? "active" : ""}
                onClick={() => setLanguage("es")}
              >
                Español
              </button>
            </div>
          )}
        </div>
      </nav>

      <section className="legal-hero">
        <p>{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <div className="legal-dates">
          {content.effective && (
            <span>
              {isSpanish ? "Vigente" : "Effective"}: {content.effective}
            </span>
          )}
          {content.updated && (
            <span>
              {isSpanish ? "Última actualización" : "Last updated"}: {content.updated}
            </span>
          )}
        </div>
      </section>

      <section className="legal-shell">
        <div className="legal-card">
          {content.intro.map((paragraph) => (
            <p key={paragraph} className="legal-lead">
              {paragraph}
            </p>
          ))}

          {content.sections.map((section) => (
            <section key={section.title} className="legal-section">
              <h2>{section.title}</h2>
              {section.body?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {!!section.bullets?.length && (
                <ul>
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {content.after}
        </div>
      </section>
    </main>
  );
}
