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

The API container runs migrations on startup before serving traffic.

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

## Example create request

```bash
curl -X POST http://localhost:3000/api/v1/anime \
  -H "Content-Type: application/json" \
  -H "x-api-key: local-dev-key-1" \
  -d '{"title":"Bleach","yearFrom":2004,"yearTo":2012}'
```

## Example read by id request

```bash
curl -X GET http://localhost:3000/api/v1/anime/1 \
   -H "x-api-key: local-dev-key-1"
```

## Example list requests

List first page with defaults:

```bash
curl -X GET "http://localhost:3000/api/v1/anime?page=1&pageSize=10" \
   -H "x-api-key: local-dev-key-1"
```

Sort chronologically descending and filter for completed titles from a year range:

```bash
curl -X GET "http://localhost:3000/api/v1/anime?page=1&pageSize=20&sortBy=yearFrom&sortOrder=desc&ongoing=false&yearFromMin=2000&yearFromMax=2015" \
   -H "x-api-key: local-dev-key-1"
```

Find ongoing titles by partial name:

```bash
curl -X GET "http://localhost:3000/api/v1/anime?titleContains=ble&ongoing=true&sortBy=title&sortOrder=asc" \
   -H "x-api-key: local-dev-key-1"
```

## Example update request

```bash
curl -X PUT http://localhost:3000/api/v1/anime/1 \
   -H "Content-Type: application/json" \
   -H "x-api-key: local-dev-key-1" \
   -d '{"title":"Bleach: Thousand-Year Blood War","yearFrom":2022,"yearTo":null}'
```

## Example delete request

```bash
curl -X DELETE http://localhost:3000/api/v1/anime/1 \
   -H "x-api-key: local-dev-key-1"
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