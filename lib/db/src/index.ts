import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";

// PRUEBA DE DIAGNÓSTICO: Correr 100% en memoria para descartar problemas de archivos
console.log("[DB] Iniciando PGlite en modo MEMORIA (Diagnóstico)");
const client = new PGlite(); 

export const db = drizzle(client, { schema });

export * from "./schema";
