# 03 — Ship Authenticated Anime Create Flow

**What to build:** A Client can create an Anime through authenticated endpoints with year validation and duplicate identity protection.

**Blocked by:** 02 — Deliver API Key Capability for Protected API Access.

**Status:** resolved

- [x] Authenticated clients can create Anime with title, yearFrom, and optional yearTo.
- [x] Invalid year payloads return validation errors, and duplicate Anime identity attempts return conflict errors.

## Answer

Implemented and verified authenticated create behavior:

- `POST /api/v1/anime` is protected by API key auth and returns `201` with created resource data.
- Payload validation enforces year rules and returns `422 VALIDATION_ERROR` for invalid values.
- Duplicate title/yearFrom collisions map to `409 ANIME_CONFLICT` via database uniqueness handling.

Implementation points:

- Route-level behavior in `anime-api/src/app.ts`.
- Validation rules in `anime-api/src/validation.ts`.
- Uniqueness handling backed by repository/database in `anime-api/src/repositories/animeRepository.ts` and migration constraints.

Validation run:

- `npm test`
