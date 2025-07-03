import { pool } from "./db";
import type { 
  User, 
  UpsertUser,
  FloristAuth, 
  InsertFloristAuth 
} from "@shared/schema";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Florist authentication operations
  createFloristAuth(florist: InsertFloristAuth): Promise<FloristAuth>;
  getFloristAuthByEmail(email: string): Promise<FloristAuth | undefined>;
  getFloristAuthById(id: number): Promise<FloristAuth | undefined>;
  
  // Business profile operations
  createOrUpdateFloristProfile(floristAuthId: number, profileData: any): Promise<any>;
  getFloristProfile(floristAuthId: number): Promise<any>;
  saveFloristImage(floristId: number, imageUrl: string, caption?: string, isPrimary?: boolean): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      profileImageUrl: row.profile_image_url,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const query = `
      INSERT INTO users (id, email, first_name, last_name, profile_image_url, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        profile_image_url = EXCLUDED.profile_image_url,
        updated_at = NOW()
      RETURNING *
    `;
    
    const values = [
      userData.id,
      userData.email,
      userData.firstName,
      userData.lastName,
      userData.profileImageUrl,
      userData.role || 'user'
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      profileImageUrl: row.profile_image_url,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // Florist authentication operations
  async createFloristAuth(florist: InsertFloristAuth): Promise<FloristAuth> {
    console.log('Creating florist auth with data:', florist);
    
    // Debug: Check database connection and schema
    try {
      const dbInfo = await pool.query('SELECT current_database(), current_user');
      console.log('App database connection:', dbInfo.rows[0]);
      
      const tableCheck = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'florist_auth' 
        ORDER BY ordinal_position
      `);
      console.log('App sees florist_auth columns:', tableCheck.rows.map(r => r.column_name));
    } catch (error) {
      console.error('Database debug error:', error);
    }
    
    const query = `
      INSERT INTO florist_auth (
        email, password_hash, first_name, last_name, is_verified
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      florist.email,
      florist.passwordHash,
      florist.firstName,
      florist.lastName,
      florist.isVerified
    ];
    
    try {
      const result = await pool.query(query, values);
      console.log('Successfully created florist auth:', result.rows[0]);
      
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
        passwordHash: row.password_hash,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      console.error('Error creating florist auth:', error);
      throw error;
    }
  }

  async getFloristAuthByEmail(email: string): Promise<FloristAuth | undefined> {
    console.log('Looking for florist auth with email:', email);
    
    const query = 'SELECT * FROM florist_auth WHERE email = $1';
    
    try {
      const result = await pool.query(query, [email]);
      console.log('Found florist auth records:', result.rows.length);
      
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
        passwordHash: row.password_hash,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      console.error('Error getting florist auth by email:', error);
      throw error;
    }
  }

  async getFloristAuthById(id: number): Promise<FloristAuth | undefined> {
    console.log('Looking for florist auth with id:', id);
    
    const query = 'SELECT * FROM florist_auth WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      
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
        passwordHash: row.password_hash,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      console.error('Error getting florist auth by id:', error);
      throw error;
    }
  }

  async createOrUpdateFloristProfile(floristAuthId: number, profileData: any): Promise<any> {
    console.log(`Creating/updating florist profile for auth ID: ${floristAuthId}`);
    
    try {
      // First check if profile already exists
      const existingResult = await pool.query(
        'SELECT * FROM florists WHERE user_id = $1',
        [floristAuthId.toString()]
      );
      
      if (existingResult.rows.length > 0) {
        // Update existing profile
        const result = await pool.query(`
          UPDATE florists 
          SET business_name = $2, description = $3, address = $4, city = $5, 
              state = $6, zip_code = $7, phone = $8, website = $9, 
              services = $10, specialties = $11, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
          RETURNING *
        `, [
          floristAuthId.toString(),
          profileData.businessName,
          profileData.profileSummary,
          profileData.address,
          profileData.city,
          profileData.state,
          profileData.zipCode,
          profileData.phone,
          profileData.website || null,
          profileData.services || [],
          profileData.specialties || []
        ]);
        
        return result.rows[0];
      } else {
        // Create new profile
        const result = await pool.query(`
          INSERT INTO florists (
            user_id, business_name, description, address, city, state, zip_code, 
            phone, website, services, specialties, is_verified, is_active, 
            rating, review_count, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, true, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *
        `, [
          floristAuthId.toString(),
          profileData.businessName,
          profileData.profileSummary,
          profileData.address,
          profileData.city,
          profileData.state,
          profileData.zipCode,
          profileData.phone,
          profileData.website || null,
          profileData.services || [],
          profileData.specialties || []
        ]);
        
        return result.rows[0];
      }
    } catch (error) {
      console.error('Error creating/updating florist profile:', error);
      throw error;
    }
  }

  async getFloristProfile(floristAuthId: number): Promise<any> {
    console.log(`Getting florist profile for auth ID: ${floristAuthId}`);
    
    try {
      const result = await pool.query(
        'SELECT * FROM florists WHERE user_id = $1',
        [floristAuthId.toString()]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const profile = result.rows[0];
      
      // Also get primary image
      const imageResult = await pool.query(
        'SELECT image_url FROM florist_images WHERE florist_id = $1 AND is_primary = true LIMIT 1',
        [profile.id]
      );
      
      return {
        ...profile,
        primaryImageUrl: imageResult.rows[0]?.image_url || null
      };
    } catch (error) {
      console.error('Error getting florist profile:', error);
      throw error;
    }
  }

  async saveFloristImage(floristId: number, imageUrl: string, caption?: string, isPrimary?: boolean): Promise<any> {
    console.log(`Saving florist image for florist ID: ${floristId}`);
    
    try {
      // If setting as primary, first remove other primary flags
      if (isPrimary) {
        await pool.query(
          'UPDATE florist_images SET is_primary = false WHERE florist_id = $1',
          [floristId]
        );
      }
      
      const result = await pool.query(`
        INSERT INTO florist_images (florist_id, image_url, caption, is_primary, created_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING *
      `, [floristId, imageUrl, caption || null, isPrimary || false]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error saving florist image:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();