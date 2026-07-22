"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Globe,
  Users,
  Shield,
  Palette,
  Settings2,
  Check,
  Lock,
  UserPlus,
} from "lucide-react";
import type { Organization, Employee, UserRole } from "@/types/database";
import { can, ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/features/tenant/roles";
import { PLAN_LABELS } from "@/features/tenant/tenant";
import { updateOrganization, setMemberRole } from "@/features/tenant/tenant.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { initials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const ROLES: UserRole[] = ["admin", "staff", "readonly"];

export function OrganizationManager({
  org,
  organizations,
  members,
  role,
}: {
  org: Organization;
  organizations: Organization[];
  members: Employee[];
  role: UserRole;
}) {
  const { toast } = useToast();
  const canSettings = can(role, "manage_settings");
  const canMembers = can(role, "manage_members");

  const [name, setName] = React.useState(org.name);
  const [domain, setDomain] = React.useState(org.custom_domain ?? "");
  const [saving, setSaving] = React.useState(false);
  const [roles, setRoles] = React.useState<Record<string, UserRole>>(
    Object.fromEntries(members.map((m) => [m.id, m.role]))
  );

  const dirty = name !== org.name || domain !== (org.custom_domain ?? "");

  const saveOrg = async () => {
    setSaving(true);
    const res = await updateOrganization({ name, custom_domain: domain });
    setSaving(false);
    toast({
      variant: res.ok ? "success" : "destructive",
      title: res.ok ? "Saved" : "Couldn't save",
      description: res.message,
    });
  };

  const changeRole = async (member: Employee, next: UserRole) => {
    const prev = roles[member.id]!;
    setRoles((r) => ({ ...r, [member.id]: next }));
    const res = await setMemberRole(member.id, next);
    if (!res.ok) {
      setRoles((r) => ({ ...r, [member.id]: prev }));
      toast({ variant: "destructive", title: "Couldn't update role", description: res.message });
    } else {
      toast({ title: "Role updated", description: `${member.full_name} is now ${ROLE_LABELS[next]}.` });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Your organization, custom domain, and team roles.
        </p>
      </div>

      {role === "readonly" && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          You have read-only access. Ask an admin to make changes.
        </div>
      )}

      {/* Identity */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Organization</h2>
          <Badge variant="default" className="ml-auto">
            {PLAN_LABELS[org.plan]} plan
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              value={name}
              disabled={!canSettings}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="org-slug">Subdomain</Label>
            <div className="mt-1.5 flex items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
              <span className="py-2 font-medium text-foreground">{org.slug}</span>
              <span className="py-2">.example.com</span>
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="org-domain" className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> Custom domain
            </Label>
            <Input
              id="org-domain"
              value={domain}
              disabled={!canSettings}
              placeholder="www.yourbusiness.com"
              onChange={(e) => setDomain(e.target.value)}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Point your domain&apos;s DNS here, then it resolves to this workspace.
            </p>
          </div>
        </div>

        {canSettings && dirty && (
          <div className="mt-5 flex justify-end">
            <Button size="sm" onClick={saveOrg} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        )}

        {/* White-label pointers */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
          <span className="text-xs text-muted-foreground">White-label:</span>
          <Link href="/admin/settings" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <Settings2 className="h-3.5 w-3.5" /> Business details
          </Link>
          <Link href="/admin/theme" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <Palette className="h-3.5 w-3.5" /> Brand & theme
          </Link>
        </div>
      </section>

      {/* Members */}
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Team & roles</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!canMembers}
            onClick={() =>
              toast({
                title: "Invite ready to wire up",
                description: "Connect Supabase Auth invitations to send invites.",
              })
            }
          >
            <UserPlus className="h-4 w-4" />
            Invite
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="text-right">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {member.avatar_url && (
                        <AvatarImage src={member.avatar_url} alt={member.full_name} />
                      )}
                      <AvatarFallback>{initials(member.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.full_name}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {member.active ? (
                    <Badge variant="success" className="gap-1">
                      <Check className="h-3 w-3" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="muted">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {canMembers ? (
                    <Select
                      value={roles[member.id]}
                      onValueChange={(v) => changeRole(member, v as UserRole)}
                    >
                      <SelectTrigger className="ml-auto w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline">{ROLE_LABELS[roles[member.id]!]}</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="grid gap-2 border-t border-border p-4 text-xs text-muted-foreground sm:grid-cols-3">
          {ROLES.map((r) => (
            <div key={r} className="flex items-start gap-1.5">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                <span className="font-medium text-foreground">{ROLE_LABELS[r]}</span> —{" "}
                {ROLE_DESCRIPTIONS[r]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Agency: other organizations */}
      {organizations.length > 1 && (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Organizations</h2>
            <Badge variant="muted" className="ml-auto">
              {organizations.length} workspaces
            </Badge>
          </div>
          <ul className="divide-y divide-border">
            {organizations.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">
                    {o.name}
                    {o.id === org.id && (
                      <Badge variant="default" className="ml-2 text-[10px]">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {o.custom_domain ?? `${o.slug}.example.com`}
                  </div>
                </div>
                <Badge variant="outline">{PLAN_LABELS[o.plan]}</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Each workspace has isolated data (scoped by <code>org_id</code>), its own
            domain, and its own team. See migration <code>0005_multi_tenancy.sql</code>.
          </p>
        </section>
      )}
    </div>
  );
}
