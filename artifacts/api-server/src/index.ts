import app from "./app";
import { logger } from "./lib/logger";
import { db, usersTable } from "@workspace/db";
import bcrypt from "bcrypt";
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
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, "admin"));
    if (existing.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.insert(usersTable).values({
        name: "Administrador",
        email: "admin",
        password: hashedPassword,
        role: "admin",
        active: true,
      });
      logger.info("Default admin user created");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed admin user");
  }
};

seedAdmin().then(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
});
