import { prisma } from "../lib/prisma";
import { requireRole } from "../lib/auth/rbac";

export async function listRecentAuditLogs(actorUserId: string, limit = 10) {
  await requireRole(actorUserId, "ADMIN");

  return prisma.auditLog.findMany({
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      createdAt: true,
      employee: { select: { firstName: true, lastName: true, staffNumber: true } },
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 100),
  });
}
