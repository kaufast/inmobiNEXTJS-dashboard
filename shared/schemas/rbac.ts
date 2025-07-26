import { pgTable, serial, varchar, text, boolean, timestamp, integer, decimal, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { agencies } from "./agencies";
import { subscriptionTierEnum } from "./enums";

// Enhanced role system
export const roleEnum = pgEnum('role', [
  'admin',
  'agency_basic',
  'agency_premium',
  'agent',
  'agent_premium', 
  'user',
  'user_seller',
  'approved_user',
  'agent_superuser'
]);

// Subscription tiers
// Add-on types
export const addonTypeEnum = pgEnum('addon_type', [
  'verified_badge',
  'recommended_badge',
  'featured_listing',
  'boosted_ads',
  'appointment_scheduler',
  'advanced_analytics',
  'premium_support',
  'extra_listings',
  'custom_branding'
]);

// User roles and permissions
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: roleEnum("role").notNull().default('user'),
  agencyId: integer("agency_id").references(() => agencies.id),
  isAgencySuperuser: boolean("is_agency_superuser").default(false),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  assignedBy: integer("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Subscription plans (parent table)
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  tier: subscriptionTierEnum("tier").notNull(),
  role: roleEnum("role").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('USD'),
  billingPeriod: varchar("billing_period", { length: 20 }).default('monthly'), // monthly, yearly
  listingsLimit: integer("listings_limit").default(0),
  features: jsonb("features").$type<string[]>().default([]),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Available add-ons (parent table)
export const addons = pgTable("addons", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: addonTypeEnum("type").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('USD'),
  billingType: varchar("billing_type", { length: 20 }).default('monthly'), // monthly, one_time, per_listing
  availableForRoles: jsonb("available_for_roles").$type<string[]>().default([]),
  features: jsonb("features").$type<string[]>().default([]),
  limits: jsonb("limits").$type<Record<string, number>>().default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coupons (parent table)
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 20 }).notNull(), // percentage, fixed_amount, trial
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('USD'),
  applicableRoles: jsonb("applicable_roles").$type<string[]>().default([]),
  applicablePlans: jsonb("applicable_plans").$type<number[]>().default([]),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").default(0),
  maxUsesPerUser: integer("max_uses_per_user").default(1),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Permission definitions (parent table)
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// User subscriptions (child table - references subscriptionPlans)
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  agencyId: integer("agency_id").references(() => agencies.id),
  status: varchar("status", { length: 20 }).default('active'), // active, cancelled, expired, suspended
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User add-on purchases (child table - references addons)
export const userAddons = pgTable("user_addons", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  addonId: integer("addon_id").references(() => addons.id).notNull(),
  agencyId: integer("agency_id").references(() => agencies.id),
  quantity: integer("quantity").default(1),
  status: varchar("status", { length: 20 }).default('active'), // active, expired, cancelled
  purchasedAt: timestamp("purchased_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  autoRenew: boolean("auto_renew").default(false),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User badges and achievements
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  badgeType: varchar("badge_type", { length: 50 }).notNull(), // verified, recommended, etc.
  isActive: boolean("is_active").default(true),
  grantedBy: integer("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow()
});

// Role permissions mapping (child table - references permissions)
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  role: roleEnum("role").notNull(),
  permissionId: integer("permission_id").references(() => permissions.id).notNull(),
  isGranted: boolean("is_granted").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Listing limits and usage tracking
export const listingUsage = pgTable("listing_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  agencyId: integer("agency_id").references(() => agencies.id),
  totalLimit: integer("total_limit").notNull(),
  currentUsage: integer("current_usage").default(0),
  extraListingsPurchased: integer("extra_listings_purchased").default(0),
  resetDate: timestamp("reset_date"), // For monthly limits
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Data retention and GDPR compliance
export const dataRetention = pgTable("data_retention", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  agencyId: integer("agency_id").references(() => agencies.id),
  dataType: varchar("data_type", { length: 50 }).notNull(), // user_data, listing_data, message_data
  originalId: integer("original_id").notNull(),
  retentionPeriod: integer("retention_period").notNull(), // in days
  status: varchar("status", { length: 20 }).default('active'), // active, archived, deleted
  scheduledDeletionAt: timestamp("scheduled_deletion_at"),
  archivedAt: timestamp("archived_at"),
  deletedAt: timestamp("deleted_at"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow()
});

// Coupon usage tracking (child table - references coupons, userSubscriptions, userAddons)
export const couponUsage = pgTable("coupon_usage", {
  id: serial("id").primaryKey(),
  couponId: integer("coupon_id").references(() => coupons.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subscriptionId: integer("subscription_id").references(() => userSubscriptions.id),
  addonId: integer("addon_id").references(() => userAddons.id),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull(),
  usedAt: timestamp("used_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({})
});

// Type exports
export type UserRole = typeof userRoles.$inferSelect;
export type UserRoleInsert = typeof userRoles.$inferInsert;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type SubscriptionPlanInsert = typeof subscriptionPlans.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type UserSubscriptionInsert = typeof userSubscriptions.$inferInsert;
export type Addon = typeof addons.$inferSelect;
export type AddonInsert = typeof addons.$inferInsert;
export type UserAddon = typeof userAddons.$inferSelect;
export type UserAddonInsert = typeof userAddons.$inferInsert;
export type UserBadge = typeof userBadges.$inferSelect;
export type UserBadgeInsert = typeof userBadges.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type PermissionInsert = typeof permissions.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type ListingUsage = typeof listingUsage.$inferSelect;
export type DataRetention = typeof dataRetention.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type CouponUsage = typeof couponUsage.$inferSelect;