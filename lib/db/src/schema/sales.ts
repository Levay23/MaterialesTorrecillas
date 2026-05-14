import { pgTable, text, serial, timestamp, numeric, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";
import { customersTable } from "./customers";

export const salesTable = pgTable("sales", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customersTable.id),
  subtotal: text("subtotal").notNull(),
  discount: text("discount").default("0"),
  tax: text("tax").default("0"),
  total: text("total").notNull(),
  paymentMethod: text("payment_method").notNull().default("cash"),
  status: text("status").notNull().default("completed"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const saleItemsTable = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").references(() => salesTable.id),
  productId: integer("product_id"),
  quantity: text("quantity").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  total: text("total").notNull(),
});

export const insertSaleSchema = createInsertSchema(salesTable).omit({ id: true, createdAt: true });
export type Sale = typeof salesTable.$inferSelect;
