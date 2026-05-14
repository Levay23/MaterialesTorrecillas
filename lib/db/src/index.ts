import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import path from "path";

const pgdata = path.resolve(process.cwd(), "pgdata");
const client = new PGlite(pgdata);

export const db = drizzle(client, { schema });

export * from "./schema";
