import {
  users,
  floristAuth,
  florists,
  type User,
  type UpsertUser,
  type FloristAuth,
  type Florist
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc, sql } from "drizzle-orm";

// Corrected storage interface reflecting actual database structure
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Florist authentication operations (florist_auth table)
  createFloristAuth(authData: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }): Promise<FloristAuth>;
  getFloristAuthByEmail(email: string): Promise<FloristAuth | undefined>;
  getFloristAuthById(id: number): Promise<FloristAuth | undefined>;
  
  // Business profile operations (florists table)
  createOrUpdateFloristProfile(floristAuthId: number, profileData: {
    businessName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    website?: string;
    profileSummary?: string;
    yearsOfExperience?: number;
    specialties?: string[];
    services?: string[];
    profileImageUrl?: string;
  }): Promise<Florist>;
  
  getFloristProfile(floristAuthId: number): Promise<{
    auth: FloristAuth;
    business: Florist | null;
  }>;
  
  // Reference data
  getSpecialties(): Promise<any[]>;
  getServices(): Promise<any[]>;
  
  // Search functionality
  searchFlorists(params: {
    location?: string;
    specialty?: string;
    service?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]>;
}

export class CorrectedDatabaseStorage implements IStorage {
  // User operations (Replit Auth)
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

  // Florist authentication (florist_auth table only)
  async createFloristAuth(authData: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }): Promise<FloristAuth> {
    console.log('Creating florist auth record:', { email: authData.email });
    
    const [authRecord] = await db
      .insert(floristAuth)
      .values({
        email: authData.email,
        passwordHash: authData.passwordHash,
        firstName: authData.firstName,
        lastName: authData.lastName,
        isVerified: false,
      })
      .returning();
    
    return authRecord;
  }

  async getFloristAuthByEmail(email: string): Promise<FloristAuth | undefined> {
    const [authRecord] = await db
      .select()
      .from(floristAuth)
      .where(eq(floristAuth.email, email));
    return authRecord;
  }

  async getFloristAuthById(id: number): Promise<FloristAuth | undefined> {
    const [authRecord] = await db
      .select()
      .from(floristAuth)
      .where(eq(floristAuth.id, id));
    return authRecord;
  }

  // Get florist by ID
  async getFloristById(id: number): Promise<Florist | null> {
    try {
      const result = await db
        .select()
        .from(florists)
        .where(eq(florists.id, id))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error("Error getting florist by ID:", error);
      throw error;
    }
  }

  // Business profile operations (florists table)
  async createOrUpdateFloristProfile(floristAuthId: number, profileData: {
    businessName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    website?: string;
    profileSummary?: string;
    yearsOfExperience?: number;
    specialties?: string[];
    services?: string[];
    profileImageUrl?: string;
  }): Promise<Florist> {
    console.log('Creating/updating florist profile for auth ID:', floristAuthId);
    
    // Get auth record to get email
    const authRecord = await this.getFloristAuthById(floristAuthId);
    if (!authRecord) {
      throw new Error('Florist auth record not found');
    }

    // Create or update florist profile
    const [businessProfile] = await db
      .insert(florists)
      .values({
        userId: floristAuthId,
        email: authRecord.email,
        businessName: profileData.businessName,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zipCode,
        phone: profileData.phone,
        website: profileData.website,
        profileSummary: profileData.profileSummary,
        yearsOfExperience: profileData.yearsOfExperience || 0,
        specialties: profileData.specialties || [],
        services: profileData.services || [],
        profileImageUrl: profileData.profileImageUrl,
        isActive: true,
        isFeatured: false,
      })
      .onConflictDoUpdate({
        target: florists.email,
        set: {
          businessName: profileData.businessName,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zipCode: profileData.zipCode,
          phone: profileData.phone,
          website: profileData.website,
          profileSummary: profileData.profileSummary,
          yearsOfExperience: profileData.yearsOfExperience || 0,
          specialties: profileData.specialties || [],
          services: profileData.services || [],
          profileImageUrl: profileData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();

    return businessProfile;
  }

  async getFloristProfile(floristAuthId: number): Promise<{
    auth: FloristAuth;
    business: Florist | null;
  }> {
    console.log('Getting florist profile for auth ID:', floristAuthId);
    
    // Get auth record
    const authRecord = await this.getFloristAuthById(floristAuthId);
    if (!authRecord) {
      throw new Error('Florist auth record not found');
    }

    // Get business profile
    const [businessProfile] = await db
      .select()
      .from(florists)
      .where(eq(florists.userId, floristAuthId));

    return {
      auth: authRecord,
      business: businessProfile || null,
    };
  }

  // Reference data operations
  async getSpecialties(): Promise<any[]> {
    // Hardcoded for now - can be moved to database later
    return [
      { id: 1, name: "Wedding Arrangements", description: "Beautiful bridal bouquets and ceremony decorations" },
      { id: 2, name: "Funeral Arrangements", description: "Respectful sympathy flowers and memorial pieces" },
      { id: 3, name: "Anniversary Celebrations", description: "Romantic arrangements for special milestones" },
      { id: 4, name: "Birthday Celebrations", description: "Cheerful flowers for birthday parties" },
      { id: 5, name: "Corporate Events", description: "Professional arrangements for business occasions" }
    ];
  }

  async getServices(): Promise<any[]> {
    // Hardcoded for now - can be moved to database later
    return [
      { id: 1, name: "Same-Day Service", description: "Quick delivery for urgent orders" },
      { id: 2, name: "Delivery Service", description: "Professional flower delivery" },
      { id: 3, name: "Event Setup", description: "On-site arrangement and decoration" },
      { id: 4, name: "Consultation", description: "Expert advice for your floral needs" },
      { id: 5, name: "Custom Arrangements", description: "Personalized flower designs" }
    ];
  }

  // Search functionality
  async searchFlorists(params: {
    location?: string;
    specialty?: string;
    service?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      console.log('Searching florists with params:', params);
      
      let query = db
        .select({
          id: florists.id,
          businessName: florists.businessName,
          address: florists.address,
          city: florists.city,
          state: florists.state,
          zipCode: florists.zipCode,
          phone: florists.phone,
          website: florists.website,
          profileSummary: florists.profileSummary,
          yearsOfExperience: florists.yearsOfExperience,
          specialties: florists.specialties,
          services: florists.services,
          profileImageUrl: florists.profileImageUrl,
          createdAt: florists.createdAt,
          // Include auth data for complete profile
          firstName: floristAuth.firstName,
          lastName: floristAuth.lastName,
          email: floristAuth.email
        })
        .from(florists)
        .innerJoin(floristAuth, eq(florists.userId, floristAuth.id))
        .where(eq(florists.businessName, ''));  // Start with a condition that will be modified

      // Remove the dummy where condition
      query = db
        .select({
          id: florists.id,
          businessName: florists.businessName,
          address: florists.address,
          city: florists.city,
          state: florists.state,
          zipCode: florists.zipCode,
          phone: florists.phone,
          website: florists.website,
          profileSummary: florists.profileSummary,
          yearsOfExperience: florists.yearsOfExperience,
          specialties: florists.specialties,
          services: florists.services,
          profileImageUrl: florists.profileImageUrl,
          createdAt: florists.createdAt,
          firstName: floristAuth.firstName,
          lastName: floristAuth.lastName,
          email: floristAuth.email
        })
        .from(florists)
        .innerJoin(floristAuth, eq(florists.userId, floristAuth.id));

      // Add filters based on search parameters
      const conditions: any[] = [];

      if (params.location) {
        // Search in city, state, or zipCode
        const locationPattern = `%${params.location.toLowerCase()}%`;
        conditions.push(
          or(
            ilike(florists.city, locationPattern),
            ilike(florists.state, locationPattern),
            ilike(florists.zipCode, locationPattern)
          )
        );
      }

      // TODO: Fix array filtering - temporarily disabled to get basic search working
      // if (params.specialty) {
      //   conditions.push(
      //     sql`${florists.specialties} && ${[params.specialty]}`
      //   );
      // }

      // if (params.service) {
      //   conditions.push(
      //     sql`${florists.services} && ${[params.service]}`
      //   );
      // }

      // Apply filters if any exist
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Add ordering (by creation date, newest first)
      query = query.orderBy(desc(florists.createdAt));

      // Add pagination
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (params.offset) {
        query = query.offset(params.offset);
      }

      const results = await query;
      console.log(`Found ${results.length} florists`);
      
      // Transform data to match frontend expectations
      const transformedResults = results.map(florist => ({
        id: florist.id,
        businessName: florist.businessName,
        address: florist.address,
        city: florist.city,
        state: florist.state,
        zipCode: florist.zipCode,
        phone: florist.phone,
        website: florist.website,
        profileSummary: florist.profileSummary,
        yearsOfExperience: florist.yearsOfExperience,
        specialties: florist.specialties || [],
        services: florist.services || [],
        firstName: florist.firstName,
        lastName: florist.lastName,
        email: florist.email,
        createdAt: florist.createdAt,
        // Transform profileImageUrl to expected images array format
        images: florist.profileImageUrl ? [{
          id: 1,
          url: florist.profileImageUrl,
          isPrimary: true,
          alt: `${florist.businessName} profile photo`
        }] : [],
        // Add default values for missing fields expected by frontend
        rating: "4.5", // Default rating
        distance: null,
        reviewCount: 0,
        isOpen: true,
        tags: [],
        location: {
          lat: null,
          lng: null
        }
      }));
      
      return transformedResults;
    } catch (error) {
      console.error('Search florists error:', error);
      throw error;
    }
  }
}

export const correctedStorage = new CorrectedDatabaseStorage();