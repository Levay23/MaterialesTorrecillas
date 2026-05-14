import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/src/schema/index.ts",
  out: "./lib/db/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "pgdata", // Para PGlite local, drizzle-kit a veces necesita un truco o usar la lib directamente
  },
});
