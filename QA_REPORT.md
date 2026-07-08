# EntityOS QA Report

**Generated:** Wednesday, July 8, 2026  
**Project:** entityos  
**Scope:** Full project analysis

## Executive Summary

EntityOS is a **Next.js 16** private dashboard for managing a personal or professional "entity" — canonical identity, digital assets, claims, supporting evidence, search/AI visibility snapshots, structured-data schema tracking, and a roadmap. Data is stored in **Neon Postgres** via **Drizzle ORM**. The app is feature-rich for a Phase 1 MVP: full CRUD exists for all major entities, a computed dashboard with health scores, and optional automation for AI snapshots (OpenAI + Gemini).

**Build quality is solid for a project without tests.** `npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass. There are **no automated tests** in the repository. The README is still the default `create-next-app` boilerplate and does not document the app's real purpose or setup beyond generic Next.js instructions.

**Issue counts (verified from codebase and commands run):**

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 6 |
| Medium | 11 |
| Low | 7 |
| **Total** | **25** |

The most important risks are **deployment security** (the app is fully open if `SITE_PASSWORD` is not set in production), **no test coverage**, and **referential-integrity gaps** when deleting records that are still linked elsewhere. Performance is acceptable for a small private dashboard today, but the dashboard and list pages will degrade as data grows because they load full tables and run many parallel queries with no pagination or caching.

---

## 1. Functionality Report

### 1.1 Project Overview

EntityOS helps a single operator track and improve how they appear across the web and in AI systems. Core concepts:

- **Identity** — canonical name, bios (25–500 words), headshot URL, website, location
- **Assets** — websites, books, podcasts, profiles, etc., with authority/consistency scores
- **Claims** — factual statements about the entity with confidence and public-importance ratings
- **Evidence** — sources linked to claims and/or assets
- **Search Snapshots** — manual records of search-engine results (Google, Bing)
- **AI Snapshots** — manual or automated records of how AI assistants answer a prompt
- **Schema** — checklist of structured-data types and implementation status
- **Roadmap** — prioritized work items tied to assets/claims
- **Settings** — manual overrides for search/AI visibility scores; trigger for AI snapshot automation
- **Dashboard** — aggregated health metrics and quick-access lists

**Tech stack:** Next.js 16 (App Router), React 19, TypeScript (strict), Drizzle ORM, Neon serverless Postgres, Zod validation, react-hook-form, shadcn/Base UI components, Tailwind CSS 4, OpenAI + Google Generative AI SDKs.

### 1.2 Feature Inventory

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard with health scores | ✅ Working | 5 pillar scores + entity health average |
| Identity profile (view/edit) | ✅ Working | Single-row model; create-on-first-save |
| Assets CRUD + filters | ✅ Working | List, detail, create, edit, delete |
| Claims CRUD + filters | ✅ Working | Evidence count shown on list |
| Evidence CRUD + filters | ✅ Working | Must link to claim and/or asset |
| Search Snapshots CRUD + filters | ✅ Working | Manual entry only |
| AI Snapshots CRUD + filters | ✅ Working | Manual entry + automation |
| Schema manager | ✅ Working | Inline status updates, create/edit/delete |
| Roadmap CRUD + filters | ✅ Working | Edit page only (no detail view) |
| Settings (manual scores) | ✅ Working | Persists to `settings` table |
| AI snapshot automation | ⚠️ Partial | ChatGPT + Gemini only; hardcoded prompt |
| Vercel cron job | ⚠️ Configured | Monthly schedule (`0 0 1 * *`) |
| Site password (Basic auth) | ⚠️ Optional | Skipped when `SITE_PASSWORD` unset |
| User accounts / roles | ❌ Missing | Single shared password only |
| Public REST API | ❌ Missing | Only `/api/cron/ai-snapshots` |
| Automated search snapshots | ❌ Missing | Manual entry only |
| Computed search/AI visibility | ❌ Missing | Manual scores in Settings |
| Perplexity / Claude automation | ❌ Missing | Enum exists; runner does not use them |
| Pagination on list pages | ❌ Missing | All rows loaded |
| Automated tests | ❌ Missing | No test files or test script |

### 1.3 User Flows

**Primary flows (all functional when database is configured):**

1. **Onboarding** — Run `db:push` / `db:seed` → open dashboard → review seeded identity, assets, claims
2. **Manage identity** — `/identity` → Edit → save bios and URLs → dashboard identity score updates from asset consistency
3. **Track a claim** — `/claims/new` → create claim → `/evidence/new` → link evidence (claim must be selected manually)
4. **Monitor visibility** — Manually add search/AI snapshots OR Settings → "Run AI Snapshot Now" / wait for Vercel cron
5. **Plan work** — `/roadmap` → filter by priority → edit items → dashboard "Current Sprint" shows `now` items
6. **Review health** — Dashboard shows broken high-authority assets, unsupported high-importance claims, recent evidence

**Broken or incomplete sub-flows:**

- From a claim detail page, "Add evidence" links to `/evidence/new` **without pre-selecting the claim** (extra manual step)
- Deleting an asset, claim, or roadmap item that is referenced elsewhere **fails at the database** with only a generic toast
- Roadmap items link to edit page only — **no read-only detail page** unlike assets/claims/evidence

### 1.4 Integrations & Dependencies

| Integration | Purpose | Required env vars |
|-------------|---------|-------------------|
| Neon Postgres | Primary database | `DATABASE_URL` |
| OpenAI API | Automated AI snapshots | `OPENAI_API_KEY` (or `OPTIONAL_OPENAI_API_KEY`) |
| Google Gemini | Automated AI snapshots | `GEMINI_API_KEY` (or aliases) |
| Vercel Cron | Scheduled AI snapshots | `CRON_SECRET` |
| Vercel / hosting | Deployment | `NEXT_PUBLIC_APP_URL`, `VERCEL_URL` (auto) |
| Site password | Basic HTTP auth | `SITE_PASSWORD` (optional locally) |

**Auth model:** Middleware applies HTTP Basic auth when `SITE_PASSWORD` is set. The cron API route (`/api/cron/ai-snapshots`) is **excluded** from middleware and uses `Bearer CRON_SECRET` instead. Server Actions perform mutations with no additional per-user authorization — anyone who passes site password can change all data.

**External API surface:** One route — `POST /api/cron/ai-snapshots`. All other data access is via Server Actions and server components.

### 1.5 Test Coverage

| Area | Coverage |
|------|----------|
| Unit tests | None |
| Integration tests | None |
| E2E tests | None |
| Test script in `package.json` | None |
| CI test pipeline | Not present in repo |

Validation is handled at form boundaries via **Zod schemas** in each feature module. TypeScript strict mode is enabled. Lint and build pass, but there is no regression safety net.

### 1.6 Functionality Gaps & Incomplete Features

1. **AI automation is person-specific** — prompt is hardcoded to `"Who is Michael Pearson-Adams? Be concise."` in `lib/ai-snapshot-runner.ts`
2. **Search and AI visibility scores are manual** — dashboard reads from `settings` table defaults (50), not from snapshot data
3. **Only 2 of 5 AI providers** in the enum are automated (ChatGPT, Gemini)
4. **No search engine automation** — search snapshots are fully manual
5. **No multi-user support** — one shared password, no audit trail of who changed what
6. **No export/import** — data locked in Postgres
7. **Seed script is not idempotent** — re-running `db:seed` will attempt duplicate inserts
8. **Documentation gap** — README does not describe EntityOS features, env vars, or deployment steps (`.env.example` is better but minimal)
9. **Cron schedule is monthly** — `vercel.json` uses `0 0 1 * *` (midnight on the 1st of each month), which may not match expected frequency
10. **Dashboard roadmap summary omits `blocked` status** — only backlog, in progress, and done are counted

---

## 2. Bug Report

### 2.1 Critical

#### BUG-001 — Production app fully public if `SITE_PASSWORD` is unset
- **Severity:** Critical
- **Location:** `middleware.ts`
- **Description:** When `SITE_PASSWORD` is not set, middleware calls `NextResponse.next()` and allows all requests through with no authentication. This is intentional for local dev but dangerous if deployed to production without the env var.
- **Impact:** Anyone on the internet can view and modify all entity data, trigger paid AI API calls, and delete records.
- **Recommendation:** Fail closed in production (e.g. require `SITE_PASSWORD` when `NODE_ENV === "production"`), or use Vercel Deployment Protection. Document this prominently in deployment checklist.

### 2.2 High

#### BUG-002 — No automated test suite
- **Severity:** High
- **Location:** Project-wide (no `*.test.*` files, no test script)
- **Description:** Zero tests exist for scoring logic, server actions, API auth, or form validation.
- **Impact:** Regressions in dashboard scores, CRUD, or auth can ship undetected. Refactoring enum/schema sync is risky.
- **Recommendation:** Add Vitest or Jest; prioritize tests for `lib/scores.ts`, middleware auth, cron authorization, and Zod schemas.

#### BUG-003 — Delete operations fail silently on foreign-key references
- **Severity:** High
- **Location:** `app/assets/actions.ts`, `app/claims/actions.ts`, `app/roadmap/actions.ts`, delete dialog components
- **Description:** Database foreign keys use default `ON DELETE NO ACTION` (`db/schema.ts`). Deleting an asset referenced by evidence, schema items, or roadmap items throws a DB error. Delete dialogs catch the error and show a generic toast: "Could not delete…"
- **Impact:** Users cannot delete records without knowing they must unlink dependents first. No guidance on which records block deletion.
- **Recommendation:** Check references before delete and return a specific message (e.g. "This asset is linked to 3 evidence items"). Consider `ON DELETE SET NULL` for optional FKs or a soft-delete pattern.

#### BUG-004 — Seed script is not idempotent
- **Severity:** High
- **Location:** `db/seed.ts`
- **Description:** Seed always inserts rows with no existence check or upsert. Running `npm run db:seed` twice will fail or create duplicates.
- **Impact:** Broken local/staging resets; confusing errors for developers.
- **Recommendation:** Use upsert, truncate-with-confirmation, or check row counts before inserting.

#### BUG-005 — Cron API excluded from site password protection
- **Severity:** High (security)
- **Location:** `middleware.ts` (matcher excludes `api/cron`)
- **Description:** The cron endpoint is intentionally outside Basic auth and relies solely on `CRON_SECRET`. If the secret is weak, leaked, or missing from env, the endpoint is either exploitable or non-functional.
- **Impact:** Attacker with `CRON_SECRET` can trigger OpenAI/Gemini calls and write to `ai_snapshots` without site password.
- **Recommendation:** Use a long random secret; add rate limiting; consider IP allowlisting for Vercel cron invocations.

#### BUG-006 — Evidence form does not prefill claim when linked from claim detail
- **Severity:** High (UX / workflow)
- **Location:** `app/claims/[id]/page.tsx` → links to `/evidence/new`; `app/evidence/new/page.tsx`
- **Description:** Claim detail "Add evidence" button goes to `/evidence/new` without a `claimId` query param. The new evidence page always uses `emptyEvidenceForm`.
- **Impact:** Users must manually re-select the claim they came from — error-prone workflow break.
- **Recommendation:** Pass `?claimId={id}` and read `searchParams` in `NewEvidencePage` to prefill the form.

#### BUG-007 — Hardcoded AI snapshot prompt
- **Severity:** High (functionality)
- **Location:** `lib/ai-snapshot-runner.ts`
- **Description:** `AI_SNAPSHOT_PROMPT` is a constant string for a specific person, not derived from identity profile.
- **Impact:** Automation produces wrong or irrelevant results for any other entity; undermines reusability of the app.
- **Recommendation:** Build prompt from `identity_profile.canonical_name` or a configurable setting.

### 2.3 Medium

#### BUG-008 — Evidence FK IDs not validated before insert
- **Severity:** Medium
- **Location:** `app/evidence/actions.ts`, `app/evidence/schema.ts`
- **Description:** `claimId` and `assetId` are coerced with `Number()` but not checked for existence. Invalid IDs cause a raw Postgres FK violation.
- **Impact:** Server error instead of friendly validation message if form is tampered with or stale options are submitted.
- **Recommendation:** Verify claim/asset exists in server action before insert.

#### BUG-009 — Identity consistency score ignores assets without scores
- **Severity:** Medium
- **Location:** `lib/scores.ts` — `getIdentityConsistency()`
- **Description:** Loads all active assets, then filters to those with non-null `consistencyScore` for the average. Assets missing scores are excluded from the denominator.
- **Impact:** Score can appear artificially high if most active assets have no score entered.
- **Recommendation:** Treat missing scores as 0, or exclude unscored assets from the "active" pool in the UI with a clear metric definition.

#### BUG-010 — Dashboard roadmap counts omit `blocked` status
- **Severity:** Medium
- **Location:** `lib/scores.ts` — `getDashboardData()`
- **Description:** `roadmapStatus` countBy only includes `backlog`, `in_progress`, `done`. The `blocked` enum value exists in schema but is not shown.
- **Impact:** Blocked items are invisible on dashboard summary.
- **Recommendation:** Add `blocked` to the count map and dashboard UI.

#### BUG-011 — Enum values duplicated across many files
- **Severity:** Medium (maintainability)
- **Location:** `db/schema.ts` vs `app/*/schema.ts` (assets, claims, evidence, etc.)
- **Description:** Comments say enums "MUST stay in sync" but they are copy-pasted, not imported from a single source.
- **Impact:** Drift between DB and form validation can cause runtime insert failures or wrong labels.
- **Recommendation:** Export enum arrays from `db/schema.ts` or a shared `lib/enums.ts`.

#### BUG-012 — `runAiSnapshotsNow` server action has no extra authorization
- **Severity:** Medium (security)
- **Location:** `app/settings/actions.ts`
- **Description:** Any user who passes site password can trigger paid API calls via the Settings button.
- **Impact:** Unauthorized operator (or leaked password) can incur API costs.
- **Recommendation:** Acceptable for single-operator MVP; add rate limiting or a separate admin secret for production.

#### BUG-013 — Invalid route IDs show 404 correctly but rely on `Number()` coercion
- **Severity:** Medium (low priority)
- **Location:** Dynamic route pages (e.g. `app/assets/[id]/page.tsx`)
- **Description:** `Number("abc")` → `NaN`; data layer checks `Number.isInteger(id)` and returns null → `notFound()`. Works correctly but pattern is repeated inconsistently (some pages assign to `claimId` variable first).
- **Impact:** No user-facing bug today; maintenance noise.
- **Recommendation:** Shared `parseRouteId()` helper.

#### BUG-014 — No handling when `DATABASE_URL` missing at runtime
- **Severity:** Medium
- **Location:** `db/index.ts`
- **Description:** Module throws at import time if `DATABASE_URL` is unset. Build succeeded because `.env` exists locally; production misconfiguration causes immediate crash on any DB access.
- **Impact:** Total app failure with opaque error if env not configured on deploy.
- **Recommendation:** Document required vars; add health check route; consider lazy DB init with clearer error page.

#### BUG-015 — AI snapshot partial failure returns 200 with errors
- **Severity:** Medium
- **Location:** `lib/ai-snapshot-runner.ts`, `app/api/cron/ai-snapshots/route.ts`
- **Description:** If one provider succeeds and one fails, runner returns success with `errors` array. Cron and Settings button treat this as full success.
- **Impact:** Operator may think both snapshots were captured when only one was.
- **Recommendation:** Surface partial failures in Settings UI toast; consider 207 Multi-Status or warning state.

#### BUG-016 — Claims list evidence count may count duplicates
- **Severity:** Medium (potential)
- **Location:** `app/claims/data.ts`
- **Description:** Uses `count(evidence.id)` with `leftJoin` and `groupBy(claims.id)`. Standard pattern — likely correct, but multiple evidence per claim is counted correctly only if join doesn't duplicate claim rows (it shouldn't with groupBy).
- **Impact:** Low risk if verified; included as code-review note only.
- **Recommendation:** Add integration test for evidence count query.

#### BUG-017 — Next.js middleware deprecation warning
- **Severity:** Medium (future breakage)
- **Location:** `middleware.ts`; build output
- **Description:** Build warns: `"middleware" file convention is deprecated. Please use "proxy" instead.`
- **Impact:** Auth layer may need migration on future Next.js upgrades.
- **Recommendation:** Track Next.js 16 proxy migration guide.

#### BUG-018 — No `blocked` roadmap filter visibility on dashboard quick lists
- **Severity:** Medium
- **Location:** `app/page.tsx` sprint section
- **Description:** Sprint shows `priority=now` items regardless of blocked status — may show items that cannot progress.
- **Impact:** Dashboard may highlight blocked work as active sprint items.
- **Recommendation:** Filter out `blocked` status or show blocked badge.

### 2.4 Low

#### BUG-019 — README is generic boilerplate
- **Severity:** Low
- **Location:** `README.md`
- **Description:** Does not describe EntityOS, database setup, env vars, or deployment.
- **Impact:** New contributors or deployers lack guidance.
- **Recommendation:** Replace with project-specific documentation.

#### BUG-020 — `next-env.d.ts` in `.gitignore` but present in repo
- **Severity:** Low
- **Location:** `.gitignore`
- **Description:** `next-env.d.ts` is gitignored but file exists (may be tracked from before ignore rule).
- **Impact:** Minor git hygiene inconsistency.
- **Recommendation:** Remove from repo or remove from gitignore per team preference.

#### BUG-021 — Theme forced to dark on `<html>` element
- **Severity:** Low
- **Location:** `app/layout.tsx`
- **Description:** `<html className="dark ...">` hardcodes dark class while `ThemeProvider` supports system/light.
- **Impact:** Possible flash or conflict with theme toggle on first paint.
- **Recommendation:** Let ThemeProvider control class without hardcoded `dark`.

#### BUG-022 — Delete server actions use `throw` for invalid ID
- **Severity:** Low
- **Location:** Various `delete*.ts` actions
- **Description:** Invalid ID throws `Error` while update returns `{ ok: false }` — inconsistent error contract.
- **Impact:** Inconsistent error handling in callers.
- **Recommendation:** Standardize on result objects or consistent throws.

#### BUG-023 — No sitemap/robots configuration
- **Severity:** Low
- **Location:** Project root
- **Description:** Private app has no `robots.txt` disallow rules in repo.
- **Impact:** Search engines might index pages if password protection fails.
- **Recommendation:** Add `robots.ts` disallow all for defense in depth.

#### BUG-024 — Vercel cron schedule may not match product intent
- **Severity:** Low
- **Location:** `vercel.json`
- **Description:** Schedule `0 0 1 * *` runs once per month, not daily/weekly.
- **Impact:** Stale AI snapshot data if monthly cadence was unintentional.
- **Recommendation:** Confirm intended schedule with product owner.

#### BUG-025 — `identity/actions.ts` falls back to seed constants for empty name/sentence
- **Severity:** Low
- **Location:** `app/identity/actions.ts`
- **Description:** Empty canonical name/sentence silently replaced with `SEED_CANONICAL_NAME` and `SEED_CANONICAL_IDENTITY_SENTENCE`.
- **Impact:** Unexpected data if user clears fields intending to empty them.
- **Recommendation:** Validate required fields in Zod instead of silent fallback.

### 2.5 Test & Build Failures (if any)

| Command | Result |
|---------|--------|
| `npm run lint` | ✅ Pass (no errors) |
| `npx tsc --noEmit` | ✅ Pass |
| `npm run build` | ✅ Pass |
| Automated tests | ⚠️ Not configured — nothing to run |

**Build warnings (non-failing):**
- Middleware file convention deprecated in favor of "proxy" (Next.js 16)

---

## 3. Performance Report

### 3.1 Critical Performance Issues

**None confirmed at current scale.** The app is a private single-tenant dashboard; performance issues are **latent** and will appear as data volume grows.

### 3.2 Optimization Opportunities

#### PERF-001 — Dashboard loads entire tables for counts
- **Severity:** Medium
- **Location:** `lib/scores.ts` — `getDashboardData()`
- **Description:** Fetches all rows from `assets`, `claims`, `evidence`, `schema_items`, and `roadmap_items`, then counts in JavaScript. Also runs ~10 parallel queries per dashboard load.
- **Impact:** Slow dashboard as tables grow; unnecessary Neon compute and data transfer.
- **Recommendation:** Use SQL `COUNT(*) GROUP BY status/confidence` aggregations in one or two queries.

#### PERF-002 — No pagination on any list page
- **Severity:** Medium
- **Location:** All `app/*/page.tsx` list views and `get*()` data functions
- **Description:** Every list loads the full result set.
- **Impact:** Page render and memory grow linearly with records.
- **Recommendation:** Add cursor or offset pagination (e.g. 50 rows per page).

#### PERF-003 — All data pages use `force-dynamic`
- **Severity:** Low–Medium
- **Location:** Nearly every page exports `dynamic = "force-dynamic"`
- **Description:** No static or cached rendering; every request hits the database.
- **Impact:** Higher TTFB and DB load than necessary for mostly-read pages.
- **Recommendation:** Use `revalidate` tags with sensible TTL for list pages; keep dynamic only where needed.

#### PERF-004 — Large JavaScript bundles on form-heavy routes
- **Severity:** Low–Medium
- **Location:** Build output — `.next/diagnostics/route-bundle-stats.json`
- **Description:** Uncompressed first-load JS sizes from production build:
  - `/schema` — ~1.06 MB
  - `/roadmap/[id]/edit` — ~1.06 MB
  - `/search-snapshots/new` — ~1.05 MB
  - `/` (dashboard) — ~577 KB (605,405 bytes)
- **Impact:** Slower first load on mobile/slow networks for admin UI.
- **Recommendation:** Code-split heavy client components (`SchemaManager`, forms); audit shared chunks; ensure server components stay default.

#### PERF-005 — `getClaimOptions` / `getAssetOptions` loaded on every evidence form
- **Severity:** Low
- **Location:** `app/evidence/new/page.tsx`, `app/evidence/[id]/edit/page.tsx`
- **Description:** Full claim and asset lists fetched for dropdowns on every form load.
- **Impact:** Slow form pages with hundreds of claims/assets.
- **Recommendation:** Searchable combobox with server-side search; or limit to recent items.

#### PERF-006 — AI snapshot runner makes parallel external API calls
- **Severity:** Low
- **Location:** `lib/ai-snapshot-runner.ts`
- **Description:** `Promise.allSettled` for OpenAI + Gemini is appropriate; no timeout configured.
- **Impact:** Hung requests can block server action/cron until platform timeout.
- **Recommendation:** Add per-provider timeout (e.g. 30s) and abort controllers.

### 3.3 Database & Query Patterns

| Pattern | Assessment |
|---------|------------|
| Drizzle ORM with typed schema | ✅ Good |
| Parameterized queries (no raw SQL injection risk in app code) | ✅ Good |
| Claims list with `leftJoin` + `groupBy` for evidence count | ✅ Efficient single query |
| Evidence/schema/roadmap lists with `leftJoin` for names | ✅ Good |
| Dashboard full-table scans | ⚠️ Will not scale |
| Foreign keys without indexes on FK columns | ⚠️ Postgres auto-indexes PKs; FK columns (`claim_id`, `asset_id`) may benefit from explicit indexes at scale |
| Neon serverless HTTP driver | ✅ Fine for this workload; watch connection limits under heavy cron + traffic |
| No migrations runner in scripts (only `db:generate`, `db:push`) | ⚠️ `drizzle/` migration exists but deploy process should use `db:push` or migrate consistently |

**N+1 queries:** Not observed in list pages. Dashboard runs many parallel queries but not classic N+1.

**Missing caching:** No Redis, no Next.js `unstable_cache`, no HTTP cache headers on dynamic pages.

### 3.4 Frontend & Bundle

- **Fonts:** Geist loaded via `next/font` — optimized ✅
- **Images:** No `next/image` usage; headshot is an external URL link only — no image optimization component
- **Client JS:** Forms, filters, schema manager, nav, theme toggle are client components — expected
- **CSS:** Tailwind 4 with PostCSS — standard setup
- **No bundle analyzer** in devDependencies — harder to track regressions

### 3.5 Recommendations (prioritized)

1. **P0 — Security before scale:** Enforce `SITE_PASSWORD` in production; protect cron secret
2. **P1 — Dashboard aggregations:** Replace full-table fetches with SQL `COUNT`/`GROUP BY`
3. **P1 — Pagination:** Add to assets, claims, evidence, snapshots, roadmap lists
4. **P2 — Bundle diet:** Lazy-load `SchemaManager` and heavy form clients
5. **P2 — Selective caching:** `revalidateTag` on mutations; short revalidate on read-heavy pages
6. **P3 — FK indexes:** Add indexes on `evidence.claim_id`, `evidence.asset_id` when row counts exceed ~10k
7. **P3 — API timeouts:** Wrap OpenAI/Gemini calls with timeouts in automation runner

---

## 4. Recommended Next Steps

### Immediate (this week)
1. **BUG-001:** Require auth in production — never deploy without `SITE_PASSWORD` or Vercel Protection
2. **BUG-003:** Improve delete error messages when FK constraints block deletion
3. **BUG-006:** Prefill `claimId` on evidence create from claim detail page
4. **BUG-007:** Derive AI prompt from identity profile instead of hardcoded name
5. Document real setup in README (replace boilerplate)

### Short term (next 2–4 weeks)
6. **BUG-002:** Add test framework; cover `lib/scores.ts` and cron auth first
7. **BUG-004:** Make seed idempotent or add `db:reset` script
8. **PERF-001 / PERF-002:** Dashboard SQL aggregations + list pagination
9. **BUG-008:** Validate FK references in evidence server actions
10. Confirm Vercel cron schedule intent (**BUG-024**)

### Medium term
11. Compute search/AI visibility scores from snapshot history (reduce manual Settings dependency)
12. Add Perplexity/Claude to automation or remove unused enum values
13. Migrate middleware to Next.js proxy API when stable
14. Add rate limiting on cron and manual AI snapshot triggers
15. Roadmap detail page and blocked-status dashboard visibility

---

## Appendix

### A. Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.10 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, shadcn/Base UI |
| Language | TypeScript 5 (strict) |
| Database | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM 0.45 |
| Validation | Zod 4 |
| Forms | react-hook-form + @hookform/resolvers |
| AI | openai, @google/generative-ai |
| Deploy | Vercel (inferred from vercel.json, VERCEL_URL usage) |

### B. Commands Run

```bash
npm run lint          # Exit 0
npx tsc --noEmit      # Exit 0
npm run build         # Exit 0 (with middleware deprecation warning)
```

No test command exists. `.env` was not read (secrets); required variables documented from `.env.example` and code references.

### C. Key Files Reviewed

**Config:** `package.json`, `tsconfig.json`, `next.config.ts`, `drizzle.config.ts`, `vercel.json`, `.env.example`, `eslint.config.mjs`, `middleware.ts`

**Database:** `db/schema.ts`, `db/index.ts`, `db/seed.ts`, `db/seed-data.ts`, `drizzle/0000_cuddly_toro.sql`

**Core logic:** `lib/scores.ts`, `lib/ai-snapshot-runner.ts`

**API:** `app/api/cron/ai-snapshots/route.ts`

**Features (representative):** All `app/*/actions.ts`, `app/*/data.ts`, `app/*/schema.ts`, page components for dashboard, identity, assets, claims, evidence, snapshots, schema, roadmap, settings

**UI:** `components/site-nav.tsx`, `components/site-header.tsx`, `app/schema/schema-manager.tsx`, form components

**Build artifacts:** `.next/diagnostics/route-bundle-stats.json` (bundle sizes)

### D. Route Map (from build)

| Route | Rendering |
|-------|-----------|
| `/` | Dynamic (dashboard) |
| `/identity`, `/identity/edit` | Dynamic |
| `/assets`, `/assets/[id]`, `/assets/new`, `/assets/[id]/edit` | Dynamic / static new |
| `/claims`, `/claims/[id]`, `/claims/new`, `/claims/[id]/edit` | Dynamic / static new |
| `/evidence`, `/evidence/[id]`, `/evidence/new`, `/evidence/[id]/edit` | Dynamic |
| `/search-snapshots`, `.../new`, `.../[id]`, `.../edit` | Dynamic / static new |
| `/ai-snapshots`, `.../new`, `.../[id]`, `.../edit` | Dynamic / static new |
| `/schema` | Dynamic |
| `/roadmap`, `/roadmap/new`, `/roadmap/[id]/edit` | Dynamic |
| `/settings` | Dynamic |
| `POST /api/cron/ai-snapshots` | Dynamic API |

### E. Required Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Neon Postgres connection |
| `NEXT_PUBLIC_APP_URL` | Recommended | Metadata base URL |
| `SITE_PASSWORD` | Production | Basic auth for entire app |
| `CRON_SECRET` | For automation | Bearer token for cron API |
| `OPENAI_API_KEY` | For ChatGPT snapshots | AI automation |
| `GEMINI_API_KEY` | For Gemini snapshots | AI automation |

### F. Severity Legend

| Level | Meaning |
|-------|---------|
| **Critical** | Security exposure or total loss of data integrity in normal misconfiguration |
| **High** | Major broken flows, security risks, or missing safety nets |
| **Medium** | Incorrect behavior, maintainability risks, or scale limits |
| **Low** | Minor UX, docs, or polish issues |

---

*Report generated by static analysis and build verification. Runtime behavior with a live database was not exercised in a browser during this audit.*
