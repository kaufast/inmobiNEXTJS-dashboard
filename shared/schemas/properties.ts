import { pgTable, text, serial, integer, boolean, jsonb, doublePrecision, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { propertyTypeEnum, listingTypeEnum } from "./enums";
import { users } from "./users";
// import { neighborhoods } from "./neighborhoods";

// PROPERTIES TABLE
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  bedrooms: integer("bedrooms"),
  bathrooms: doublePrecision("bathrooms"),
  areaSqm: doublePrecision("area_sqm"),
  lotSize: doublePrecision("lot_size"),
  propertyType: propertyTypeEnum("property_type").notNull(),
  features: jsonb("features").$type<string[]>(),
  images: jsonb("images").$type<string[]>().notNull(),
  amenities: text("amenities").array(),
  isPremium: boolean("is_premium").default(false),
  listingType: listingTypeEnum("listing_type").notNull(),
  ownerId: integer("owner_id").references(() => users.id),
  neighborhoodId: integer("neighborhood_id").references(() => neighborhoods.id),
  isVerified: boolean("is_verified").default(false),
  installmentPlan: jsonb("installment_plan").$type<{ years: number; downPayment?: number }>(),
  badge: text("badge"),
  agentNumber: text("agent_number"),
  agencyNumber: text("agency_number"),
  agencyName: text("agency_name"),
  // location: point("location"), // Skip geometry type for now
  contactEmail: text("contact_email"),
  phoneNumber: text("phone_number"),
  phoneCountryCode: text("phone_country_code"),
  isPhoneNumberPublic: boolean("is_phone_number_public").default(true),
  approximateLocation: text("approximate_location"),
  currency: text("currency").default("EUR"),
  furnished: boolean("furnished").default(false),
  yearBuilt: integer("year_built"),
  parkingSpaces: integer("parking_spaces").default(0),
  petsAllowed: boolean("pets_allowed").default(false),
  elevator: boolean("elevator").default(false),
  petFriendly: boolean("pet_friendly").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// NEIGHBORHOODS TABLE
export const neighborhoods = pgTable("neighborhoods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  zipCode: text("zip_code"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  scores: jsonb("scores").$type<{
    overall: number;
    safety: number;
    schools: number;
    transit: number;
  }>(),
  medianHomePrice: doublePrecision("median_home_price"),
});

// FAVORITES TABLE
export const favorites = pgTable("favorites", {
  userId: integer("user_id").notNull().references(() => users.id),
  propertyId: integer("property_id").notNull().references(() => properties.id),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.propertyId] }),
  };
});

// RELATIONS
export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, {
    fields: [properties.ownerId],
    references: [users.id]
  }),
  neighborhood: one(neighborhoods, {
    fields: [properties.neighborhoodId],
    references: [neighborhoods.id]
  }),
  favorites: many(favorites),
  // messageThreads: many(messageThreadsRelation),
  // tours: many(propertyToursRelation),
}));

export const neighborhoodsRelations = relations(neighborhoods, ({ many }) => ({
  properties: many(properties),
}));

// Relations are now defined in relations.ts

// Validation Schemas
export const insertPropertySchema = createInsertSchema(properties);
export const insertNeighborhoodSchema = createInsertSchema(neighborhoods);
export const insertFavoriteSchema = createInsertSchema(favorites);

// Search Schema
export const searchPropertySchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  propertyType: z.enum(propertyTypeEnum.enumValues).optional(),
  listingType: z.enum(listingTypeEnum.enumValues).optional(),
  minAreaSqm: z.number().optional(),
  maxAreaSqm: z.number().optional(),
  features: z.array(z.string()).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radius: z.number().optional(),
  limit: z.number().default(9),
  offset: z.number().default(0),
});

// Export types
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type Neighborhood = typeof neighborhoods.$inferSelect;
export type NewNeighborhood = typeof neighborhoods.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
export type PropertySearchParams = z.infer<typeof searchPropertySchema>;

// Relations are now defined in relations.ts