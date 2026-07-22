import { getLeads } from "@/services/leads.service";
import { getAssignableEmployees } from "@/services/employees.service";
import { LeadsTable } from "@/components/admin/leads-table";

export default async function LeadsPage() {
  const [leads, employees] = await Promise.all([
    getLeads(),
    getAssignableEmployees(),
  ]);

  return <LeadsTable initialLeads={leads} employees={employees} />;
}
