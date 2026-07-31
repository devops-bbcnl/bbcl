import { createHash } from "node:crypto";
import { prisma } from "./prisma";

const WINDOW_MS = 60_000; // 60-second sliding window
const MAX_REQUESTS_PER_WINDOW = 30;

// Supabase-backed rate limiting — an in-memory counter would not survive Netlify's
// serverless cold starts across instances (each cold instance would reset to zero,
// making the control theatrical). The increment is a single atomic SQL statement
// (INSERT ... ON CONFLICT ... DO UPDATE ... RETURNING) so concurrent requests from
// the same IP can never race a read-then-write and undercount. See eng review
// "rate-limit race" finding.
export async function checkRateLimit(ip: string, token: string): Promise<{ allowed: boolean }> {
  const key = `verify:${hashIp(ip)}:${token}`;
  const now = new Date();
  const windowCutoff = new Date(now.getTime() - WINDOW_MS);

  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO rate_limit (id, key, window_start, count)
    VALUES (gen_random_uuid(), ${key}, ${now}, 1)
    ON CONFLICT (key) DO UPDATE
    SET
      count = CASE
        WHEN rate_limit.window_start < ${windowCutoff} THEN 1
        ELSE rate_limit.count + 1
      END,
      window_start = CASE
        WHEN rate_limit.window_start < ${windowCutoff} THEN ${now}
        ELSE rate_limit.window_start
      END
    RETURNING count;
  `;

  const count = rows[0]?.count ?? 0;
  return { allowed: count <= MAX_REQUESTS_PER_WINDOW };
}

function hashIp(ip: string): string {
  // Never store raw IPs in a public-adjacent table — hash them.
  return createHash("sha256").update(ip).digest("hex");
}
