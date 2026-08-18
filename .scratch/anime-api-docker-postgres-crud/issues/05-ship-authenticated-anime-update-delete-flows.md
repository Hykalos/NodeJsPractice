# 05 — Ship Authenticated Anime Update and Delete Flows

**What to build:** A Client can update and hard-delete Anime records through authenticated endpoints with stable error behavior.

**Blocked by:** 04 — Ship Authenticated Anime Read Flows.

**Status:** ready-for-agent

- [ ] Authenticated clients can update existing Anime records with the same domain validation and conflict semantics used at creation.
- [ ] Authenticated clients can hard-delete Anime records and receive clear not-found behavior for missing targets.
