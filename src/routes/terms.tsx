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
    />
  );
}
