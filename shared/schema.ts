// Modern modular schema - exports from focused schema modules
// This maintains backward compatibility while using the new structure

// Re-export everything from modular schemas
export * from "./schemas";

// Legacy compatibility exports (keep for existing code)
export * from "./schemas/enums";
export * from "./schemas/users";
export * from "./schemas/agencies";
export * from "./schemas/properties";
export * from "./schemas/messaging";
export * from "./schemas/wishlists";
export * from "./schemas/documents";
export * from "./schemas/tours";
export * from "./schemas/chat";
export * from "./schemas/google-calendar";
export * from "./schemas/rbac";
export * from "./schemas/analytics";
export * from "./schemas/property-amenities";
export * from "./schemas/privacy";