import { relations } from "drizzle-orm";
import { agencies } from "./agencies";
import { users, consents } from "./users";
import { properties, neighborhoods, favorites } from "./properties";
import { messageThreads, messages, messageFolderEntries, messageDrafts, messageFavorites } from "./messaging";
import { propertyTours } from "./tours";
import { documents, documentSignatures, verificationDocuments } from "./documents";
import { wishlists, wishlistMembers, wishlistItems, wishlistChecklists, wishlistItemComments, wishlistItemRatings } from "./wishlists";
import { googleCalendarCredentials, googleCalendarSyncMappings } from "./google-calendar";
import { tourBookings, agentAvailability, agentBlockedTimes, tourParticipants, calendarNotifications } from "./calendar";
import { chatConversations, chatMessages } from "./chat";
import { userRoles, subscriptionPlans, userSubscriptions, userAddons, rolePermissions } from "./rbac";

// USER RELATIONS
export const usersRelations = relations(users, ({ one, many }) => ({
  // Agency relationship
  agency: one(agencies, {
    fields: [users.agencyId],
    references: [agencies.id]
  }),
  // Verified by relationship (self-reference)
  verifiedBy: one(users, {
    fields: [users.verifiedById],
    references: [users.id]
  }),
  // Properties owned
  properties: many(properties),
  // Messages and threads
  sentMessages: many(messages, { relationName: "messageSender" }),
  createdThreads: many(messageThreads, { relationName: "threadCreator" }),
  assignedThreads: many(messageThreads, { relationName: "threadAssignee" }),
  messageFolderEntries: many(messageFolderEntries, { relationName: "folderUser" }),
  messageDrafts: many(messageDrafts, { relationName: "draftUser" }),
  ownedFavorites: many(messageFavorites, { relationName: "favoriteOwner" }),
  targetedFavorites: many(messageFavorites, { relationName: "favoriteTarget" }),
  // Property interactions
  favorites: many(favorites),
  userTours: many(propertyTours, { relationName: "tourUser" }),
  agentTours: many(propertyTours, { relationName: "tourAgent" }),
  // Wishlists
  wishlists: many(wishlists),
  wishlistMemberships: many(wishlistMembers),
  // Documents
  uploadedDocuments: many(documents, { relationName: "documentUploader" }),
  verifiedDocuments: many(documents, { relationName: "documentVerifier" }),
  documentSignatures: many(documentSignatures),
  verificationDocuments: many(verificationDocuments),
  // Calendar
  userBookings: many(tourBookings, { relationName: "bookingUser" }),
  agentBookings: many(tourBookings, { relationName: "bookingAgent" }),
  lastActionBookings: many(tourBookings, { relationName: "bookingLastActor" }),
  agentAvailability: many(agentAvailability),
  agentBlockedTimes: many(agentBlockedTimes, { relationName: "blockedTimeAgent" }),
  createdBlockedTimes: many(agentBlockedTimes, { relationName: "blockedTimeCreator" }),
  tourParticipations: many(tourParticipants),
  calendarNotifications: many(calendarNotifications, { relationName: "notificationUser" }),
  // Chat
  chatConversations: many(chatConversations),
  chatMessages: many(chatMessages),
  // RBAC
  userRoles: many(userRoles),
  userSubscriptions: many(userSubscriptions),
  userAddons: many(userAddons),
  // Google Calendar
  googleCalendarCredentials: many(googleCalendarCredentials),
  googleCalendarSyncMappings: many(googleCalendarSyncMappings),
  // Privacy consents
  consents: many(consents)
}));

// AGENCIES RELATIONS  
export const agenciesRelations = relations(agencies, ({ many }) => ({
  users: many(users), // Agency has many users (agents and admin)
}));

// PROPERTY RELATIONS
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
  propertyTours: many(propertyTours),
  messageThreads: many(messageThreads),
  documents: many(documents),
  wishlistItems: many(wishlistItems),
  tourBookings: many(tourBookings)
}));

// NEIGHBORHOOD RELATIONS
export const neighborhoodsRelations = relations(neighborhoods, ({ many }) => ({
  properties: many(properties)
}));

// FAVORITES RELATIONS
export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id]
  }),
  property: one(properties, {
    fields: [favorites.propertyId],
    references: [properties.id]
  })
}));

// MESSAGE RELATIONS
export const messageThreadsRelations = relations(messageThreads, ({ one, many }) => ({
  property: one(properties, {
    fields: [messageThreads.propertyId],
    references: [properties.id]
  }),
  createdBy: one(users, {
    fields: [messageThreads.createdById],
    references: [users.id],
    relationName: "threadCreator"
  }),
  assignedTo: one(users, {
    fields: [messageThreads.assignedToId],
    references: [users.id],
    relationName: "threadAssignee"
  }),
  messages: many(messages),
  messageFolderEntries: many(messageFolderEntries)
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  thread: one(messageThreads, {
    fields: [messages.threadId],
    references: [messageThreads.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "messageSender"
  })
}));

export const messageFolderEntriesRelations = relations(messageFolderEntries, ({ one }) => ({
  user: one(users, {
    fields: [messageFolderEntries.userId],
    references: [users.id],
    relationName: "folderUser"
  }),
  thread: one(messageThreads, {
    fields: [messageFolderEntries.threadId],
    references: [messageThreads.id]
  }),
}));

export const messageDraftsRelations = relations(messageDrafts, ({ one }) => ({
  user: one(users, {
    fields: [messageDrafts.userId],
    references: [users.id],
    relationName: "draftUser"
  }),
  thread: one(messageThreads, {
    fields: [messageDrafts.threadId],
    references: [messageThreads.id]
  }),
}));

export const messageFavoritesRelations = relations(messageFavorites, ({ one }) => ({
  owner: one(users, {
    fields: [messageFavorites.ownerId],
    references: [users.id],
    relationName: "favoriteOwner"
  }),
  target: one(users, {
    fields: [messageFavorites.targetId],
    references: [users.id],
    relationName: "favoriteTarget"
  }),
}));

// PROPERTY TOURS RELATIONS
export const propertyToursRelations = relations(propertyTours, ({ one }) => ({
  property: one(properties, {
    fields: [propertyTours.propertyId],
    references: [properties.id]
  }),
  user: one(users, {
    fields: [propertyTours.userId],
    references: [users.id],
    relationName: "tourUser"
  }),
  agent: one(users, {
    fields: [propertyTours.agentId],
    references: [users.id],
    relationName: "tourAgent"
  })
}));

// DOCUMENT RELATIONS
export const documentsRelations = relations(documents, ({ one, many }) => ({
  uploadedBy: one(users, {
    fields: [documents.uploadedById],
    references: [users.id],
    relationName: "documentUploader"
  }),
  verifiedBy: one(users, {
    fields: [documents.verifiedById],
    references: [users.id],
    relationName: "documentVerifier"
  }),
  property: one(properties, {
    fields: [documents.propertyId],
    references: [properties.id]
  }),
  documentSignatures: many(documentSignatures)
}));

export const documentSignaturesRelations = relations(documentSignatures, ({ one }) => ({
  document: one(documents, {
    fields: [documentSignatures.documentId],
    references: [documents.id]
  }),
  user: one(users, {
    fields: [documentSignatures.userId],
    references: [users.id]
  })
}));

export const verificationDocumentsRelations = relations(verificationDocuments, ({ one }) => ({
  user: one(users, {
    fields: [verificationDocuments.userId],
    references: [users.id]
  })
}));

// WISHLIST RELATIONS
export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  owner: one(users, {
    fields: [wishlists.ownerId],
    references: [users.id]
  }),
  members: many(wishlistMembers),
  items: many(wishlistItems),
  checklists: many(wishlistChecklists)
}));

export const wishlistMembersRelations = relations(wishlistMembers, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlistMembers.wishlistId],
    references: [wishlists.id]
  }),
  user: one(users, {
    fields: [wishlistMembers.userId],
    references: [users.id]
  })
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
  comments: many(wishlistItemComments),
  ratings: many(wishlistItemRatings)
}));

// GOOGLE CALENDAR RELATIONS
export const googleCalendarCredentialsRelations = relations(googleCalendarCredentials, ({ one }) => ({
  user: one(users, {
    fields: [googleCalendarCredentials.userId],
    references: [users.id]
  }),
}));

export const googleCalendarSyncMappingsRelations = relations(googleCalendarSyncMappings, ({ one }) => ({
  user: one(users, {
    fields: [googleCalendarSyncMappings.userId],
    references: [users.id]
  }),
}));

// CALENDAR RELATIONS
export const tourBookingsRelations = relations(tourBookings, ({ one, many }) => ({
  property: one(properties, {
    fields: [tourBookings.propertyId],
    references: [properties.id]
  }),
  agent: one(users, {
    fields: [tourBookings.agentId],
    references: [users.id],
    relationName: "bookingAgent"
  }),
  user: one(users, {
    fields: [tourBookings.userId],
    references: [users.id],
    relationName: "bookingUser"
  }),
  lastActionBy: one(users, {
    fields: [tourBookings.lastActionBy],
    references: [users.id],
    relationName: "bookingLastActor"
  }),
  participants: many(tourParticipants),
  notifications: many(calendarNotifications)
}));

export const agentAvailabilityRelations = relations(agentAvailability, ({ one }) => ({
  agent: one(users, {
    fields: [agentAvailability.agentId],
    references: [users.id]
  })
}));

export const agentBlockedTimesRelations = relations(agentBlockedTimes, ({ one }) => ({
  agent: one(users, {
    fields: [agentBlockedTimes.agentId],
    references: [users.id],
    relationName: "blockedTimeAgent"
  }),
  createdBy: one(users, {
    fields: [agentBlockedTimes.createdBy],
    references: [users.id],
    relationName: "blockedTimeCreator"
  })
}));

export const tourParticipantsRelations = relations(tourParticipants, ({ one }) => ({
  booking: one(tourBookings, {
    fields: [tourParticipants.bookingId],
    references: [tourBookings.id]
  })
}));

export const calendarNotificationsRelations = relations(calendarNotifications, ({ one }) => ({
  booking: one(tourBookings, {
    fields: [calendarNotifications.bookingId],
    references: [tourBookings.id]
  }),
  user: one(users, {
    fields: [calendarNotifications.userId],
    references: [users.id],
    relationName: "notificationUser"
  })
}));

// CHAT RELATIONS
export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  user1: one(users, {
    fields: [chatConversations.user1Id],
    references: [users.id]
  }),
  user2: one(users, {
    fields: [chatConversations.user2Id],
    references: [users.id]
  }),
  messages: many(chatMessages)
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id]
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id]
  })
}));

// RBAC RELATIONS
export const userRolesRelations = relations(userRoles, ({ one, many }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id]
  }),
  rolePermissions: many(rolePermissions)
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id]
  }),
  plan: one(subscriptionPlans, {
    fields: [userSubscriptions.planId],
    references: [subscriptionPlans.id]
  })
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  userSubscriptions: many(userSubscriptions)
}));

// CONSENT RELATIONS
export const consentsRelations = relations(consents, ({ one }) => ({
  user: one(users, {
    fields: [consents.userId],
    references: [users.id]
  })
}));