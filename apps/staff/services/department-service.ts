import { prisma } from "../lib/prisma";
import { withAudit } from "../lib/audit";
import { requireRole } from "../lib/auth/rbac";

export async function listDepartments(actorUserId: string) {
  await requireRole(actorUserId, "STAFF");
  return prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function createDepartment(actorUserId: string, name: string) {
  await requireRole(actorUserId, "ADMIN");
  return withAudit({
    actorId: actorUserId,
    action: "department.create",
    entityType: "Department",
    mutate: (tx) => tx.department.create({ data: { name } }),
  });
}

export async function renameDepartment(actorUserId: string, departmentId: string, name: string) {
  await requireRole(actorUserId, "ADMIN");
  return withAudit({
    actorId: actorUserId,
    action: "department.rename",
    entityType: "Department",
    entityId: departmentId,
    mutate: (tx) => tx.department.update({ where: { id: departmentId }, data: { name } }),
  });
}
