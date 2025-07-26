import { pgTable, text, serial, integer, boolean, timestamp, time, date, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";
import { properties } from "./properties";

// Tour Bookings/Requests
export const tourBookings = pgTable("tour_bookings", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(), // Buyer/Renter
  agentId: integer("agent_id").references(() => users.id).notNull(), // Agent/Seller
  
  // Scheduling
  requestedDateTime: timestamp("requested_date_time").notNull(),
  confirmedDateTime: timestamp("confirmed_date_time"),
  durationMinutes: integer("duration_minutes").default(60),
  
  // Status Management
  status: text("status").default('pending').$type<
    'pending' | 'confirmed' | 'cancelled' | 'completed' | 
    'reschedule_requested' | 'no_show' | 'rescheduled'
  >().notNull(),
  
  // Communication
  userNotes: text("user_notes"),
  agentNotes: text("agent_notes"),
  adminNotes: text("admin_notes"),
  cancellationReason: text("cancellation_reason"),
  
  // Metadata
  bookingType: text("booking_type").default('tour').$type<
    'tour' | 'viewing' | 'inspection' | 'consultation'
  >(),
  isVirtual: boolean("is_virtual").default(false),
  meetingLink: text("meeting_link"), // For virtual tours
  
  // Tracking
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
  cancelledAt: timestamp("cancelled_at"),
  completedAt: timestamp("completed_at"),
  
  // Actions tracking
  lastActionBy: integer("last_action_by").references(() => users.id),
  lastActionType: text("last_action_type"), // 'created', 'confirmed', 'cancelled', etc.
});

// Agent Availability
export const agentAvailability = pgTable("agent_availability", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => users.id).notNull(),
  
  // Time slots
  dayOfWeek: integer("day_of_week"), // 0=Sunday, 1=Monday, etc.
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  
  // Date range (for temporary availability)
  validFrom: date("valid_from"),
  validUntil: date("valid_until"),
  
  // Settings
  isActive: boolean("is_active").default(true),
  slotDurationMinutes: integer("slot_duration_minutes").default(60),
  bufferTimeMinutes: integer("buffer_time_minutes").default(15), // Time between bookings
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Agent Blocked Times (Vacations, meetings, etc.)
export const agentBlockedTimes = pgTable("agent_blocked_times", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => users.id).notNull(),
  
  // Time blocking
  startDatetime: timestamp("start_datetime").notNull(),
  endDatetime: timestamp("end_datetime").notNull(),
  
  // Details
  reason: text("reason"),
  isRecurring: boolean("is_recurring").default(false),
  recurrencePattern: jsonb("recurrence_pattern"), // For recurring blocks
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
});

// Tour Participants (for group tours)
export const tourParticipants = pgTable("tour_participants", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => tourBookings.id).notNull(),
  participantName: text("participant_name").notNull(),
  participantEmail: text("participant_email"),
  participantPhone: text("participant_phone"),
  relationship: text("relationship"), // 'spouse', 'family', 'friend', 'colleague'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Calendar Notifications
export const calendarNotifications = pgTable("calendar_notifications", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => tourBookings.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Notification details
  notificationType: text("notification_type").notNull(), // 'booking_created', 'booking_confirmed', etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  
  // Status
  isRead: boolean("is_read").default(false),
  isSent: boolean("is_sent").default(false),
  sentAt: timestamp("sent_at"),
  
  // Delivery channels
  sendEmail: boolean("send_email").default(true),
  sendSms: boolean("send_sms").default(false),
  sendPush: boolean("send_push").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations are now defined in relations.ts

// Zod Schemas for validation
export const insertTourBookingSchema = createInsertSchema(tourBookings);
export const insertAgentAvailabilitySchema = createInsertSchema(agentAvailability);
export const insertAgentBlockedTimesSchema = createInsertSchema(agentBlockedTimes);
export const insertTourParticipantSchema = createInsertSchema(tourParticipants);
export const insertCalendarNotificationSchema = createInsertSchema(calendarNotifications);

// Custom validation schemas
export const tourRequestSchema = z.object({
  propertyId: z.number().positive(),
  agentId: z.number().positive(),
  requestedDateTime: z.string().datetime(),
  durationMinutes: z.number().min(15).max(480).default(60),
  isVirtual: z.boolean().default(false),
  userNotes: z.string().optional(),
  participants: z.array(z.object({
    participantName: z.string().min(1),
    participantEmail: z.string().email().optional(),
    participantPhone: z.string().optional(),
    relationship: z.string().optional(),
  })).optional(),
});

export const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  slotDurationMinutes: z.number().min(15).max(240).default(60),
  bufferTimeMinutes: z.number().min(0).max(60).default(15),
});

export const blockTimeSchema = z.object({
  startDatetime: z.string().datetime(),
  endDatetime: z.string().datetime(),
  reason: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    interval: z.number().min(1).max(12),
    endDate: z.string().optional(),
  }).optional(),
});

// Types
export type TourBooking = typeof tourBookings.$inferSelect;
export type InsertTourBooking = typeof tourBookings.$inferInsert;
export type AgentAvailability = typeof agentAvailability.$inferSelect;
export type InsertAgentAvailability = typeof agentAvailability.$inferInsert;
export type AgentBlockedTime = typeof agentBlockedTimes.$inferSelect;
export type InsertAgentBlockedTime = typeof agentBlockedTimes.$inferInsert;
export type TourParticipant = typeof tourParticipants.$inferSelect;
export type InsertTourParticipant = typeof tourParticipants.$inferInsert;
export type CalendarNotification = typeof calendarNotifications.$inferSelect;
export type InsertCalendarNotification = typeof calendarNotifications.$inferInsert;

// Custom types
export type TourStatus = TourBooking['status'];
export type BookingType = TourBooking['bookingType'];

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  conflicts?: TourBooking[];
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: TourStatus;
  property: {
    id: number;
    title: string;
    address: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
  agent: {
    id: number;
    name: string;
    email: string;
  };
  participants?: TourParticipant[];
  isVirtual: boolean;
  meetingLink?: string;
  notes?: string;
}

export interface ConflictCheck {
  hasConflicts: boolean;
  conflicts: TourBooking[];
  suggestions: TimeSlot[];
}

export interface CalendarStats {
  toursToday: number;
  toursThisWeek: number;
  pendingToday: number;
  completionRate: number;
  activeAgents: number;
  weekGrowth: number;
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
  bufferTime: number;
}