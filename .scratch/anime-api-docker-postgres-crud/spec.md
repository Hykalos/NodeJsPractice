# Anime API in Docker with PostgreSQL CRUD Spec

Status: ready-for-agent

## Problem Statement

A developer wants a new Node.js API that runs in Docker with PostgreSQL and exposes a simple CRUD interface for an Anime catalog. The API should be practical for local development and automation, with explicit schema migrations, authenticated access, and confidence from behavior-focused testing.

## Solution

Deliver a Dockerized Node.js + PostgreSQL service that manages Anime records with these core domain rules:

- Anime is a title-level record.
- Anime has title, yearFrom, and optional yearTo.
- Ongoing Anime is represented by yearTo being null.
- API access is protected by API Key authentication using the x-api-key header.

The API exposes a versioned REST contract for create, read (single/list), update, and delete. It includes pagination, sorting, and filtering for list operations. Schema changes are managed with explicit SQL migrations. Integration tests verify external behavior against a PostgreSQL runtime.

## User Stories

1. As a developer, I want to run the entire API stack with Docker Compose, so that I can start developing without manual infrastructure setup.
2. As a developer, I want PostgreSQL to start with health checks, so that the API only boots after the database is actually ready.
3. As a client, I want a health endpoint, so that I can quickly detect whether the service is running.
4. As a client, I want to create an Anime with title and yearFrom, so that I can register new catalog entries.
5. As a client, I want yearTo to be optional, so that I can represent Ongoing Anime.
6. As a client, I want Ongoing Anime represented consistently, so that downstream systems can treat null yearTo as still running.
7. As a client, I want to fetch one Anime by id, so that I can view details for a specific record.
8. As a client, I want to list Anime records, so that I can browse the catalog.
9. As a client, I want page and pageSize controls, so that I can consume large lists efficiently.
10. As a client, I want bounded pageSize, so that I can avoid accidentally expensive queries.
11. As a client, I want sorting by title, so that I can browse alphabetically.
12. As a client, I want sorting by yearFrom, so that I can browse chronologically.
13. As a client, I want ascending and descending sort order, so that I can inspect newest or oldest records first.
14. As a client, I want titleContains filtering, so that I can find Anime by partial name.
15. As a client, I want ongoing filtering, so that I can separate completed Anime from Ongoing Anime.
16. As a client, I want yearFrom range filtering, so that I can narrow results by release period.
17. As a client, I want to update an Anime, so that I can correct title or year data.
18. As a client, I want to delete an Anime, so that I can remove obsolete or incorrect records.
19. As a client, I want not-found responses for missing ids, so that I can handle missing resources correctly.
20. As a client, I want validation errors to return a clear 422 contract, so that I can correct request payloads quickly.
21. As a client, I want invalid or missing API Key requests rejected, so that protected endpoints remain secure.
22. As an operator, I want API Keys stored as hashes, so that plaintext keys are not persisted.
23. As an operator, I want API Key revocation support, so that compromised keys can be disabled.
24. As an operator, I want bootstrap keys from environment configuration, so that local and ephemeral environments can be initialized quickly.
25. As a maintainer, I want explicit SQL migrations, so that schema evolution is deterministic across environments.
26. As a maintainer, I want migration tracking, so that each migration is applied once and in order.
27. As a maintainer, I want unique constraints on Anime identity semantics, so that duplicate title/yearFrom entries are prevented.
28. As a maintainer, I want conflict responses for uniqueness violations, so that clients can resolve duplicates cleanly.
29. As a maintainer, I want API startup to run migrations before serving traffic, so that runtime schema drift is minimized.
30. As a maintainer, I want a key-generation utility, so that I can issue new API Keys without hand-rolling scripts.
31. As a tester, I want behavior-level integration tests for CRUD and auth, so that regressions are caught where users feel them.
32. As a tester, I want tests to execute against PostgreSQL, so that query and migration behavior matches production-like reality.
33. As a teammate, I want clear API documentation and examples, so that onboarding and verification are straightforward.
34. As a teammate, I want a stable response envelope for data and metadata, so that clients can parse responses consistently.
35. As a future contributor, I want domain terms to be explicit, so that Anime, Ongoing Anime, API Key, and Client semantics remain consistent.

## Implementation Decisions

- The domain model is intentionally minimal for v1: Anime is title-level only, with yearFrom required and yearTo optional.
- Ongoing Anime is a first-class semantic derived from yearTo being null.
- API style is REST over JSON with version prefix /api/v1.
- CRUD scope is limited to Anime only in v1; no Season, Episode, Studio, or Character entities are included.
- Authentication uses API Key credentials passed via x-api-key.
- API Keys are persisted in a dedicated table and stored as SHA-256 hashes.
- Revocation is supported through a revoked timestamp that makes a key non-authoritative.
- Initial bootstrap keys are seeded from environment configuration to support local/dev startup.
- Database migrations are explicit SQL files applied in lexical order, tracked in a migrations ledger table.
- Startup sequence applies migrations before serving requests to reduce mismatch between code and schema.
- Anime uniqueness is enforced by a composite uniqueness rule on title and yearFrom.
- Validation rules enforce year boundaries and yearTo >= yearFrom when yearTo is provided.
- Delete semantics are hard delete for v1.
- List endpoint supports page/pageSize, sortBy/sortOrder, and filters for titleContains, ongoing, and yearFrom range.
- Response contracts use predictable success and error envelopes with domain-relevant error codes for validation, auth, conflict, not-found, and internal errors.
- Container topology is two services: API and PostgreSQL, with dependency on database health.

## Testing Decisions

- Good tests assert externally observable behavior: HTTP status, response body contract, and persisted-state effects, rather than internal implementation details.
- The primary seam is the HTTP API boundary at /api/v1 with real middleware, validation, and database integration.
- Existing seam is preferred and sufficient: request/response behavior against the composed application instance and PostgreSQL.
- Integration tests cover the full CRUD lifecycle, API Key enforcement, and validation failures.
- Integration tests should use PostgreSQL-compatible runtime behavior so that SQL constraints and migration effects are exercised realistically.
- When container runtime is unavailable in an environment, integration setup may be skipped safely rather than failing with misleading assertion noise.
- Prior art in this codebase is behavior-driven endpoint testing with request-level assertions and real database semantics.

## Out of Scope

- Domain expansion beyond Anime (such as seasons, episodes, studios, staff, or characters).
- JWT, OAuth, user identities, or per-user ownership models.
- Soft deletes and restoration workflows.
- Advanced search (full-text relevance ranking, typo tolerance, multilingual collation).
- Multi-tenant partitioning.
- Production hardening extras such as rate limiting, distributed tracing, and advanced observability.
- CI/CD pipeline authoring and deployment platform templates.
- Admin UI for key management.

## Further Notes

- Domain glossary terms should remain canonical: Anime, Ongoing Anime, API Key, Revoked API Key, and Client.
- The preferred high seam for tests is the HTTP API boundary; adding lower-level seams should only happen when a behavior cannot be efficiently covered at this seam.
- Triage has been set to ready-for-agent so implementation follow-up can be automated without further clarification.