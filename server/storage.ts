import {
  users,
  floristAuth,
  specialtiesReference,
  servicesReference,
  type User,
  type UpsertUser,
  type FloristAuth,
  type InsertFloristAuth
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Florist authentication operations
  createFloristAuth(florist: InsertFloristAuth): Promise<FloristAuth>;
  getFloristAuthByEmail(email: string): Promise<FloristAuth | undefined>;
  getFloristAuthById(id: number): Promise<FloristAuth | undefined>;
  
  // Profile operations (updates florist_auth table which has all profile fields)
  updateFloristProfile(floristAuthId: number, profileData: any): Promise<any>;
  getFloristProfile(floristAuthId: number): Promise<any>;
  
  // Reference data operations
  getSpecialties(): Promise<any[]>;
  getServices(): Promise<any[]>;
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

  // Florist authentication operations
  async createFloristAuth(florist: InsertFloristAuth): Promise<FloristAuth> {
    console.log('Creating florist auth:', florist);

    const { 
      email, firstName, lastName, businessName, address, city, state, zipCode, phone, passwordHash, isVerified 
    } = florist;

    const query = `
      INSERT INTO florist_auth (
        email, first_name, last_name, business_name, address, city, state, zip_code, phone, password_hash, is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      email, firstName, lastName, businessName, address, city, state, zipCode, phone, passwordHash, isVerified
    ];
    
    try {
      const result = await pool.query(query, values);
      const row = result.rows[0];
      
      // Return object that matches the actual database structure
      return {
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
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        passwordHash: row.password_hash,
      };
    } catch (error) {
      console.error('Error creating florist auth:', error);
      throw error;
    }
  }

  async getFloristAuthByEmail(email: string): Promise<FloristAuth | undefined> {
    console.log(`Getting florist auth by email: ${email}`);
    
    try {
      const result = await pool.query(
        'SELECT * FROM florist_auth WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      const row = result.rows[0];
      return {
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
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        passwordHash: row.password_hash,
      };
    } catch (error) {
      console.error('Error getting florist auth by email:', error);
      throw error;
    }
  }

  async getFloristAuthById(id: number): Promise<FloristAuth | undefined> {
    console.log(`Getting florist auth by ID: ${id}`);
    
    try {
      const result = await pool.query(
        'SELECT * FROM florist_auth WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      const row = result.rows[0];
      return {
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
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        passwordHash: row.password_hash,
      };
    } catch (error) {
      console.error('Error getting florist auth by ID:', error);
      throw error;
    }
  }

  async updateFloristProfile(floristAuthId: number, profileData: any): Promise<any> {
    console.log(`Updating florist profile for auth ID: ${floristAuthId}`);
    
    try {
      // Handle profile image - store binary data as base64 string
      let profileImageData = null;
      if (profileData.profileImageUrl) {
        // If it's already a data URL (base64), store it directly
        if (profileData.profileImageUrl.startsWith('data:image/')) {
          profileImageData = profileData.profileImageUrl;
        } else {
          // If it's a regular URL, store it as is for now
          profileImageData = profileData.profileImageUrl;
        }
      }

      // Build dynamic update query - only update fields that are provided
      const updateFields = [];
      const values = [floristAuthId];
      let paramCount = 1;

      if (profileData.businessName !== undefined) {
        updateFields.push(`business_name = $${++paramCount}`);
        values.push(profileData.businessName);
      }
      if (profileData.address !== undefined) {
        updateFields.push(`address = $${++paramCount}`);
        values.push(profileData.address);
      }
      if (profileData.city !== undefined) {
        updateFields.push(`city = $${++paramCount}`);
        values.push(profileData.city);
      }
      if (profileData.state !== undefined) {
        updateFields.push(`state = $${++paramCount}`);
        values.push(profileData.state);
      }
      if (profileData.zipCode !== undefined) {
        updateFields.push(`zip_code = $${++paramCount}`);
        values.push(profileData.zipCode);
      }
      if (profileData.phone !== undefined) {
        updateFields.push(`phone = $${++paramCount}`);
        values.push(profileData.phone);
      }
      if (profileData.website !== undefined) {
        updateFields.push(`website = $${++paramCount}`);
        values.push(profileData.website);
      }
      if (profileImageData !== null) {
        updateFields.push(`profile_image_url = $${++paramCount}`);
        values.push(profileImageData);
      }
      if (profileData.profileSummary !== undefined) {
        updateFields.push(`profile_summary = $${++paramCount}`);
        values.push(profileData.profileSummary);
      }
      if (profileData.yearsOfExperience !== undefined) {
        updateFields.push(`years_of_experience = $${++paramCount}`);
        values.push(profileData.yearsOfExperience);
      }
      if (profileData.specialties !== undefined) {
        updateFields.push(`specialties = $${++paramCount}`);
        values.push(profileData.specialties);
      }

      // Always update the timestamp
      updateFields.push('updated_at = CURRENT_TIMESTAMP');

      if (updateFields.length === 1) { // Only timestamp
        throw new Error('No fields to update');
      }

      const query = `
        UPDATE florist_auth 
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating florist profile:', error);
      throw error;
    }
  }

  async getFloristProfile(floristAuthId: number): Promise<any> {
    console.log(`Getting florist profile for auth ID: ${floristAuthId}`);
    
    try {
      const result = await pool.query(
        'SELECT * FROM florist_auth WHERE id = $1',
        [floristAuthId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
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
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      console.error('Error getting florist profile:', error);
      throw error;
    }
  }

  async getSpecialties(): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: specialtiesReference.id,
          name: specialtiesReference.name,
          description: specialtiesReference.description
        })
        .from(specialtiesReference)
        .where(eq(specialtiesReference.isActive, true))
        .orderBy(asc(specialtiesReference.displayOrder), asc(specialtiesReference.name));
      
      return result;
    } catch (error) {
      console.error('Error fetching specialties:', error);
      throw error;
    }
  }

  async getServices(): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: servicesReference.id,
          name: servicesReference.name,
          description: servicesReference.description
        })
        .from(servicesReference)
        .where(eq(servicesReference.isActive, true))
        .orderBy(asc(servicesReference.displayOrder), asc(servicesReference.name));
      
      return result;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();