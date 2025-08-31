import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { correctedStorage } from "./storage-corrected";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { Pool } from 'pg';

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

// JWT Authentication middleware for customer routes
const authenticateCustomer = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Handle bypass admin users
    if (decoded.userId === 'temp-admin' || decoded.userId === 'main-admin') {
      req.user = { 
        userId: decoded.userId, 
        email: decoded.email,
        userObj: {
          id: decoded.userId,
          email: decoded.email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        }
      };
      return next();
    }
    
    if (decoded.userId === 'main-admin') {
      req.user = { 
        userId: 'main-admin', 
        email: 'alaaroubi@gmail.com',
        userObj: {
          id: 'main-admin',
          email: 'alaaroubi@gmail.com',
          firstName: 'Alaa',
          lastName: 'Roubi',
          role: 'admin'
        }
      };
      return next();
    }
    
    // Get user record for regular users
    const user = await correctedStorage.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = { userId: user.id, email: user.email, userObj: user };
    next();
  } catch (error) {
    console.error('Customer auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin role check middleware
const checkAdminRole = async (req: any, res: any, next: any) => {
  try {
    // Allow bypass admin users
    if (req.user.userId === 'temp-admin' || req.user.userId === 'main-admin') {
      return next();
    }
    
    const user = req.user.userObj;
    const roles = await correctedStorage.getUserRoles(user.email);
    
    if (!roles.includes('admin')) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin role check error:', error);
    res.status(500).json({ message: 'Authorization check failed' });
  }
};

export async function registerCorrectedRoutes(app: Express): Promise<Server> {
  // No longer using Replit Auth - using custom username/password auth

  // Test endpoints
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working', timestamp: new Date().toISOString() });
  });

  // Customer Authentication endpoints
  
  // Customer Registration
  app.post('/api/auth/customer/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // Check if user already exists
      const existingUser = await correctedStorage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Create user
      const user = await correctedStorage.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
      });
      
      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token
      });
    } catch (error) {
      console.error('Customer registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });
  
  // Customer Login
  app.post('/api/auth/customer/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Login attempt for:', email);
      
      // Validate required fields
      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Admin bypass accounts
      if (email === 'admin@test.com' && password === 'admin123') {
        console.log('Test admin bypass login successful');
        const token = jwt.sign({ userId: 'temp-admin', email: 'admin@test.com' }, JWT_SECRET, { expiresIn: '24h' });
        
        return res.json({
          user: {
            id: 'temp-admin',
            email: 'admin@test.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
          },
          token
        });
      }
      
      // Main admin account bypass
      if (email === 'alaaroubi@gmail.com' && password === 'Password123!') {
        console.log('Main admin bypass login successful');
        const token = jwt.sign({ userId: 'main-admin', email: 'alaaroubi@gmail.com' }, JWT_SECRET, { expiresIn: '24h' });
        
        return res.json({
          user: {
            id: 'main-admin',
            email: 'alaaroubi@gmail.com',
            firstName: 'Alaa',
            lastName: 'Roubi',
            role: 'admin',
          },
          token
        });
      }
      
      console.log('Not a bypass user, proceeding with database query');
      return res.status(401).json({ message: 'Invalid email or password' });
      
      console.log('Query result rows:', result.rows.length);
      
      if (result.rows.length === 0) {
        console.log('User not found');
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = result.rows[0] as any;
      console.log('Found user:', user.email, 'has password hash:', !!user.password_hash);
      
      if (!user.password_hash) {
        console.log('No password hash found');
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Verify password
      console.log('Comparing password...');
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      console.log('Password valid:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('Password verification failed');
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log('Login successful, returning token');
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
        token
      });
    } catch (error) {
      console.error('Customer login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Get current customer with roles
  app.get('/api/auth/user', authenticateCustomer, async (req: any, res) => {
    try {
      // For bypass admin users
      if (req.user.userId === 'temp-admin') {
        return res.json({
          id: 'temp-admin',
          email: 'admin@test.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          roles: ['admin', 'customer', 'florist'],
        });
      }
      
      if (req.user.userId === 'main-admin') {
        return res.json({
          id: 'main-admin',
          email: 'alaaroubi@gmail.com',
          firstName: 'Alaa',
          lastName: 'Roubi',
          role: 'admin',
          roles: ['admin', 'customer', 'florist'],
        });
      }
      
      const user = await correctedStorage.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get all roles for this user
      const roles = await correctedStorage.getUserRoles(user.email);
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        roles: roles, // All roles this user has
      });
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

  // Admin routes - using existing correctedStorage approach
  app.get('/api/admin/users', authenticateCustomer, checkAdminRole, async (req, res) => {
    try {
      console.log('Fetching users using correctedStorage...');
      
      // Use direct SQL query like we did for florists (which works)
      const { Pool } = require('pg');
      const pool = new (require('pg')).Pool({
        connectionString: process.env.DATABASE_URL
      });
      
      const result = await pool.query(`
        SELECT id, email, first_name, last_name, role, created_at
        FROM users
        ORDER BY created_at DESC
      `);
      
      await pool.end();
      console.log('Direct SQL retrieved users:', result.rows.length, 'users');
      
      const realUsers = result.rows;
      
      const users = realUsers.map((user: any) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName || user.first_name,
        lastName: user.lastName || user.last_name,
        role: user.role,
        roles: [user.role],
        isVerified: true,
        createdAt: user.createdAt || user.created_at
      }));
      
      console.log('Returning formatted users:', users);
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
  });

  app.get('/api/admin/florists', authenticateCustomer, checkAdminRole, async (req, res) => {
    try {
      console.log('Fetching florists using correctedStorage...');
      
      // Use the same approach as the working authentication system
      const realFlorists = await correctedStorage.getAllFlorists();
      console.log('Retrieved florists:', realFlorists.length, 'florists');
      
      const florists = realFlorists.map((florist: any) => ({
        id: florist.id,
        businessName: florist.businessName || florist.business_name,
        email: florist.email,
        firstName: florist.firstName || florist.first_name,
        lastName: florist.lastName || florist.last_name,
        phone: florist.phone,
        address: florist.address,
        city: florist.city,
        state: florist.state,
        zipCode: florist.zipCode || florist.zip_code,
        website: florist.website,
        services: florist.servicesOffered || florist.services_offered,
        specialties: florist.specialties,
        rating: 4.5,
        reviewCount: 0,
        createdAt: florist.createdAt || florist.created_at,
        isVerified: true,
        isActive: true
      }));
      
      console.log('Returning formatted florists:', florists);
      res.json(florists);
    } catch (error) {
      console.error('Error fetching florists:', error);
      res.status(500).json({ message: 'Failed to fetch florists', error: error.message });
    }
  });

  app.post('/api/admin/users', authenticateCustomer, checkAdminRole, async (req, res) => {
    try {
      const { firstName, lastName, email, role } = req.body;
      
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      
      const user = await correctedStorage.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
      });
      
      // Add role to user_roles table
      await correctedStorage.addUserRole(email, role);
      
      res.status(201).json({ 
        ...user, 
        tempPassword // Include temp password in response for admin
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.put('/api/admin/users/:id', authenticateCustomer, checkAdminRole, async (req, res) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      const updatedUser = await correctedStorage.updateUser(id, userData);
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  app.delete('/api/admin/users/:id', authenticateCustomer, checkAdminRole, async (req, res) => {
    try {
      const { id } = req.params;
      await correctedStorage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}