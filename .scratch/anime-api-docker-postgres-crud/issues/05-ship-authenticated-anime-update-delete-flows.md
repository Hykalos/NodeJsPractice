# 05 — Ship Authenticated Anime Update and Delete Flows

**What to build:** A Client can update and hard-delete Anime records through authenticated endpoints with stable error behavior.

**Blocked by:** 04 — Ship Authenticated Anime Read Flows.

**Status:** resolved

- [x] Authenticated clients can update existing Anime records with the same domain validation and conflict semantics used at creation.
- [x] Authenticated clients can hard-delete Anime records and receive clear not-found behavior for missing targets.

## Answer

Implemented and verified authenticated update/delete behavior:

- `PUT /api/v1/anime/:id` applies the same validation semantics as create and returns `409 ANIME_CONFLICT` on duplicate identity collisions.
- `PUT /api/v1/anime/:id` returns `404 ANIME_NOT_FOUND` when the target does not exist.
- `DELETE /api/v1/anime/:id` performs hard delete and returns `204` on success or `404 ANIME_NOT_FOUND` for missing ids.

Implementation points:

- Update/delete route contracts in `anime-api/src/app.ts`.
- Shared write validation in `anime-api/src/validation.ts`.
- Persistence operations in `anime-api/src/repositories/animeRepository.ts`.

Validation run:

- `npm test`
