# Anime API

Node.js + TypeScript CRUD API for anime titles, running with Docker and PostgreSQL.

## Domain scope (v1)

- Anime title
- `yearFrom` (required)
- `yearTo` (optional; null means ongoing)

## Requirements

- Node.js 22+
- Docker Desktop

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start PostgreSQL via Docker:

   ```bash
   docker compose up -d postgres
   ```

3. Copy env values and adjust if needed:

   ```bash
   copy .env.example .env
   ```

4. Run migrations:

   ```bash
   npm run migrate
   ```

5. Start API:

   ```bash
   npm run dev
   ```

## Run full stack in Docker

```bash
docker compose up --build
```

Default seeded API keys:

- `local-dev-key-1`
- `local-dev-key-2`

## API endpoints

- `POST /api/v1/anime`
- `GET /api/v1/anime`
- `GET /api/v1/anime/:id`
- `PUT /api/v1/anime/:id`
- `DELETE /api/v1/anime/:id`

All `/api/v1/*` endpoints require `x-api-key` header.

## Example create request

```bash
curl -X POST http://localhost:3000/api/v1/anime \
  -H "Content-Type: application/json" \
  -H "x-api-key: local-dev-key-1" \
  -d '{"title":"Bleach","yearFrom":2004,"yearTo":2012}'
```

## Filtering and pagination example

```bash
curl "http://localhost:3000/api/v1/anime?page=1&pageSize=20&sortBy=yearFrom&sortOrder=desc&ongoing=false&titleContains=ble"
```

## Generate a new API key

```bash
npm run create:key -- "CI Key"
```

The command outputs the plaintext key once and stores only its SHA-256 hash.

## Testing

Integration tests run against a real PostgreSQL container:

```bash
npm test
```