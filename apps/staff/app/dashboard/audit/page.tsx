import { ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { listRecentAuditLogs } from "@/services/audit-service";

function formatAction(action: string) {
  return action.replace(/[._]/g, " ");
}

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AuditLogPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = user.employee?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <ShieldAlert className="h-8 w-8 text-slate-300" aria-hidden="true" />
        <p className="mt-3 text-sm text-slate-500">Only admins can view the audit log.</p>
      </div>
    );
  }

  const entries = await listRecentAuditLogs(user.id, 50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Audit Log</h1>
        <p className="mt-1 text-sm text-slate-500">Most recent {entries.length} events.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-4 py-3">Time</th>
                <th scope="col" className="px-4 py-3">Action</th>
                <th scope="col" className="px-4 py-3">Entity</th>
                <th scope="col" className="px-4 py-3">Employee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                    {formatTimestamp(entry.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium capitalize text-slate-900">
                    {formatAction(entry.action)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{entry.entityType}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {entry.employee ? `${entry.employee.firstName} ${entry.employee.lastName}` : "—"}
                  </td>
                </tr>
              ))}

              {entries.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                    No activity yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
