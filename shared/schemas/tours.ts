import { pgTable, serial, integer, timestamp, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { tourStatusEnum } from "./enums";
import { users } from "./users";
import { properties } from "./properties";

// PROPERTY TOURS
export const propertyTours = pgTable("property_tours", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  userId: integer("user_id").notNull().references(() => users.id),
  agentId: integer("agent_id").notNull().references(() => users.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: tourStatusEnum("status").default('pending').notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations are now defined in relations.ts

// Validation Schema
export const insertPropertyTourSchema = createInsertSchema(propertyTours);

// Export types
export type PropertyTour = typeof propertyTours.$inferSelect;
export type NewPropertyTour = typeof propertyTours.$inferInsert;