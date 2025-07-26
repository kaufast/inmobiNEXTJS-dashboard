import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { messageStatusEnum, messageTypeEnum, messageFolderEnum, targetTypeEnum } from "./enums";
import { users } from "./users";
import { properties } from "./properties";

// MESSAGE THREADS
export const messageThreads = pgTable("message_threads", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  messageType: messageTypeEnum("message_type").default('direct').notNull(),
  status: messageStatusEnum("status").default('unread').notNull(),
  preview: text("preview"),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  propertyId: integer("property_id").references(() => properties.id),
  participants: jsonb("participants").$type<number[]>().default([]), // Array of user IDs
  isArchived: boolean("is_archived").default(false),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// MESSAGES
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull().references(() => messageThreads.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  messageType: messageTypeEnum("message_type").default('direct').notNull(),
  content: text("content").notNull(),
  attachments: jsonb("attachments").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// MESSAGE FOLDER ENTRIES (for tracking message status per user)
export const messageFolderEntries = pgTable("message_folder_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  threadId: integer("thread_id").notNull().references(() => messageThreads.id),
  folder: messageFolderEnum("folder").default('inbox').notNull(),
  status: messageStatusEnum("status").default('unread').notNull(),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// MESSAGE DRAFTS
export const messageDrafts = pgTable("message_drafts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  threadId: integer("thread_id").references(() => messageThreads.id),
  subject: text("subject"),
  content: text("content").notNull(),
  attachments: jsonb("attachments").$type<string[]>(),
  recipients: jsonb("recipients").$type<number[]>(), // User IDs
  lastSavedAt: timestamp("last_saved_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// MESSAGE FAVORITES
export const messageFavorites = pgTable("message_favorites", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id), // The user who marks the favorite
  targetId: integer("target_id").notNull().references(() => users.id), // The user being favorited
  targetType: targetTypeEnum("target_type").default('user').notNull(), // Type of the target (user or agent)
  lastMessageAt: timestamp("last_message_at"), // Timestamp of the last message received from this favorite
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    uniqueTarget: primaryKey({ columns: [table.ownerId, table.targetId] }), // Ensure each user-target pair is unique
  };
});

// RELATIONS
// Relations are now defined in relations.ts

// Validation Schemas
export const insertMessageThreadSchema = createInsertSchema(messageThreads);
export const insertMessageSchema = createInsertSchema(messages);
export const insertMessageFolderEntrySchema = createInsertSchema(messageFolderEntries);
export const insertMessageDraftSchema = createInsertSchema(messageDrafts);
export const insertMessageFavoriteSchema = createInsertSchema(messageFavorites);

// Export types
export type MessageThread = typeof messageThreads.$inferSelect;
export type NewMessageThread = typeof messageThreads.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type MessageFolderEntry = typeof messageFolderEntries.$inferSelect;
export type NewMessageFolderEntry = typeof messageFolderEntries.$inferInsert;
export type MessageDraft = typeof messageDrafts.$inferSelect;
export type NewMessageDraft = typeof messageDrafts.$inferInsert;
export type MessageFavorite = typeof messageFavorites.$inferSelect;
export type NewMessageFavorite = typeof messageFavorites.$inferInsert;