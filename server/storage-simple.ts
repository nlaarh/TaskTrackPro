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

  // Get all florists from florist_auth table (PERFORMANCE OPTIMIZED)
  async getAllFlorists() {
    console.log('SimpleStorage: getAllFlorists called - reading from florist_auth table');
    try {
      // PERFORMANCE: Exclude large profile_image_data from the main query
      const result = await db
        .select({
          id: floristAuth.id,
          businessName: floristAuth.businessName,
          email: floristAuth.email,
          firstName: floristAuth.firstName,
          lastName: floristAuth.lastName,
          address: floristAuth.address,
          city: floristAuth.city,
          state: floristAuth.state,
          zipCode: floristAuth.zipCode,
          phone: floristAuth.phone,
          website: floristAuth.website,
          profileSummary: floristAuth.profileSummary,
          yearsOfExperience: floristAuth.yearsOfExperience,
          specialties: floristAuth.specialties,
          servicesOffered: floristAuth.servicesOffered,
          profileImageUrl: floristAuth.profileImageUrl,
          businessHours: floristAuth.businessHours,
          isVerified: floristAuth.isVerified,
          createdAt: floristAuth.createdAt,
          updatedAt: floristAuth.updatedAt
          // Explicitly exclude profileImageData for performance
        })
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
        profileImageUrl: `/api/florists/${florist.id}/image`, // Use optimized image endpoint
        profileImageData: undefined, // Exclude large base64 data for performance
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