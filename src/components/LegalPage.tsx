import type { ReactNode } from "react";
import { LanguageToggle, useAppLanguage, useTranslate } from "../lib/language";

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
  const { language } = useAppLanguage();
  const tr = useTranslate();
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
            <a href="/terms">{tr("Terms", "Terminos")}</a>
            <a href="/privacy">{tr("Privacy", "Privacidad")}</a>
            <a href="/cookies">{tr("Cookies", "Cookies")}</a>
          </div>
          {spanish && <LanguageToggle />}
        </div>
      </nav>

      <section className="legal-hero">
        <p>{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <div className="legal-dates">
          {content.effective && (
            <span>
              {tr("Effective", "Vigente")}: {content.effective}
            </span>
          )}
          {content.updated && (
            <span>
              {tr("Last updated", "Ultima actualizacion")}: {content.updated}
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
