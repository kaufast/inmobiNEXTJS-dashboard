// Export all ENUMs first
export * from "./enums";

// Export table definitions
export * from "./users";
export * from "./agencies";
export * from "./properties";
export * from "./messaging";
export * from "./wishlists";
export * from "./documents";
export * from "./tours";
export * from "./chat";
export * from "./google-calendar";
export * from "./rbac";
export * from "./analytics";
export * from "./newsletter";

// Relations are exported from individual files above
// export * from "./relations"; // Disabled to avoid conflicts

// Re-export everything from the original schema for backward compatibility
export * from "./users";
export * from "./agencies";
export * from "./properties";
export * from "./messaging";
export * from "./wishlists";
export * from "./documents";
export * from "./tours";
export * from "./chat";
export * from "./google-calendar";
export * from "./rbac";
export * from "./analytics";