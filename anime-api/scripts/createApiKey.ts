import crypto from "node:crypto";
import { createPool } from "../src/db";
import { hashApiKey } from "../src/auth";

async function main(): Promise<void> {
  const name = process.argv[2]?.trim() || "Generated Key";
  const plainKey = crypto.randomBytes(24).toString("hex");
  const keyHash = hashApiKey(plainKey);
  const pool = createPool();

  try {
    await pool.query(
      `
        INSERT INTO api_keys(name, key_hash)
        VALUES($1, $2)
      `,
      [name, keyHash]
    );
  } finally {
    await pool.end();
  }

  process.stdout.write(`name=${name}\n`);
  process.stdout.write(`apiKey=${plainKey}\n`);
}

main().catch((error) => {
  process.stderr.write(`Failed to create API key: ${String(error)}\n`);
  process.exit(1);
});