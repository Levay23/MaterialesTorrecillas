import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import path from "path";
import { fileURLToPath } from "url";

const pgdata = path.resolve(process.env["PGDATA_PATH"] || "pgdata");
const client = new PGlite(pgdata);

export const db = drizzle(client, { schema });

export * from "./schema";
