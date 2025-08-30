import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { correctedStorage } from "./storage-corrected";
import { setupAuth, isAuthenticated } from "./replitAuth";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// JWT Authentication middleware for florist routes
const authenticateFlorist = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get florist auth record
    const floristAuth = await correctedStorage.getFloristAuthById(decoded.floristId);
    if (!floristAuth) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.florist = floristAuth;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export async function registerCorrectedRoutes(app: Express): Promise<Server> {
  // Replit Auth setup
  await setupAuth(app);

  // Test endpoints
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working', timestamp: new Date().toISOString() });
  });

  // Replit Auth endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await correctedStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Florist Registration - Creates ONLY florist_auth record
  app.post("/api/auth/florist/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      console.log('Florist registration attempt:', { email, firstName, lastName });

      // Validate input
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          message: "Email, password, first name, and last name are required" 
        });
      }

      // Check if florist already exists
      const existingFlorist = await correctedStorage.getFloristAuthByEmail(email);
      if (existingFlorist) {
        return res.status(400).json({ message: "Florist with this email already exists" });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create florist auth record ONLY
      const florist = await correctedStorage.createFloristAuth({
        email,
        passwordHash,
        firstName,
        lastName,
      });

      console.log('Florist auth created successfully:', { id: florist.id, email: florist.email });

      res.status(201).json({
        message: "Florist registered successfully",
        florist: {
          id: florist.id,
          email: florist.email,
          firstName: florist.firstName,
          lastName: florist.lastName,
        },
      });
    } catch (error) {
      console.error("Florist registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Florist Login - Verifies florist_auth record
  app.post("/api/auth/florist/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('Florist login attempt:', { email });

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Get florist auth record
      const florist = await correctedStorage.getFloristAuthByEmail(email);
      if (!florist) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, florist.passwordHash!);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          floristId: florist.id,
          email: florist.email,
          type: 'florist'
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      console.log('Login successful for florist:', { id: florist.id, email: florist.email });

      res.json({
        message: "Login successful",
        token,
        florist: {
          id: florist.id,
          email: florist.email,
          firstName: florist.firstName,
          lastName: florist.lastName,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get Florist Profile - Joins florist_auth + florists tables
  app.get("/api/florist/profile", authenticateFlorist, async (req: any, res) => {
    try {
      const floristAuthId = req.florist.id;
      console.log('Getting florist profile for auth ID:', floristAuthId);

      // Get combined profile data
      const profileData = await correctedStorage.getFloristProfile(floristAuthId);
      
      // Structure response to match frontend expectations
      const response = {
        // Auth data (from florist_auth table)
        id: profileData.auth.id,
        email: profileData.auth.email,
        firstName: profileData.auth.firstName,
        lastName: profileData.auth.lastName,
        isVerified: profileData.auth.isVerified,
        
        // Business profile data (from florists table, nested)
        businessProfile: profileData.business ? {
          id: profileData.business.id,
          email: profileData.business.email,
          firstName: profileData.auth.firstName, // From auth table
          lastName: profileData.auth.lastName,   // From auth table
          businessName: profileData.business.businessName,
          address: profileData.business.address,
          city: profileData.business.city,
          state: profileData.business.state,
          zipCode: profileData.business.zipCode,
          phone: profileData.business.phone,
          website: profileData.business.website,
          profileSummary: profileData.business.profileSummary,
          yearsOfExperience: profileData.business.yearsOfExperience,
          specialties: profileData.business.specialties,
          services: profileData.business.services,
          profileImageUrl: profileData.business.profileImageUrl,
          isActive: profileData.business.isActive,
          isFeatured: profileData.business.isFeatured,
        } : null,
      };

      console.log('Profile data retrieved successfully');
      res.json(response);
    } catch (error) {
      console.error("Error fetching florist profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Profile Setup - Creates/Updates florists table record
  app.post('/api/florist/profile/setup', authenticateFlorist, async (req: any, res) => {
    try {
      const floristAuthId = req.florist.id;
      const profileData = req.body;
      
      console.log('Profile setup for auth ID:', floristAuthId);
      console.log('Profile data received:', {
        businessName: profileData.businessName,
        address: profileData.address,
        specialties: profileData.specialties,
        services: profileData.services,
        hasProfileImage: !!(profileData.profileImage || profileData.profileImageUrl),
        imageSize: (profileData.profileImage || profileData.profileImageUrl || '').length,
        imageFieldNames: Object.keys(profileData).filter(key => key.toLowerCase().includes('image'))
      });
      
      // Validate required fields
      if (!profileData.businessName || !profileData.address || !profileData.city || !profileData.state || !profileData.zipCode) {
        return res.status(400).json({ 
          message: "Missing required fields: businessName, address, city, state, zipCode",
          received: Object.keys(profileData)
        });
      }

      // Create/update business profile in florists table
      const businessProfile = await correctedStorage.createOrUpdateFloristProfile(
        floristAuthId,
        {
          businessName: profileData.businessName,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zipCode: profileData.zipCode,
          phone: profileData.phone,
          website: profileData.website,
          profileSummary: profileData.profileSummary,
          yearsOfExperience: profileData.yearsOfExperience,
          specialties: profileData.specialties,
          services: profileData.services,
          profileImageUrl: profileData.profileImageUrl || profileData.profileImage, // Handle both field names
        }
      );

      console.log('Profile setup completed successfully');
      res.json({
        message: "Profile setup completed successfully",
        businessProfile: {
          id: businessProfile.id,
          businessName: businessProfile.businessName,
          address: businessProfile.address,
          city: businessProfile.city,
          state: businessProfile.state,
          zipCode: businessProfile.zipCode,
        },
      });
    } catch (error) {
      console.error("Profile setup error:", error);
      res.status(500).json({ message: "Profile setup failed" });
    }
  });

  // Reference data endpoints
  app.get('/api/reference/specialties', async (req, res) => {
    try {
      const specialties = await correctedStorage.getSpecialties();
      res.json(specialties);
    } catch (error) {
      console.error("Error fetching specialties:", error);
      res.status(500).json({ message: "Failed to fetch specialties" });
    }
  });

  app.get('/api/reference/services', async (req, res) => {
    try {
      const services = await correctedStorage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });



  // Get individual florist by ID (use more specific route first)
  app.get('/api/florists/detail/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const floristId = parseInt(id);
      
      if (isNaN(floristId)) {
        return res.status(400).json({ message: "Invalid florist ID" });
      }
      
      const florist = await correctedStorage.getFloristById(floristId);
      
      if (!florist) {
        return res.status(404).json({ message: "Florist not found" });
      }
      
      // Transform data to match frontend expectations (same format as search)
      const transformedFlorist = {
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
      };
      
      res.json(transformedFlorist);
    } catch (error) {
      console.error("Error fetching florist:", error);
      res.status(500).json({ message: "Failed to fetch florist" });
    }
  });

  // Florist search endpoint
  app.get('/api/florists/search', async (req, res) => {
    try {
      const { location, specialty, service, limit, offset } = req.query;
      
      const searchParams = {
        location: location as string | undefined,
        specialty: specialty as string | undefined,
        service: service as string | undefined,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0,
      };

      console.log('Search request:', searchParams);
      
      const searchResult = await correctedStorage.searchFlorists(searchParams);
      
      // Return data in the format expected by frontend
      res.json({
        florists: searchResult.florists,
        total: searchResult.total,
        page: Math.floor((searchParams.offset || 0) / (searchParams.limit || 50)) + 1,
        limit: searchParams.limit || 50
      });
    } catch (error) {
      console.error("Error searching florists:", error);
      res.status(500).json({ message: "Failed to search florists" });
    }
  });

  // Get reviews for a specific florist
  app.get('/api/florists/:id/reviews', async (req, res) => {
    try {
      const { id } = req.params;
      const floristId = parseInt(id);
      
      if (isNaN(floristId)) {
        return res.status(400).json({ message: "Invalid florist ID" });
      }
      
      const reviews = await correctedStorage.getReviewsByFloristId(floristId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}