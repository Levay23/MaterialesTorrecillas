import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import path from "path";
import { fileURLToPath } from "url";

// Usar ruta absoluta desde la ubicación del archivo, no process.cwd()
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pgdata = path.resolve(__dirname, "..", "..", "..", "pgdata");
const client = new PGlite(pgdata);

export const db = drizzle(client, { schema });

export * from "./schema";
