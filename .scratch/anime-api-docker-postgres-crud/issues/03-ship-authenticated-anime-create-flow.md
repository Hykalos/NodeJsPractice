# 03 — Ship Authenticated Anime Create Flow

**What to build:** A Client can create an Anime through authenticated endpoints with year validation and duplicate identity protection.

**Blocked by:** 02 — Deliver API Key Capability for Protected API Access.

**Status:** ready-for-agent

- [ ] Authenticated clients can create Anime with title, yearFrom, and optional yearTo.
- [ ] Invalid year payloads return validation errors, and duplicate Anime identity attempts return conflict errors.
