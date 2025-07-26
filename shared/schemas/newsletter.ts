import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  status: text('status', { enum: ['active', 'unsubscribed', 'bounced', 'pending'] }).notNull().default('pending'),
  source: text('source').notNull().default('homepage'), // homepage, property-page, agent-signup, etc.
  preferences: jsonb('preferences').$type<{
    propertyUpdates: boolean;
    marketInsights: boolean;
    newFeatures: boolean;
    weeklyDigest: boolean;
    promotionalOffers: boolean;
  }>().default({
    propertyUpdates: true,
    marketInsights: true,
    newFeatures: true,
    weeklyDigest: true,
    promotionalOffers: false
  }),
  metadata: jsonb('metadata').$type<{
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    location?: {
      country?: string;
      city?: string;
    };
  }>(),
  confirmedAt: timestamp('confirmed_at'),
  unsubscribedAt: timestamp('unsubscribed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Newsletter campaigns table for tracking sent newsletters
export const newsletterCampaigns = pgTable('newsletter_campaigns', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  content: text('content').notNull(),
  htmlContent: text('html_content'),
  status: text('status', { enum: ['draft', 'scheduled', 'sending', 'sent', 'cancelled'] }).notNull().default('draft'),
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  recipientCount: text('recipient_count').default('0'),
  openCount: text('open_count').default('0'),
  clickCount: text('click_count').default('0'),
  unsubscribeCount: text('unsubscribe_count').default('0'),
  bounceCount: text('bounce_count').default('0'),
  metadata: jsonb('metadata').$type<{
    tags?: string[];
    segmentCriteria?: Record<string, any>;
    templateId?: string;
  }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Newsletter analytics table for tracking individual subscriber interactions
export const newsletterAnalytics = pgTable('newsletter_analytics', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  subscriberId: text('subscriber_id').notNull().references(() => newsletterSubscribers.id, { onDelete: 'cascade' }),
  campaignId: text('campaign_id').notNull().references(() => newsletterCampaigns.id, { onDelete: 'cascade' }),
  event: text('event', { enum: ['sent', 'delivered', 'opened', 'clicked', 'unsubscribed', 'bounced', 'complained'] }).notNull(),
  eventData: jsonb('event_data').$type<{
    clickUrl?: string;
    userAgent?: string;
    ipAddress?: string;
    location?: {
      country?: string;
      city?: string;
    };
    bounceReason?: string;
    unsubscribeReason?: string;
  }>(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

// Zod schemas for validation
export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers, {
  email: z.string().email('Invalid email address'),
  status: z.enum(['active', 'unsubscribed', 'bounced', 'pending']).optional(),
  source: z.string().min(1, 'Source is required'),
  preferences: z.object({
    propertyUpdates: z.boolean().default(true),
    marketInsights: z.boolean().default(true),
    newFeatures: z.boolean().default(true),
    weeklyDigest: z.boolean().default(true),
    promotionalOffers: z.boolean().default(false),
  }).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectNewsletterSubscriberSchema = createSelectSchema(newsletterSubscribers);

export const updateNewsletterPreferencesSchema = z.object({
  preferences: z.object({
    propertyUpdates: z.boolean().optional(),
    marketInsights: z.boolean().optional(),
    newFeatures: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
    promotionalOffers: z.boolean().optional(),
  }),
});

export const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  reason: z.string().optional(),
  token: z.string().optional(), // For unsubscribe links
});

export const insertNewsletterCampaignSchema = createInsertSchema(newsletterCampaigns, {
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'cancelled']).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectNewsletterCampaignSchema = createSelectSchema(newsletterCampaigns);

export const insertNewsletterAnalyticsSchema = createInsertSchema(newsletterAnalytics, {
  subscriberId: z.string().uuid('Invalid subscriber ID'),
  campaignId: z.string().uuid('Invalid campaign ID'),
  event: z.enum(['sent', 'delivered', 'opened', 'clicked', 'unsubscribed', 'bounced', 'complained']),
}).omit({
  id: true,
  timestamp: true,
});

export const selectNewsletterAnalyticsSchema = createSelectSchema(newsletterAnalytics);

// Types
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;
export type NewsletterCampaign = typeof newsletterCampaigns.$inferSelect;
export type InsertNewsletterCampaign = typeof newsletterCampaigns.$inferInsert;
export type NewsletterAnalytics = typeof newsletterAnalytics.$inferSelect;
export type InsertNewsletterAnalytics = typeof newsletterAnalytics.$inferInsert;

// Preferences type
export type NewsletterPreferences = {
  propertyUpdates: boolean;
  marketInsights: boolean;
  newFeatures: boolean;
  weeklyDigest: boolean;
  promotionalOffers: boolean;
};