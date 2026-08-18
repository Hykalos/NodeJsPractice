import { Pool } from "pg";
import { getDatabaseUrl } from "./config";

export function createPool(databaseUrl = getDatabaseUrl()): Pool {
  return new Pool({ connectionString: databaseUrl });
}