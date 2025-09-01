import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Customer authentication table - Updated for username/password auth with string ID (matching existing database)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("customer"),
  isVerified: boolean("is_verified").default(false),
  verificationToken: varchar("verification_token"),
  resetToken: varchar("reset_token"),
  resetTokenExpires: timestamp("reset_token_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User roles table for multiple roles per user
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userEmail: varchar("user_email").notNull(),
  role: varchar("role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  { unique: [table.userEmail, table.role] }
]);

// Website contact information table
export const websiteInfo = pgTable("website_info", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name").default("FloriHub"),
  ownerName: varchar("owner_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  website: varchar("website"),
  description: text("description"),
  socialMedia: jsonb("social_media").$type<{
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  }>(),
  businessHours: jsonb("business_hours").$type<{
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
  }>(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"), // Admin user who made the update
});

// Florist authentication AND business data - EXACT MATCH TO RAILWAY DATABASE
export const floristAuth = pgTable("florist_auth", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  businessName: varchar("business_name"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  phone: varchar("phone"),
  profileImageUrl: varchar("profile_image_url"),
  profileImageData: text("profile_image_data"), // Base64 encoded image data
  profileSummary: text("profile_summary"),
  yearsOfExperience: integer("years_of_experience"),
  specialties: text("specialties").array(),
  businessHours: jsonb("business_hours"),
  website: varchar("website"),
  socialMedia: jsonb("social_media"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  passwordHash: varchar("password_hash"),
  servicesOffered: text("services_offered").array(),
});

// Florist catalog/portfolio images
export const floristCatalog = pgTable("florist_catalog", {
  id: serial("id").primaryKey(),
  floristId: integer("florist_id").notNull(),
  imageUrl: varchar("image_url").notNull(),
  altText: varchar("alt_text"),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  floristId: integer("florist_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer inquiries
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  floristId: integer("florist_id").notNull(),
  userId: varchar("user_id"),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  eventType: varchar("event_type"),
  eventDate: timestamp("event_date"),
  budget: varchar("budget"),
  message: text("message").notNull(),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Newsletter subscriptions
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved florists (user favorites)
export const savedFlorists = pgTable("saved_florists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  floristId: integer("florist_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reference tables for admin-managed lists
export const specialtiesReference = pgTable("specialties_reference", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const servicesReference = pgTable("services_reference", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Validation schemas
export const insertFloristAuthSchema = createInsertSchema(floristAuth).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// No separate florist table - all data in floristAuth
// export const insertFloristSchema = createInsertSchema(florists).omit({
//   id: true,
//   createdAt: true,
//   updatedAt: true,
// });

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

// Customer auth schemas for forms
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  passwordHash: true,
  verificationToken: true,
  resetToken: true,
  resetTokenExpires: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertFloristAuth = z.infer<typeof insertFloristAuthSchema>;
export type FloristAuth = typeof floristAuth.$inferSelect;
// Updated types - floristAuth contains all data
export type InsertFlorist = z.infer<typeof insertFloristAuthSchema>;
export type Florist = typeof floristAuth.$inferSelect;
export type FloristCatalogImage = typeof floristCatalog.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type SavedFlorist = typeof savedFlorists.$inferSelect;

// Extended types for API responses
export type FloristWithDetails = Florist & {
  catalogImages: FloristCatalogImage[];
};

export type SpecialtyReference = typeof specialtiesReference.$inferSelect;
export type ServiceReference = typeof servicesReference.$inferSelect;

// Website info schemas
export const insertWebsiteInfoSchema = createInsertSchema(websiteInfo).omit({
  id: true,
  updatedAt: true,
});

export type WebsiteInfo = typeof websiteInfo.$inferSelect;
export type InsertWebsiteInfo = z.infer<typeof insertWebsiteInfoSchema>;