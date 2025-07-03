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

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Florist authentication table - exactly matching actual database structure
export const floristAuth = pgTable("florist_auth", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  password: varchar("password"),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  businessName: varchar("business_name").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code").notNull(),
  phone: varchar("phone").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  profileSummary: text("profile_summary"),
  yearsOfExperience: integer("years_of_experience"),
  specialties: varchar("specialties").array(),
  businessHours: jsonb("business_hours"),
  website: varchar("website"),
  socialMedia: jsonb("social_media"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  passwordHash: varchar("password_hash"),
});

// Florists business listing table
export const florists = pgTable("florists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  email: varchar("email"),
  phone: varchar("phone"),
  businessName: varchar("business_name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  website: varchar("website"),
  socialMedia: jsonb("social_media"),
  specialties: varchar("specialties").array(),
  yearsOfExperience: integer("years_of_experience"),
  businessHours: jsonb("business_hours"),
  services: varchar("services").array(),
  priceRange: varchar("price_range"),
  rating: text("rating"),
  reviewCount: integer("review_count"),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  hours: jsonb("hours"),
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
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
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