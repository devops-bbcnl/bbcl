"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { updateEmployee, regenerateQRToken } from "@/services/employee-service";
import type { EmploymentType } from "@prisma/client";

const EMPLOYMENT_TYPES: EmploymentType[] = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"];

function nullableString(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

export async function updateEmployeeAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const employeeId = String(formData.get("employeeId"));
  const employmentTypeRaw = String(formData.get("employmentType") ?? "");
  const employmentType = EMPLOYMENT_TYPES.includes(employmentTypeRaw as EmploymentType)
    ? (employmentTypeRaw as EmploymentType)
    : null;

  await updateEmployee(user.id, employeeId, {
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    middleName: nullableString(formData, "middleName"),
    email: String(formData.get("email") ?? "").trim(),
    phone: nullableString(formData, "phone"),
    departmentId: nullableString(formData, "departmentId"),
    jobTitle: nullableString(formData, "jobTitle"),
    employmentType,
    bloodGroup: nullableString(formData, "bloodGroup"),
    emergencyContactName: nullableString(formData, "emergencyContactName"),
    emergencyContactPhone: nullableString(formData, "emergencyContactPhone"),
  });

  revalidatePath(`/dashboard/staff/${employeeId}`);
}

export async function regenerateQrAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const employeeId = String(formData.get("employeeId"));
  await regenerateQRToken(user.id, employeeId);
  revalidatePath(`/dashboard/staff/${employeeId}`);
}
