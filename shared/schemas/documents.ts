import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { documentStatusEnum, documentTypeEnum } from "./enums";
import { users } from "./users";
import { properties } from "./properties";

// DOCUMENTS - Column order must match actual database structure
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), // Column 2 - Required field
  description: text("description"), // Column 3
  fileUrl: text("file_url").notNull(), // Column 4 - Required field
  fileType: text("file_type").notNull(), // Column 5 - Required field
  fileSize: integer("file_size").notNull(), // Column 6 - Required field
  documentType: documentTypeEnum("document_type").notNull(), // Column 7 - Required field
  status: documentStatusEnum("status").default('pending').notNull(), // Column 8 - Required field
  uploadedById: integer("uploaded_by_id").notNull().references(() => users.id), // Column 9 - Required field
  propertyId: integer("property_id").references(() => properties.id), // Column 10
  createdAt: timestamp("created_at").defaultNow().notNull(), // Column 11 - Required field
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // Column 12 - Required field
  name: text("name"), // Column 13 - Optional field for compatibility
  filePath: text("file_path"), // Column 14 - Optional field for compatibility
  mimeType: text("mime_type"), // Column 15 - Optional field for compatibility
  metadata: jsonb("metadata"), // Column 16
  verified: boolean("verified").default(false), // Column 17
  verifiedAt: timestamp("verified_at"), // Column 18
  verifiedById: integer("verified_by_id").references(() => users.id), // Column 19
});

// DOCUMENT SIGNATURES
export const documentSignatures = pgTable("document_signatures", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id),
  userId: integer("user_id").notNull().references(() => users.id),
  signatureData: text("signature_data").notNull(), // Base64 encoded signature or digital signature data
  signedAt: timestamp("signed_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  metadata: jsonb("metadata"),
});

// VERIFICATION DOCUMENTS
export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  documentType: text("document_type").notNull(), // ID, passport, business license, etc.
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size").notNull(),
  mimetype: text("mimetype").notNull(),
  diditSessionId: text("didit_session_id"), // For tracking DIDiT verification sessions
  diditVerificationData: jsonb("didit_verification_data"), // Store DIDiT verification response
  status: documentStatusEnum("status").default('pending').notNull(),
  notes: text("notes"), // For admin to add notes during manual verification
  verifiedAt: timestamp("verified_at"),
  verifiedById: integer("verified_by_id").references(() => users.id), // Admin who approved
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations are now defined in relations.ts

// Validation Schemas
export const insertDocumentSchema = createInsertSchema(documents);
export const insertDocumentSignatureSchema = createInsertSchema(documentSignatures);
export const insertVerificationDocumentSchema = createInsertSchema(verificationDocuments);

// Export types
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type DocumentSignature = typeof documentSignatures.$inferSelect;
export type NewDocumentSignature = typeof documentSignatures.$inferInsert;
export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type NewVerificationDocument = typeof verificationDocuments.$inferInsert;