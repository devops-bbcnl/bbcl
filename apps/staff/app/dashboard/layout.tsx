import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.employee || user.employee.employmentStatus !== "ACTIVE") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-50 p-6">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold text-slate-900">Access pending</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your account isn&apos;t linked to an active employee record yet. Contact an admin to get access.
          </p>
        </div>
      </main>
    );
  }

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        roleLabel: user.employee.role === "ADMIN" ? "Admin" : "Staff",
      }}
    >
      {children}
    </DashboardShell>
  );
}
