import { pgTable, text, serial, timestamp, numeric, integer, boolean, real } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const crmNotesTable = pgTable("crm_notes", {
  id: serial("id").primaryKey(),
  targetType: text("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
