import { defineConfig } from "drizzle-kit";
import path from "path";

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql", // Drizzle Kit uses postgresql dialect for PGLite
  dbCredentials: {
    url: "pgdata", // Path to PGLite data directory
  },
});
