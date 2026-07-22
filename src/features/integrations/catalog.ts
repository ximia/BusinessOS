/**
 * Integrations (Priority 7) — catalog of supported third-party providers and
 * their config fields. Pure metadata (no React / no server imports) so it is
 * safe in both the admin UI and server actions/services.
 *
 * Each field is marked `secret` when it holds a credential that must never be
 * shown back to the browser. The services layer masks these before returning
 * config, and the save action preserves the stored value when the incoming
 * value is blank or still the mask sentinel.
 */

export const INTEGRATION_PROVIDERS = [
  "google-business",
  "google-analytics",
  "google-tag-manager",
  "stripe",
  "twilio",
  "calendly",
  "zapier",
] as const;

export type IntegrationProviderId = (typeof INTEGRATION_PROVIDERS)[number];

export type IntegrationCategory = "analytics" | "payments" | "communication" | "scheduling" | "automation";

export interface IntegrationField {
  key: string;
  label: string;
  type: "text" | "password" | "url";
  /** Credentials — masked in the UI, never returned raw to the client. */
  secret?: boolean;
  placeholder?: string;
  help?: string;
  required?: boolean;
}

export interface IntegrationProvider {
  id: IntegrationProviderId;
  name: string;
  category: IntegrationCategory;
  description: string;
  /** Icon key resolved to a Lucide icon in the UI. */
  icon: string;
  docsUrl: string;
  fields: IntegrationField[];
}

/** Sentinel returned in place of a stored secret; save() treats it as "unchanged". */
export const SECRET_MASK = "__stored__";

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  analytics: "Analytics",
  payments: "Payments",
  communication: "Communication",
  scheduling: "Scheduling",
  automation: "Automation",
};

export const INTEGRATION_CATALOG: IntegrationProvider[] = [
  {
    id: "google-analytics",
    name: "Google Analytics 4",
    category: "analytics",
    description: "Track site traffic and conversions with GA4.",
    icon: "line-chart",
    docsUrl: "https://support.google.com/analytics/answer/9539598",
    fields: [
      {
        key: "measurementId",
        label: "Measurement ID",
        type: "text",
        placeholder: "G-XXXXXXXXXX",
        help: "Public ID. On the live site, also set NEXT_PUBLIC_GA_ID to render the tag.",
        required: true,
      },
    ],
  },
  {
    id: "google-tag-manager",
    name: "Google Tag Manager",
    category: "analytics",
    description: "Manage all your marketing tags from one container.",
    icon: "tags",
    docsUrl: "https://support.google.com/tagmanager",
    fields: [
      {
        key: "containerId",
        label: "Container ID",
        type: "text",
        placeholder: "GTM-XXXXXXX",
        help: "Public ID. On the live site, also set NEXT_PUBLIC_GTM_ID to render the tag.",
        required: true,
      },
    ],
  },
  {
    id: "google-business",
    name: "Google Business Profile",
    category: "analytics",
    description: "Sync reviews and business info from your Google listing.",
    icon: "map-pin",
    docsUrl: "https://developers.google.com/my-business",
    fields: [
      { key: "placeId", label: "Place ID", type: "text", placeholder: "ChIJ…", required: true },
      { key: "apiKey", label: "API key", type: "password", secret: true },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "payments",
    description: "Accept deposits and invoice payments online.",
    icon: "credit-card",
    docsUrl: "https://stripe.com/docs/keys",
    fields: [
      {
        key: "publishableKey",
        label: "Publishable key",
        type: "text",
        placeholder: "pk_live_…",
        help: "Safe to expose in the browser.",
        required: true,
      },
      { key: "secretKey", label: "Secret key", type: "password", secret: true, placeholder: "sk_live_…", required: true },
      { key: "webhookSecret", label: "Webhook signing secret", type: "password", secret: true, placeholder: "whsec_…" },
    ],
  },
  {
    id: "twilio",
    name: "Twilio",
    category: "communication",
    description: "Send SMS reminders and lead notifications.",
    icon: "message-square",
    docsUrl: "https://www.twilio.com/docs",
    fields: [
      { key: "accountSid", label: "Account SID", type: "text", placeholder: "AC…", required: true },
      { key: "authToken", label: "Auth token", type: "password", secret: true, required: true },
      { key: "fromNumber", label: "From number", type: "text", placeholder: "+15551234567" },
    ],
  },
  {
    id: "calendly",
    name: "Calendly",
    category: "scheduling",
    description: "Let customers book appointments from your site.",
    icon: "calendar",
    docsUrl: "https://developer.calendly.com",
    fields: [
      {
        key: "schedulingUrl",
        label: "Scheduling URL",
        type: "url",
        placeholder: "https://calendly.com/your-team/consult",
        required: true,
      },
      { key: "apiToken", label: "API token", type: "password", secret: true },
    ],
  },
  {
    id: "zapier",
    name: "Zapier",
    category: "automation",
    description: "Push new leads into thousands of other apps.",
    icon: "zap",
    docsUrl: "https://zapier.com/apps/webhook/integrations",
    fields: [
      {
        key: "webhookUrl",
        label: "Catch webhook URL",
        type: "url",
        secret: true,
        placeholder: "https://hooks.zapier.com/hooks/catch/…",
        help: "Treated as a secret — it can trigger your Zaps.",
        required: true,
      },
    ],
  },
];

export function getProvider(id: string): IntegrationProvider | undefined {
  return INTEGRATION_CATALOG.find((p) => p.id === id);
}
