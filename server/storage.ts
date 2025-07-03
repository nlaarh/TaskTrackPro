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
import { db, pool } from "./db";
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
    try {
      console.log('Creating florist with data:', florist);
      const [newFlorist] = await db.insert(florists).values(florist).returning();
      console.log('Florist created successfully:', newFlorist);
      return newFlorist;
    } catch (error) {
      console.error('Error creating florist:', error);
      throw error;
    }
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
    // For florist auth system, get the florist without complex joins
    const [florist] = await db
      .select()
      .from(florists)
      .where(eq(florists.email, email))
      .limit(1);

    if (!florist) {
      return undefined;
    }

    // Get images separately to avoid join issues
    const images = await db
      .select()
      .from(floristImages)
      .where(eq(floristImages.floristId, florist.id));

    // Create a mock user object since florists use their own auth system
    const mockUser = {
      id: florist.email || '',
      email: florist.email,
      firstName: null,
      lastName: null,
      profileImageUrl: florist.profileImageUrl,
      role: 'florist',
      createdAt: florist.createdAt,
      updatedAt: florist.updatedAt,
    };

    return {
      ...florist,
      user: mockUser,
      images,
      averageRating: florist.averageRating ? parseFloat(florist.averageRating) : undefined,
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
    console.log('Creating florist auth with data:', florist);
    
    // Use raw SQL to bypass schema issues
    const query = `
      INSERT INTO florist_auth (
        email, password_hash, first_name, last_name, business_name, 
        address, city, state, zip_code, phone, is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      florist.email,
      florist.passwordHash,
      florist.firstName,
      florist.lastName,
      florist.businessName,
      florist.address,
      florist.city,
      florist.state,
      florist.zipCode,
      florist.phone,
      florist.isVerified
    ];
    
    const result = await pool.query(query, values);
    console.log('Raw insert result:', result.rows[0]);
    
    // Convert database result to match our type
    const dbResult = result.rows[0];
    const floristAuth: FloristAuth = {
      id: dbResult.id,
      email: dbResult.email,
      password: dbResult.password,
      firstName: dbResult.first_name,
      lastName: dbResult.last_name,
      businessName: dbResult.business_name,
      address: dbResult.address,
      city: dbResult.city,
      state: dbResult.state,
      zipCode: dbResult.zip_code,
      phone: dbResult.phone,
      profileImageUrl: dbResult.profile_image_url,
      profileSummary: dbResult.profile_summary,
      yearsOfExperience: dbResult.years_of_experience,
      specialties: dbResult.specialties,
      businessHours: dbResult.business_hours,
      website: dbResult.website,
      socialMedia: dbResult.social_media,
      isVerified: dbResult.is_verified,
      passwordHash: dbResult.password_hash,
      createdAt: dbResult.created_at,
      updatedAt: dbResult.updated_at,
    };
    
    return floristAuth;
  }

  async getFloristAuthByEmail(email: string): Promise<FloristAuth | undefined> {
    console.log('Looking for florist auth with email:', email);
    try {
      // Debug: Check which database we're connected to
      const dbInfoResult = await pool.query('SELECT current_database(), current_user;');
      console.log('Connected to database:', dbInfoResult.rows[0]);
      
      // Use raw SQL query to bypass any Drizzle ORM issues
      const result = await pool.query(
        'SELECT * FROM florist_auth WHERE email = $1 LIMIT 1',
        [email]
      );
      
      console.log('Raw SQL query result:', result.rows);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      const row = result.rows[0];
      const floristAuth: FloristAuth = {
        id: row.id,
        email: row.email,
        password: row.password,
        firstName: row.first_name,
        lastName: row.last_name,
        businessName: row.business_name,
        address: row.address,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
        phone: row.phone,
        profileImageUrl: row.profile_image_url,
        profileSummary: row.profile_summary,
        yearsOfExperience: row.years_of_experience,
        specialties: row.specialties,
        businessHours: row.business_hours,
        website: row.website,
        socialMedia: row.social_media,
        isVerified: row.is_verified,
        passwordHash: row.password_hash,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      
      console.log('Parsed florist auth:', floristAuth);
      return floristAuth;
    } catch (error) {
      console.error('Error in getFloristAuthByEmail:', error);
      return undefined;
    }
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
