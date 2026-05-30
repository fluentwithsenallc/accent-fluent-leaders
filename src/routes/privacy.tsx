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
    />
  );
}
