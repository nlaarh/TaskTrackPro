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
}

export const storage = new DatabaseStorage();