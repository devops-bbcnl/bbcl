import { describe, it, expect, vi, beforeEach } from "vitest";

const findUnique = vi.fn();
const findMany = vi.fn();
const count = vi.fn();
const queryRaw = vi.fn();

vi.mock("../lib/prisma", () => ({
  prisma: {
    employee: { findUnique: (...a: unknown[]) => findUnique(...a), findMany: (...a: unknown[]) => findMany(...a), count: (...a: unknown[]) => count(...a) },
    $queryRaw: (...a: unknown[]) => queryRaw(...a),
  },
}));

const requireRole = vi.fn().mockResolvedValue({ id: "actor-emp", role: "ADMIN", employmentStatus: "ACTIVE" });
vi.mock("../lib/auth/rbac", () => ({ requireRole: (...a: unknown[]) => requireRole(...a) }));

const txMock = {
  employee: { create: vi.fn() },
  $queryRaw: (...a: unknown[]) => queryRaw(...a),
};
const withAudit = vi.fn(({ mutate }: { mutate: (tx: unknown) => Promise<unknown> }) => mutate(txMock));
vi.mock("../lib/audit", () => ({ withAudit: (...a: Parameters<typeof withAudit>) => withAudit(...a) }));

const { getPublicVerificationData, createEmployee, listEmployees } = await import("./employee-service");

describe("getPublicVerificationData (public allowlist)", () => {
  beforeEach(() => findUnique.mockReset());

  it("returns INVALID_EMPLOYEE for an unknown token", async () => {
    findUnique.mockResolvedValue(null);
    const result = await getPublicVerificationData("bad-token");
    expect(result).toEqual({ status: "INVALID_EMPLOYEE" });
  });

  it("returns FORMER_EMPLOYEE for an inactive employee, without leaking their name", async () => {
    findUnique.mockResolvedValue({
      firstName: "Jane",
      lastName: "Doe",
      jobTitle: "Engineer",
      employmentStatus: "INACTIVE",
      dateJoined: new Date(),
      profilePhotoUrl: null,
      department: null,
    });
    const result = await getPublicVerificationData("old-token");
    expect(result).toEqual({ status: "FORMER_EMPLOYEE" });
  });

  it("returns ONLY the allowlisted fields for an active employee — never blood group, emergency contact, id, or email", async () => {
    findUnique.mockResolvedValue({
      firstName: "Jane",
      lastName: "Doe",
      jobTitle: "Engineer",
      employmentStatus: "ACTIVE",
      dateJoined: new Date("2026-01-01"),
      profilePhotoUrl: "https://r2.example/jane.jpg",
      department: { name: "Engineering" },
    });

    const result = await getPublicVerificationData("good-token");

    expect(result).toEqual({
      status: "VALID",
      fullName: "Jane Doe",
      jobTitle: "Engineer",
      department: "Engineering",
      dateJoined: new Date("2026-01-01"),
      profilePhotoUrl: "https://r2.example/jane.jpg",
    });

    // Negative assertion — the select clause itself must never request these fields.
    const selectArg = findUnique.mock.calls[0][0].select;
    expect(selectArg).not.toHaveProperty("bloodGroup");
    expect(selectArg).not.toHaveProperty("emergencyContactName");
    expect(selectArg).not.toHaveProperty("emergencyContactPhone");
    expect(selectArg).not.toHaveProperty("id");
    expect(selectArg).not.toHaveProperty("email");
    expect(selectArg).not.toHaveProperty("staffNumber");
  });
});

describe("createEmployee", () => {
  beforeEach(() => {
    requireRole.mockClear();
    withAudit.mockClear();
    queryRaw.mockReset();
    txMock.employee.create.mockReset();
  });

  it("requires ADMIN role before creating", async () => {
    queryRaw.mockResolvedValue([{ nextval: 1n }]);
    txMock.employee.create.mockResolvedValue({ id: "new-emp" });

    await createEmployee("actor-user", {
      userId: "u1",
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
    });

    expect(requireRole).toHaveBeenCalledWith("actor-user", "ADMIN");
  });

  it("formats the staff number as BB-<YY><4-digit padded sequence>", async () => {
    queryRaw.mockResolvedValue([{ nextval: 7n }]);
    txMock.employee.create.mockResolvedValue({ id: "new-emp" });

    await createEmployee("actor-user", { userId: "u1", firstName: "A", lastName: "B", email: "a@b.com" });

    const createArg = txMock.employee.create.mock.calls[0][0].data;
    expect(createArg.staffNumber).toMatch(/^BB-\d{2}0007$/);
  });
});

describe("listEmployees", () => {
  beforeEach(() => {
    requireRole.mockClear();
    findMany.mockReset();
    count.mockReset();
  });

  it("requires at least STAFF role", async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await listEmployees("actor-user");
    expect(requireRole).toHaveBeenCalledWith("actor-user", "STAFF");
  });

  it("selects only list-view fields — no role, permission, or PII fields fetched", async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await listEmployees("actor-user");

    const selectArg = findMany.mock.calls[0][0].select;
    expect(selectArg).not.toHaveProperty("bloodGroup");
    expect(selectArg).not.toHaveProperty("emergencyContactName");
    expect(selectArg).not.toHaveProperty("role");
  });

  it("caps pageSize at 100 even if a larger value is requested", async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await listEmployees("actor-user", { pageSize: 500 });

    expect(findMany.mock.calls[0][0].take).toBe(100);
  });
});
