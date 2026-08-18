import { createApp } from "./app";
import { bootstrapApiKeys } from "./auth";
import { config } from "./config";
import { createPool } from "./db";

async function main(): Promise<void> {
  const pool = createPool();
  await bootstrapApiKeys(pool, config.apiKeysBootstrap);

  const app = createApp(pool);
  const server = app.listen(config.port, () => {
    process.stdout.write(`anime-api listening on port ${config.port}\n`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  process.stderr.write(`Startup failed: ${String(error)}\n`);
  process.exit(1);
});