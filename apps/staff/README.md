# Bubble Barrel Staff — Plan A (Staff Identity + RBAC + Audit)

Next.js 15 App Router app. Part of the `bubblebarrel` npm workspace monorepo — run all
commands from the repo root unless noted.

## Scope

This is Plan A only: Employee/Department models, DB-backed auth sessions (Better Auth),
a simple `staff | admin` RBAC enum (not the full permission graph — see root `TODOS.md`),
the audit-log wrapper, and the public `/verify/[token]` page.

**Not in this app yet:** ID-card generation (Plan B), CMS/leads/config (Plan C). See
`~/.gstack/projects/bbcl/devops-main-design-20260727.md` for the full roadmap.

## Setup

1. Provision a Supabase project (Postgres). Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — the pooled connection string (Supavisor, port 6543, `?pgbouncer=true`)
   - `DIRECT_URL` — the direct connection string (port 5432), used for migrations
   - `BETTER_AUTH_SECRET` — generate with `openssl rand -base64 32`
2. Install dependencies (from repo root): `npm install`
3. Run the initial migration: `npm run db:migrate --workspace=apps/staff`
4. Apply the staff-number sequence (Prisma's schema DSL can't express `CREATE SEQUENCE`):
   `psql "$DIRECT_URL" -f apps/staff/prisma/sql/001_staff_number_sequence.sql`
5. `npm run dev --workspace=apps/staff`

## Testing

`npm run test --workspace=apps/staff` (Vitest). Service-layer and auth/RBAC logic have
unit test coverage with mocked Prisma; see the eng-review test coverage diagram for
remaining gaps (notably: E2E coverage for the full onboarding and verification flows,
and component-level tests for the login/dashboard UI).

## Deploy

Separate Netlify site from `apps/marketing`, with "Base directory" set to `apps/staff`
in the site settings. See `netlify.toml` in this directory.
