import { CheckCircle2, PauseCircle, XCircle, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmployeeRole, EmploymentStatus } from "@prisma/client";

const STATUS_CONFIG: Record<EmploymentStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  ACTIVE: { label: "Active", className: "bg-green-50 text-green-700 ring-green-600/20", Icon: CheckCircle2 },
  SUSPENDED: { label: "Suspended", className: "bg-amber-50 text-amber-700 ring-amber-600/20", Icon: PauseCircle },
  INACTIVE: { label: "Former employee", className: "bg-slate-100 text-slate-600 ring-slate-500/20", Icon: XCircle },
};

export function EmploymentStatusBadge({ status }: { status: EmploymentStatus }) {
  const { label, className, Icon } = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

const ROLE_CONFIG: Record<EmployeeRole, { label: string; className: string; Icon: typeof ShieldCheck }> = {
  ADMIN: { label: "Admin", className: "bg-bb-blue/10 text-bb-blue ring-bb-blue/20", Icon: ShieldCheck },
  STAFF: { label: "Staff", className: "bg-slate-100 text-slate-600 ring-slate-500/20", Icon: User },
};

export function RoleBadge({ role }: { role: EmployeeRole }) {
  const { label, className, Icon } = ROLE_CONFIG[role];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
