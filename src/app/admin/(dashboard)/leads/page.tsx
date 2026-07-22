import {
  getLeads,
  getLeadNotesByLead,
  getCallLogsByLead,
  getFollowUpsByLead,
} from "@/services/leads.service";
import { getAssignableEmployees } from "@/services/employees.service";
import { LeadsTable } from "@/components/admin/leads-table";

export default async function LeadsPage() {
  const [leads, employees, notesByLead, callsByLead, followUpsByLead] =
    await Promise.all([
      // Include archived so the "Archived" view is populated client-side.
      getLeads({ includeArchived: true }),
      getAssignableEmployees(),
      getLeadNotesByLead(),
      getCallLogsByLead(),
      getFollowUpsByLead(),
    ]);

  return (
    <LeadsTable
      initialLeads={leads}
      employees={employees}
      notesByLead={notesByLead}
      callsByLead={callsByLead}
      followUpsByLead={followUpsByLead}
    />
  );
}
