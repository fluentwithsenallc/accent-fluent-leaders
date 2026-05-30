import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - Fluent with Sena" },
      {
        name: "description",
        content: "Privacy Policy for Fluent with Sena.",
      },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      effective="June 1, 2026"
      updated="May 30, 2026"
      intro={[
        "Your privacy is important to us. It is our policy to respect your privacy and comply with applicable law and regulation regarding personal information we may collect about you, including across http://www.fluentwithsena.com/ and other sites we own and operate.",
        "Personal information is information that can be used to identify you, including details about you, your devices, payment details, and how you use a website or online service.",
        "If our site links to third-party sites and services, those sites have their own privacy policies. This Privacy Policy does not apply after you leave our site.",
      ]}
      sections={[
        {
          title: "Information We Collect",
          body: [
            'Information we collect falls into two categories: "voluntarily provided" information and "automatically collected" information.',
            "Voluntarily provided information is information you knowingly provide when using our services, registering an account, subscribing, contacting us, or participating in promotions.",
            "Automatically collected information is information sent by your device while accessing our products and services.",
          ],
        },
        {
          title: "Log Data and Device Data",
          body: [
            "When you visit our website, our servers may log standard browser data, including IP address, browser type and version, pages visited, time and date of visit, time spent on each page, and other visit details.",
            "If you encounter errors, we may collect technical data about the error, your device, and what you were trying to do when the error happened.",
            "We may also collect device data such as device type and geo-location data, depending on your settings and software.",
          ],
        },
        {
          title: "Personal Information",
          body: [
            "We may ask for personal information when you submit content, subscribe to our newsletter, register an account, or contact us.",
          ],
          bullets: [
            "Name",
            "Email",
            "Date of birth",
            "Phone/mobile number",
            "Home/mailing address",
          ],
        },
        {
          title: "How We Use Information",
          body: [
            "We only collect and use personal information when we have a legitimate reason and only collect what is reasonably necessary to provide our services.",
          ],
          bullets: [
            "To provide core platform features and services",
            "To customize or personalize your website experience",
            "To contact and communicate with you",
            "For analytics, market research, and business development",
            "To send marketing and promotional communications, where permitted",
            "To deliver personalized or targeted advertising",
            "For internal record keeping and administration",
            "To comply with legal obligations and resolve disputes",
            "For security and fraud prevention",
          ],
        },
        {
          title: "Security and Retention",
          body: [
            "We protect personal information within commercially acceptable means to prevent loss, theft, unauthorized access, disclosure, copying, use, or modification.",
            "No electronic transmission or storage method is 100% secure, and we cannot guarantee absolute data security.",
            "We keep personal information only for as long as needed, unless retention is required for legal, accounting, reporting, archiving, research, or statistical purposes.",
          ],
        },
        {
          title: "Children's Privacy",
          body: [
            "We do not aim our products or services directly at children under 13 and do not knowingly collect personal information about children under 13.",
          ],
        },
        {
          title: "Disclosure to Third Parties",
          body: [
            "We may disclose personal information to affiliates, service providers, employees, contractors, business partners, courts, regulators, law enforcement, professional advisors, payment processors, and parties involved in a business transfer where permitted or required.",
            "Third-party services we currently use may include Google Analytics, Stripe, Substack, Google AdSense, and Meta Ads.",
          ],
        },
        {
          title: "Your Rights",
          body: [
            "You may request access to personal information we hold about you, request corrections, opt out of marketing communications, and make privacy complaints using the contact details below.",
            "We will not discriminate against you for exercising privacy rights unless the information is required to provide a particular service or offer.",
            "If we receive personal information about you from a third party, we will protect it as described in this policy.",
          ],
        },
        {
          title: "Text Message Communications",
          body: [
            "By providing your number, you agree to receive messages from Fluent with Sena regarding your schedule and services. Message frequency may vary. Message and data rates may apply. Reply STOP to unsubscribe or HELP for assistance. We do not share or sell your information to third parties.",
          ],
        },
        {
          title: "Cookies",
          body: [
            "We use cookies to collect information about you and your activity across our site so we can understand how you use the site and serve content based on preferences you specify. Please refer to our Cookie Policy for more information.",
          ],
        },
        {
          title: "Business Transfers and Policy Changes",
          body: [
            "If we or our assets are acquired, your personal information may be included among transferred assets. Any acquiring party may continue to use personal information according to this policy where permitted by law.",
            "We may update this Privacy Policy to reflect business, legal, or regulatory changes. If changes are significant, we may contact users with updated details where required.",
          ],
        },
        {
          title: "GDPR Disclosures",
          body: [
            "Fluent With Sena is a Data Controller with respect to personal information you provide to us.",
            "Our lawful bases may include consent, performance of a contract or transaction, legitimate interests, and compliance with the law.",
            "Where applicable, you may have rights to restrict processing, object to processing, request data portability, or request deletion.",
            "We will protect transfers of personal information from the EEA to countries outside the EEA using appropriate safeguards where required.",
          ],
        },
        {
          title: "Contact Us",
          body: [
            "For questions or concerns regarding your privacy, contact Fluent With Sena at sena@fluentwithsena.com.",
          ],
        },
      ]}
      spanish={{
        eyebrow: "Legal",
        title: "Política de privacidad",
        effective: "1 de junio de 2026",
        updated: "30 de mayo de 2026",
        intro: [
          "Tu privacidad es importante para nosotros. Es nuestra política respetar tu privacidad y cumplir con cualquier ley y regulación aplicable relacionada con cualquier información personal que podamos recopilar sobre ti, incluyendo a través de http://www.fluentwithsena.com/ y otros sitios que poseemos y operamos.",
          "La información personal es cualquier información sobre ti que pueda usarse para identificarte. Esto incluye información sobre ti como persona, tus dispositivos, detalles de pago e información sobre cómo usas un sitio web o servicio en línea.",
          "Si nuestro sitio contiene enlaces a sitios y servicios de terceros, ten en cuenta que esos sitios tienen sus propias políticas de privacidad. Esta Política de privacidad no aplica después de abandonar nuestro sitio.",
        ],
        sections: [
          {
            title: "Información que recopilamos",
            body: [
              'La información que recopilamos se divide en dos categorías: información "proporcionada voluntariamente" e información "recopilada automáticamente".',
              "La información proporcionada voluntariamente es cualquier información que nos das de manera consciente y activa al usar nuestros servicios, registrar una cuenta, suscribirte, contactarnos o participar en promociones.",
              "La información recopilada automáticamente es cualquier información enviada por tus dispositivos cuando accedes a nuestros productos y servicios.",
            ],
          },
          {
            title: "Datos de registro y datos del dispositivo",
            body: [
              "Cuando visitas nuestro sitio web, nuestros servidores pueden registrar datos estándar del navegador, incluyendo dirección IP, tipo y versión del navegador, páginas visitadas, fecha y hora de la visita, tiempo dedicado en cada página y otros detalles.",
              "Si encuentras errores mientras usas el sitio, podemos recopilar datos técnicos sobre el error, tu dispositivo y lo que intentabas hacer cuando ocurrió.",
              "También podemos recopilar datos del dispositivo, como el tipo de dispositivo y datos de geolocalización, dependiendo de tu configuración y software.",
            ],
          },
          {
            title: "Información personal",
            body: [
              "Podemos solicitar información personal cuando envías contenido, te suscribes a nuestro boletín, registras una cuenta o te pones en contacto con nosotros.",
            ],
            bullets: [
              "Nombre",
              "Correo electrónico",
              "Fecha de nacimiento",
              "Número de teléfono/móvil",
              "Dirección postal",
            ],
          },
          {
            title: "Cómo usamos la información",
            body: [
              "Solo recopilamos y usamos información personal cuando tenemos una razón legítima para hacerlo, y solo recopilamos lo razonablemente necesario para proporcionarte nuestros servicios.",
            ],
            bullets: [
              "Proporcionar las funciones y servicios principales de nuestra plataforma",
              "Personalizar tu experiencia en el sitio web",
              "Contactarte y comunicarnos contigo",
              "Realizar análisis, investigación de mercado y desarrollo empresarial",
              "Enviar comunicaciones de marketing y promocionales cuando esté permitido",
              "Ofrecer publicidad personalizada o dirigida",
              "Mantener registros internos y fines administrativos",
              "Cumplir obligaciones legales y resolver disputas",
              "Proteger la seguridad y prevenir el fraude",
            ],
          },
          {
            title: "Seguridad y conservación",
            body: [
              "Cuando recopilamos y procesamos información personal, la protegemos dentro de medios comercialmente aceptables para evitar pérdidas, robos, acceso no autorizado, divulgación, copia, uso o modificación.",
              "Ningún método de transmisión o almacenamiento electrónico es 100% seguro, por lo que no podemos garantizar seguridad absoluta.",
              "Conservamos la información personal solo durante el tiempo necesario, salvo que debamos conservarla por razones legales, contables, de informes, archivo, investigación o estadísticas.",
            ],
          },
          {
            title: "Privacidad de menores",
            body: [
              "Ninguno de nuestros productos o servicios está dirigido a menores de 13 años y no recopilamos conscientemente información personal de menores de 13 años.",
            ],
          },
          {
            title: "Divulgación a terceros",
            body: [
              "Podemos divulgar información personal a afiliadas, proveedores de servicios, empleados, contratistas, socios comerciales, tribunales, reguladores, autoridades, asesores profesionales, procesadores de pago y partes involucradas en una transferencia comercial cuando esté permitido o sea requerido.",
              "Los servicios de terceros que usamos actualmente pueden incluir Google Analytics, Stripe, Substack, Google AdSense y Meta Ads.",
            ],
          },
          {
            title: "Tus derechos",
            body: [
              "Puedes solicitar acceso a la información personal que conservamos sobre ti, pedir correcciones, cancelar comunicaciones de marketing y presentar reclamaciones de privacidad usando los datos de contacto a continuación.",
              "No te discriminaremos por ejercer tus derechos de privacidad, salvo que la información sea necesaria para proporcionar un servicio u oferta particular.",
              "Si recibimos información personal tuya de un tercero, la protegeremos como se describe en esta política.",
            ],
          },
          {
            title: "Comunicaciones por mensaje de texto",
            body: [
              "Al proporcionar tu número, aceptas recibir mensajes de Fluent with Sena sobre tu programación y servicios. La frecuencia puede variar. Pueden aplicarse tarifas de mensajes y datos. Responde STOP para cancelar tu suscripción o HELP para obtener ayuda. No compartimos ni vendemos tu información a terceros.",
            ],
          },
          {
            title: "Uso de cookies",
            body: [
              "Usamos cookies para recopilar información sobre ti y tu actividad en nuestro sitio, entender cómo lo usas y ofrecer contenido basado en las preferencias que especifiques. Consulta nuestra Política de cookies para obtener más información.",
            ],
          },
          {
            title: "Transferencias comerciales y cambios",
            body: [
              "Si nosotros o nuestros activos somos adquiridos, tu información personal puede incluirse entre los activos transferidos. Cualquier parte adquirente puede continuar usando la información personal de acuerdo con esta política cuando la ley lo permita.",
              "Podemos cambiar esta Política de privacidad para reflejar actualizaciones comerciales, prácticas aceptables actuales o cambios legislativos o regulatorios. Si los cambios son significativos, podemos contactar a los usuarios con los detalles actualizados cuando sea requerido.",
            ],
          },
          {
            title: "Divulgaciones adicionales del RGPD",
            body: [
              "Fluent With Sena es Responsable del tratamiento respecto de la información personal que nos proporcionas.",
              "Nuestras bases legales pueden incluir tu consentimiento, la ejecución de un contrato o transacción, nuestros intereses legítimos y el cumplimiento de la ley.",
              "Cuando corresponda, puedes tener derecho a restringir el procesamiento, oponerte al procesamiento, solicitar portabilidad de datos o solicitar eliminación.",
              "Protegeremos las transferencias de información personal desde el Espacio Económico Europeo a países fuera del EEE mediante salvaguardas adecuadas cuando sea requerido.",
            ],
          },
          {
            title: "Contáctenos",
            body: [
              "Para cualquier pregunta o inquietud sobre tu privacidad, puedes contactar a Fluent With Sena en sena@fluentwithsena.com.",
            ],
          },
        ],
      }}
    />
  );
}
