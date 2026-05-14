import { pgTable, text, serial, timestamp, numeric, integer, boolean, real } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const purchasesTable = pgTable("purchases", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id"),
  total: text("total").notNull(),
  status: text("status").notNull().default("received"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
