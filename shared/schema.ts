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

// Florist authentication table - ACTUAL database structure
export const floristAuth = pgTable("florist_auth", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  isVerified: boolean("is_verified").default(false),
  verificationToken: varchar("verification_token"),
  resetToken: varchar("reset_token"),
  resetTokenExpires: timestamp("reset_token_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Florists business listing table - ACTUAL database structure
export const florists = pgTable("florists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  email: varchar("email"),
  phone: varchar("phone"),
  businessName: varchar("business_name"),
  address: varchar("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  website: varchar("website"),
  profileSummary: text("profile_summary"),
  yearsOfExperience: integer("years_of_experience"),
  specialties: varchar("specialties").array(),
  services: varchar("services").array(),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  profileImageUrl: varchar("profile_image_url"),
  hours: jsonb("hours"),
  averageRating: text("average_rating"),
  totalReviews: integer("total_reviews"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const insertFloristSchema = createInsertSchema(florists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

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
export type InsertFlorist = z.infer<typeof insertFloristSchema>;
export type Florist = typeof florists.$inferSelect;
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