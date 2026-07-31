import { randomUUID } from "node:crypto";
import type { EmploymentStatus, EmploymentType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { withAudit } from "../lib/audit";
import { requireRole } from "../lib/auth/rbac";

type CreateEmployeeInput = {
  userId: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  email: string;
  phone?: string | null;
  departmentId?: string | null;
  jobTitle?: string | null;
  employmentType?: EmploymentType | null;
  bloodGroup?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
};

// Staff number allocation via a Postgres native sequence — atomic, no read-then-
// increment race (see design doc Success Criteria and the schema.prisma comment
// on staff_number_seq). A rolled-back employee insert burns that number
// permanently; accepted as normal, same as any DB sequence (eng review decision).
async function nextStaffNumber(tx: Prisma.TransactionClient): Promise<string> {
  const [{ nextval }] = await tx.$queryRaw<{ nextval: bigint }[]>`
    SELECT nextval('staff_number_seq') AS nextval;
  `;
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  const padded = nextval.toString().padStart(4, "0");
  return `BB-${yearSuffix}${padded}`;
}

export async function createEmployee(actorUserId: string, input: CreateEmployeeInput) {
  await requireRole(actorUserId, "ADMIN");

  return withAudit({
    actorId: actorUserId,
    action: "employee.create",
    entityType: "Employee",
    mutate: async (tx) => {
      const staffNumber = await nextStaffNumber(tx);
      return tx.employee.create({
        data: {
          userId: input.userId,
          staffNumber,
          firstName: input.firstName,
          lastName: input.lastName,
          middleName: input.middleName,
          email: input.email,
          phone: input.phone,
          departmentId: input.departmentId,
          jobTitle: input.jobTitle,
          employmentType: input.employmentType,
          bloodGroup: input.bloodGroup,
          emergencyContactName: input.emergencyContactName,
          emergencyContactPhone: input.emergencyContactPhone,
          createdById: actorUserId,
          verificationToken: randomUUID(),
        },
      });
    },
  });
}

type UpdateEmployeeInput = Partial<
  Omit<CreateEmployeeInput, "userId"> & { employmentStatus: EmploymentStatus }
>;

export async function updateEmployee(actorUserId: string, employeeId: string, input: UpdateEmployeeInput) {
  await requireRole(actorUserId, "ADMIN");

  const before = await prisma.employee.findUniqueOrThrow({ where: { id: employeeId } });

  return withAudit({
    actorId: actorUserId,
    action: "employee.update",
    entityType: "Employee",
    entityId: employeeId,
    employeeId,
    diff: { before, after: input } as unknown as Prisma.InputJsonValue,
    mutate: (tx) =>
      tx.employee.update({
        where: { id: employeeId },
        data: input,
      }),
  });
}

export async function suspendEmployee(actorUserId: string, employeeId: string) {
  return setEmploymentStatus(actorUserId, employeeId, "SUSPENDED", "employee.suspend");
}

export async function deactivateEmployee(actorUserId: string, employeeId: string) {
  return setEmploymentStatus(actorUserId, employeeId, "INACTIVE", "employee.deactivate");
}

async function setEmploymentStatus(
  actorUserId: string,
  employeeId: string,
  employmentStatus: EmploymentStatus,
  action: string,
) {
  await requireRole(actorUserId, "ADMIN");

  return withAudit({
    actorId: actorUserId,
    action,
    entityType: "Employee",
    entityId: employeeId,
    employeeId,
    mutate: (tx) => tx.employee.update({ where: { id: employeeId }, data: { employmentStatus } }),
  });
}

// Soft delete — never a hard delete, per design doc (audit trail must survive).
export async function softDeleteEmployee(actorUserId: string, employeeId: string) {
  await requireRole(actorUserId, "ADMIN");

  return withAudit({
    actorId: actorUserId,
    action: "employee.delete",
    entityType: "Employee",
    entityId: employeeId,
    employeeId,
    mutate: (tx) =>
      tx.employee.update({
        where: { id: employeeId },
        data: { deletedAt: new Date(), employmentStatus: "INACTIVE" },
      }),
  });
}

// Old token is invalidated immediately on regeneration — durable-but-revocable,
// not literally permanent (design doc Success Criteria wording fix).
export async function regenerateQRToken(actorUserId: string, employeeId: string) {
  await requireRole(actorUserId, "ADMIN");

  return withAudit({
    actorId: actorUserId,
    action: "employee.qr_regenerate",
    entityType: "Employee",
    entityId: employeeId,
    employeeId,
    mutate: (tx) =>
      tx.employee.update({
        where: { id: employeeId },
        data: { verificationToken: randomUUID() },
      }),
  });
}

export async function getEmployeeStats(actorUserId: string) {
  await requireRole(actorUserId, "STAFF");

  const [total, active, suspended, departments] = await Promise.all([
    prisma.employee.count({ where: { deletedAt: null } }),
    prisma.employee.count({ where: { deletedAt: null, employmentStatus: "ACTIVE" } }),
    prisma.employee.count({ where: { deletedAt: null, employmentStatus: "SUSPENDED" } }),
    prisma.department.count(),
  ]);

  return { total, active, suspended, departments };
}

type ListEmployeesParams = {
  page?: number;
  pageSize?: number;
  departmentId?: string;
  employmentStatus?: EmploymentStatus;
  search?: string;
};

// Explicit `select` (not `include`) + pagination from day one — see design doc
// Finding 6 / performance review. Never fetches role/permission trees or PII fields
// (blood group, emergency contact) for a list view.
export async function listEmployees(actorUserId: string, params: ListEmployeesParams = {}) {
  await requireRole(actorUserId, "STAFF");

  const page = params.page ?? 1;
  const pageSize = Math.min(params.pageSize ?? 25, 100);

  const where: Prisma.EmployeeWhereInput = {
    deletedAt: null,
    departmentId: params.departmentId,
    employmentStatus: params.employmentStatus,
    ...(params.search
      ? {
          OR: [
            { firstName: { contains: params.search, mode: "insensitive" } },
            { lastName: { contains: params.search, mode: "insensitive" } },
            { staffNumber: { contains: params.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      select: {
        id: true,
        staffNumber: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        employmentStatus: true,
        department: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.employee.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

// Full record, incl. verificationToken (for the admin QR panel) — admin-only,
// unlike listEmployees' hard-limited select for the table view.
export async function getEmployeeById(actorUserId: string, employeeId: string) {
  await requireRole(actorUserId, "ADMIN");

  return prisma.employee.findUnique({
    where: { id: employeeId, deletedAt: null },
    select: {
      id: true,
      staffNumber: true,
      firstName: true,
      lastName: true,
      middleName: true,
      email: true,
      phone: true,
      departmentId: true,
      department: { select: { id: true, name: true } },
      jobTitle: true,
      employmentType: true,
      profilePhotoUrl: true,
      bloodGroup: true,
      emergencyContactName: true,
      emergencyContactPhone: true,
      employmentStatus: true,
      dateJoined: true,
      role: true,
      verificationToken: true,
    },
  });
}

// Public allowlist only — never a generic employee serializer. Called by the
// unauthenticated /verify/[token] route. See design doc Premise 5.
export async function getPublicVerificationData(token: string) {
  const employee = await prisma.employee.findUnique({
    where: { verificationToken: token },
    select: {
      firstName: true,
      lastName: true,
      jobTitle: true,
      employmentStatus: true,
      dateJoined: true,
      profilePhotoUrl: true,
      department: { select: { name: true } },
    },
  });

  if (!employee) {
    return { status: "INVALID_EMPLOYEE" as const };
  }
  if (employee.employmentStatus !== "ACTIVE") {
    return { status: "FORMER_EMPLOYEE" as const };
  }

  return {
    status: "VALID" as const,
    fullName: `${employee.firstName} ${employee.lastName}`,
    jobTitle: employee.jobTitle,
    department: employee.department?.name ?? null,
    dateJoined: employee.dateJoined,
    profilePhotoUrl: employee.profilePhotoUrl,
  };
}
