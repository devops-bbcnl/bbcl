import { describe, it, expect, vi, beforeEach } from "vitest";

const queryRaw = vi.fn();
vi.mock("./prisma", () => ({
  prisma: { $queryRaw: (...args: unknown[]) => queryRaw(...args) },
}));

const { checkRateLimit } = await import("./rate-limit");

describe("checkRateLimit", () => {
  beforeEach(() => {
    queryRaw.mockReset();
  });

  it("allows the request when the atomic count is under the limit", async () => {
    queryRaw.mockResolvedValue([{ count: 1 }]);
    const result = await checkRateLimit("1.2.3.4", "tok-abc");
    expect(result.allowed).toBe(true);
  });

  it("allows the request exactly at the limit boundary", async () => {
    queryRaw.mockResolvedValue([{ count: 30 }]);
    const result = await checkRateLimit("1.2.3.4", "tok-abc");
    expect(result.allowed).toBe(true);
  });

  it("denies the request once the atomic count exceeds the limit", async () => {
    queryRaw.mockResolvedValue([{ count: 31 }]);
    const result = await checkRateLimit("1.2.3.4", "tok-abc");
    expect(result.allowed).toBe(false);
  });

  it("hashes the IP rather than embedding it raw in the rate-limit key", async () => {
    queryRaw.mockResolvedValue([{ count: 1 }]);
    await checkRateLimit("9.9.9.9", "tok-xyz");
    const templateArgs = queryRaw.mock.calls[0];
    const interpolated = JSON.stringify(templateArgs);
    expect(interpolated).not.toContain("9.9.9.9");
  });
});
