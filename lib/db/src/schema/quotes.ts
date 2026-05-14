import { pgTable, text, serial, timestamp, numeric, integer, boolean, real } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const quotesTable = pgTable("quotes", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id"),
  total: text("total").notNull(),
  status: text("status").notNull().default("pending"),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
