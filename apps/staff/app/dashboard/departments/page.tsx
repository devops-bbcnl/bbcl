import { revalidatePath } from "next/cache";
import { Building2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { listDepartments, createDepartment } from "@/services/department-service";

async function createDepartmentAction(formData: FormData) {
  "use server";

  const user = await getCurrentUser();
  if (!user) return;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await createDepartment(user.id, name);
  revalidatePath("/dashboard/departments");
}

export default async function DepartmentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = user.employee?.role === "ADMIN";
  const departments = await listDepartments(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Departments</h1>
        <p className="mt-1 text-sm text-slate-500">
          {departments.length} department{departments.length === 1 ? "" : "s"}
        </p>
      </div>

      {isAdmin && (
        <form action={createDepartmentAction} className="flex max-w-md gap-2">
          <input
            type="text"
            name="name"
            required
            placeholder="New department name"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-bb-blue focus:outline-none focus:ring-1 focus:ring-bb-blue"
          />
          <button
            type="submit"
            className="rounded-lg bg-bb-blue px-4 py-2 text-sm font-medium text-white hover:bg-bb-blue/90"
          >
            Add
          </button>
        </form>
      )}

      {departments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Building2 className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
          <p className="mt-3 text-sm text-slate-500">No departments yet.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => (
            <li
              key={department.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bb-blue/10 text-bb-blue">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="truncate font-medium text-slate-900">{department.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
