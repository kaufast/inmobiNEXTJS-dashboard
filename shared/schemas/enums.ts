import { pgEnum } from "drizzle-orm/pg-core";

// Property and Real Estate ENUMs
export const propertyTypeEnum = pgEnum('property_type', [
  'apartment', 'villa', 'penthouse', 'townhouse', 'office', 'retail', 'land'
]);

export const listingTypeEnum = pgEnum('listing_type', ['buy', 'rent', 'sell']);

// User and Authorization ENUMs
export const userRoleEnum = pgEnum('user_role', ['user', 'agent', 'admin', 'agency']);
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'premium', 'enterprise']);
export const verificationTypeEnum = pgEnum('verification_type', ['user', 'agency']);

// Tour and Booking ENUMs
export const tourStatusEnum = pgEnum('tour_status', ['pending', 'confirmed', 'completed', 'canceled']);

// Messaging ENUMs
export const messageStatusEnum = pgEnum('message_status', ['unread', 'read', 'archived']);
export const messageTypeEnum = pgEnum('message_type', ['direct', 'support', 'system', 'property_inquiry']);
export const messageFolderEnum = pgEnum('message_folder', ['inbox', 'sent', 'drafts', 'trash', 'favorites']);

// Document Management ENUMs
export const documentStatusEnum = pgEnum('document_status', ['pending', 'verified', 'rejected']);
export const documentTypeEnum = pgEnum('document_type', [
  'contract', 'deed', 'identification', 'utility', 'other',
  'purchase_agreement', 'listing_agreement', 'lease_agreement', 'property_deed',
  'title_report', 'inspection_report', 'appraisal_report', 'insurance_policy',
  'mortgage_document', 'tax_document', 'permit', 'certificate', 'floor_plan',
  'survey', 'disclosure', 'hoa_documents', 'property_photos', 'legal_document'
]);

// Wishlist ENUMs
export const wishlistRoleEnum = pgEnum('wishlist_role', ['owner', 'member', 'viewer']);

// General ENUMs
export const targetTypeEnum = pgEnum('target_type', ['user', 'agent']);

// Chat/AI ENUMs
export const chatRoleEnum = pgEnum('chat_role', ['user', 'assistant', 'system']);