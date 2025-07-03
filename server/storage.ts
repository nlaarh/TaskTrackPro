import {
  users,
  florists,
  floristImages,
  reviews,
  inquiries,
  newsletterSubscriptions,
  savedFlorists,
  floristAuth,
  type User,
  type UpsertUser,
  type InsertFlorist,
  type Florist,
  type InsertFloristImage,
  type FloristImage,
  type InsertReview,
  type Review,
  type InsertInquiry,
  type Inquiry,
  type InsertNewsletterSubscription,
  type NewsletterSubscription,
  type InsertSavedFlorist,
  type SavedFlorist,
  type FloristWithDetails,
  type FloristWithReviews,
  type InsertFloristAuth,
  type FloristAuth,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, ilike, or, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Florist authentication
  createFloristAuth(florist: InsertFloristAuth): Promise<FloristAuth>;
  getFloristAuthByEmail(email: string): Promise<FloristAuth | undefined>;
  getFloristAuthById(id: number): Promise<FloristAuth | undefined>;
  updateFloristAuth(id: number, updates: Partial<InsertFloristAuth>): Promise<FloristAuth | undefined>;
  
  // Florist operations
  createFlorist(florist: InsertFlorist): Promise<Florist>;
  getFlorist(id: number): Promise<FloristWithDetails | undefined>;
  getFloristByUserId(userId: string): Promise<Florist | undefined>;
  getFloristByEmail(email: string): Promise<FloristWithDetails | undefined>;
  updateFlorist(id: number, updates: Partial<InsertFlorist>): Promise<Florist | undefined>;
  deleteFlorist(id: number): Promise<boolean>;
  searchFlorists(params: {
    keyword?: string;
    location?: string;
    services?: string[];
    latitude?: number;
    longitude?: number;
    radius?: number;
    sortBy?: 'distance' | 'rating' | 'newest';
    limit?: number;
    offset?: number;
  }): Promise<{ florists: FloristWithDetails[]; total: number }>;
  getFeaturedFlorists(limit?: number): Promise<FloristWithDetails[]>;
  
  // Florist images
  addFloristImage(image: InsertFloristImage): Promise<FloristImage>;
  getFloristImages(floristId: number): Promise<FloristImage[]>;
  deleteFloristImage(id: number): Promise<boolean>;
  updatePrimaryImage(floristId: number, imageId: number): Promise<boolean>;
  
  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getFloristReviews(floristId: number): Promise<(Review & { user: User })[]>;
  getFloristWithReviews(id: number): Promise<FloristWithReviews | undefined>;
  updateFloristRating(floristId: number): Promise<void>;
  
  // Inquiries
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getFloristInquiries(floristId: number): Promise<Inquiry[]>;
  getUserInquiries(userId: string): Promise<Inquiry[]>;
  updateInquiryStatus(id: number, status: string): Promise<boolean>;
  
  // Newsletter
  subscribeNewsletter(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  unsubscribeNewsletter(email: string): Promise<boolean>;
  
  // Saved florists
  saveFlorist(savedFlorist: InsertSavedFlorist): Promise<SavedFlorist>;
  unsaveFlorist(userId: string, floristId: number): Promise<boolean>;
  getUserSavedFlorists(userId: string): Promise<FloristWithDetails[]>;
  isFloristSaved(userId: string, floristId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Florist operations
  async createFlorist(florist: InsertFlorist): Promise<Florist> {
    const [newFlorist] = await db.insert(florists).values(florist).returning();
    return newFlorist;
  }

  async getFlorist(id: number): Promise<FloristWithDetails | undefined> {
    const result = await db
      .select({
        florist: florists,
        user: users,
      })
      .from(florists)
      .leftJoin(users, eq(florists.userId, users.id))
      .where(eq(florists.id, id))
      .limit(1);

    if (!result[0]) return undefined;

    const images = await this.getFloristImages(id);

    return {
      ...result[0].florist,
      user: result[0].user!,
      images,
    };
  }

  async getFloristByUserId(userId: string): Promise<Florist | undefined> {
    const [florist] = await db
      .select()
      .from(florists)
      .where(eq(florists.userId, userId))
      .limit(1);
    return florist;
  }

  async getFloristByEmail(email: string): Promise<FloristWithDetails | undefined> {
    const result = await db
      .select({
        florist: florists,
        user: users,
        images: floristImages,
      })
      .from(florists)
      .leftJoin(users, eq(florists.userId, users.id))
      .leftJoin(floristImages, eq(florists.id, floristImages.floristId))
      .where(eq(florists.email, email));

    if (result.length === 0) {
      return undefined;
    }

    // Group images and build the florist with details
    const firstResult = result[0];
    const images = result
      .filter(r => r.images)
      .map(r => r.images!);

    return {
      ...firstResult.florist,
      user: firstResult.user || {
        id: '',
        email: null,
        firstName: null,
        lastName: null,
        profileImageUrl: null,
        role: 'florist',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      images,
      averageRating: firstResult.florist.averageRating ? parseFloat(firstResult.florist.averageRating) : undefined,
    } as FloristWithDetails;
  }


  async updateFlorist(id: number, updates: Partial<InsertFlorist>): Promise<Florist | undefined> {
    const [updatedFlorist] = await db
      .update(florists)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(florists.id, id))
      .returning();
    return updatedFlorist;
  }

  async deleteFlorist(id: number): Promise<boolean> {
    const result = await db.delete(florists).where(eq(florists.id, id));
    return result.rowCount > 0;
  }

  async searchFlorists(params: {
    keyword?: string;
    location?: string;
    services?: string[];
    latitude?: number;
    longitude?: number;
    radius?: number;
    sortBy?: 'distance' | 'rating' | 'newest';
    limit?: number;
    offset?: number;
  }): Promise<{ florists: FloristWithDetails[]; total: number }> {
    let query = db
      .select({
        florist: florists,
        user: users,
        distance: params.latitude && params.longitude
          ? sql<number>`
            (3959 * acos(
              cos(radians(${params.latitude})) * 
              cos(radians(${florists.latitude})) * 
              cos(radians(${florists.longitude}) - radians(${params.longitude})) + 
              sin(radians(${params.latitude})) * 
              sin(radians(${florists.latitude}))
            ))
          `
          : sql<number>`0`,
      })
      .from(florists)
      .leftJoin(users, eq(florists.userId, users.id))
      .where(eq(florists.isActive, true));

    // Apply filters
    const conditions = [eq(florists.isActive, true)];

    if (params.keyword) {
      conditions.push(
        or(
          ilike(florists.businessName, `%${params.keyword}%`),
          ilike(florists.description, `%${params.keyword}%`)
        )!
      );
    }

    if (params.location) {
      conditions.push(
        or(
          ilike(florists.city, `%${params.location}%`),
          ilike(florists.state, `%${params.location}%`),
          ilike(florists.zipCode, `%${params.location}%`)
        )!
      );
    }

    if (params.services && params.services.length > 0) {
      conditions.push(
        sql`${florists.services} && ${params.services}`
      );
    }

    if (params.radius && params.latitude && params.longitude) {
      conditions.push(
        sql`
          (3959 * acos(
            cos(radians(${params.latitude})) * 
            cos(radians(${florists.latitude})) * 
            cos(radians(${florists.longitude}) - radians(${params.longitude})) + 
            sin(radians(${params.latitude})) * 
            sin(radians(${florists.latitude}))
          )) <= ${params.radius}
        `
      );
    }

    if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (params.sortBy === 'distance' && params.latitude && params.longitude) {
      query = query.orderBy(asc(sql`distance`));
    } else if (params.sortBy === 'rating') {
      query = query.orderBy(desc(florists.rating));
    } else {
      query = query.orderBy(desc(florists.createdAt));
    }

    // Apply pagination
    if (params.offset) {
      query = query.offset(params.offset);
    }
    if (params.limit) {
      query = query.limit(params.limit);
    }

    const results = await query;

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(florists)
      .where(and(...conditions));

    // Get images for each florist
    const floristsWithImages = await Promise.all(
      results.map(async (result) => {
        const images = await this.getFloristImages(result.florist.id);
        return {
          ...result.florist,
          user: result.user!,
          images,
          distance: result.distance,
        };
      })
    );

    return {
      florists: floristsWithImages,
      total: total as number,
    };
  }

  async getFeaturedFlorists(limit = 6): Promise<FloristWithDetails[]> {
    const results = await db
      .select({
        florist: florists,
        user: users,
      })
      .from(florists)
      .leftJoin(users, eq(florists.userId, users.id))
      .where(and(eq(florists.isActive, true), eq(florists.isVerified, true)))
      .orderBy(desc(florists.rating))
      .limit(limit);

    const floristsWithImages = await Promise.all(
      results.map(async (result) => {
        const images = await this.getFloristImages(result.florist.id);
        return {
          ...result.florist,
          user: result.user!,
          images,
        };
      })
    );

    return floristsWithImages;
  }

  // Florist images
  async addFloristImage(image: InsertFloristImage): Promise<FloristImage> {
    const [newImage] = await db.insert(floristImages).values(image).returning();
    return newImage;
  }

  async getFloristImages(floristId: number): Promise<FloristImage[]> {
    return await db
      .select()
      .from(floristImages)
      .where(eq(floristImages.floristId, floristId))
      .orderBy(desc(floristImages.isPrimary), desc(floristImages.createdAt));
  }

  async deleteFloristImage(id: number): Promise<boolean> {
    const result = await db.delete(floristImages).where(eq(floristImages.id, id));
    return result.rowCount > 0;
  }

  async updatePrimaryImage(floristId: number, imageId: number): Promise<boolean> {
    await db.transaction(async (tx) => {
      // Remove primary flag from all images
      await tx
        .update(floristImages)
        .set({ isPrimary: false })
        .where(eq(floristImages.floristId, floristId));

      // Set new primary image
      await tx
        .update(floristImages)
        .set({ isPrimary: true })
        .where(eq(floristImages.id, imageId));
    });

    return true;
  }

  // Reviews
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    await this.updateFloristRating(review.floristId);
    return newReview;
  }

  async getFloristReviews(floristId: number): Promise<(Review & { user: User })[]> {
    const results = await db
      .select({
        review: reviews,
        user: users,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.floristId, floristId))
      .orderBy(desc(reviews.createdAt));

    return results.map((result) => ({
      ...result.review,
      user: result.user!,
    }));
  }

  async getFloristWithReviews(id: number): Promise<FloristWithReviews | undefined> {
    const florist = await this.getFlorist(id);
    if (!florist) return undefined;

    const reviewsWithUsers = await this.getFloristReviews(id);

    return {
      ...florist,
      reviews: reviewsWithUsers,
    };
  }

  async updateFloristRating(floristId: number): Promise<void> {
    const [result] = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})`,
        reviewCount: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.floristId, floristId));

    await db
      .update(florists)
      .set({
        rating: result.avgRating ? result.avgRating.toString() : "0",
        reviewCount: result.reviewCount as number,
      })
      .where(eq(florists.id, floristId));
  }

  // Inquiries
  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [newInquiry] = await db.insert(inquiries).values(inquiry).returning();
    return newInquiry;
  }

  async getFloristInquiries(floristId: number): Promise<Inquiry[]> {
    return await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.floristId, floristId))
      .orderBy(desc(inquiries.createdAt));
  }

  async getUserInquiries(userId: string): Promise<Inquiry[]> {
    return await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.userId, userId))
      .orderBy(desc(inquiries.createdAt));
  }

  async updateInquiryStatus(id: number, status: string): Promise<boolean> {
    const result = await db
      .update(inquiries)
      .set({ status })
      .where(eq(inquiries.id, id));
    return result.rowCount > 0;
  }

  // Newsletter
  async subscribeNewsletter(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [newSubscription] = await db
      .insert(newsletterSubscriptions)
      .values(subscription)
      .onConflictDoUpdate({
        target: newsletterSubscriptions.email,
        set: { isActive: true },
      })
      .returning();
    return newSubscription;
  }

  async unsubscribeNewsletter(email: string): Promise<boolean> {
    const result = await db
      .update(newsletterSubscriptions)
      .set({ isActive: false })
      .where(eq(newsletterSubscriptions.email, email));
    return result.rowCount > 0;
  }

  // Saved florists
  async saveFlorist(savedFlorist: InsertSavedFlorist): Promise<SavedFlorist> {
    const [newSavedFlorist] = await db
      .insert(savedFlorists)
      .values(savedFlorist)
      .onConflictDoNothing()
      .returning();
    return newSavedFlorist;
  }

  async unsaveFlorist(userId: string, floristId: number): Promise<boolean> {
    const result = await db
      .delete(savedFlorists)
      .where(and(eq(savedFlorists.userId, userId), eq(savedFlorists.floristId, floristId)));
    return result.rowCount > 0;
  }

  async getUserSavedFlorists(userId: string): Promise<FloristWithDetails[]> {
    const results = await db
      .select({
        florist: florists,
        user: users,
      })
      .from(savedFlorists)
      .leftJoin(florists, eq(savedFlorists.floristId, florists.id))
      .leftJoin(users, eq(florists.userId, users.id))
      .where(eq(savedFlorists.userId, userId))
      .orderBy(desc(savedFlorists.createdAt));

    const floristsWithImages = await Promise.all(
      results.map(async (result) => {
        const images = await this.getFloristImages(result.florist.id);
        return {
          ...result.florist,
          user: result.user!,
          images,
        };
      })
    );

    return floristsWithImages;
  }

  async isFloristSaved(userId: string, floristId: number): Promise<boolean> {
    const [result] = await db
      .select()
      .from(savedFlorists)
      .where(and(eq(savedFlorists.userId, userId), eq(savedFlorists.floristId, floristId)))
      .limit(1);
    return !!result;
  }

  // Florist authentication methods
  async createFloristAuth(florist: InsertFloristAuth): Promise<FloristAuth> {
    const [result] = await db
      .insert(floristAuth)
      .values(florist)
      .returning();
    return result;
  }

  async getFloristAuthByEmail(email: string): Promise<FloristAuth | undefined> {
    const [result] = await db
      .select()
      .from(floristAuth)
      .where(eq(floristAuth.email, email))
      .limit(1);
    return result;
  }

  async getFloristAuthById(id: number): Promise<FloristAuth | undefined> {
    const [result] = await db
      .select()
      .from(floristAuth)
      .where(eq(floristAuth.id, id))
      .limit(1);
    return result;
  }

  async updateFloristAuth(id: number, updates: Partial<InsertFloristAuth>): Promise<FloristAuth | undefined> {
    const [result] = await db
      .update(floristAuth)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(floristAuth.id, id))
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
