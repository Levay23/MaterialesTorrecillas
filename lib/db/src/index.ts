import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// En Hugging Face, /tmp es siempre escribible y seguro
const pgdata = process.platform === "linux" ? "/tmp/pgdata" : path.resolve(process.cwd(), "pgdata");

if (!fs.existsSync(pgdata)) {
  fs.mkdirSync(pgdata, { recursive: true });
}

console.log(`[DB] Iniciando PGlite en: ${pgdata}`);
const client = new PGlite(pgdata);

export const db = drizzle(client, { schema });

export * from "./schema";
