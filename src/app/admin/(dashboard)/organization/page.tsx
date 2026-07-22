import {
  getActiveOrg,
  getOrganizations,
  getActiveMemberRole,
} from "@/features/tenant/tenant.service";
import { getEmployees } from "@/services/employees.service";
import { OrganizationManager } from "@/components/admin/organization-manager";

export default async function OrganizationPage() {
  const [org, organizations, members, role] = await Promise.all([
    getActiveOrg(),
    getOrganizations(),
    getEmployees(),
    getActiveMemberRole(),
  ]);

  return (
    <OrganizationManager
      org={org}
      organizations={organizations}
      members={members}
      role={role}
    />
  );
}
