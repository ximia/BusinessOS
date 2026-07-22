import {
  LayoutDashboard,
  Users,
  FileText,
  Star,
  Image as ImageIcon,
  Newspaper,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Optional keyboard shortcut hint shown in the command palette. */
  shortcut?: string;
}

export const adminNav: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, shortcut: "D" },
  { label: "Leads", href: "/admin/leads", icon: Users, shortcut: "L" },
  { label: "Quotes", href: "/admin/quotes", icon: FileText, shortcut: "Q" },
  { label: "Reviews", href: "/admin/reviews", icon: Star, shortcut: "R" },
  { label: "Gallery", href: "/admin/gallery", icon: ImageIcon, shortcut: "G" },
  { label: "Blog", href: "/admin/blog", icon: Newspaper, shortcut: "B" },
  { label: "Employees", href: "/admin/employees", icon: UserCog, shortcut: "E" },
];
