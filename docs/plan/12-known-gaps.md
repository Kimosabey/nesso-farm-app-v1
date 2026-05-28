# 12 — Known Gaps & Hardening Backlog

Gaps inherited from the FoodSign baseline + risks specific to Nesso v1. Each item has an owner phase (see `11-implementation-phases.md`) and a mitigation.

## Inherited from FoodSign

| # | Gap | Mitigation | Phase |
|---|---|---|---|
| 1 | Plaintext passwords in `users` | bcrypt(12) on save/login; mandatory password change on first login. | Phase 1 |
| 2 | Base64 images stored in MongoDB docs (50 MB JSON limit) | S3 + pre-signed URLs from day one. Migration script for legacy data. | Phase 2 |
| 3 | Open CORS (`*`) | Strict allowlist: admin, portal, mobile scheme; per-env. | Phase 1 |
| 4 | No rate limit on `/admin/login` | `@nestjs/throttler` 5/min/IP on `/auth/*`. | Phase 1 |
| 5 | No audit trail | `auditLogs` collection + interceptor on all mutations. | Phase 1 |
| 6 | Role-based route guard is a no-op | `RolesGuard` enforced; scope filters in service layer. | Phase 1 |
| 7 | Mobile dependencies polluted with backend libs (`express, mongoose, jsonwebtoken`) | Clean monorepo separation; per-app `package.json`. | Phase 0 |
| 8 | Web app monolithic 8K-line `app.js` | Next.js modular SSR + RSC. | Phase 0 |
| 9 | Hard-coded weather coords (Mysuru) | Use farm `lat/lng`; backend caches per-tile. | Phase 3 |
| 10 | No automated tests | Vitest + Playwright + Detox + Jest (api). CI gates at 70% coverage. | All |
| 11 | i18n corruption history (`repair_*.js` scripts) | `check-i18n` script in CI; English is source of truth; translations land via PRs. | Phase 0 |
| 12 | Firebase phone token not re-verified server-side | Backend verifies Firebase ID token on `/auth/otp/verify`. | Phase 1 |
| 13 | Hard-coded fallback admin credentials (`Admin@2026`, `12345678`, `password`) | Removed; one-shot seed from env, forced rotation. | Phase 1 |
| 14 | Hard-coded POP catalog in code | `popCatalog` collection + admin editor. | Phase 3 |
| 15 | No conflict resolution on offline sync | Server-wins (last-write-wins on `updatedAt`); mutations made append-only where possible. | Phase 2 |
| 16 | Static `db_architecture.html` doc drifts from schema | Auto-generate ERD from Mongoose schemas, publish to `/docs`. | Phase 6 |

## New risks introduced by the modern stack

| # | Risk | Mitigation |
|---|---|---|
| 17 | Next.js App Router learning curve / RSC pitfalls | Concrete patterns documented in `06-web-dashboard.md`; team training in Phase 0. |
| 18 | Expo SDK upgrades may break native plugins (firebase, camera) | Pin SDK in Phase 0; upgrades batched twice a year with a regression sweep. |
| 19 | NativeWind v4 still maturing | Fallback plan: switch to inline `StyleSheet.create` + tokens; theme stays portable. |
| 20 | MMKV native module conflicts with Expo Go | Use development client from day one; Expo Go only for `mobile/web` builds. |
| 21 | SQLite outbox can grow unbounded if backend is down for days | Cap outbox at 5,000 rows; surface "sync stuck" banner with manual export option. |
| 22 | S3 pre-signed URLs leak if logged | Logs scrub query strings; URLs expire in 15 min for sensitive blobs. |
| 23 | Field-level encryption key rotation | Use envelope encryption (KMS data keys); rotation procedure documented in runbook. |
| 24 | Public QR portal as a scraping target | Cloudflare rate limit + per-code throttling; no PII without consent. |

## Security backlog (timeboxed before GA)

- [ ] OWASP Top 10 review of every endpoint
- [ ] Dependency scanning (Dependabot + Snyk) wired in CI
- [ ] Pen test of staging environment (external firm)
- [ ] PII data flow diagram + retention policy
- [ ] DPDP Act 2023 compliance review (India data protection)
- [ ] Crash log scrubbing (no PII in Sentry events; allowlist breadcrumb fields)
- [ ] CSP headers on web; SRI on third-party scripts (none planned, but enforce policy)
- [ ] Mobile pinning of API TLS cert (optional, post-GA)
- [ ] Secrets rotation policy (90-day cadence)

## Data migration plan (if porting FoodSign data)

If Nesso v1 must adopt existing FoodSign data on day one:

1. **Snapshot** the FoodSign Atlas cluster (read-only replica).
2. **Map** collections via the table in `03-database-schema.md` § Migration.
3. **Run** `migrations/2026-XX-foodsign-import.ts`:
   - Stream each old doc through a transform that:
     - Renames fields where they changed
     - Extracts every base64 image → S3, replaces with key
     - Adds `createdBy: 'migration'`, `migratedAt: now()`
   - Writes to the new collection in batches of 1,000
4. **Re-index** (2dsphere, unique constraints).
5. **Smoke-test** API reads on the new cluster behind a feature flag.
6. **Cut over** the mobile/web base URLs in EAS/Vercel env vars.
7. **Read-only mode** on the old cluster for 7 days, then archive.
8. **Decommission**.

## Deferred features (post-GA roadmap)

| # | Feature | Notes |
|---|---|---|
| 1 | Disease detection (camera + YOLOv8) | Needs a labeled dataset; ML model serving infra. |
| 2 | Yield prediction | Requires 2+ seasons of harvest data. |
| 3 | Smart fertilizer suggestions | Build on POP catalog + soil tests. |
| 4 | AI chatbot (Ollama / Qwen) | Likely conversational support; needs RAG over docs. |
| 5 | Voice assistant | Useful for low-literacy farmers; Whisper-based STT. |
| 6 | Weather intelligence (advisories) | Beyond raw Open-Meteo; spray windows, frost risk. |
| 7 | Blockchain anchoring | Anchor batch hashes to a public chain for tamper evidence. |
| 8 | IoT sensor ingestion | Soil moisture, temperature; MQTT broker + time-series store. |
| 9 | ERP integrations | SAP/Oracle connectors; depends on customer demand. |
| 10 | Multi-tenant SaaS | Org-scoped data isolation; currently single-org. |
| 11 | Export compliance | EUDR, GLOBALG.A.P. workflows. |
| 12 | SCIM / SAML SSO | For larger enterprise customers. |
| 13 | Marketplace | Farmer ↔ buyer direct sales — currently out of scope. |
| 14 | Lending / insurance | Out of scope. |

These are tracked, not committed. The v1 plan does not promise any of them.
