# 02 — Deliver API Key Capability for Protected API Access

**What to build:** An Operator can bootstrap API Keys, store them securely as hashes, and have protected API routes enforce x-api-key authentication from day one.

**Blocked by:** 01 — Bootstrap Dockerized Anime Service.

**Status:** ready-for-agent

- [ ] API Key credentials can be seeded and persisted without storing plaintext keys.
- [ ] Requests to protected API routes without a valid x-api-key are rejected with a clear auth error contract.
