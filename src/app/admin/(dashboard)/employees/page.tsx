import { getEmployees } from "@/services/employees.service";
import { EmployeesManager } from "@/components/admin/employees-manager";

export default async function EmployeesPage() {
  const employees = await getEmployees();
  return <EmployeesManager initialEmployees={employees} />;
}
