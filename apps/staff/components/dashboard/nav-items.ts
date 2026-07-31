import { LayoutDashboard, Users, Building2, ScrollText } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/dashboard/staff", label: "Staff", Icon: Users, exact: false },
  { href: "/dashboard/departments", label: "Departments", Icon: Building2, exact: false },
  { href: "/dashboard/audit", label: "Audit Log", Icon: ScrollText, exact: false },
] as const;
