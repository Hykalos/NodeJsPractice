import express, { type Request, type Response } from "express";
import type { Pool } from "pg";
import { ZodError } from "zod";
import { apiKeyAuth } from "./auth";
import { createAnimeRepository } from "./repositories/animeRepository";
import { animeCreateSchema, animeListQuerySchema, animeUpdateSchema } from "./validation";

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
  const animeRepository = createAnimeRepository(pool);
  app.use(express.json());

  app.get("/healthz", async (_req, res) => {
    try {
      await animeRepository.checkHealth();
      res.json({ status: "ok", database: "ok" });
    } catch {
      res.status(503).json({ status: "degraded", database: "unhealthy" });
    }
  });

  app.use("/api/v1", apiKeyAuth(pool));

  app.post("/api/v1/anime", async (req, res) => {
    try {
      const payload = animeCreateSchema.parse(req.body);
      const anime = await animeRepository.create(payload);

      res.status(201).json({ data: anime });
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
      const result = await animeRepository.list(query);

      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }
      throw error;
    }
  });

  app.get("/api/v1/anime/:id", async (req, res) => {
    const anime = await animeRepository.getById(req.params.id);

    if (anime == null) {
      res.status(404).json({ error: { code: "ANIME_NOT_FOUND", message: "Anime not found" } });
      return;
    }

    res.json({ data: anime });
  });

  app.put("/api/v1/anime/:id", async (req, res) => {
    try {
      const payload = animeUpdateSchema.parse(req.body);
      const anime = await animeRepository.update(req.params.id, payload);

      if (anime == null) {
        res.status(404).json({ error: { code: "ANIME_NOT_FOUND", message: "Anime not found" } });
        return;
      }

      res.json({ data: anime });
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
    const wasDeleted = await animeRepository.delete(req.params.id);
    if (!wasDeleted) {
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