import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../prisma";

// DB-backed sessions (Better Auth's default) — revocation is instant (delete the
// session row), and role is read live from Employee at check-time rather than baked
// into a token that would go stale on a role change or offboarding. See design doc
// Finding 1 and the eng review's auth-architecture decision.
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // employees are provisioned by HR, not self-signup
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once per day of activity
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  // `next dev` picks whatever port is free, so in local dev the actual origin
  // often drifts from BETTER_AUTH_URL (e.g. another app already holding :3000).
  // Trust a small range of local ports so sign-in doesn't 403 on origin-check
  // every time that happens — never applies outside development.
  trustedOrigins:
    process.env.NODE_ENV === "development"
      ? Array.from({ length: 6 }, (_, i) => `http://localhost:${3000 + i}`)
      : undefined,
});
