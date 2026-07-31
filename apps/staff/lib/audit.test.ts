import { describe, it, expect, vi, beforeEach } from "vitest";

const auditLogCreate = vi.fn();
const $transaction = vi.fn();

vi.mock("./prisma", () => ({
  prisma: {
    $transaction: (...args: unknown[]) => $transaction(...args),
    auditLog: { create: (...args: unknown[]) => auditLogCreate(...args) },
  },
}));

const { withAudit, logAuditAsync } = await import("./audit");

describe("withAudit", () => {
  beforeEach(() => {
    auditLogCreate.mockReset();
    $transaction.mockReset();
  });

  it("runs the mutation and writes the audit row in the same transaction", async () => {
    const tx = { auditLog: { create: auditLogCreate } };
    $transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => cb(tx));
    const mutate = vi.fn().mockResolvedValue({ id: "emp1" });

    const result = await withAudit({
      actorId: "user1",
      action: "employee.create",
      entityType: "Employee",
      mutate,
    });

    expect(result).toEqual({ id: "emp1" });
    expect(mutate).toHaveBeenCalledWith(tx);
    expect(auditLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: "employee.create" }) }),
    );
  });

  it("rolls back the mutation if the transaction (and thus the audit write) fails", async () => {
    $transaction.mockImplementation(async () => {
      throw new Error("audit write failed");
    });
    const mutate = vi.fn();

    await expect(
      withAudit({ actorId: "user1", action: "employee.create", entityType: "Employee", mutate }),
    ).rejects.toThrow("audit write failed");
  });
});

describe("logAuditAsync", () => {
  beforeEach(() => {
    auditLogCreate.mockReset();
  });

  it("does not throw when the underlying audit write rejects (best-effort, non-blocking)", () => {
    auditLogCreate.mockRejectedValue(new Error("db blip"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      logAuditAsync({ actorId: "user1", action: "auth.login", entityType: "User" }),
    ).not.toThrow();

    consoleSpy.mockRestore();
  });
});
