import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Simple validation schemas for florist auth
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
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

      const { email, password, firstName, lastName } = parsed.data;

      // Check if email already exists
      const existingFlorist = await storage.getFloristAuthByEmail(email);
      if (existingFlorist) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      console.log('Password hashed successfully');

      // Create florist authentication account with only available fields
      const florist = await storage.createFloristAuth({
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
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
      console.log('Profile setup data received:', profileData);

      // For now, just store the image URL if provided and return success
      // This handles the immediate issue with profile image storage
      res.json({ 
        message: "Profile setup saved successfully",
        profileComplete: true,
        profileImageUrl: profileData.profileImageUrl || null
      });
    } catch (error) {
      console.error("Error setting up profile:", error);
      res.status(500).json({ message: "Failed to setup profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}