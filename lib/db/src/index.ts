import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// Ruta absoluta persistente
const pgdata = process.platform === "linux" ? "/app/pgdata" : path.resolve(process.cwd(), "pgdata");

// Asegurar limpieza si es necesario (opcional, pero ayuda si hay corrupción)
if (process.env.RESET_DB === "true" && fs.existsSync(pgdata)) {
  console.warn(`[DB] Reseteando base de datos en: ${pgdata}`);
  fs.rmSync(pgdata, { recursive: true, force: true });
}

if (!fs.existsSync(pgdata)) {
  fs.mkdirSync(pgdata, { recursive: true });
}

console.log(`[DB] Inicializando PGlite en: ${pgdata}`);
const client = new PGlite(pgdata);

export const db = drizzle(client, { schema });

// Función para ejecutar migraciones automáticamente
export const runMigrations = async () => {
  console.log("🚀 Ejecutando migraciones de Drizzle...");
  try {
    // Buscamos las migraciones en la carpeta local o del contenedor
    const migrationsFolder = path.resolve(process.cwd(), "../../lib/db/drizzle");
    
    // Si no existe la carpeta, la crearemos en el siguiente paso con drizzle-kit
    if (!fs.existsSync(migrationsFolder)) {
       console.warn("⚠️ Carpeta de migraciones no encontrada. Se recomienda usar 'drizzle-kit push' para desarrollo.");
    } else {
       await migrate(db, { migrationsFolder });
       console.log("✅ Migraciones completadas exitosamente.");
    }
  } catch (error) {
    console.error("❌ Error durante las migraciones:", error);
    throw error;
  }
};

export * from "./schema";
