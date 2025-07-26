import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { chatRoleEnum } from "./enums";
import { users } from "./users";

// Property search parameters type for chat context
type PropertySearchParams = {
  location?: string;
  priceRange?: { min?: number; max?: number };
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  features?: string[];
  listingType?: 'buy' | 'rent' | 'sell';
};

// CHATBOT CONVERSATIONS
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull().default('New conversation'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id),
  role: chatRoleEnum("role").notNull(),
  content: text("content").notNull(),
  searchParams: jsonb("search_params").$type<PropertySearchParams>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RELATIONS
export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [chatConversations.userId],
    references: [users.id]
  }),
  messages: many(chatMessages)
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id]
  })
}));

// Validation Schemas
export const insertChatConversationSchema = createInsertSchema(chatConversations);
export const insertChatMessageSchema = createInsertSchema(chatMessages);

// Export types
export type ChatConversation = typeof chatConversations.$inferSelect;
export type NewChatConversation = typeof chatConversations.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;