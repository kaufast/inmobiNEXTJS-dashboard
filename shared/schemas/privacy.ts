import { z } from "zod";

// Consent categories schema
export const consentCategoriesSchema = z.object({
  necessary: z.boolean().default(true),
  functional: z.boolean().default(false),
  analytics: z.boolean().default(false),
  marketing: z.boolean().default(false),
});

// Services consent schema (dynamic object with service names as keys)
export const servicesConsentSchema = z.record(z.string(), z.boolean());

// Full consent status schema
export const consentStatusSchema = z.object({
  hasConsent: z.boolean(),
  shouldCollectConsent: z.boolean(),
  categories: consentCategoriesSchema,
  services: servicesConsentSchema,
  consentId: z.string(),
  timestamp: z.date(),
  isEU: z.boolean(),
});

// Consent submission schema
export const consentSubmissionSchema = z.object({
  consent: consentStatusSchema,
  timestamp: z.date(),
  source: z.enum(['web', 'mobile']),
});

// Database consent record schema
export const consentRecordSchema = z.object({
  id: z.number(),
  userId: z.number(),
  consentId: z.string(),
  categories: consentCategoriesSchema,
  services: servicesConsentSchema,
  hasConsent: z.boolean(),
  shouldCollectConsent: z.boolean(),
  isEU: z.boolean(),
  source: z.enum(['web', 'mobile']),
  timestamp: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports
export type ConsentCategories = z.infer<typeof consentCategoriesSchema>;
export type ServicesConsent = z.infer<typeof servicesConsentSchema>;
export type ConsentStatus = z.infer<typeof consentStatusSchema>;
export type ConsentSubmission = z.infer<typeof consentSubmissionSchema>;
export type ConsentRecord = z.infer<typeof consentRecordSchema>;

// Usercentrics service configuration
export const usercentricsServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['necessary', 'functional', 'analytics', 'marketing']),
  description: z.string(),
  provider: z.string(),
  privacyPolicyUrl: z.string(),
  cookies: z.array(z.string()),
  hostingLocation: z.string(),
  dataRetention: z.string(),
});

export type UsercentricsService = z.infer<typeof usercentricsServiceSchema>;