import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// GOOGLE CALENDAR CREDENTIALS
export const googleCalendarCredentials = pgTable("google_calendar_credentials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  scope: text("scope"),
  tokenType: text("token_type"),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// GOOGLE CALENDAR SYNC MAPPINGS
export const googleCalendarSyncMappings = pgTable("google_calendar_sync_mappings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  propertyTourId: integer("property_tour_id"),
  googleEventId: text("google_event_id").notNull(),
  lastSynced: timestamp("last_synced").defaultNow().notNull(),
  syncStatus: text("sync_status").default("synced").notNull(), // synced, error, pending
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations will be defined in the relations.ts file to avoid circular imports

// Validation Schemas
export const insertGoogleCalendarCredentialsSchema = createInsertSchema(googleCalendarCredentials);
export const insertGoogleCalendarSyncMappingSchema = createInsertSchema(googleCalendarSyncMappings);

// Export types
export type GoogleCalendarCredentials = typeof googleCalendarCredentials.$inferSelect;
export type NewGoogleCalendarCredentials = typeof googleCalendarCredentials.$inferInsert;
export type GoogleCalendarSyncMapping = typeof googleCalendarSyncMappings.$inferSelect;
export type NewGoogleCalendarSyncMapping = typeof googleCalendarSyncMappings.$inferInsert;