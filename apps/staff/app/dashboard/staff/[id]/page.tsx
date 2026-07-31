import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getEmployeeById } from "@/services/employee-service";
import { listDepartments } from "@/services/department-service";
import { StaffDetail } from "@/components/dashboard/staff-detail";
import { updateEmployeeAction, regenerateQrAction } from "./actions";

export default async function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = user.employee?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <ShieldAlert className="h-8 w-8 text-slate-300" aria-hidden="true" />
        <p className="mt-3 text-sm text-slate-500">Only admins can view a staff member&apos;s full profile.</p>
      </div>
    );
  }

  const [employee, departments] = await Promise.all([
    getEmployeeById(user.id, id),
    listDepartments(user.id),
  ]);

  if (!employee) {
    notFound();
  }

  // Better Auth's own baseURL already equals this app's public origin, so it
  // doubles as the base for the public verification link encoded in the QR.
  const verifyUrl = `${process.env.BETTER_AUTH_URL}/verify/${employee.verificationToken}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 240 });

  return (
    <StaffDetail
      employee={employee}
      departments={departments}
      qrDataUrl={qrDataUrl}
      verifyUrl={verifyUrl}
      updateAction={updateEmployeeAction}
      regenerateAction={regenerateQrAction}
    />
  );
}
