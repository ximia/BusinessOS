import type { OrgPlan } from "@/types/database";

/**
 * Tenant resolution helpers (Multi-tenancy). Pure and framework-agnostic; the
 * server service (`tenant.service.ts`) uses these to map an incoming host to an
 * organization. Two mechanisms are supported:
 *   - subdomain:      acme.example.com          → slug "acme"
 *   - custom domain:  www.acme-detailing.com    → matched to org.custom_domain
 */

/** Root domains that carry tenant subdomains. Customize per deployment. */
export const TENANT_ROOT_DOMAINS = ["localhost", "vercel.app"];

/** Normalise a host header to a bare hostname (strip port, lowercase). */
export function normalizeHost(host: string | null | undefined): string {
  return (host ?? "").split(":")[0]!.trim().toLowerCase();
}

/**
 * Extract a tenant slug from a subdomain, or null when the host is an apex /
 * www / unknown domain (those resolve by custom-domain match instead).
 */
export function slugFromHost(host: string | null | undefined): string | null {
  const h = normalizeHost(host);
  if (!h || h === "localhost") return null;
  const parts = h.split(".");
  if (parts.length < 3) return null; // apex or bare host → no subdomain
  const sub = parts[0]!;
  if (sub === "www") return null;
  return sub;
}

export const PLAN_LABELS: Record<OrgPlan, string> = {
  starter: "Starter",
  pro: "Pro",
  agency: "Agency",
};
