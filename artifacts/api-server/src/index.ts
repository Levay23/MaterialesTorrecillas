import app from "./app";
import { logger } from "./lib/logger";
import { db, usersTable, runMigrations } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const seedAdmin = async () => {
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.username, "admin"));
    if (existing.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.insert(usersTable).values({
        name: "Administrador",
        username: "admin",
        password: hashedPassword,
        role: "admin",
      });
      logger.info("Default admin user created");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed admin user");
  }
};

const startServer = async () => {
  try {
    // 1. Ejecutar migraciones automáticas
    await runMigrations();

    // 2. Sembrar datos iniciales
    await seedAdmin();

    // 3. Iniciar servidor
    app.listen(port, () => {
      logger.info({ port }, "Server listening and database ready");
    });
  } catch (err) {
    logger.error({ err }, "Critical failure during startup");
    process.exit(1);
  }
};

startServer();
