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