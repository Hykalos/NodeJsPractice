# 01 — Bootstrap Dockerized Anime Service

**What to build:** A developer can run PostgreSQL and the API together with health-aware startup and verify service readiness through a health endpoint.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] Dockerized API and PostgreSQL services start together with database health gating API startup.
- [x] A health endpoint returns a successful response when the API is ready to serve traffic.

## Answer

- Docker health-gated startup is configured via service dependency on PostgreSQL health in docker-compose.
- API readiness endpoint behavior is verified by integration test against `/healthz` returning `200` with `{ "status": "ok" }`.
