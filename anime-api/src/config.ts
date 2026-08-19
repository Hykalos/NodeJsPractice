import fs from "node:fs";
import path from "node:path";

function loadLocalEnvFile(): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const nodeEnv = process.env.NODE_ENV ?? "development";
  const candidates = [
    `.env.${nodeEnv}.local`,
    ".env.local",
    `.env.${nodeEnv}`,
    ".env"
  ];

  for (const fileName of candidates) {
    const envFilePath = path.resolve(process.cwd(), fileName);
    if (!fs.existsSync(envFilePath)) {
      continue;
    }

    // Use Node's built-in env loader so local scripts work without manual exports.
    process.loadEnvFile(envFilePath);
  }
}

loadLocalEnvFile();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  apiKeysBootstrap: process.env.API_KEYS_BOOTSTRAP ?? ""
};

export function getDatabaseUrl(): string {
  const value = process.env.DATABASE_URL ?? config.databaseUrl;
  if (!value) {
    throw new Error("DATABASE_URL is required");
  }
  return value;
}