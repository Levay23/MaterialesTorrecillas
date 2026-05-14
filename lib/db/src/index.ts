import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// Detectar si estamos en Docker (Hugging Face)
const isDocker = fs.existsSync("/.dockerenv") || fs.existsSync("/app");
const pgdata = isDocker ? "/app/pgdata" : path.resolve(process.cwd(), "pgdata");

console.log(`[DB] Using pgdata path: ${pgdata}`);
if (isDocker && !fs.existsSync(pgdata)) {
  fs.mkdirSync(pgdata, { recursive: true });
}

const client = new PGlite(pgdata);

export const db = drizzle(client, { schema });

export * from "./schema";
