import { floristAuth, users } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Simple, working storage functions for the corrected schema
export class SimpleStorage {
  
  // Get all users (working correctly)
  async getAllUsers() {
    console.log('SimpleStorage: getAllUsers called');
    try {
      const result = await db.select().from(users).orderBy(desc(users.createdAt));
      console.log('SimpleStorage: getAllUsers found', result.length, 'users');
      console.log('SimpleStorage: User roles found:', result.map(u => ({ id: u.id, email: u.email, role: u.role })));
      return result;
    } catch (error) {
      console.error('SimpleStorage: getAllUsers error:', error);
      throw error;
    }
  }

  // Get all florists from florist_auth table (FIXED)
  async getAllFlorists() {
    console.log('SimpleStorage: getAllFlorists called - reading from florist_auth table');
    try {
      const result = await db
        .select()
        .from(floristAuth)
        .orderBy(desc(floristAuth.createdAt));
      
      console.log('SimpleStorage: getAllFlorists found', result.length, 'florist records');
      
      // Transform to expected format for admin dashboard
      const florists = result.map(florist => ({
        id: florist.id,
        businessName: florist.businessName || 'Unnamed Business',
        email: florist.email,
        firstName: florist.firstName,
        lastName: florist.lastName,
        address: florist.address,
        city: florist.city,
        state: florist.state,
        zipCode: florist.zipCode,
        phone: florist.phone,
        website: florist.website,
        profileSummary: florist.profileSummary,
        yearsOfExperience: florist.yearsOfExperience || 0,
        specialties: florist.specialties || [],
        services: florist.servicesOffered || [],
        profileImageUrl: florist.profileImageUrl,
        businessHours: florist.businessHours,
        isFeatured: florist.isVerified || false,
        createdAt: florist.createdAt,
        updatedAt: florist.updatedAt
      }));
      
      console.log('SimpleStorage: Returning', florists.length, 'formatted florist records');
      console.log('SimpleStorage: Sample businesses:', florists.slice(0, 3).map(f => f.businessName));
      
      return florists;
    } catch (error) {
      console.error('SimpleStorage: getAllFlorists error:', error);
      throw error;
    }
  }
}

export const simpleStorage = new SimpleStorage();