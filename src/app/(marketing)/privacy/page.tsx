import type { Metadata } from "next";
import { siteConfig } from "@/config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { LegalContent, type LegalSection } from "@/components/shared/legal-content";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${siteConfig.companyName} collects and uses your information.`,
  path: "/privacy",
  noIndex: false,
});

// NOTE: Template copy. Have your own policy reviewed by counsel before launch.
const sections: LegalSection[] = [
  {
    heading: "Information we collect",
    body: [
      `When you contact us or request a quote through this website, we collect the information you provide — typically your name, email address, phone number, vehicle details, and the contents of your message.`,
      "We also collect basic, anonymized analytics about how visitors use the site to help us improve it.",
    ],
  },
  {
    heading: "How we use your information",
    body: [
      "We use your information solely to respond to your enquiry, prepare quotes, schedule and deliver services, and keep records of our communication with you.",
      "We do not sell your personal information to third parties.",
    ],
  },
  {
    heading: "How we store your information",
    body: [
      `Contact and quote submissions are stored securely in our customer management system. Access is limited to team members who need it to serve you.`,
    ],
  },
  {
    heading: "Cookies",
    body: [
      "This website uses only the cookies necessary to function and, where enabled, privacy-respecting analytics. You can control cookies through your browser settings.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      `You may request a copy of the information we hold about you, ask us to correct it, or ask us to delete it. To make a request, email ${siteConfig.email}.`,
    ],
  },
  {
    heading: "Contact us",
    body: [
      `Questions about this policy can be directed to ${siteConfig.email} or ${siteConfig.phone}.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="Privacy Policy"
        description={`Last updated ${new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
      />
      <section className="section">
        <div className="container max-w-3xl">
          <LegalContent sections={sections} />
        </div>
      </section>
    </>
  );
}
