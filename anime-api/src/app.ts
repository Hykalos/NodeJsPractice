import express, { type Request, type Response } from "express";
import type { Pool } from "pg";
import { ZodError } from "zod";
import { apiKeyAuth } from "./auth";
import { animeCreateSchema, animeListQuerySchema, animeUpdateSchema } from "./validation";

type AnimeRow = {
  id: string;
  title: string;
  year_from: number;
  year_to: number | null;
  created_at: string;
  updated_at: string;
};

function mapAnime(row: AnimeRow) {
  return {
    id: row.id,
    title: row.title,
    yearFrom: row.year_from,
    yearTo: row.year_to,
    ongoing: row.year_to == null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function handleZodError(res: Response, error: ZodError): void {
  res.status(422).json({
    error: {
      code: "VALIDATION_ERROR",
      message: "Request validation failed",
      details: error.issues
    }
  });
}

export function createApp(pool: Pool) {
  const app = express();
  app.use(express.json());

  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/v1", apiKeyAuth(pool));

  app.post("/api/v1/anime", async (req, res) => {
    try {
      const payload = animeCreateSchema.parse(req.body);
      const result = await pool.query<AnimeRow>(
        `
          INSERT INTO anime(title, year_from, year_to)
          VALUES ($1, $2, $3)
          RETURNING id, title, year_from, year_to, created_at, updated_at
        `,
        [payload.title, payload.yearFrom, payload.yearTo ?? null]
      );

      res.status(201).json({ data: mapAnime(result.rows[0]) });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }
      if ((error as { code?: string }).code === "23505") {
        res.status(409).json({ error: { code: "ANIME_CONFLICT", message: "Anime already exists for title/yearFrom" } });
        return;
      }
      throw error;
    }
  });

  app.get("/api/v1/anime", async (req, res) => {
    try {
      const query = animeListQuerySchema.parse(req.query);

      const filters: string[] = [];
      const values: Array<string | number | boolean> = [];

      if (query.titleContains) {
        values.push(`%${query.titleContains}%`);
        filters.push(`title ILIKE $${values.length}`);
      }
      if (query.ongoing === "true") {
        filters.push("year_to IS NULL");
      }
      if (query.ongoing === "false") {
        filters.push("year_to IS NOT NULL");
      }
      if (query.yearFromGte != null) {
        values.push(query.yearFromGte);
        filters.push(`year_from >= $${values.length}`);
      }
      if (query.yearFromLte != null) {
        values.push(query.yearFromLte);
        filters.push(`year_from <= $${values.length}`);
      }

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
      const offset = (query.page - 1) * query.pageSize;
      const orderBy = query.sortBy === "yearFrom" ? "year_from" : "title";
      const orderDirection = query.sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

      values.push(query.pageSize);
      values.push(offset);

      const listSql = `
        SELECT id, title, year_from, year_to, created_at, updated_at
        FROM anime
        ${whereClause}
        ORDER BY ${orderBy} ${orderDirection}
        LIMIT $${values.length - 1}
        OFFSET $${values.length}
      `;

      const countSql = `SELECT COUNT(*)::INT AS total FROM anime ${whereClause}`;

      const [listResult, countResult] = await Promise.all([
        pool.query<AnimeRow>(listSql, values),
        pool.query<{ total: number }>(countSql, values.slice(0, values.length - 2))
      ]);

      res.json({
        data: listResult.rows.map(mapAnime),
        meta: {
          page: query.page,
          pageSize: query.pageSize,
          total: countResult.rows[0].total
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }
      throw error;
    }
  });

  app.get("/api/v1/anime/:id", async (req, res) => {
    const result = await pool.query<AnimeRow>(
      `
        SELECT id, title, year_from, year_to, created_at, updated_at
        FROM anime
        WHERE id = $1
      `,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: { code: "ANIME_NOT_FOUND", message: "Anime not found" } });
      return;
    }

    res.json({ data: mapAnime(result.rows[0]) });
  });

  app.put("/api/v1/anime/:id", async (req, res) => {
    try {
      const payload = animeUpdateSchema.parse(req.body);
      const result = await pool.query<AnimeRow>(
        `
          UPDATE anime
          SET title = $1,
              year_from = $2,
              year_to = $3,
              updated_at = NOW()
          WHERE id = $4
          RETURNING id, title, year_from, year_to, created_at, updated_at
        `,
        [payload.title, payload.yearFrom, payload.yearTo ?? null, req.params.id]
      );

      if (result.rowCount === 0) {
        res.status(404).json({ error: { code: "ANIME_NOT_FOUND", message: "Anime not found" } });
        return;
      }

      res.json({ data: mapAnime(result.rows[0]) });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }
      if ((error as { code?: string }).code === "23505") {
        res.status(409).json({ error: { code: "ANIME_CONFLICT", message: "Anime already exists for title/yearFrom" } });
        return;
      }
      throw error;
    }
  });

  app.delete("/api/v1/anime/:id", async (req, res) => {
    const result = await pool.query("DELETE FROM anime WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: { code: "ANIME_NOT_FOUND", message: "Anime not found" } });
      return;
    }
    res.status(204).send();
  });

  app.use((error: unknown, _req: Request, res: Response, _next: unknown) => {
    process.stderr.write(`Unexpected error: ${String(error)}\n`);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred"
      }
    });
  });

  return app;
}