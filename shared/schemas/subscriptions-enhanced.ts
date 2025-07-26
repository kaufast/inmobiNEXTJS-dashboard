import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";
import { subscriptionTierEnum } from "./enums";

// Enhanced Subscriptions Table with Trials and Discounts
export const subscriptionsEnhanced = pgTable("subscriptions_enhanced", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCouponId: text("stripe_coupon_id"), // Stripe coupon for discounts
  status: text("status").notNull(), // active, canceled, past_due, trialing, etc.
  tier: subscriptionTierEnum("tier").notNull(),
  
  // Trial Management
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  trialDays: integer("trial_days"), // Number of trial days
  isTrialActive: boolean("is_trial_active").default(false),
  trialCreatedBy: integer("trial_created_by").references(() => users.id), // Admin who created trial
  trialReason: text("trial_reason"), // Reason for trial (e.g., "New customer promotion")
  
  // Discount Management
  discountType: text("discount_type"), // 'percentage', 'fixed_amount', 'custom'
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }), // Discount amount or percentage
  discountDescription: text("discount_description"), // Human readable description
  discountDuration: text("discount_duration"), // 'once', 'repeating', 'forever'
  discountDurationInMonths: integer("discount_duration_in_months"), // For repeating discounts
  discountStart: timestamp("discount_start"),
  discountEnd: timestamp("discount_end"),
  discountCreatedBy: integer("discount_created_by").references(() => users.id), // Admin who created discount
  discountReason: text("discount_reason"), // Reason for discount
  
  // Subscription Periods
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  
  // Pricing Information
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }), // Original subscription price
  discountedPrice: decimal("discounted_price", { precision: 10, scale: 2 }), // Price after discount
  currency: text("currency").default('USD'),
  
  // Metadata
  metadata: json("metadata"), // Additional subscription data
  notes: text("notes"), // Admin notes about the subscription
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Discount Coupons Table - For reusable discount templates
export const discountCoupons = pgTable("discount_coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // Coupon code (e.g., "SUMMER2024")
  name: text("name").notNull(), // Display name
  description: text("description"),
  
  // Discount Configuration
  discountType: text("discount_type").notNull(), // 'percentage', 'fixed_amount'
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default('USD'),
  
  // Usage Limits
  maxRedemptions: integer("max_redemptions"), // null = unlimited
  timesRedeemed: integer("times_redeemed").default(0),
  maxRedemptionsPerUser: integer("max_redemptions_per_user").default(1),
  
  // Validity Period
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  
  // Applicable Plans
  applicableTiers: json("applicable_tiers"), // Array of subscription tiers this applies to
  
  // Status
  isActive: boolean("is_active").default(true),
  
  // Admin Info
  createdBy: integer("created_by").references(() => users.id).notNull(),
  notes: text("notes"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Trial Templates Table - For standardized trial offers
export const trialTemplates = pgTable("trial_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "New User 14-Day Trial"
  description: text("description"),
  
  // Trial Configuration
  trialDays: integer("trial_days").notNull(),
  applicableTiers: json("applicable_tiers"), // Array of tiers this trial applies to
  
  // Conditions
  userRoleRequirements: json("user_role_requirements"), // Array of roles eligible
  isNewUsersOnly: boolean("is_new_users_only").default(true),
  requiresApproval: boolean("requires_approval").default(false),
  
  // Usage Limits
  maxUsages: integer("max_usage"), // null = unlimited
  timesUsed: integer("times_used").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  
  // Admin Info
  createdBy: integer("created_by").references(() => users.id).notNull(),
  notes: text("notes"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Subscription History Table - Track all subscription changes
export const subscriptionHistory = pgTable("subscription_history", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").references(() => subscriptionsEnhanced.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Change Details
  action: text("action").notNull(), // 'created', 'trial_started', 'trial_ended', 'discount_applied', 'upgraded', 'downgraded', 'canceled'
  fromTier: subscriptionTierEnum("from_tier"),
  toTier: subscriptionTierEnum("to_tier"),
  
  // Financial Details
  previousPrice: decimal("previous_price", { precision: 10, scale: 2 }),
  newPrice: decimal("new_price", { precision: 10, scale: 2 }),
  discountApplied: decimal("discount_applied", { precision: 10, scale: 2 }),
  
  // Trial/Discount Info
  trialDaysGranted: integer("trial_days_granted"),
  discountCode: text("discount_code"),
  
  // Admin Info
  performedBy: integer("performed_by").references(() => users.id), // Admin who made the change
  reason: text("reason"),
  notes: text("notes"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Discount Usage Table - Track individual user discount usage
export const userDiscountUsage = pgTable("user_discount_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  couponId: integer("coupon_id").references(() => discountCoupons.id).notNull(),
  subscriptionId: integer("subscription_id").references(() => subscriptionsEnhanced.id),
  
  // Usage Details
  usedAt: timestamp("used_at").defaultNow().notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }),
  
  // Status
  isActive: boolean("is_active").default(true), // false if discount was removed/expired
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const subscriptionsEnhancedRelations = relations(subscriptionsEnhanced, ({ one, many }) => ({
  user: one(users, { fields: [subscriptionsEnhanced.userId], references: [users.id] }),
  trialCreator: one(users, { fields: [subscriptionsEnhanced.trialCreatedBy], references: [users.id] }),
  discountCreator: one(users, { fields: [subscriptionsEnhanced.discountCreatedBy], references: [users.id] }),
  history: many(subscriptionHistory),
}));

export const discountCouponsRelations = relations(discountCoupons, ({ one, many }) => ({
  creator: one(users, { fields: [discountCoupons.createdBy], references: [users.id] }),
  usages: many(userDiscountUsage),
}));

export const trialTemplatesRelations = relations(trialTemplates, ({ one }) => ({
  creator: one(users, { fields: [trialTemplates.createdBy], references: [users.id] }),
}));

export const subscriptionHistoryRelations = relations(subscriptionHistory, ({ one }) => ({
  subscription: one(subscriptionsEnhanced, { fields: [subscriptionHistory.subscriptionId], references: [subscriptionsEnhanced.id] }),
  user: one(users, { fields: [subscriptionHistory.userId], references: [users.id] }),
  performer: one(users, { fields: [subscriptionHistory.performedBy], references: [users.id] }),
}));

export const userDiscountUsageRelations = relations(userDiscountUsage, ({ one }) => ({
  user: one(users, { fields: [userDiscountUsage.userId], references: [users.id] }),
  coupon: one(discountCoupons, { fields: [userDiscountUsage.couponId], references: [discountCoupons.id] }),
  subscription: one(subscriptionsEnhanced, { fields: [userDiscountUsage.subscriptionId], references: [subscriptionsEnhanced.id] }),
}));

// Zod Schemas for validation
export const insertSubscriptionEnhancedSchema = createInsertSchema(subscriptionsEnhanced);
export const insertDiscountCouponSchema = createInsertSchema(discountCoupons);
export const insertTrialTemplateSchema = createInsertSchema(trialTemplates);
export const insertSubscriptionHistorySchema = createInsertSchema(subscriptionHistory);
export const insertUserDiscountUsageSchema = createInsertSchema(userDiscountUsage);

// Types
export type SubscriptionEnhanced = typeof subscriptionsEnhanced.$inferSelect;
export type InsertSubscriptionEnhanced = typeof subscriptionsEnhanced.$inferInsert;
export type DiscountCoupon = typeof discountCoupons.$inferSelect;
export type InsertDiscountCoupon = typeof discountCoupons.$inferInsert;
export type TrialTemplate = typeof trialTemplates.$inferSelect;
export type InsertTrialTemplate = typeof trialTemplates.$inferInsert;
export type SubscriptionHistory = typeof subscriptionHistory.$inferSelect;
export type InsertSubscriptionHistory = typeof subscriptionHistory.$inferInsert;
export type UserDiscountUsage = typeof userDiscountUsage.$inferSelect;
export type InsertUserDiscountUsage = typeof userDiscountUsage.$inferInsert;