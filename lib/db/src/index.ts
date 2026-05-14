import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// Ruta absoluta para el contenedor o local para Windows
const pgdata = process.platform === "linux" ? "/app/pgdata" : path.resolve(process.cwd(), "pgdata");

if (!fs.existsSync(pgdata)) {
  fs.mkdirSync(pgdata, { recursive: true });
}

console.log(`[DB] Iniciando PGlite en: ${pgdata}`);
const client = new PGlite(pgdata);

export const db = drizzle(client, { schema });

export * from "./schema";
