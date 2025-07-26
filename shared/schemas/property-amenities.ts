/**
 * Property Amenities Schema
 */

import { pgTable, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { properties } from './properties';

export const property_amenities = pgTable('property_amenities', {
  id: varchar('id', { length: 255 }).primaryKey(),
  propertyId: varchar('property_id', { length: 255 }).references(() => properties.id).notNull(),
  amenityType: varchar('amenity_type', { length: 50 }).notNull(), // 'standard' or 'custom'
  amenityName: varchar('amenity_name', { length: 100 }).notNull(),
  amenityDescription: text('amenity_description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const bulk_upload_sessions = pgTable('bulk_upload_sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  totalRows: varchar('total_rows', { length: 10 }).notNull(),
  validRows: varchar('valid_rows', { length: 10 }).notNull(),
  invalidRows: varchar('invalid_rows', { length: 10 }).notNull(),
  status: varchar('status', { length: 50 }).default('processing').notNull(), // 'processing', 'completed', 'failed'
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  errorLog: text('error_log'),
  validationSummary: text('validation_summary') // JSON string of validation results
});

// Export types for use in other modules
export type PropertyAmenity = typeof property_amenities.$inferSelect;
export type NewPropertyAmenity = typeof property_amenities.$inferInsert;
export type BulkUploadSession = typeof bulk_upload_sessions.$inferSelect;
export type NewBulkUploadSession = typeof bulk_upload_sessions.$inferInsert;