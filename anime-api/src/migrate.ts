import fs from "node:fs/promises";
import path from "node:path";
import { createPool } from "./db";

export async function runMigrations(): Promise<void> {
  const pool = createPool();

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const migrationsDir = path.resolve(process.cwd(), "migrations");
    const files = (await fs.readdir(migrationsDir))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    const applied = await pool.query("SELECT filename FROM schema_migrations");
    const appliedSet = new Set(applied.rows.map((row) => row.filename as string));

    for (const file of files) {
      if (appliedSet.has(file)) {
        continue;
      }

      const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
      await pool.query("BEGIN");
      try {
        await pool.query(sql);
        await pool.query("INSERT INTO schema_migrations(filename) VALUES($1)", [file]);
        await pool.query("COMMIT");
      } catch (error) {
        await pool.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      process.stdout.write("Migrations completed\n");
    })
    .catch((error) => {
      process.stderr.write(`Migration failed: ${String(error)}\n`);
      process.exit(1);
    });
}