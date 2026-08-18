# 04 — Ship Authenticated Anime Read Flows

**What to build:** A Client can read one Anime by id and list Anime records with pagination, sorting, and filtering including Ongoing Anime semantics.

**Blocked by:** 03 — Ship Authenticated Anime Create Flow.

**Status:** resolved

- [x] Authenticated clients can fetch a single Anime by id and receive not-found responses for unknown ids.
- [x] Authenticated clients can list Anime using page/pageSize, sort controls, and filters for title, ongoing state, and year range.

## Answer

Implemented and verified authenticated read behavior:

- `GET /api/v1/anime/:id` returns Anime details when found and `404 ANIME_NOT_FOUND` for unknown ids.
- `GET /api/v1/anime` supports pagination (`page`, `pageSize`), sorting (`sortBy`, `sortOrder`), and filters (`titleContains`, `ongoing`, `yearFromGte`, `yearFromLte`).

Implementation points:

- Read/list routes and not-found contract in `anime-api/src/app.ts`.
- Query parsing and bounds in `anime-api/src/validation.ts`.
- List filtering/sorting/pagination logic in `anime-api/src/repositories/animeRepository.ts`.

Validation run:

- `npm test`
