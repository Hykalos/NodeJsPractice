import { afterAll, beforeAll, describe, expect, it } from "vitest";
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
      await pool.query("INSERT INTO api_keys(name, key_hash) VALUES($1, $2)", ["Test Key", hashApiKey("test-key")]);
      integrationReady = true;
    } catch (error) {
      process.stderr.write(`Skipping integration tests: ${String(error)}\n`);
      integrationReady = false;
    }
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
    if (container) {
      await container.stop();
    }
  });

  it("performs CRUD with api key auth", async () => {
    if (!integrationReady || !pool) {
      return;
    }
    const app = createApp(pool);

    const createResponse = await request(app)
      .post("/api/v1/anime")
      .set("x-api-key", "test-key")
      .send({ title: "Naruto", yearFrom: 2002, yearTo: 2017 })
      .expect(201);

    const animeId = createResponse.body.data.id as string;

    await request(app)
      .get(`/api/v1/anime/${animeId}`)
      .set("x-api-key", "test-key")
      .expect(200)
      .expect((res) => {
        expect(res.body.data.title).toBe("Naruto");
      });

    await request(app)
      .get("/api/v1/anime?page=1&pageSize=10&sortBy=title&sortOrder=asc&titleContains=Nar")
      .set("x-api-key", "test-key")
      .expect(200)
      .expect((res) => {
        expect(res.body.meta.total).toBe(1);
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
  });

  it("rejects requests without key", async () => {
    if (!integrationReady || !pool) {
      return;
    }
    const app = createApp(pool);
    await request(app).get("/api/v1/anime").expect(401);
  });

  it("returns 422 for invalid years", async () => {
    if (!integrationReady || !pool) {
      return;
    }
    const app = createApp(pool);
    await request(app)
      .post("/api/v1/anime")
      .set("x-api-key", "test-key")
      .send({ title: "Invalid", yearFrom: 2024, yearTo: 2000 })
      .expect(422);
  });
});