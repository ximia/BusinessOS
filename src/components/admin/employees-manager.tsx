"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import type { Employee, UserRole } from "@/types/database";
import { initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  staff: "Staff",
  readonly: "Read-only",
};

const roleDescriptions: Record<UserRole, string> = {
  admin: "Full access, including team & settings",
  staff: "Manage leads, quotes, content",
  readonly: "View-only access",
};

export function EmployeesManager({
  initialEmployees,
}: {
  initialEmployees: Employee[];
}) {
  const { toast } = useToast();
  const [employees, setEmployees] = React.useState(initialEmployees);

  const setRole = (id: string, role: UserRole) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, role } : e)));
    toast({ title: "Role updated", description: `Now ${roleLabels[role]}.` });
  };

  const toggleActive = (id: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, active: !e.active } : e))
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {employees.filter((e) => e.active).length} active team members
        </p>
        <Button
          size="sm"
          onClick={() =>
            toast({
              title: "Invite flow ready to wire up",
              description: "Connect to Supabase Auth invitations to send invites.",
            })
          }
        >
          <UserPlus className="h-4 w-4" />
          Invite member
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden sm:table-cell">Access</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {emp.avatar_url && (
                        <AvatarImage src={emp.avatar_url} alt={emp.full_name} />
                      )}
                      <AvatarFallback>{initials(emp.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{emp.full_name}</div>
                      <div className="text-xs text-muted-foreground">{emp.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={emp.role}
                    onValueChange={(v) => setRole(emp.id, v as UserRole)}
                  >
                    <SelectTrigger className="h-9 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                        <SelectItem key={r} value={r}>
                          {roleLabels[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                  {roleDescriptions[emp.role]}
                </TableCell>
                <TableCell className="text-right">
                  <button onClick={() => toggleActive(emp.id)}>
                    <Badge variant={emp.active ? "success" : "muted"}>
                      {emp.active ? "Active" : "Inactive"}
                    </Badge>
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
