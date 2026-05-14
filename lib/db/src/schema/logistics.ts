import { pgTable, text, serial, timestamp, numeric, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

export const shipmentsTable = pgTable("shipments", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id"),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  carrier: text("carrier"),
  trackingNumber: text("tracking_number"),
  destinationAddress: text("destination_address"),
  deliveryDate: timestamp("delivery_date", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertShipmentSchema = createInsertSchema(shipmentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type Shipment = typeof shipmentsTable.$inferSelect;
