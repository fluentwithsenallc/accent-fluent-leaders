import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/LegalPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy - Fluent with Sena" },
      {
        name: "description",
        content: "Cookie Policy for Fluent with Sena.",
      },
    ],
  }),
  component: CookiePolicy,
});

function CookiePolicy() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Cookie Policy"
      effective="June 1, 2026"
      intro={[
        "We use cookies to help improve your experience of our website at http://www.fluentwithsena.com/ and its subdomains. This Cookie Policy is part of our Privacy Policy.",
        "This policy covers the use of cookies between your device and our site. It also provides basic information about third-party services we may use, who may also use cookies as part of their service.",
        "If you do not wish to accept cookies from us, you should instruct your browser to refuse cookies from http://www.fluentwithsena.com/. In that case, some content and services may not be available.",
      ]}
      sections={[
        {
          title: "What Is a Cookie?",
          body: [
            "A cookie is a small piece of data a website stores on your device when you visit. It typically contains information about the website, a unique identifier, data that serves the cookie's purpose, and the cookie's lifespan.",
            "Cookies may enable features such as logging in, tracking site usage, storing settings such as time zone or notification preferences, and personalizing content.",
            "Cookies set by the website you are visiting are first-party cookies. Cookies set by other sites and companies are third-party cookies.",
          ],
        },
        {
          title: "Types of Cookies and How We Use Them",
          body: [
            "Functionality cookies collect information about your device and settings you may configure on the website, such as language and time zone settings.",
            "With this information, websites can provide customized, enhanced, or optimized content and services.",
            "We use functionality cookies on our site.",
          ],
        },
        {
          title: "How You Can Control Cookies",
          body: [
            "You have the right to decide whether to accept or reject cookies on our website. You can manage cookie preferences in our Cookie Consent Manager.",
            "Essential cookies cannot be rejected because they are strictly necessary to provide services on the website.",
            "You may also manage cookie preferences through your web browser settings. If you refuse or disable cookies, you may still use the website, though some functionality may not be available.",
          ],
        },
        {
          title: "Cookie Policy Updates",
          body: [
            "We may update this Cookie Policy from time to time to reflect changes to cookies and related technologies we use, or for operational, legal, or regulatory reasons.",
            "Each time you use our website, the current version of the Cookie Policy will apply. Please check the date at the top of this policy and review any changes.",
          ],
        },
        {
          title: "Contact Us",
          body: [
            "For questions or concerns regarding our Cookie Policy, contact Fluent With Sena at sena@fluentwithsena.com.",
          ],
        },
      ]}
    >
      <div className="legal-preferences">
        <h2>Cookie Preferences</h2>
        <p>
          You can reopen the cookie consent preferences panel at any time using the button below.
        </p>
        <button type="button" data-gt-cookie-widget-show="true">
          Manage Cookie Preferences
        </button>
      </div>
    </LegalPage>
  );
}
