import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { insertFloristAuthSchema } from "@shared/schema";
import { 
  insertFloristSchema, 
  insertReviewSchema, 
  insertInquirySchema,
  insertNewsletterSubscriptionSchema,
  insertSavedFloristSchema,
  insertFloristImageSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
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

  // Florist authentication endpoints
  app.post('/api/auth/florist/register', async (req, res) => {
    try {
      // Extract and validate the required fields from the frontend form
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        businessName,
        address,
        city,
        state,
        zipCode,
        website,
        profileSummary,
        yearsOfExperience,
        specialties,
        profileImageUrl
      } = req.body;

      // Validate required fields for auth only
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if email already exists
      const existingFlorist = await storage.getFloristAuthByEmail(email);
      if (existingFlorist) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create florist authentication account
      const florist = await storage.createFloristAuth({
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        isVerified: false,
      });

      // Generate JWT token
      const token = jwt.sign(
        { floristId: florist.id, email: florist.email },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: "Registration successful",
        token,
        florist: {
          id: florist.id,
          email: florist.email,
          firstName: florist.firstName,
          lastName: florist.lastName,
        },
      });
    } catch (error: any) {
      console.error("Florist registration error:", error);
      res.status(400).json({ 
        message: error.message || "Registration failed" 
      });
    }
  });

  app.post('/api/auth/florist/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find florist by email
      const florist = await storage.getFloristAuthByEmail(email);
      if (!florist) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, florist.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { floristId: florist.id, email: florist.email },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

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
    } catch (error: any) {
      console.error("Florist login error:", error);
      res.status(500).json({ 
        message: "Login failed" 
      });
    }
  });

  // Search florists
  app.get('/api/florists/search', async (req, res) => {
    try {
      const {
        keyword,
        location,
        services,
        latitude,
        longitude,
        radius = 25,
        sortBy = 'distance',
        limit = 10,
        offset = 0
      } = req.query;

      const searchParams = {
        keyword: keyword as string,
        location: location as string,
        services: services ? (services as string).split(',') : undefined,
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
        radius: parseInt(radius as string),
        sortBy: sortBy as 'distance' | 'rating' | 'newest',
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      const result = await storage.searchFlorists(searchParams);
      res.json(result);
    } catch (error) {
      console.error("Error searching florists:", error);
      res.status(500).json({ message: "Failed to search florists" });
    }
  });

  // Get featured florists
  app.get('/api/florists/featured', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const florists = await storage.getFeaturedFlorists(limit);
      res.json(florists);
    } catch (error) {
      console.error("Error fetching featured florists:", error);
      res.status(500).json({ message: "Failed to fetch featured florists" });
    }
  });

  // Get florist by ID
  app.get('/api/florists/:id', async (req, res) => {
    try {
      const floristId = parseInt(req.params.id);
      const florist = await storage.getFlorist(floristId);
      
      if (!florist) {
        return res.status(404).json({ message: "Florist not found" });
      }

      res.json(florist);
    } catch (error) {
      console.error("Error fetching florist:", error);
      res.status(500).json({ message: "Failed to fetch florist" });
    }
  });

  // Get florist with reviews
  app.get('/api/florists/:id/reviews', async (req, res) => {
    try {
      const floristId = parseInt(req.params.id);
      const florist = await storage.getFloristWithReviews(floristId);
      
      if (!florist) {
        return res.status(404).json({ message: "Florist not found" });
      }

      res.json(florist);
    } catch (error) {
      console.error("Error fetching florist reviews:", error);
      res.status(500).json({ message: "Failed to fetch florist reviews" });
    }
  });

  // Create florist listing (protected)
  app.post('/api/florists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const floristData = insertFloristSchema.parse({ ...req.body, userId });
      
      // Check if user already has a florist listing
      const existingFlorist = await storage.getFloristByUserId(userId);
      if (existingFlorist) {
        return res.status(400).json({ message: "User already has a florist listing" });
      }

      const florist = await storage.createFlorist(floristData);
      res.status(201).json(florist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating florist:", error);
      res.status(500).json({ message: "Failed to create florist listing" });
    }
  });

  // Update florist listing (protected)
  app.put('/api/florists/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const floristId = parseInt(req.params.id);
      
      // Check if user owns this florist listing
      const existingFlorist = await storage.getFlorist(floristId);
      if (!existingFlorist || existingFlorist.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this listing" });
      }

      const updates = insertFloristSchema.partial().parse(req.body);
      const updatedFlorist = await storage.updateFlorist(floristId, updates);
      
      if (!updatedFlorist) {
        return res.status(404).json({ message: "Florist not found" });
      }

      res.json(updatedFlorist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating florist:", error);
      res.status(500).json({ message: "Failed to update florist listing" });
    }
  });

  // Add florist image (protected)
  app.post('/api/florists/:id/images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const floristId = parseInt(req.params.id);
      
      // Check if user owns this florist listing
      const florist = await storage.getFlorist(floristId);
      if (!florist || florist.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to add images to this listing" });
      }

      const imageData = insertFloristImageSchema.parse({ ...req.body, floristId });
      const image = await storage.addFloristImage(imageData);
      res.status(201).json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error adding florist image:", error);
      res.status(500).json({ message: "Failed to add image" });
    }
  });

  // Create review (protected)
  app.post('/api/florists/:id/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const floristId = parseInt(req.params.id);
      
      const reviewData = insertReviewSchema.parse({ ...req.body, floristId, userId });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Create inquiry
  app.post('/api/florists/:id/inquiries', async (req, res) => {
    try {
      const floristId = parseInt(req.params.id);
      const inquiryData = insertInquirySchema.parse({ ...req.body, floristId });
      
      const inquiry = await storage.createInquiry(inquiryData);
      res.status(201).json(inquiry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating inquiry:", error);
      res.status(500).json({ message: "Failed to create inquiry" });
    }
  });

  // Get user's florist listing (protected)
  app.get('/api/user/florist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const florist = await storage.getFloristByUserId(userId);
      
      if (!florist) {
        return res.status(404).json({ message: "No florist listing found" });
      }

      const floristWithDetails = await storage.getFlorist(florist.id);
      res.json(floristWithDetails);
    } catch (error) {
      console.error("Error fetching user florist:", error);
      res.status(500).json({ message: "Failed to fetch florist listing" });
    }
  });

  // Get user's inquiries (protected)
  app.get('/api/user/inquiries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const inquiries = await storage.getUserInquiries(userId);
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching user inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  // Save/unsave florist (protected)
  app.post('/api/florists/:id/save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const floristId = parseInt(req.params.id);
      
      const savedFlorist = await storage.saveFlorist({ userId, floristId });
      res.status(201).json(savedFlorist);
    } catch (error) {
      console.error("Error saving florist:", error);
      res.status(500).json({ message: "Failed to save florist" });
    }
  });

  app.delete('/api/florists/:id/save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const floristId = parseInt(req.params.id);
      
      const success = await storage.unsaveFlorist(userId, floristId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Saved florist not found" });
      }
    } catch (error) {
      console.error("Error unsaving florist:", error);
      res.status(500).json({ message: "Failed to unsave florist" });
    }
  });

  // Get user's saved florists (protected)
  app.get('/api/user/saved-florists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savedFlorists = await storage.getUserSavedFlorists(userId);
      res.json(savedFlorists);
    } catch (error) {
      console.error("Error fetching saved florists:", error);
      res.status(500).json({ message: "Failed to fetch saved florists" });
    }
  });

  // Newsletter subscription
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const subscriptionData = insertNewsletterSubscriptionSchema.parse(req.body);
      const subscription = await storage.subscribeNewsletter(subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email address", errors: error.errors });
      }
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // Newsletter unsubscription
  app.post('/api/newsletter/unsubscribe', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const success = await storage.unsubscribeNewsletter(email);
      if (success) {
        res.json({ message: "Successfully unsubscribed" });
      } else {
        res.status(404).json({ message: "Email not found" });
      }
    } catch (error) {
      console.error("Error unsubscribing from newsletter:", error);
      res.status(500).json({ message: "Failed to unsubscribe from newsletter" });
    }
  });

  // Florist authentication middleware
  const authenticateFlorist = async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
      const florist = await storage.getFloristAuthById(decoded.floristId);
      
      if (!florist) {
        return res.status(401).json({ message: "Invalid token" });
      }

      req.florist = florist;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };

  // Florist profile setup
  app.post('/api/florist/profile/setup', authenticateFlorist, async (req: any, res: any) => {
    try {
      const {
        businessName,
        address,
        city,
        state,
        zipCode,
        phone,
        website,
        profileSummary,
        yearsOfExperience,
        specialties,
        services,
        profileImageUrl
      } = req.body;

      // Create florist business profile
      const florist = await storage.createFlorist({
        userId: null, // We're using florist_auth system, not regular users
        email: req.florist.email,
        businessName,
        address,
        city,
        state,
        zipCode,
        phone,
        website: website || null,
        profileSummary: profileSummary || null,
        yearsOfExperience: yearsOfExperience || 0,
        specialties: specialties || [],
        services: services || [],
        profileImageUrl: profileImageUrl || null,
        isActive: true,
        isFeatured: false,
      });

      res.json({
        message: "Profile setup completed successfully",
        florist,
      });
    } catch (error: any) {
      console.error("Profile setup error:", error);
      res.status(500).json({ 
        message: error.message || "Profile setup failed" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
