import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { userRoleEnum, subscriptionTierEnum, verificationTypeEnum } from "./enums";
import { agencies } from "./agencies";

// USERS TABLE
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").default('user').notNull(),
  subscriptionTier: subscriptionTierEnum("subscription_tier").default('free').notNull(),
  preferredLanguage: text("preferred_language").default('en'),
  avatar: text("avatar"),
  phone: text("phone"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  googleId: text("google_id"),
  passkeyCredentials: text("passkey_credentials"), // JSON string of credential objects
  hasUsedFreeUpload: boolean("has_used_free_upload").default(false),
  isVerified: boolean("is_verified").default(false),
  verificationType: verificationTypeEnum("verification_type"),
  verificationMethod: text("verification_method"), // 'didit' or 'manual'
  verifiedAt: timestamp("verified_at"),
  // verifiedById: integer("verified_by_id").references(() => users.id), // Admin who manually approved - Disabled to fix circular reference
  agencyId: integer("agency_id").references(() => agencies.id), // Agency association for agency_admin and agency_agent roles
  // Email preferences
  messageNotifications: boolean("message_notifications").default(true),
  propertyInquiries: boolean("property_inquiries").default(true),
  systemNotifications: boolean("system_notifications").default(true),
  emailOptOut: boolean("email_opt_out").default(false),
  emailFrequency: text("email_frequency").default('immediate'), // 'immediate', 'daily', 'weekly'
  // 2FA settings
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"), // Encrypted in production
  // status: text("status").default('active'), // active, suspended, inactive, deleted (soft delete) - temporarily disabled
  // deletedAt: timestamp("deleted_at"), // When user was soft deleted - temporarily disabled
  // deletedBy: integer("deleted_by").references(() => users.id), // Admin who deleted the user - temporarily disabled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// SUBSCRIPTIONS TABLE
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull(), // active, canceled, past_due, etc.
  tier: subscriptionTierEnum("tier").notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations are now defined in relations.ts

// Validation Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

// PRIVACY CONSENTS TABLE
export const consents = pgTable("consents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  consentId: text("consent_id").notNull(),
  categories: jsonb("categories").$type<{
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  }>().notNull(),
  services: jsonb("services").$type<Record<string, boolean>>().notNull(),
  hasConsent: boolean("has_consent").notNull(),
  shouldCollectConsent: boolean("should_collect_consent").notNull(),
  isEU: boolean("is_eu").notNull(),
  source: text("source").notNull(), // 'web' or 'mobile'
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations are now defined in relations.ts

// Export consent types
export type Consent = typeof consents.$inferSelect;
export type NewConsent = typeof consents.$inferInsert;

// Relations are now defined in relations.ts