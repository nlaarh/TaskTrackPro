import {
  users,
  userRoles,
  floristAuth,
  florists,
  reviews,
  type User,
  type UpsertUser,
  type FloristAuth,
  type Florist
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, or, ilike, desc, sql } from "drizzle-orm";
import { Pool } from 'pg';

// Corrected storage interface reflecting actual database structure
export interface IStorage {
  // Customer operations (username/password auth)
  createUser(userData: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserRoles(email: string): Promise<string[]>;
  addUserRole(email: string, role: string): Promise<void>;
  
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
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllFlorists(): Promise<Florist[]>;
}

export class CorrectedDatabaseStorage implements IStorage {
  // Customer operations (username/password auth)
  async createUser(userData: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    try {
      // Generate a unique ID
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const [newUser] = await db
        .insert(users)
        .values({
          id: userId,
          email: userData.email,
          passwordHash: userData.passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'customer',
          isVerified: false,
        })
        .returning();
      
      // Add customer role to user_roles table
      await this.addUserRole(userData.email, 'customer');
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Use raw SQL query to avoid Drizzle schema mismatch
      const result = await db.execute(sql`
        SELECT * FROM users WHERE email = ${email} LIMIT 1
      `);
      
      if (result.rows.length === 0) return undefined;
      
      const row = result.rows[0] as any;
      return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        firstName: row.first_name,
        lastName: row.last_name,
        profileImageUrl: row.profile_image_url,
        role: row.role,
        isVerified: row.is_verified || false,
        verificationToken: row.verification_token,
        resetToken: row.reset_token,
        resetTokenExpires: row.reset_token_expires,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserById(id: string): Promise<User | undefined> {
    try {
      // Use raw SQL query to avoid Drizzle schema mismatch
      const result = await db.execute(sql`
        SELECT id, email, password_hash, first_name, last_name, profile_image_url, role, is_verified, created_at, updated_at 
        FROM users 
        WHERE id = ${id}
        LIMIT 1
      `);
      
      if (result.rows.length === 0) return undefined;
      
      const row = result.rows[0] as any;
      return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        firstName: row.first_name,
        lastName: row.last_name,
        profileImageUrl: row.profile_image_url,
        role: row.role,
        isVerified: row.is_verified,
        verificationToken: null,
        resetToken: null,
        resetTokenExpires: null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }

  async getUserRoles(email: string): Promise<string[]> {
    try {
      const roles = await db
        .select({ role: userRoles.role })
        .from(userRoles)
        .where(eq(userRoles.userEmail, email));
      return roles.map(r => r.role);
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }

  async addUserRole(email: string, role: string): Promise<void> {
    try {
      await db
        .insert(userRoles)
        .values({ userEmail: email, role })
        .onConflictDoNothing();
    } catch (error) {
      console.error('Error adding user role:', error);
      throw error;
    }
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
  }): Promise<{ florists: any[]; total: number }> {
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

      // Get total count for pagination (before applying limit/offset)
      let countQuery = db
        .select({ count: sql`count(*)` })
        .from(florists)
        .innerJoin(floristAuth, eq(florists.userId, floristAuth.id));

      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }

      const [totalResult] = await countQuery;
      const total = Number(totalResult.count);

      const results = await query;
      console.log(`Found ${results.length} florists out of ${total} total`);
      
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
      
      return {
        florists: transformedResults,
        total: total
      };
    } catch (error) {
      console.error('Search florists error:', error);
      throw error;
    }
  }

  async getReviewsByFloristId(floristId: number) {
    try {
      const reviewsResult = await db
        .select({
          id: reviews.id,
          floristId: reviews.floristId,
          userId: reviews.userId,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .where(eq(reviews.floristId, floristId))
        .orderBy(desc(reviews.createdAt));

      return reviewsResult;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    try {
      console.log('getAllUsers: Starting query...');
      console.log('Database URL:', process.env.DATABASE_URL ? 'configured' : 'missing');
      
      // Use direct pool connection to bypass any Drizzle ORM issues  
      const testPool = new Pool({
        connectionString: "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb",
        ssl: false
      });
      
      const directResult = await testPool.query(`
        SELECT id, email, first_name, last_name, role, created_at 
        FROM users 
        ORDER BY created_at DESC
      `);
      
      await testPool.end();
      
      console.log('getAllUsers: Direct pool query result:', directResult.rows.length, 'users');
      
      const result = directResult;
      
      console.log('getAllUsers: Raw result:', result);
      console.log('getAllUsers: Rows count:', result.rows?.length || 0);
      
      if (!result.rows || result.rows.length === 0) {
        console.warn('getAllUsers: No rows returned from database');
        return [];
      }
      
      const users = result.rows.map((row: any) => ({
        id: row.id,
        email: row.email,
        passwordHash: '',
        firstName: row.first_name,
        lastName: row.last_name,
        profileImageUrl: null,
        role: row.role,
        isVerified: true,
        verificationToken: null,
        resetToken: null,
        resetTokenExpires: null,
        createdAt: row.created_at,
        updatedAt: null,
      }));
      
      console.log('getAllUsers: Returning', users.length, 'users');
      return users;
      
    } catch (error) {
      console.error('getAllUsers: Error occurred:', error);
      throw error;
    }
  }

  async getAllFlorists(): Promise<Florist[]> {
    try {
      console.log('getAllFlorists: Querying florist_auth table (contains all 52 florist business records)...');
      
      // Query florist_auth table - this contains all florist business data
      const result = await pool.query(`
        SELECT 
          id,
          email,
          first_name,
          last_name,
          business_name,
          address,
          city,
          state,
          zip_code,
          phone,
          website,
          profile_summary,
          years_of_experience,
          specialties,
          services_offered,
          profile_image_url,
          business_hours,
          is_verified,
          created_at,
          updated_at
        FROM florist_auth
        ORDER BY created_at DESC
      `);
      
      console.log('getAllFlorists: Found', result.rows?.length || 0, 'florist records');
      
      if (!result.rows || result.rows.length === 0) {
        console.warn('getAllFlorists: No florists found in florist_auth table');
        return [];
      }

      // Transform the raw database rows to match Florist interface
      const florists = result.rows.map((row: any) => ({
        id: row.id,
        businessName: row.business_name || 'Unnamed Florist',
        address: row.address || null,
        city: row.city || null,
        state: row.state || null,
        zipCode: row.zip_code || null,
        phone: row.phone || null,
        website: row.website || null,
        profileSummary: row.profile_summary || null,
        yearsOfExperience: row.years_of_experience || 0,
        specialties: Array.isArray(row.specialties) ? row.specialties : [],
        services: Array.isArray(row.services_offered) ? row.services_offered : [],
        profileImageUrl: row.profile_image_url || null,
        businessHours: row.business_hours || null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        userId: row.id,
        latitude: null,
        longitude: null,
        isFeatured: row.is_verified || false,
        averageRating: null,
        totalReviews: 0
      }));
      
      console.log('getAllFlorists: Returning', florists.length, 'florists');
      console.log('getAllFlorists: Sample businesses:', florists.slice(0, 3).map(f => f.businessName));
      return florists;
      
    } catch (error) {
      console.error('getAllFlorists: Error occurred:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (userData.firstName) {
        updateFields.push(`first_name = $${paramIndex++}`);
        values.push(userData.firstName);
      }
      if (userData.lastName) {
        updateFields.push(`last_name = $${paramIndex++}`);
        values.push(userData.lastName);
      }
      if (userData.email) {
        updateFields.push(`email = $${paramIndex++}`);
        values.push(userData.email);
      }
      if (userData.role) {
        updateFields.push(`role = $${paramIndex++}`);
        values.push(userData.role);
      }
      
      updateFields.push(`updated_at = $${paramIndex++}`);
      values.push(new Date());
      values.push(id);

      const result = await db.execute(sql.raw(`
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, email, password_hash, first_name, last_name, profile_image_url, role, is_verified, created_at, updated_at
      `, values));
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const row = result.rows[0] as any;
      return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        firstName: row.first_name,
        lastName: row.last_name,
        profileImageUrl: row.profile_image_url,
        role: row.role,
        isVerified: row.is_verified,
        verificationToken: null,
        resetToken: null,
        resetTokenExpires: null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      // Use direct pool connection for deletion
      const testPool = new Pool({
        connectionString: "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb",
        ssl: false
      });
      
      // First delete from user_roles table
      await testPool.query('DELETE FROM user_roles WHERE user_email IN (SELECT email FROM users WHERE id = $1)', [id]);
      
      // Then delete from users table
      const result = await testPool.query('DELETE FROM users WHERE id = $1', [id]);
      
      await testPool.end();
      
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export const correctedStorage = new CorrectedDatabaseStorage();