import { describe, it, expect, vi, beforeEach } from "vitest";

const findUnique = vi.fn();
vi.mock("../prisma", () => ({
  prisma: { employee: { findUnique: (...args: unknown[]) => findUnique(...args) } },
}));

const { requireRole, AuthorizationError } = await import("./rbac");

describe("requireRole", () => {
  beforeEach(() => {
    findUnique.mockReset();
  });

  it("resolves for an active STAFF employee when STAFF is required", async () => {
    findUnique.mockResolvedValue({ id: "emp1", role: "STAFF", employmentStatus: "ACTIVE" });
    const result = await requireRole("user1", "STAFF");
    expect(result.id).toBe("emp1");
  });

  it("resolves for an active ADMIN employee when STAFF is required (admin satisfies lower bar)", async () => {
    findUnique.mockResolvedValue({ id: "emp1", role: "ADMIN", employmentStatus: "ACTIVE" });
    const result = await requireRole("user1", "STAFF");
    expect(result.role).toBe("ADMIN");
  });

  it("throws when no employee record exists for the user", async () => {
    findUnique.mockResolvedValue(null);
    await expect(requireRole("ghost-user", "STAFF")).rejects.toThrow(AuthorizationError);
  });

  it("throws when the employee is not ACTIVE (suspended/inactive can't act)", async () => {
    findUnique.mockResolvedValue({ id: "emp1", role: "ADMIN", employmentStatus: "SUSPENDED" });
    await expect(requireRole("user1", "STAFF")).rejects.toThrow(AuthorizationError);
  });

  it("throws when a STAFF employee tries an ADMIN-only action", async () => {
    findUnique.mockResolvedValue({ id: "emp1", role: "STAFF", employmentStatus: "ACTIVE" });
    await expect(requireRole("user1", "ADMIN")).rejects.toThrow(AuthorizationError);
  });
});
