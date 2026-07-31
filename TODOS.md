# TODOS

## Migrate staff/admin enum to full DB-driven RBAC graph
**What:** Schema migration from a simple `staff | admin` enum on the Employee/User model
to the full `Role`, `Permission`, `RolePermission`, `EmployeeRole` join-table graph
(originally specced), plus replacing the single `requireRole()` service-layer check with
permission-key lookups (`content:write`, `leads:read`, `config:write`, etc.).

**Why:** Plan A (Staff Identity + RBAC + Audit) intentionally shipped with a simple
staff/admin enum instead of the full DB-driven permission graph — an outside-voice
challenge during `/plan-eng-review` on 2026-07-27 argued the full graph was premature
infrastructure with no current consumer. Plans B (ID-card generation) and C (CMS/leads/
config admin layer) may need permission keys finer than staff/admin once they're scoped.

**Pros:** Change permissions without a redeploy; matches the original spec's explicit
"permissions should be database-driven" requirement; avoids re-litigating RBAC scope
per-module.

**Cons:** The migration touches every existing permission-check call site, not just the
schema — every `requireRole('admin')` call becomes a permission-key check. Real work, not
a pure addition.

**Depends on / blocked by:** Plan B and Plan C scoping — confirm they actually need
permission granularity beyond staff/admin before doing this migration. If they don't,
this TODO may never need to happen.

**Context for whoever picks this up:** See the approved design doc at
`~/.gstack/projects/bbcl/devops-main-design-20260727.md` (original full-RBAC design) and
the Plan A eng-review session (2026-07-27) for the reasoning behind the simplification.
