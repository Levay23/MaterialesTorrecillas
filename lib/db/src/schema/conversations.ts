import { pgTable, text, serial, timestamp, numeric, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

export const conversationsTable = pgTable("conversations", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name"),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  unreadCount: integer("unread_count").notNull().default(0),
  status: text("status").notNull().default("open"), // 'open', 'closed', 'archived'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversationsTable.id),
  content: text("content").notNull(),
  fromMe: boolean("from_me").notNull().default(false),
  status: text("status").notNull().default("sent"), // 'sent', 'delivered', 'read', 'received'
  messageType: text("message_type").notNull().default("text"), // 'text', 'image', 'document'
  mediaUrl: text("media_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
