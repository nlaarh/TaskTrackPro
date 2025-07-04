import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { pool } from "./db";

// Simple validation schemas for florist auth
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  businessName: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  phone: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Test route to verify API routing works
  app.get('/api/test', (req, res) => {
    res.json({ message: "API routing works!" });
  });

  app.post('/api/test', (req, res) => {
    res.json({ message: "POST API routing works!", body: req.body });
  });

  // Setup Replit Auth middleware
  await setupAuth(app);

  // Replit Auth user route
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Florist Registration
  app.post("/api/auth/florist/register", async (req, res) => {
    try {
      console.log('Registration request received:', req.body);
      
      // Validate request
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: parsed.error.errors 
        });
      }

      const { email, password, firstName, lastName, businessName, address, city, state, zipCode, phone } = parsed.data;

      // Check if email already exists
      const existingFlorist = await storage.getFloristAuthByEmail(email);
      if (existingFlorist) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      console.log('Password hashed successfully');

      // Create florist authentication account with all required business fields
      const florist = await storage.createFloristAuth({
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        businessName,
        address,
        city,
        state,
        zipCode,
        phone,
        isVerified: false,
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          floristId: florist.id, 
          email: florist.email,
          type: 'florist'
        },
        process.env.JWT_SECRET || "fallback-secret-key",
        { expiresIn: "24h" }
      );

      console.log('Registration successful for:', email);
      res.status(201).json({
        message: "Registration successful",
        token,
        florist: {
          id: florist.id,
          email: florist.email,
          firstName: florist.firstName,
          lastName: florist.lastName,
          businessName: florist.businessName,
        },
      });
    } catch (error) {
      console.error("Florist registration error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Registration failed"
      });
    }
  });

  // Florist Login
  app.post("/api/auth/florist/login", async (req, res) => {
    try {
      console.log('Login attempt for email:', req.body.email);
      
      // Validate request
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: parsed.error.errors 
        });
      }

      const { email, password } = parsed.data;

      // Find florist by email
      const florist = await storage.getFloristAuthByEmail(email);
      console.log('Florist found:', florist ? 'Yes' : 'No');
      
      if (!florist) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      console.log('Verifying password...');
      if (!florist.passwordHash) {
        console.log('No password hash found for florist');
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const isValidPassword = await bcrypt.compare(password, florist.passwordHash);
      console.log('Password valid:', isValidPassword);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          floristId: florist.id, 
          email: florist.email,
          type: 'florist'
        },
        process.env.JWT_SECRET || "fallback-secret-key",
        { expiresIn: "24h" }
      );

      console.log('Login successful for:', email);
      res.json({
        message: "Login successful",
        token,
        florist: {
          id: florist.id,
          email: florist.email,
          firstName: florist.firstName,
          lastName: florist.lastName,
          businessName: florist.businessName,
        },
      });
    } catch (error) {
      console.error("Florist login error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Login failed"
      });
    }
  });

  // Get florist profile
  app.get("/api/florist/profile", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key") as any;
      
      if (decoded.type !== 'florist') {
        return res.status(401).json({ message: "Invalid token type" });
      }

      const florist = await storage.getFloristAuthById(decoded.floristId);
      if (!florist) {
        return res.status(404).json({ message: "Florist not found" });
      }

      // Also get the business profile if it exists
      const businessProfile = await storage.getFloristProfile(decoded.floristId);

      res.json({
        id: florist.id,
        email: florist.email,
        firstName: florist.firstName,
        lastName: florist.lastName,
        isVerified: florist.isVerified,
        businessProfile: businessProfile
      });
    } catch (error) {
      console.error("Error fetching florist profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Profile setup endpoint
  app.post('/api/florist/profile/setup', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key") as any;
      
      if (decoded.type !== 'florist') {
        return res.status(401).json({ message: "Invalid token type" });
      }

      const profileData = req.body;
      console.log('Profile setup data received (size check):', {
        hasImage: !!profileData.profileImageUrl,
        imageSize: profileData.profileImageUrl ? profileData.profileImageUrl.length : 0
      });

      // Validate image size if provided
      if (profileData.profileImageUrl && profileData.profileImageUrl.length > 500000) { // 500KB limit
        return res.status(400).json({ 
          message: "Profile image is too large. Please use an image smaller than 500KB." 
        });
      }

      // Update the florist_auth record with profile data including profile image
      const updatedProfile = await storage.updateFloristProfile(decoded.floristId, profileData);

      res.json({ 
        message: "Profile setup saved successfully",
        profileComplete: true,
        profile: {
          businessName: updatedProfile.business_name,
          address: updatedProfile.address,
          city: updatedProfile.city,
          state: updatedProfile.state,
          zipCode: updatedProfile.zip_code,
          phone: updatedProfile.phone,
          website: updatedProfile.website,
          profileImageUrl: updatedProfile.profile_image_url,
          profileSummary: updatedProfile.profile_summary,
          yearsOfExperience: updatedProfile.years_of_experience,
          specialties: updatedProfile.specialties
        }
      });
    } catch (error) {
      console.error("Error setting up profile:", error);
      res.status(500).json({ message: "Failed to setup profile" });
    }
  });

  // Test route to verify database connection
  app.get('/api/test-db', async (req, res) => {
    try {
      const result = await db.select().from(users).limit(1);
      res.json({ message: 'Database connection working', count: result.length });
    } catch (error) {
      console.error('Database test error:', error);
      res.status(500).json({ message: 'Database connection failed', error: error.message });
    }
  });

  // Reference data endpoints for form dropdowns
  app.get('/api/reference/specialties', async (req, res) => {
    try {
      const specialties = await storage.getSpecialties();
      res.json(specialties);
    } catch (error) {
      console.error('Error fetching specialties:', error);
      res.status(500).json({ message: 'Failed to fetch specialties' });
    }
  });

  app.get('/api/reference/services', async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ message: 'Failed to fetch services' });
    }
  });

  // Admin endpoints for managing reference data (add later)
  // TODO: Add admin authentication middleware
  // app.post('/api/admin/specialties', adminAuth, async (req, res) => { ... });
  // app.put('/api/admin/specialties/:id', adminAuth, async (req, res) => { ... });
  // app.delete('/api/admin/specialties/:id', adminAuth, async (req, res) => { ... });

  const httpServer = createServer(app);
  return httpServer;
}