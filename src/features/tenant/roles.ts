import type { UserRole } from "@/types/database";

/**
 * Role capabilities (Multi-tenancy — Priority 11). Pure, client- and
 * server-safe. `admin` runs the workspace, `staff` can do day-to-day work,
 * `readonly` can only view. Enforce with `can(role, capability)` in the UI and
 * mirror it in RLS (see migration 0005) so it holds server-side too.
 */
export type Capability =
  | "read"
  | "write"
  | "manage_members"
  | "manage_settings"
  | "manage_billing";

const MATRIX: Record<UserRole, Capability[]> = {
  admin: ["read", "write", "manage_members", "manage_settings", "manage_billing"],
  staff: ["read", "write"],
  readonly: ["read"],
};

export function can(role: UserRole, capability: Capability): boolean {
  return MATRIX[role].includes(capability);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  staff: "Staff",
  readonly: "Read-only",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full access — settings, billing, and team.",
  staff: "Can manage leads, content, and day-to-day work.",
  readonly: "Can view everything, but can't make changes.",
};
