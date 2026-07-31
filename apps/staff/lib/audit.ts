import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

type AuditParams = {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  employeeId?: string | null;
  diff?: Prisma.InputJsonValue;
};

// Data mutations (employee create/update/delete, QR regen) hard-couple to audit
// success — the mutation and its audit row commit or roll back together. A silent
// audit gap is unacceptable for an identity/access-control system (compliance
// requirement, not a nice-to-have). See design doc Finding 5.
export async function withAudit<T>(
  params: AuditParams & { mutate: (tx: Prisma.TransactionClient) => Promise<T> },
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    const result = await params.mutate(tx);
    await tx.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        employeeId: params.employeeId ?? null,
        diff: params.diff,
      },
    });
    return result;
  });
}

// Login/logout audit writes are async/best-effort, deliberately NOT in the same
// transaction as session creation — auth availability must never depend on
// audit-table health (see eng review cross-model tension on audit-coupling).
// A failed write here is caught and logged for out-of-band alerting; it must
// never block or fail the login/logout flow itself.
export function logAuditAsync(params: AuditParams): void {
  prisma.auditLog
    .create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        employeeId: params.employeeId ?? null,
        diff: params.diff,
      },
    })
    .catch((err: unknown) => {
      // eslint-disable-next-line no-console
      console.error(`[audit] async audit write failed for action "${params.action}"`, err);
    });
}
