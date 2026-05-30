import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service - Fluent with Sena" },
      {
        name: "description",
        content: "Terms of Service for Fluent with Sena.",
      },
    ],
  }),
  component: TermsOfService,
});

function TermsOfService() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated="May 30, 2026"
      intro={[
        "These Terms of Service govern your use of the website located at http://www.fluentwithsena.com/ and any related services provided by Fluent With Sena.",
        "By accessing http://www.fluentwithsena.com/, you agree to abide by these Terms of Service and comply with all applicable laws and regulations. If you do not agree, you are prohibited from using or accessing this website or services provided by Fluent With Sena.",
        "Fluent With Sena reserves the right to review and amend these Terms of Service at our sole discretion. Changes take effect immediately from the date of publication.",
      ]}
      sections={[
        {
          title: "Limitations of Use",
          body: ["By using this website, you warrant that you will not:"],
          bullets: [
            "Modify, copy, prepare derivative works of, decompile, or reverse engineer materials or software on this website",
            "Remove copyright or proprietary notations",
            'Transfer materials to another person or "mirror" materials on another server',
            "Use the website or services in a way that abuses or disrupts our networks or services",
            "Transmit or publish harassing, indecent, obscene, fraudulent, or unlawful material",
            "Use the website or services in violation of applicable laws or regulations",
            "Send unauthorized advertising or spam",
            "Harvest, collect, or gather user data without consent",
            "Infringe the privacy, intellectual property rights, or other rights of third parties",
          ],
        },
        {
          title: "Intellectual Property",
          body: [
            "The intellectual property in materials on this website is owned by or licensed to Fluent With Sena and protected by copyright and trademark law.",
            "We grant permission to download one copy of materials for personal, non-commercial transitory use. This is a license, not a transfer of title, and it terminates automatically if you violate these Terms.",
          ],
        },
        {
          title: "SMS/MMS Communications",
          body: [
            "Fluent With Sena may send SMS and/or MMS communications for promotional, conversational, and informational purposes only with prior express consent.",
            "By opting in, you consent to receive SMS and/or MMS messages from Fluent With Sena. We do not charge fees for these messages, but message and data rates may apply.",
            "Fluent With Sena may use an automatic telephone dialing system or other automated technologies to send messages for the purposes described above.",
          ],
        },
        {
          title: "Opting Out of SMS/MMS Communications",
          body: [
            'To opt out at any time, reply "STOP" or "UNSUBSCRIBE" to any SMS/MMS message we send you. There may be a short delay while your request is processed.',
            "For assistance, contact Fluent With Sena at sena@fluentwithsena.com.",
          ],
        },
        {
          title: "Liability",
          body: [
            "Our website and materials are provided on an 'as is' basis. To the extent permitted by law, Fluent With Sena makes no warranties, expressed or implied.",
            "In no event shall Fluent With Sena or its suppliers be liable for consequential loss arising from use of, or inability to use, this website or its materials.",
            "Some jurisdictions do not allow certain limitations, so these limitations may not apply to you.",
          ],
        },
        {
          title: "Accuracy of Materials",
          body: [
            "Materials on our website are for general information purposes only. Fluent With Sena does not warrant the accuracy, likely results, or reliability of materials on this website or linked resources.",
          ],
        },
        {
          title: "Links",
          body: [
            "Fluent With Sena has not reviewed all linked sites and is not responsible for their contents. Use of linked sites is at your own risk.",
          ],
        },
        {
          title: "Coaching Disclaimer",
          body: [
            "Fluent With Sena provides language coaching services only and does not guarantee specific results, career outcomes, or employment. Results vary based on individual effort and commitment.",
          ],
        },
        {
          title: "Right to Terminate",
          body: [
            "We may suspend or terminate your right to use our website and terminate these Terms immediately upon written notice for breach of these Terms.",
          ],
        },
        {
          title: "Severance",
          body: [
            "Any term that is wholly or partially void or unenforceable is severed to that extent. The validity of the remainder of these Terms is not affected.",
          ],
        },
        {
          title: "Governing Law",
          body: [
            "These Terms of Service are governed by and construed in accordance with the laws of the USA. You submit to the exclusive jurisdiction of the courts in that State or location.",
          ],
        },
      ]}
      spanish={{
        eyebrow: "Legal",
        title: "Términos de servicio",
        updated: "30 de mayo de 2026",
        intro: [
          "Estos Términos de servicio rigen tu uso del sitio web ubicado en http://www.fluentwithsena.com/ y cualquier servicio relacionado proporcionado por Fluent With Sena.",
          "Al acceder a http://www.fluentwithsena.com/, aceptas cumplir con estos Términos de servicio y con todas las leyes y regulaciones aplicables. Si no estás de acuerdo, tienes prohibido usar o acceder a este sitio web o utilizar cualquier otro servicio proporcionado por Fluent With Sena.",
          "Nos reservamos el derecho de revisar y modificar cualquiera de estos Términos de servicio a nuestra entera discreción. Cualquier cambio entrará en vigor de inmediato a partir de la fecha de publicación.",
        ],
        sections: [
          {
            title: "Limitaciones de uso",
            body: [
              "Al usar este sitio web, garantizas en tu nombre, el de tus usuarios y el de otras partes que representas que no:",
            ],
            bullets: [
              "Modificarás, copiarás, prepararás obras derivadas, descompilarás ni realizarás ingeniería inversa de ningún material o software contenido en este sitio web",
              "Eliminarás ningún aviso de derechos de autor u otras anotaciones de propiedad de ningún material o software de este sitio web",
              'Transferirás los materiales a otra persona ni los "reflejarás" en ningún otro servidor',
              "Usarás este sitio web de manera que abuse o interrumpa nuestras redes o cualquier otro servicio que Fluent With Sena proporcione",
              "Transmitirás o publicarás material acosador, indecente, obsceno, fraudulento o ilegal",
              "Usarás este sitio web en violación de las leyes o regulaciones aplicables",
              "Enviarás publicidad no autorizada o correo no deseado",
              "Recopilarás datos de usuarios sin su consentimiento",
              "Infringirás la privacidad, los derechos de propiedad intelectual u otros derechos de terceros",
            ],
          },
          {
            title: "Propiedad intelectual",
            body: [
              "La propiedad intelectual de los materiales contenidos en este sitio web es propiedad de Fluent With Sena o está licenciada a esta, y está protegida por las leyes de derechos de autor y marcas registradas aplicables.",
              "Otorgamos permiso para descargar una copia de los materiales para uso personal, no comercial y transitorio. Esto constituye una licencia, no una transferencia de título, y se cancelará automáticamente si violas estas restricciones o los Términos de servicio.",
            ],
          },
          {
            title: "Comunicaciones por SMS/MMS",
            body: [
              "Fluent With Sena puede enviar comunicaciones por SMS y/o MMS con fines promocionales, conversacionales e informativos, pero solo con el consentimiento expreso previo del destinatario.",
              "Al optar por recibir comunicaciones, consientes expresamente que Fluent With Sena te envíe mensajes SMS y/o MMS. Fluent With Sena no cobra tarifas por estos mensajes, pero pueden aplicarse tarifas de mensajes y datos según tu operador móvil.",
              "Fluent With Sena puede utilizar un sistema automático de marcación telefónica u otras tecnologías automatizadas para enviar estos mensajes.",
            ],
          },
          {
            title: "Cancelación de suscripción a SMS/MMS",
            body: [
              'Para cancelar tu suscripción en cualquier momento, responde "STOP" o "UNSUBSCRIBE" a cualquier mensaje SMS/MMS que te enviemos. Es posible que haya un breve retraso mientras procesamos tu solicitud.',
              "Para obtener ayuda, contáctanos en sena@fluentwithsena.com.",
            ],
          },
          {
            title: "Responsabilidad",
            body: [
              'Nuestro sitio web y los materiales en nuestro sitio web se proporcionan "tal cual". En la medida permitida por la ley, Fluent With Sena no ofrece garantías, expresas ni implícitas.',
              "En ningún caso Fluent With Sena o sus proveedores serán responsables de ninguna pérdida consecuente que surja del uso o la imposibilidad de usar este sitio web o sus materiales.",
              "Debido a que algunas jurisdicciones no permiten ciertas limitaciones, es posible que estas limitaciones no te apliquen.",
            ],
          },
          {
            title: "Exactitud de los materiales",
            body: [
              "Los materiales que aparecen en nuestro sitio web son solo para fines de información general. Fluent With Sena no garantiza la exactitud, los resultados probables o la confiabilidad de los materiales.",
            ],
          },
          {
            title: "Enlaces",
            body: [
              "Fluent With Sena no ha revisado todos los sitios vinculados a su sitio web y no es responsable del contenido de ningún sitio vinculado. El uso de cualquier sitio vinculado es bajo tu propio riesgo.",
            ],
          },
          {
            title: "Aviso legal de coaching",
            body: [
              "Fluent With Sena proporciona únicamente servicios de coaching de idiomas y no garantiza resultados específicos, resultados profesionales ni empleo. Los resultados varían según el esfuerzo y el compromiso individual.",
            ],
          },
          {
            title: "Derecho a rescindir",
            body: [
              "Podemos suspender o cancelar tu derecho a usar nuestro sitio web y rescindir estos Términos de servicio de inmediato mediante notificación por escrito si incumples cualquiera de estos Términos.",
            ],
          },
          {
            title: "Separabilidad",
            body: [
              "Cualquier término que sea total o parcialmente nulo o inaplicable se separará en la medida correspondiente. La validez del resto de estos Términos de servicio no se verá afectada.",
            ],
          },
          {
            title: "Ley aplicable",
            body: [
              "Estos Términos de servicio se rigen e interpretan de acuerdo con las leyes de EE. UU. Te sometes irrevocablemente a la jurisdicción exclusiva de los tribunales de ese Estado o localidad.",
            ],
          },
        ],
      }}
    />
  );
}
