# NodeJsPractice

NodeJsPractice is a hands-on TypeScript backend practice project centered on a small Anime CRUD API.

The API lives in `anime-api/` and provides authenticated REST endpoints for creating, listing, updating, and deleting anime entries stored in PostgreSQL.

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
4. Run request `Get all animes`.

## Useful scripts

From `anime-api/`:

- `npm run dev`: start API with file watching
- `npm run build`: compile TypeScript
- `npm run start`: run compiled API
- `npm run migrate`: run migrations in local/dev mode
- `npm run create:key -- "<name>"`: generate and persist a new API key
