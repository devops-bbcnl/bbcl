import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { listEmployees } from "@/services/employee-service";
import { EmploymentStatusBadge } from "@/components/ui/status-badge";

const PAGE_SIZE = 25;

type SearchParams = Promise<{ q?: string; page?: string }>;

export default async function StaffPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const user = await getCurrentUser();
  if (!user) return null;

  const { items, total, pageSize } = await listEmployees(user.id, { page, pageSize: PAGE_SIZE, search: q });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff</h1>
          <p className="mt-1 text-sm text-slate-500">{total} employee{total === 1 ? "" : "s"}</p>
        </div>

        <form className="flex items-center" action="/dashboard/staff" method="get">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by name or staff number"
              className="w-72 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-bb-blue focus:outline-none focus:ring-1 focus:ring-bb-blue"
            />
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-4 py-3">Staff #</th>
                <th scope="col" className="px-4 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Job title</th>
                <th scope="col" className="px-4 py-3">Department</th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                    {employee.staffNumber}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium">
                    <Link
                      href={`/dashboard/staff/${employee.id}`}
                      className="text-slate-900 hover:text-bb-blue hover:underline"
                    >
                      {employee.firstName} {employee.lastName}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{employee.jobTitle ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{employee.department?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <EmploymentStatusBadge status={employee.employmentStatus} />
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                    {q ? `No staff match "${q}".` : "No staff yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <PageLink page={page - 1} q={q} disabled={page <= 1}>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </PageLink>
              <PageLink page={page + 1} q={q} disabled={page >= totalPages}>
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </PageLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PageLink({
  page,
  q,
  disabled,
  children,
}: {
  page: number;
  q?: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="flex cursor-not-allowed items-center gap-1 rounded-lg px-3 py-1.5 text-slate-300">
        {children}
      </span>
    );
  }

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("page", String(page));

  return (
    <Link
      href={`/dashboard/staff?${params.toString()}`}
      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100"
    >
      {children}
    </Link>
  );
}
