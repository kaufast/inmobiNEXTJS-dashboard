import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// AGENCIES TABLE
export const agencies = pgTable("agencies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country").default('USA'),
  website: text("website"),
  logo: text("logo"),
  description: text("description"),
  licenseNumber: text("license_number"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Validation Schemas
export const insertAgencySchema = createInsertSchema(agencies);
export const selectAgencySchema = createInsertSchema(agencies);

// Custom validation schemas for API
export const createAgencySchema = insertAgencySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAgencySchema = createAgencySchema.partial();

// Export types
export type Agency = typeof agencies.$inferSelect;
export type NewAgency = typeof agencies.$inferInsert;