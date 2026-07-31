import Link from "next/link";
import { Users, UserCheck, PauseCircle, Building2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getEmployeeStats } from "@/services/employee-service";
import { listRecentAuditLogs } from "@/services/audit-service";
import { StatCard } from "@/components/ui/stat-card";

function formatAction(action: string) {
  return action.replace(/[._]/g, " ");
}

function relativeTime(date: Date) {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = user.employee?.role === "ADMIN";
  const stats = await getEmployeeStats(user.id);
  const recentActivity = isAdmin ? await listRecentAuditLogs(user.id, 8) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of staff and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total staff" value={stats.total} Icon={Users} tone="blue" />
        <StatCard label="Active" value={stats.active} Icon={UserCheck} tone="default" />
        <StatCard label="Suspended" value={stats.suspended} Icon={PauseCircle} tone="gold" />
        <StatCard label="Departments" value={stats.departments} Icon={Building2} tone="default" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recent staff</h2>
          <Link href="/dashboard/staff" className="text-sm font-medium text-bb-blue hover:underline">
            View all
          </Link>
        </div>
        <p className="text-sm text-slate-500">
          Full staff list, search, and management lives on the{" "}
          <Link href="/dashboard/staff" className="font-medium text-bb-blue hover:underline">
            Staff
          </Link>{" "}
          page.
        </p>
      </div>

      {isAdmin && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Recent activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentActivity.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-900">
                      {formatAction(entry.action)}
                      {entry.employee ? (
                        <span className="text-slate-500">
                          {" "}
                          — {entry.employee.firstName} {entry.employee.lastName}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{relativeTime(entry.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
