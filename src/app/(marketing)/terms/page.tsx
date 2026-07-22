import type { Metadata } from "next";
import { siteConfig } from "@/config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { LegalContent, type LegalSection } from "@/components/shared/legal-content";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: `The terms that govern the use of ${siteConfig.companyName}'s services and website.`,
  path: "/terms",
});

// NOTE: Template copy. Have your own terms reviewed by counsel before launch.
const sections: LegalSection[] = [
  {
    heading: "Agreement",
    body: [
      `By booking a service with ${siteConfig.legalName} ("we", "us"), you agree to these terms. Please read them carefully.`,
    ],
  },
  {
    heading: "Quotes and pricing",
    body: [
      "Quotes are estimates based on the information you provide. Final pricing may vary with the actual size, condition, and requirements of the vehicle. We'll always confirm any change before proceeding.",
    ],
  },
  {
    heading: "Bookings and cancellations",
    body: [
      "Appointments are held once confirmed. We ask for reasonable notice if you need to reschedule. Deposits taken for larger jobs are refundable subject to the notice given.",
    ],
  },
  {
    heading: "Our work",
    body: [
      "We take great care with every vehicle. Some pre-existing defects — deep scratches, dents, or damage beyond the scope of the booked service — may not be fully correctable, and we'll advise you where that's the case.",
    ],
  },
  {
    heading: "Liability",
    body: [
      "We are insured and treat your property with care. To the extent permitted by law, our liability is limited to the value of the service provided. Please remove valuables before your appointment.",
    ],
  },
  {
    heading: "Contact",
    body: [
      `Questions about these terms can be directed to ${siteConfig.email} or ${siteConfig.phone}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        title="Terms of Service"
        description={`Last updated ${new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]}
      />
      <section className="section">
        <div className="container max-w-3xl">
          <LegalContent sections={sections} />
        </div>
      </section>
    </>
  );
}
