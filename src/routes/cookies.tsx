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
      after={
        <div className="legal-preferences">
          <h2>Cookie Preferences</h2>
          <p>
            You can reopen the cookie consent preferences panel at any time using the button below.
          </p>
          <button type="button" data-gt-cookie-widget-show="true">
            Manage Cookie Preferences
          </button>
        </div>
      }
      spanish={{
        eyebrow: "Legal",
        title: "Política de cookies",
        effective: "1 de junio de 2026",
        intro: [
          "Usamos cookies para ayudar a mejorar tu experiencia en nuestro sitio web en http://www.fluentwithsena.com/ y sus subdominios. Esta Política de cookies es parte de nuestra Política de privacidad.",
          "Esta política cubre el uso de cookies entre tu dispositivo y nuestro sitio. También proporciona información básica sobre servicios de terceros que podemos usar, quienes también pueden usar cookies como parte de su servicio.",
          "Si no deseas aceptar cookies de nuestra parte, debes indicarle a tu navegador que rechace las cookies de http://www.fluentwithsena.com/. En tal caso, es posible que no podamos proporcionarte parte del contenido y servicios que deseas.",
        ],
        sections: [
          {
            title: "¿Qué es una cookie?",
            body: [
              "Una cookie es un pequeño fragmento de datos que un sitio web almacena en tu dispositivo cuando lo visitas. Normalmente contiene información sobre el sitio web, un identificador único, datos que sirven al propósito de la cookie y la vida útil de la cookie.",
              "Las cookies se utilizan para habilitar funciones como iniciar sesión, rastrear el uso del sitio, almacenar configuraciones como zona horaria o preferencias de notificación, y personalizar contenido.",
              "Las cookies establecidas por el sitio web que visitas se denominan cookies de primera parte. Las cookies establecidas por otros sitios y empresas se denominan cookies de terceros.",
            ],
          },
          {
            title: "Tipos de cookies y cómo las usamos",
            body: [
              "Las cookies de funcionalidad recopilan información sobre tu dispositivo y cualquier configuración que puedas establecer en el sitio web, como idioma y zona horaria.",
              "Con esta información, los sitios web pueden proporcionarte contenido y servicios personalizados, mejorados u optimizados.",
              "Usamos cookies de funcionalidad en nuestro sitio.",
            ],
          },
          {
            title: "Cómo puedes controlar las cookies",
            body: [
              "Tienes derecho a decidir si aceptas o rechazas las cookies en nuestro sitio web. Puedes gestionar tus preferencias en nuestro Gestor de Consentimiento de Cookies.",
              "Las cookies esenciales no pueden rechazarse, ya que son estrictamente necesarias para proporcionarte los servicios del sitio web.",
              "También puedes gestionar tus preferencias desde la configuración de tu navegador. Si rechazas o deshabilitas las cookies, aún puedes usar el sitio web, aunque algunas funciones podrían no estar disponibles.",
            ],
          },
          {
            title: "Actualizaciones de esta Política de cookies",
            body: [
              "Podemos actualizar esta Política de cookies de vez en cuando para reflejar cambios en las cookies y tecnologías relacionadas que usamos, o por razones operativas, legales o regulatorias.",
              "Cada vez que uses nuestro sitio web, se aplicará la versión actual de esta Política de cookies. Revisa la fecha en la parte superior de este documento y cualquier cambio desde la última versión.",
            ],
          },
          {
            title: "¿Dónde puedes obtener más información?",
            body: [
              "Para cualquier pregunta o inquietud sobre nuestra Política de cookies, puedes contactar a Fluent With Sena en sena@fluentwithsena.com.",
            ],
          },
        ],
        after: (
          <div className="legal-preferences">
            <h2>Preferencias de cookies</h2>
            <p>
              Puedes volver a abrir el panel de preferencias de consentimiento de cookies en
              cualquier momento usando el botón a continuación.
            </p>
            <button type="button" data-gt-cookie-widget-show="true">
              Gestionar preferencias de cookies
            </button>
          </div>
        ),
      }}
    />
  );
}
