# NodeJsPractice

NodeJsPractice is a hands-on TypeScript backend practice project centered on a small Anime CRUD API.

The API lives in `anime-api/` and provides authenticated REST endpoints for creating, listing, updating, and deleting anime entries stored in PostgreSQL.

## Table of Contents

- [What this project contains](#what-this-project-contains)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Domain scope (v1)](#domain-scope-v1)
- [Quick start (local development)](#quick-start-local-development)
- [Run full stack with Docker](#run-full-stack-with-docker)
- [API endpoints](#api-endpoints)
- [Migration workflow](#migration-workflow)
- [Example requests](#example-requests)
- [Running tests](#running-tests)
- [Using Insomnia](#using-insomnia)
- [Useful scripts](#useful-scripts)

## What this project contains

- Express API written in TypeScript
- PostgreSQL persistence
- SQL migrations
- API key authentication (`x-api-key` header)
- Integration tests using Vitest and Testcontainers
- Insomnia collection and local environment files for manual API testing

## Repository layout

- `anime-api/`: application code, migrations, tests, Docker setup
- `Insomnia/`: importable Insomnia collection and environment
- `docs/`: agent and project process docs

## Prerequisites

- Node.js 22+
- npm
- Docker Desktop

## Domain scope (v1)

Included:

- Anime title records only
- `title`, `yearFrom` (required), and `yearTo` (optional)
- Ongoing anime represented as `yearTo: null`
- API key authentication for protected endpoints

Out of scope:

- Seasons, episodes, studios, characters, and staff entities
- User accounts, ownership, JWT, and OAuth
- Soft deletes and restore workflows

## Quick start (local development)

Run all Node/npm commands from `anime-api/`.

1. Install dependencies:

	```bash
	cd anime-api
	npm install
	```

2. Create local environment file:

	```bash
	copy .env.example .env
	```

3. Start PostgreSQL container:

	```bash
	docker compose up -d postgres
	```

4. Run database migrations:

	```bash
	npm run migrate
	```

5. Start the API in watch mode:

	```bash
	npm run dev
	```

API is available at `http://localhost:3000`.

Health check endpoint:

- `GET /healthz`

## Run full stack with Docker

From `anime-api/`:

```bash
docker compose up --build
```

This starts both PostgreSQL and the API.

Default seeded API keys include:

- `local-dev-key-1`
- `local-dev-key-2`

## API endpoints

All `/api/v1/*` endpoints require an `x-api-key` header.

- `POST /api/v1/anime`
- `GET /api/v1/anime`
- `GET /api/v1/anime/:id`
- `PUT /api/v1/anime/:id`
- `DELETE /api/v1/anime/:id`

Example list request:

```bash
curl "http://localhost:3000/api/v1/anime" -H "x-api-key: local-dev-key-1"
```

Common headers for authenticated JSON requests:

```bash
-H "Content-Type: application/json" \
-H "x-api-key: local-dev-key-1"
```

## Migration workflow

Use these commands from `anime-api/`:

1. Apply local migrations:

	```bash
	npm run migrate
	```

2. Start API after migrations (local dev):

	```bash
	npm run dev
	```

3. Run everything in Docker (migrations are executed at API startup):

	```bash
	docker compose up --build
	```

## Example requests

Create:

```bash
curl -X POST http://localhost:3000/api/v1/anime \
  -H "Content-Type: application/json" \
  -H "x-api-key: local-dev-key-1" \
  -d '{"title":"Bleach","yearFrom":2004,"yearTo":2012}'
```

Read by id:

```bash
curl -X GET http://localhost:3000/api/v1/anime/00000000-0000-0000-0000-000000000000 \
	-H "x-api-key: local-dev-key-1"
```

List first page using endpoint defaults:

```bash
curl -X GET "http://localhost:3000/api/v1/anime" \
	-H "x-api-key: local-dev-key-1"
```

Sort by year descending and filter completed titles in a year range:

```bash
curl -X GET "http://localhost:3000/api/v1/anime?page=1&pageSize=20&sortBy=yearFrom&sortOrder=desc&ongoing=false&yearFromGte=2000&yearFromLte=2015" \
	-H "x-api-key: local-dev-key-1"
```

Find ongoing titles by partial name:

```bash
curl -X GET "http://localhost:3000/api/v1/anime?titleContains=ble&ongoing=true&sortBy=title&sortOrder=asc" \
	-H "x-api-key: local-dev-key-1"
```

Update:

```bash
curl -X PUT http://localhost:3000/api/v1/anime/00000000-0000-0000-0000-000000000000 \
	-H "Content-Type: application/json" \
	-H "x-api-key: local-dev-key-1" \
	-d '{"title":"Bleach: Thousand-Year Blood War","yearFrom":2022,"yearTo":null}'
```

Delete:

```bash
curl -X DELETE http://localhost:3000/api/v1/anime/00000000-0000-0000-0000-000000000000 \
	-H "x-api-key: local-dev-key-1"
```

## Running tests

From `anime-api/`:

- Run tests once:

  ```bash
  npm test
  ```

- Run tests in watch mode:

  ```bash
  npm run test:watch
  ```

The integration tests use Testcontainers and require Docker to be running.

## Using Insomnia

The workspace includes ready-to-import Insomnia files:

- Collection: `Insomnia/crud_operations.yaml`
- Environment: `Insomnia/local.yaml`

Setup steps:

1. Open Insomnia and import both YAML files.
2. Select the `local` environment.
3. Verify environment values:
	- `baseUrl`: `http://localhost:3000/`
	- `apiKey`: your valid API key (for local Docker defaults, use `local-dev-key-1`)
4. Run request `List anime`.

## Useful scripts

From `anime-api/`:

- `npm run dev`: start API with file watching
- `npm run build`: compile TypeScript
- `npm run start`: run compiled API
- `npm run migrate`: run migrations in local/dev mode
- `npm run create:key -- "<name>"`: generate and persist a new API key

Generate a new API key:

```bash
npm run create:key -- "CI Key"
```

The command outputs the plaintext key once and stores only its SHA-256 hash.
