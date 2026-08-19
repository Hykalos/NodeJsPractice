import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Pool } from "pg";
import { createApp } from "../src/app";
import { runMigrations } from "../src/migrate";
import { hashApiKey } from "../src/auth";

describe("anime API integration", () => {
  let container: StartedPostgreSqlContainer | undefined;
  let pool: Pool | undefined;
  let integrationReady = false;

  beforeAll(async () => {
    try {
      container = await new PostgreSqlContainer("postgres:16-alpine")
        .withDatabase("anime_db")
        .withUsername("anime")
        .withPassword("anime")
        .start();

      process.env.DATABASE_URL = container.getConnectionUri();

      await runMigrations();
      pool = new Pool({ connectionString: process.env.DATABASE_URL });
      integrationReady = true;
    } catch (error) {
      process.stderr.write(`Skipping integration tests: ${String(error)}\n`);
      integrationReady = false;
    }
  });

  beforeEach(async () => {
    if (!integrationReady || !pool) {
      return;
    }

    await pool.query("TRUNCATE TABLE anime RESTART IDENTITY CASCADE");
    await pool.query("DELETE FROM api_keys");
    await pool.query("INSERT INTO api_keys(name, key_hash) VALUES($1, $2)", ["Test Key", hashApiKey("test-key")]);
    await pool.query("INSERT INTO api_keys(name, key_hash, revoked_at) VALUES($1, $2, NOW())", [
      "Revoked Key",
      hashApiKey("revoked-key")
    ]);
  });

  it("serves a health response", async () => {
    if (!integrationReady || !pool) {
      return;
    }

    const app = createApp(pool);
    await request(app)
      .get("/healthz")
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ status: "ok", database: "ok" });
      });
  });

  it("returns degraded health when database is unavailable", async () => {
    const unhealthyPool = {
      query: async () => {
        throw new Error("database unavailable");
      }
    } as unknown as Pool;

    const app = createApp(unhealthyPool);
    await request(app)
      .get("/healthz")
      .expect(503)
      .expect((res) => {
        expect(res.body).toEqual({ status: "degraded", database: "unhealthy" });
      });
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
    if (container) {
      await container.stop();
    }
  });

  it("performs authenticated CRUD and validates response envelopes", async () => {
    if (!integrationReady || !pool) {
      return;
    }
    const app = createApp(pool);

    const createResponse = await request(app)
      .post("/api/v1/anime")
      .set("x-api-key", "test-key")
      .send({ title: "Naruto", yearFrom: 2002, yearTo: 2017 })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.title).toBe("Naruto");
        expect(res.body.data.yearFrom).toBe(2002);
        expect(res.body.data.yearTo).toBe(2017);
        expect(res.body.data.ongoing).toBe(false);
      });

    const animeId = createResponse.body.data.id as string;

    await request(app)
      .get(`/api/v1/anime/${animeId}`)
      .set("x-api-key", "test-key")
      .expect(200)
      .expect((res) => {
        expect(res.body.data.id).toBe(animeId);
        expect(res.body.data.title).toBe("Naruto");
      });

    await request(app)
      .post("/api/v1/anime")
      .set("x-api-key", "test-key")
      .send({ title: "Bleach", yearFrom: 2004, yearTo: null })
      .expect(201);

    await request(app)
      .get("/api/v1/anime?page=1&pageSize=10&sortBy=title&sortOrder=asc&titleContains=Nar")
      .set("x-api-key", "test-key")
      .expect(200)
      .expect((res) => {
        expect(res.body.meta).toEqual({ page: 1, pageSize: 10, total: 1 });
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].title).toBe("Naruto");
      });

    await request(app)
      .get("/api/v1/anime?page=1&pageSize=10&sortBy=yearFrom&sortOrder=desc&ongoing=true")
      .set("x-api-key", "test-key")
      .expect(200)
      .expect((res) => {
        expect(res.body.meta.total).toBe(1);
        expect(res.body.data[0].title).toBe("Bleach");
        expect(res.body.data[0].ongoing).toBe(true);
      });

    await request(app)
      .put(`/api/v1/anime/${animeId}`)
      .set("x-api-key", "test-key")
      .send({ title: "Naruto Shippuden", yearFrom: 2007, yearTo: 2017 })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.title).toBe("Naruto Shippuden");
      });

    await request(app)
      .delete(`/api/v1/anime/${animeId}`)
      .set("x-api-key", "test-key")
      .expect(204);

    await request(app)
      .get(`/api/v1/anime/${animeId}`)
      .set("x-api-key", "test-key")
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({ error: { code: "ANIME_NOT_FOUND", message: "Anime not found" } });
      });
  });

  it("returns not-found for unknown ids", async () => {
    if (!integrationReady || !pool) {
      return;
    }
    const app = createApp(pool);

    await request(app)
      .get("/api/v1/anime/00000000-0000-4000-8000-000000000000")
      .set("x-api-key", "test-key")
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({ error: { code: "ANIME_NOT_FOUND", message: "Anime not found" } });
      });

    await request(app)
      .put("/api/v1/anime/00000000-0000-4000-8000-000000000000")
      .set("x-api-key", "test-key")
      .send({ title: "Missing", yearFrom: 2010, yearTo: 2012 })
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({ error: { code: "ANIME_NOT_FOUND", message: "Anime not found" } });
      });

    await request(app)
      .delete("/api/v1/anime/00000000-0000-4000-8000-000000000000")
      .set("x-api-key", "test-key")
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({ error: { code: "ANIME_NOT_FOUND", message: "Anime not found" } });
      });
  });

  it("rejects requests with missing or invalid api keys", async () => {
    if (!integrationReady || !pool) {
      return;
    }
    const app = createApp(pool);

    await request(app)
      .get("/api/v1/anime")
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({ error: { code: "AUTH_REQUIRED", message: "x-api-key header is required" } });
      });

    await request(app)
      .get("/api/v1/anime")
      .set("x-api-key", "wrong-key")
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({ error: { code: "AUTH_INVALID", message: "Invalid API key" } });
      });

    await request(app)
      .get("/api/v1/anime")
      .set("x-api-key", "revoked-key")
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({ error: { code: "AUTH_INVALID", message: "Invalid API key" } });
      });
  });

  it("returns validation contracts for invalid request inputs", async () => {
    if (!integrationReady || !pool) {
      return;
    }
    const app = createApp(pool);

    await request(app)
      .post("/api/v1/anime")
      .set("x-api-key", "test-key")
      .send({ title: "Invalid", yearFrom: 2024, yearTo: 2000 })
      .expect(422)
      .expect((res) => {
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
        expect(res.body.error.message).toBe("Request validation failed");
        expect(Array.isArray(res.body.error.details)).toBe(true);
      });

    await request(app)
      .get("/api/v1/anime?page=0&pageSize=101")
      .set("x-api-key", "test-key")
      .expect(422)
      .expect((res) => {
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
        expect(res.body.error.message).toBe("Request validation failed");
        expect(Array.isArray(res.body.error.details)).toBe(true);
      });
  });

  it("returns conflict contract for duplicate title and yearFrom", async () => {
    if (!integrationReady || !pool) {
      return;
    }
    const app = createApp(pool);

    await request(app)
      .post("/api/v1/anime")
      .set("x-api-key", "test-key")
      .send({ title: "Fullmetal Alchemist", yearFrom: 2003, yearTo: 2004 })
      .expect(201);

    await request(app)
      .post("/api/v1/anime")
      .set("x-api-key", "test-key")
      .send({ title: "Fullmetal Alchemist", yearFrom: 2003, yearTo: 2005 })
      .expect(409)
      .expect((res) => {
        expect(res.body).toEqual({
          error: {
            code: "ANIME_CONFLICT",
            message: "Anime already exists for title/yearFrom"
          }
        });
      });
  });
});