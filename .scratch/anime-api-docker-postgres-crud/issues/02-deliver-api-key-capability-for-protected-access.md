# 02 — Deliver API Key Capability for Protected API Access

**What to build:** An Operator can bootstrap API Keys, store them securely as hashes, and have protected API routes enforce x-api-key authentication from day one.

**Blocked by:** 01 — Bootstrap Dockerized Anime Service.

**Status:** resolved

- [x] API Key credentials can be seeded and persisted without storing plaintext keys.
- [x] Requests to protected API routes without a valid x-api-key are rejected with a clear auth error contract.

## Answer

Implemented and validated API key capability at the auth seam:

- Added `anime-api/tests/auth.test.ts` covering hash behavior, bootstrap key seeding with hashed values only, and auth middleware contracts for missing, invalid, and valid `x-api-key`.
- Existing application wiring enforces `apiKeyAuth` on all `/api/v1/*` routes and bootstraps keys from config during startup.

Validation run:

- `npm test -- tests/auth.test.ts`
- `npm run build`
- `npm test`
