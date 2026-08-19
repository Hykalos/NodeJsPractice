# 06 — Lock End-to-End Behavior with Integration Tests

**What to build:** Maintainers can verify full authenticated CRUD behavior at the HTTP API seam against PostgreSQL-compatible runtime behavior.

**Blocked by:** 05 — Ship Authenticated Anime Update and Delete Flows.

**Status:** resolved

- [x] Integration tests validate authenticated create, read, update, and delete behavior including expected status and response contracts.
- [x] Integration tests validate auth rejection and validation error behavior, and run against PostgreSQL-compatible runtime semantics.

## Answer

Implemented end-to-end integration coverage at the HTTP seam against PostgreSQL container runtime semantics:

- Expanded `anime-api/tests/anime.integration.test.ts` to assert full authenticated CRUD contracts (status codes and response envelopes), including post-delete not-found behavior.
- Added explicit not-found contract checks for `GET/PUT/DELETE` on unknown ids.
- Added auth rejection tests for missing key, invalid key, and revoked key (`revoked_at` set) to verify middleware behavior in real DB-backed flow.
- Added validation contract checks for invalid write payloads and invalid list query parameters (`422 VALIDATION_ERROR` with details).
- Added duplicate identity conflict coverage verifying `409 ANIME_CONFLICT` for unique title/yearFrom violations.
- Added deterministic per-test DB setup (`beforeEach`) with table reset and key seeding to avoid test coupling while still exercising real Postgres constraints and query behavior.

Validation run:

- `npm test -- tests/anime.integration.test.ts`
- `npm run build`
- `npm test`
