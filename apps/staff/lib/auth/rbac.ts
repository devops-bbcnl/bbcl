import type { EmployeeRole, EmploymentStatus } from "@prisma/client";
import { prisma } from "../prisma";

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

type AuthorizedEmployee = {
  id: string;
  role: EmployeeRole;
  employmentStatus: EmploymentStatus;
};

// Single service-layer permission check (no separate middleware enforcement layer —
// deferred per the eng review's outside-voice challenge: for an internal tool with
// no untrusted external caller, one well-tested check point is enough; a second
// layer to keep in sync buys little for the added maintenance surface).
//
// Called at the top of every service mutation. Role is read live from the DB on
// every call — never cached on the session — so a role change or offboarding takes
// effect on the very next request, not just the next login.
export async function requireRole(
  userId: string,
  minimumRole: EmployeeRole,
): Promise<AuthorizedEmployee> {
  const employee = await prisma.employee.findUnique({
    where: { userId },
    select: { id: true, role: true, employmentStatus: true },
  });

  if (!employee) {
    throw new AuthorizationError("No employee record for this user");
  }
  if (employee.employmentStatus !== "ACTIVE") {
    throw new AuthorizationError("Employee is not active");
  }
  if (minimumRole === "ADMIN" && employee.role !== "ADMIN") {
    throw new AuthorizationError("Admin role required");
  }

  return employee;
}
