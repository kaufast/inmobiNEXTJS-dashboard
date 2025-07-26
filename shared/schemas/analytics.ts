import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { users } from "./users";
import { properties } from "./properties";

// ANALYTICS EVENTS - Track all user interactions
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'view', 'inquiry', 'tour_request', 'favorite', 'share', 'contact'
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'property', 'agent', 'listing'
  entityId: integer("entity_id").notNull(), // ID of the property/agent/listing
  userId: integer("user_id"), // NULL for anonymous users - FK will be added later
  sessionId: varchar("session_id", { length: 255 }), // Track anonymous sessions
  ipAddress: varchar("ip_address", { length: 45 }), // IPv4/IPv6
  userAgent: text("user_agent"),
  referrer: text("referrer"), // Where the user came from
  metadata: jsonb("metadata"), // Additional event-specific data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// PROPERTY ANALYTICS - Aggregated stats per property
export const propertyAnalytics = pgTable("property_analytics", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(), // FK will be added later
  period: varchar("period", { length: 20 }).notNull(), // 'day', 'week', 'month'
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // View metrics
  totalViews: integer("total_views").default(0).notNull(),
  uniqueViews: integer("unique_views").default(0).notNull(),
  averageTimeOnPage: integer("average_time_on_page").default(0), // seconds
  
  // Engagement metrics
  inquiries: integer("inquiries").default(0).notNull(),
  tourRequests: integer("tour_requests").default(0).notNull(),
  favorites: integer("favorites").default(0).notNull(),
  shares: integer("shares").default(0).notNull(),
  contactClicks: integer("contact_clicks").default(0).notNull(),
  
  // Conversion metrics
  phoneClicks: integer("phone_clicks").default(0).notNull(),
  emailClicks: integer("email_clicks").default(0).notNull(),
  
  // Lead quality
  qualifiedLeads: integer("qualified_leads").default(0).notNull(),
  conversions: integer("conversions").default(0).notNull(), // Actual deals closed
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AGENT ANALYTICS - Aggregated stats per agent
export const agentAnalytics = pgTable("agent_analytics", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(), // FK will be added later
  period: varchar("period", { length: 20 }).notNull(), // 'day', 'week', 'month'
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Listing metrics
  activeListings: integer("active_listings").default(0).notNull(),
  newListings: integer("new_listings").default(0).notNull(),
  soldListings: integer("sold_listings").default(0).notNull(),
  expiredListings: integer("expired_listings").default(0).notNull(),
  
  // View metrics (across all properties)
  totalViews: integer("total_views").default(0).notNull(),
  uniqueViews: integer("unique_views").default(0).notNull(),
  
  // Lead metrics
  totalInquiries: integer("total_inquiries").default(0).notNull(),
  totalTourRequests: integer("total_tour_requests").default(0).notNull(),
  qualifiedLeads: integer("qualified_leads").default(0).notNull(),
  
  // Revenue metrics
  totalCommission: decimal("total_commission", { precision: 12, scale: 2 }).default("0.00"),
  averageDealSize: decimal("average_deal_size", { precision: 12, scale: 2 }).default("0.00"),
  
  // Performance metrics
  averageTimeToSale: integer("average_time_to_sale").default(0), // days
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default("0.00"), // percentage
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// LEAD TRACKING - Track potential customers
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id"), // FK will be added later
  agentId: integer("agent_id"), // FK will be added later
  userId: integer("user_id"), // FK will be added later - If registered user
  
  // Lead details
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  source: varchar("source", { length: 100 }), // 'website', 'referral', 'social', 'advertising'
  
  // Lead qualification
  status: varchar("status", { length: 50 }).default("new").notNull(), // 'new', 'contacted', 'qualified', 'converted', 'lost'
  score: integer("score").default(0), // Lead scoring 0-100
  budget: decimal("budget", { precision: 12, scale: 2 }),
  timeframe: varchar("timeframe", { length: 50 }), // 'immediate', '1-3months', '3-6months', '6-12months'
  
  // Tracking
  firstContact: timestamp("first_contact"),
  lastContact: timestamp("last_contact"),
  notes: text("notes"),
  metadata: jsonb("metadata"), // Additional lead data
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// TRAFFIC SOURCES - Track where visitors come from
export const trafficSources = pgTable("traffic_sources", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id"), // FK will be added later
  propertyId: integer("property_id"), // FK will be added later
  
  source: varchar("source", { length: 100 }).notNull(), // 'google', 'facebook', 'direct', 'referral'
  medium: varchar("medium", { length: 100 }), // 'organic', 'cpc', 'social', 'email'
  campaign: varchar("campaign", { length: 255 }), // Campaign name
  
  // Metrics
  sessions: integer("sessions").default(0).notNull(),
  pageviews: integer("pageviews").default(0).notNull(),
  uniqueUsers: integer("unique_users").default(0).notNull(),
  bounceRate: decimal("bounce_rate", { precision: 5, scale: 2 }).default("0.00"),
  avgSessionDuration: integer("avg_session_duration").default(0), // seconds
  
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// GOALS & TARGETS - Agent/Agency goal tracking
export const analyticsGoals = pgTable("analytics_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // FK will be added later
  goalType: varchar("goal_type", { length: 50 }).notNull(), // 'listings', 'sales', 'revenue', 'leads'
  period: varchar("period", { length: 20 }).notNull(), // 'monthly', 'quarterly', 'yearly'
  
  targetValue: decimal("target_value", { precision: 12, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }).default("0.00"),
  
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// RELATIONS
export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  user: one(users, {
    fields: [analyticsEvents.userId],
    references: [users.id],
  }),
}));

export const propertyAnalyticsRelations = relations(propertyAnalytics, ({ one }) => ({
  property: one(properties, {
    fields: [propertyAnalytics.propertyId],
    references: [properties.id],
  }),
}));

export const agentAnalyticsRelations = relations(agentAnalytics, ({ one }) => ({
  agent: one(users, {
    fields: [agentAnalytics.agentId],
    references: [users.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  property: one(properties, {
    fields: [leads.propertyId],
    references: [properties.id],
  }),
  agent: one(users, {
    fields: [leads.agentId],
    references: [users.id],
    relationName: "agentLeads",
  }),
  user: one(users, {
    fields: [leads.userId],
    references: [users.id],
    relationName: "userLeads",
  }),
}));

export const trafficSourcesRelations = relations(trafficSources, ({ one }) => ({
  agent: one(users, {
    fields: [trafficSources.agentId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [trafficSources.propertyId],
    references: [properties.id],
  }),
}));

export const analyticsGoalsRelations = relations(analyticsGoals, ({ one }) => ({
  user: one(users, {
    fields: [analyticsGoals.userId],
    references: [users.id],
  }),
}));

// Validation Schemas
export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents);
export const insertPropertyAnalyticsSchema = createInsertSchema(propertyAnalytics);
export const insertAgentAnalyticsSchema = createInsertSchema(agentAnalytics);
export const insertLeadSchema = createInsertSchema(leads);
export const insertTrafficSourceSchema = createInsertSchema(trafficSources);
export const insertAnalyticsGoalSchema = createInsertSchema(analyticsGoals);

// Export types
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
export type PropertyAnalytics = typeof propertyAnalytics.$inferSelect;
export type NewPropertyAnalytics = typeof propertyAnalytics.$inferInsert;
export type AgentAnalytics = typeof agentAnalytics.$inferSelect;
export type NewAgentAnalytics = typeof agentAnalytics.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type TrafficSource = typeof trafficSources.$inferSelect;
export type NewTrafficSource = typeof trafficSources.$inferInsert;
export type AnalyticsGoal = typeof analyticsGoals.$inferSelect;
export type NewAnalyticsGoal = typeof analyticsGoals.$inferInsert;