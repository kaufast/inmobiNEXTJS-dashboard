import { pgTable, text, serial, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { wishlistRoleEnum } from "./enums";
import { users } from "./users";
import { properties } from "./properties";

// COLLABORATIVE WISHLISTS
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").notNull().references(() => users.id), // Creator/primary owner
  coverImage: text("cover_image"), // URL to an image representing this wishlist
  isPublic: boolean("is_public").default(false), // Whether this wishlist can be viewed by non-members
  inviteCode: text("invite_code"), // Unique code that can be used to join this wishlist
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WISHLIST MEMBERS
export const wishlistMembers = pgTable("wishlist_members", {
  id: serial("id").primaryKey(),
  wishlistId: integer("wishlist_id").notNull().references(() => wishlists.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: wishlistRoleEnum("role").default('member').notNull(), // owner, member, viewer
  addedById: integer("added_by_id").references(() => users.id), // Who added this user
  addedAt: timestamp("added_at").defaultNow().notNull(),
  lastViewedAt: timestamp("last_viewed_at"),
}, (table) => {
  return {
    uniqueMember: primaryKey({ columns: [table.wishlistId, table.userId] }), // Ensure each user is in a wishlist only once
  };
});

// WISHLIST ITEMS (properties in the wishlist)
export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  wishlistId: integer("wishlist_id").notNull().references(() => wishlists.id),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  addedById: integer("added_by_id").notNull().references(() => users.id), // Who added this property
  notes: text("notes"), // Shared notes about this property
  priority: integer("priority").default(0), // Higher number = higher priority
  status: text("status").default('considering'), // considering, interested, contacted, viewed, rejected
  addedAt: timestamp("added_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    uniqueItem: primaryKey({ columns: [table.wishlistId, table.propertyId] }), // Ensure each property is in a wishlist only once
  };
});

// WISHLIST CHECKLISTS
export const wishlistChecklists = pgTable("wishlist_checklists", {
  id: serial("id").primaryKey(),
  wishlistId: integer("wishlist_id").notNull().references(() => wishlists.id),
  title: text("title").notNull(),
  completed: boolean("completed").default(false),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WISHLIST ITEM COMMENTS
export const wishlistItemComments = pgTable("wishlist_item_comments", {
  id: serial("id").primaryKey(),
  wishlistItemId: integer("wishlist_item_id").notNull().references(() => wishlistItems.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WISHLIST ITEM RATINGS
export const wishlistItemRatings = pgTable("wishlist_item_ratings", {
  id: serial("id").primaryKey(),
  wishlistItemId: integer("wishlist_item_id").notNull().references(() => wishlistItems.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 star rating
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    uniqueRating: primaryKey({ columns: [table.wishlistItemId, table.userId] }), // Ensure each user rates a property only once
  };
});

// RELATIONS
export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  owner: one(users, {
    fields: [wishlists.ownerId],
    references: [users.id]
  }),
  members: many(wishlistMembers),
  items: many(wishlistItems),
  checklists: many(wishlistChecklists),
}));

export const wishlistMembersRelations = relations(wishlistMembers, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlistMembers.wishlistId],
    references: [wishlists.id]
  }),
  user: one(users, {
    fields: [wishlistMembers.userId],
    references: [users.id]
  }),
  addedBy: one(users, {
    fields: [wishlistMembers.addedById],
    references: [users.id]
  }),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one, many }) => ({
  wishlist: one(wishlists, {
    fields: [wishlistItems.wishlistId],
    references: [wishlists.id]
  }),
  property: one(properties, {
    fields: [wishlistItems.propertyId],
    references: [properties.id]
  }),
  addedBy: one(users, {
    fields: [wishlistItems.addedById],
    references: [users.id]
  }),
  comments: many(wishlistItemComments),
  ratings: many(wishlistItemRatings),
}));

export const wishlistChecklistsRelations = relations(wishlistChecklists, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlistChecklists.wishlistId],
    references: [wishlists.id]
  }),
  creator: one(users, {
    fields: [wishlistChecklists.createdBy],
    references: [users.id]
  }),
}));

export const wishlistItemCommentsRelations = relations(wishlistItemComments, ({ one }) => ({
  wishlistItem: one(wishlistItems, {
    fields: [wishlistItemComments.wishlistItemId],
    references: [wishlistItems.id]
  }),
  user: one(users, {
    fields: [wishlistItemComments.userId],
    references: [users.id]
  }),
}));

export const wishlistItemRatingsRelations = relations(wishlistItemRatings, ({ one }) => ({
  wishlistItem: one(wishlistItems, {
    fields: [wishlistItemRatings.wishlistItemId],
    references: [wishlistItems.id]
  }),
  user: one(users, {
    fields: [wishlistItemRatings.userId],
    references: [users.id]
  }),
}));

// Validation Schemas
export const insertWishlistSchema = createInsertSchema(wishlists);
export const insertWishlistMemberSchema = createInsertSchema(wishlistMembers);
export const insertWishlistItemSchema = createInsertSchema(wishlistItems);
export const insertWishlistChecklistSchema = createInsertSchema(wishlistChecklists);
export const insertWishlistItemCommentSchema = createInsertSchema(wishlistItemComments);
export const insertWishlistItemRatingSchema = createInsertSchema(wishlistItemRatings);

// Export types
export type Wishlist = typeof wishlists.$inferSelect;
export type NewWishlist = typeof wishlists.$inferInsert;
export type WishlistMember = typeof wishlistMembers.$inferSelect;
export type NewWishlistMember = typeof wishlistMembers.$inferInsert;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type NewWishlistItem = typeof wishlistItems.$inferInsert;
export type WishlistChecklist = typeof wishlistChecklists.$inferSelect;
export type NewWishlistChecklist = typeof wishlistChecklists.$inferInsert;
export type WishlistItemComment = typeof wishlistItemComments.$inferSelect;
export type NewWishlistItemComment = typeof wishlistItemComments.$inferInsert;
export type WishlistItemRating = typeof wishlistItemRatings.$inferSelect;
export type NewWishlistItemRating = typeof wishlistItemRatings.$inferInsert;