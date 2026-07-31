"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  X,
  Save,
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  Building2,
  Briefcase,
  Droplet,
  Contact,
  CalendarDays,
} from "lucide-react";
import { EmploymentStatusBadge, RoleBadge } from "@/components/ui/status-badge";
import type { Employee, Department, EmploymentType } from "@prisma/client";

type EmployeeDetail = Pick<
  Employee,
  | "id"
  | "staffNumber"
  | "firstName"
  | "lastName"
  | "middleName"
  | "email"
  | "phone"
  | "departmentId"
  | "jobTitle"
  | "employmentType"
  | "profilePhotoUrl"
  | "bloodGroup"
  | "emergencyContactName"
  | "emergencyContactPhone"
  | "employmentStatus"
  | "dateJoined"
  | "role"
> & { department: { id: string; name: string } | null };

type StaffDetailProps = {
  employee: EmployeeDetail;
  departments: Pick<Department, "id" | "name">[];
  qrDataUrl: string;
  verifyUrl: string;
  updateAction: (formData: FormData) => Promise<void>;
  regenerateAction: (formData: FormData) => Promise<void>;
};

const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERN: "Intern",
};

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function StaffDetail({ employee, departments, qrDataUrl, verifyUrl, updateAction, regenerateAction }: StaffDetailProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [pending, startTransition] = useTransition();
  const [regenerating, startRegenerate] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateAction(formData);
      setMode("view");
    });
  }

  function handleRegenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirm("Regenerate this staff member's QR code? The old QR code will stop working immediately.")) {
      return;
    }
    const formData = new FormData(e.currentTarget);
    startRegenerate(async () => {
      await regenerateAction(formData);
    });
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/staff"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Staff
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {employee.profilePhotoUrl ? (
            <Image
              src={employee.profilePhotoUrl}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-bb-blue/10 text-lg font-semibold text-bb-blue">
              {initials(employee.firstName, employee.lastName)}
            </span>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="font-mono text-xs text-slate-500">{employee.staffNumber}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <EmploymentStatusBadge status={employee.employmentStatus} />
              <RoleBadge role={employee.role} />
            </div>
          </div>
        </div>

        {mode === "view" && (
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {mode === "view" ? (
            <DetailView employee={employee} />
          ) : (
            <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <input type="hidden" name="employeeId" value={employee.id} />
              <EditForm employee={employee} departments={departments} />

              <div className="mt-6 flex items-center gap-3 border-t border-slate-200 pt-4">
                <button
                  type="submit"
                  disabled={pending}
                  className="flex items-center gap-2 rounded-lg bg-bb-blue px-4 py-2 text-sm font-medium text-white hover:bg-bb-blue/90 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {pending ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("view")}
                  disabled={pending}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Verification QR</h2>
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URI, not an optimizable remote/static asset */}
            <img
              src={qrDataUrl}
              alt={`QR code linking to the public verification page for ${employee.firstName} ${employee.lastName}`}
              width={200}
              height={200}
              className="rounded-lg border border-slate-200"
            />
            <a
              href={verifyUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-bb-blue hover:underline"
            >
              Open verification page
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <form onSubmit={handleRegenerate} className="w-full">
              <input type="hidden" name="employeeId" value={employee.id} />
              <button
                type="submit"
                disabled={regenerating}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                {regenerating ? "Regenerating..." : "Regenerate QR code"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ Icon, label, value }: { Icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="truncate text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function DetailView({ employee }: { employee: EmployeeDetail }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-2 text-sm font-semibold text-slate-900">Details</h2>
      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0">
        <InfoRow Icon={Briefcase} label="Job title" value={employee.jobTitle ?? "—"} />
        <InfoRow Icon={Building2} label="Department" value={employee.department?.name ?? "—"} />
        <InfoRow
          Icon={Briefcase}
          label="Employment type"
          value={employee.employmentType ? EMPLOYMENT_TYPE_LABELS[employee.employmentType] : "—"}
        />
        <InfoRow Icon={CalendarDays} label="Date joined" value={new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(employee.dateJoined)} />
        <InfoRow Icon={Mail} label="Email" value={employee.email} />
        <InfoRow Icon={Phone} label="Phone" value={employee.phone ?? "—"} />
        <InfoRow Icon={Droplet} label="Blood group" value={employee.bloodGroup ?? "—"} />
        <InfoRow
          Icon={Contact}
          label="Emergency contact"
          value={
            employee.emergencyContactName || employee.emergencyContactPhone
              ? `${employee.emergencyContactName ?? "—"} ${employee.emergencyContactPhone ? `(${employee.emergencyContactPhone})` : ""}`.trim()
              : "—"
          }
        />
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-xs font-medium text-slate-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-bb-blue focus:outline-none focus:ring-1 focus:ring-bb-blue"
      />
    </div>
  );
}

function EditForm({
  employee,
  departments,
}: {
  employee: EmployeeDetail;
  departments: Pick<Department, "id" | "name">[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="First name" name="firstName" defaultValue={employee.firstName} required />
      <Field label="Last name" name="lastName" defaultValue={employee.lastName} required />
      <Field label="Middle name" name="middleName" defaultValue={employee.middleName} />
      <Field label="Email" name="email" type="email" defaultValue={employee.email} required />
      <Field label="Phone" name="phone" type="tel" defaultValue={employee.phone} />
      <Field label="Job title" name="jobTitle" defaultValue={employee.jobTitle} />

      <div>
        <label htmlFor="departmentId" className="mb-1 block text-xs font-medium text-slate-700">
          Department
        </label>
        <select
          id="departmentId"
          name="departmentId"
          defaultValue={employee.departmentId ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-bb-blue focus:outline-none focus:ring-1 focus:ring-bb-blue"
        >
          <option value="">—</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="employmentType" className="mb-1 block text-xs font-medium text-slate-700">
          Employment type
        </label>
        <select
          id="employmentType"
          name="employmentType"
          defaultValue={employee.employmentType ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-bb-blue focus:outline-none focus:ring-1 focus:ring-bb-blue"
        >
          <option value="">—</option>
          {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <Field label="Blood group" name="bloodGroup" defaultValue={employee.bloodGroup} />
      <div />
      <Field label="Emergency contact name" name="emergencyContactName" defaultValue={employee.emergencyContactName} />
      <Field label="Emergency contact phone" name="emergencyContactPhone" type="tel" defaultValue={employee.emergencyContactPhone} />
    </div>
  );
}
