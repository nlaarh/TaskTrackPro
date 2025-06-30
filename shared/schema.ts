import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  decimal,
  integer
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
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
  role: varchar("role").notNull().default("customer"), // customer, florist, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Florist authentication table for business owners
export const floristAuth = pgTable("florist_auth", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash").notNull(), // hashed password
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
  specialties: text("specialties").array(),
  businessHours: jsonb("business_hours"),
  website: varchar("website"),
  socialMedia: jsonb("social_media"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Florist business listings
export const florists = pgTable("florists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: varchar("business_name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code").notNull(),
  phone: varchar("phone"),
  website: varchar("website"),
  email: varchar("email"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  services: text("services").array().default([]),
  specialties: text("specialties").array().default([]),
  hours: jsonb("hours"), // Store business hours as JSON
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Florist gallery images
export const floristImages = pgTable("florist_images", {
  id: serial("id").primaryKey(),
  floristId: integer("florist_id").notNull().references(() => florists.id),
  imageUrl: varchar("image_url").notNull(),
  caption: text("caption"),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  floristId: integer("florist_id").notNull().references(() => florists.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer inquiries/messages
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  floristId: integer("florist_id").notNull().references(() => florists.id),
  userId: varchar("user_id").references(() => users.id), // can be null for guest inquiries
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  message: text("message").notNull(),
  eventType: varchar("event_type"), // wedding, funeral, birthday, etc.
  eventDate: timestamp("event_date"),
  budget: varchar("budget"),
  status: varchar("status").default("new"), // new, read, responded, closed
  createdAt: timestamp("created_at").defaultNow(),
});

// Newsletter subscriptions
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved florists (user favorites)
export const savedFlorists = pgTable("saved_florists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  floristId: integer("florist_id").notNull().references(() => florists.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  florists: many(florists),
  reviews: many(reviews),
  inquiries: many(inquiries),
  savedFlorists: many(savedFlorists),
}));

export const floristsRelations = relations(florists, ({ one, many }) => ({
  user: one(users, {
    fields: [florists.userId],
    references: [users.id],
  }),
  images: many(floristImages),
  reviews: many(reviews),
  inquiries: many(inquiries),
  savedFlorists: many(savedFlorists),
}));

export const floristImagesRelations = relations(floristImages, ({ one }) => ({
  florist: one(florists, {
    fields: [floristImages.floristId],
    references: [florists.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  florist: one(florists, {
    fields: [reviews.floristId],
    references: [florists.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  florist: one(florists, {
    fields: [inquiries.floristId],
    references: [florists.id],
  }),
  user: one(users, {
    fields: [inquiries.userId],
    references: [users.id],
  }),
}));

export const savedFloristsRelations = relations(savedFlorists, ({ one }) => ({
  user: one(users, {
    fields: [savedFlorists.userId],
    references: [users.id],
  }),
  florist: one(florists, {
    fields: [savedFlorists.floristId],
    references: [florists.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertFloristSchema = createInsertSchema(florists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  reviewCount: true,
});

export const insertFloristImageSchema = createInsertSchema(floristImages).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({
  id: true,
  createdAt: true,
  isActive: true,
});

export const insertSavedFloristSchema = createInsertSchema(savedFlorists).omit({
  id: true,
  createdAt: true,
});

export const insertFloristAuthSchema = createInsertSchema(floristAuth).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFlorist = z.infer<typeof insertFloristSchema>;
export type Florist = typeof florists.$inferSelect;
export type InsertFloristAuth = z.infer<typeof insertFloristAuthSchema>;
export type FloristAuth = typeof floristAuth.$inferSelect;
export type InsertFloristImage = z.infer<typeof insertFloristImageSchema>;
export type FloristImage = typeof floristImages.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertSavedFlorist = z.infer<typeof insertSavedFloristSchema>;
export type SavedFlorist = typeof savedFlorists.$inferSelect;

// Extended types for API responses
export type FloristWithDetails = Florist & {
  images: FloristImage[];
  user: User;
  averageRating?: number;
  distance?: number;
};

export type FloristWithReviews = FloristWithDetails & {
  reviews: (Review & { user: User })[];
};
