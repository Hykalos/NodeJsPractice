import crypto from "node:crypto";
import type { Pool } from "pg";
import type { NextFunction, Request, Response } from "express";

export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export async function bootstrapApiKeys(pool: Pool, rawBootstrap: string): Promise<void> {
  if (!rawBootstrap.trim()) {
    return;
  }

  const entries = rawBootstrap
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [key, ...nameParts] = entry.split(":");
      return {
        key: key.trim(),
        name: (nameParts.join(":").trim() || "Bootstrap Key")
      };
    })
    .filter((entry) => entry.key.length > 0);

  for (const entry of entries) {
    const keyHash = hashApiKey(entry.key);
    await pool.query(
      `
        INSERT INTO api_keys(name, key_hash)
        VALUES($1, $2)
        ON CONFLICT (key_hash) DO NOTHING
      `,
      [entry.name, keyHash]
    );
  }
}

export function apiKeyAuth(pool: Pool) {
  return async function apiKeyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.header("x-api-key");
    if (!apiKey) {
      res.status(401).json({ error: { code: "AUTH_REQUIRED", message: "x-api-key header is required" } });
      return;
    }

    const keyHash = hashApiKey(apiKey);
    const result = await pool.query(
      `
        SELECT id
        FROM api_keys
        WHERE key_hash = $1
          AND revoked_at IS NULL
        LIMIT 1
      `,
      [keyHash]
    );

    if (result.rowCount === 0) {
      res.status(401).json({ error: { code: "AUTH_INVALID", message: "Invalid API key" } });
      return;
    }

    next();
  };
}