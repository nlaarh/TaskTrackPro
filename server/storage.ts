import {
  users,
  floristAuth,
  specialtiesReference,
  servicesReference,
  type User,
  type UpsertUser,
  type FloristAuth,
  type InsertFloristAuth,
  type Florist
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
  
  // Profile operations (florist business data in separate florists table)
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
        servicesOffered: row.services_offered,
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
        servicesOffered: row.services_offered,
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
        servicesOffered: row.services_offered,
      };
    } catch (error) {
      console.error('Error getting florist auth by ID:', error);
      throw error;
    }
  }

  async updateFloristProfile(floristAuthId: number, profileData: any): Promise<any> {
    console.log(`Updating florist profile for auth ID: ${floristAuthId}`);
    console.log('Profile data received:', JSON.stringify(profileData, null, 2));
    
    try {
      // Handle profile image - store binary data as base64 string or URL
      let profileImageData = null;
      if (profileData.profileImageUrl) {
        profileImageData = profileData.profileImageUrl;
      }

      // Update the florist_auth table directly - this is the correct table that exists
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;
      
      // Map frontend field names to database field names and build dynamic update
      const fieldMappings: Record<string, string> = {
        'businessName': 'business_name',
        'zipCode': 'zip_code', 
        'profileImageUrl': 'profile_image_url',
        'profileImageData': 'profile_image_data',
        'profileSummary': 'profile_summary',
        'yearsOfExperience': 'years_of_experience',
        'specialties': 'specialties',
        'services': 'services_offered',
        'address': 'address',
        'city': 'city',
        'state': 'state',
        'phone': 'phone',
        'website': 'website'
      };
      
      Object.keys(profileData).forEach(key => {
        const dbField = fieldMappings[key];
        if (dbField && profileData[key] !== undefined) {
          updateFields.push(`${dbField} = $${paramIndex + 1}`);
          
          // Handle special case for profile image
          if (key === 'profileImageUrl') {
            updateValues.push(profileImageData);
          } else {
            updateValues.push(profileData[key]);
          }
          paramIndex++;
        }
      });
      
      // Always update the timestamp
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      
      if (updateFields.length === 1) { // Only timestamp, no actual data to update
        throw new Error('No valid fields to update');
      }
      
      const query = `
        UPDATE florist_auth 
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await pool.query(query, [floristAuthId, ...updateValues]);
      
      if (result.rows.length === 0) {
        throw new Error('Florist not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating florist profile:', error);
      throw error;
    }
  }

  async getFloristProfile(floristAuthId: number): Promise<any> {
    console.log(`Getting florist profile for auth ID: ${floristAuthId}`);
    
    try {
      // Get the email from florist_auth table
      const authResult = await pool.query('SELECT email, first_name, last_name FROM florist_auth WHERE id = $1', [floristAuthId]);
      if (authResult.rows.length === 0) {
        return null;
      }
      
      const authRow = authResult.rows[0];
      
      // Get the profile data from florists table
      const profileResult = await pool.query('SELECT * FROM florists WHERE email = $1', [authRow.email]);
      
      if (profileResult.rows.length === 0) {
        // Return basic info if no profile exists yet
        return {
          id: floristAuthId,
          email: authRow.email,
          firstName: authRow.first_name,
          lastName: authRow.last_name,
          businessName: null,
          address: null,
          city: null,
          state: null,
          zipCode: null,
          phone: null,
          profileImageUrl: null,
          profileSummary: null,
          yearsOfExperience: null,
          specialties: [],
          services: [],
          website: null,
        };
      }
      
      const profileRow = profileResult.rows[0];
      return {
        id: floristAuthId,
        email: authRow.email,
        firstName: authRow.first_name,
        lastName: authRow.last_name,
        businessName: profileRow.business_name,
        address: profileRow.address,
        city: profileRow.city,
        state: profileRow.state,
        zipCode: profileRow.zip_code,
        phone: profileRow.phone,
        profileImageUrl: profileRow.profile_image_url,
        profileSummary: profileRow.profile_summary,
        yearsOfExperience: profileRow.years_of_experience,
        specialties: profileRow.specialties || [],
        services: profileRow.services || [],
        website: profileRow.website,
        isVerified: false, // This would come from auth table if needed
        createdAt: profileRow.created_at,
        updatedAt: profileRow.updated_at,
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