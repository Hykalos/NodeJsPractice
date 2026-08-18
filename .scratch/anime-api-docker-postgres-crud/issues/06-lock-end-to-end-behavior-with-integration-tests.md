# 06 — Lock End-to-End Behavior with Integration Tests

**What to build:** Maintainers can verify full authenticated CRUD behavior at the HTTP API seam against PostgreSQL-compatible runtime behavior.

**Blocked by:** 05 — Ship Authenticated Anime Update and Delete Flows.

**Status:** ready-for-agent

- [ ] Integration tests validate authenticated create, read, update, and delete behavior including expected status and response contracts.
- [ ] Integration tests validate auth rejection and validation error behavior, and run against PostgreSQL-compatible runtime semantics.
