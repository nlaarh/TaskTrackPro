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
import { eq } from "drizzle-orm";

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
}

export const correctedStorage = new CorrectedDatabaseStorage();