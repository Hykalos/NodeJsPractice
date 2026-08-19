# 07 — Finalize Developer Runbook and Usage Contracts

**What to build:** Teammates can reliably start the stack, authenticate requests, and use documented API behavior for onboarding and handoff.

**Blocked by:** 06 — Lock End-to-End Behavior with Integration Tests.

**Status:** resolved

- [x] Documentation explains local startup, Docker runtime usage, migrations, and API Key usage for protected endpoints.
- [x] Documentation includes practical request examples for Anime CRUD and list query behavior.

## Answer

Finalized the developer runbook and request contracts in `anime-api/README.md`:

- Clarified local startup flow and full Docker runtime usage.
- Documented migration workflow for local execution and Docker startup behavior.
- Added explicit API key guidance for protected `/api/v1/*` endpoints.
- Added practical `curl` examples for authenticated create, read-by-id, list (pagination, sorting, and filtering), update, and delete flows.
- Kept API key generation guidance, including hash-only persistence behavior.
