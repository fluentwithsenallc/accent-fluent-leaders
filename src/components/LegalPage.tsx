type LegalSection = {
  title: string;
  body?: string[];
  bullets?: string[];
};

export type LegalPageProps = {
  title: string;
  eyebrow: string;
  effective?: string;
  updated?: string;
  intro: string[];
  sections: LegalSection[];
  children?: React.ReactNode;
};

export function LegalPage({
  title,
  eyebrow,
  effective,
  updated,
  intro,
  sections,
  children,
}: LegalPageProps) {
  return (
    <main className="legal-page">
      <nav className="legal-nav">
        <a href="/" className="legal-brand">
          Fluent with Sena
        </a>
        <div className="legal-nav-links">
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="/cookies">Cookies</a>
        </div>
      </nav>

      <section className="legal-hero">
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <div className="legal-dates">
          {effective && <span>Effective: {effective}</span>}
          {updated && <span>Last updated: {updated}</span>}
        </div>
      </section>

      <section className="legal-shell">
        <div className="legal-card">
          {intro.map((paragraph) => (
            <p key={paragraph} className="legal-lead">
              {paragraph}
            </p>
          ))}

          {sections.map((section) => (
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

          {children}
        </div>
      </section>
    </main>
  );
}
