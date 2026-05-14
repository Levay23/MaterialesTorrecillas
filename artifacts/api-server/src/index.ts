import app from "./app";
import { logger } from "./lib/logger";
import { db, usersTable, runMigrations, knowledgeItemsTable } from "@workspace/db";
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

const seedKnowledgeBase = async () => {
  try {
    const existing = await db.select().from(knowledgeItemsTable).limit(1);
    if (existing.length === 0) {
      const items = [
        { title: "Cemento Cruz Azul (50kg)", content: "Cemento gris de alta calidad para construcción general. Precio: $210.00 MXN por bulto.", category: "Materiales" },
        { title: "Varilla 3/8 (12m)", content: "Varilla corrugada de acero para refuerzo de concreto. Precio: $185.00 MXN por pieza.", category: "Acero" },
        { title: "Pintura Vinílica Blanca (19L)", content: "Pintura de alta cobertura para interiores y exteriores. Precio: $1,450.00 MXN por cubeta.", category: "Pinturas" },
        { title: "Martillo de Uña Real Steel", content: "Martillo profesional de acero forjado con mango ergonómico. Precio: $320.00 MXN.", category: "Herramientas" },
        { title: "Taladro Rotomartillo 1/2", content: "Taladro potente para concreto y madera. Marca DeWalt. Precio: $2,800.00 MXN.", category: "Herramientas Eléctricas" },
        { title: "Malla Electrosoldada (6-6/10-10)", content: "Rollo de malla para refuerzo de pisos y banquetas. Precio: $1,200.00 MXN.", category: "Acero" },
        { title: "Cal Hidratada (25kg)", content: "Cal para acabados y mezclas de albañilería. Precio: $85.00 MXN bulto.", category: "Materiales" },
      ];
      await db.insert(knowledgeItemsTable).values(items);
      logger.info("Knowledge base seeded with hardware products");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed knowledge base");
  }
};

const startServer = async () => {
  try {
    // 1. Ejecutar migraciones automáticas
    await runMigrations();

    // 2. Sembrar datos iniciales
    await seedAdmin();
    await seedKnowledgeBase();

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
