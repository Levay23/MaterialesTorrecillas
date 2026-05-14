import { pgTable, text, serial, timestamp, numeric, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

export const aiConfigTable = pgTable("ai_config", {
  id: serial("id").primaryKey(),
  apiKey: text("api_key"),
  model: text("model").notNull().default("llama3-8b-8192"),
  temperature: text("temperature").notNull().default("0.7"),
  maxTokens: integer("max_tokens").notNull().default(500),
  systemPrompt: text("system_prompt"),
  enabled: boolean("enabled").notNull().default(false),
  autoReplyEnabled: boolean("auto_reply_enabled").notNull().default(false),
  businessHoursStart: text("business_hours_start").default("07:00"),
  businessHoursEnd: text("business_hours_end").default("19:00"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const knowledgeItemsTable = pgTable("knowledge_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("general"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activityLogTable = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  entityId: integer("entity_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
