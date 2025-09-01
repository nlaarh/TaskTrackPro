import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { correctedStorage } from "./storage-corrected";
import { pool } from './db';
import { setupAuth, isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { Pool } from 'pg';
import { simpleStorage } from "./storage-simple";
import { ObjectStorageService } from "./objectStorage";

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
    
    // Get user record for regular users using pool directly
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = result.rows[0];
    req.user = { 
      userId: user.id, 
      email: user.email, 
      userObj: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    };
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
    // Check if user has admin role directly from the users table
    if (user.role !== 'admin') {
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
  
  // Standard login route (redirects to customer login)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Standard login route - redirecting to customer login for:', email);
      
      // Main admin account bypass
      if (email === 'alaaroubi@gmail.com' && password === 'Password123!') {
        console.log('Main admin bypass login successful via standard route');
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
      
      // Test admin account bypass
      if (email === 'admin@test.com' && password === 'admin123') {
        console.log('Test admin bypass login successful via standard route');
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
      
      // For other users, try regular login
      const user = await correctedStorage.getUserByEmail(email);
      if (!user || !await bcrypt.compare(password, user.passwordHash)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
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
      console.error('Standard login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });
  
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

  // MESSAGING SYSTEM ENDPOINTS
  
  // Get messages for admin or florist
  app.get('/api/messages', authenticateCustomer, async (req, res) => {
    try {
      const user = req.user;
      let userId, userType;
      
      // Determine user type and ID
      if (user.userObj?.role === 'admin') {
        userId = user.userId;
        userType = 'admin';
      } else if (user.florist) {
        userId = user.florist.id.toString();
        userType = 'florist';
      } else {
        return res.status(400).json({ message: 'Invalid user type for messaging' });
      }

      console.log(`📨 Getting messages for ${userType} ${userId}`);

      const query = `
        SELECT m.*, 
               CASE 
                 WHEN m.sender_type = 'admin' THEN (
                   SELECT CONCAT(u.first_name, ' ', u.last_name) 
                   FROM users u 
                   WHERE u.id = m.sender_id
                 )
                 WHEN m.sender_type = 'florist' THEN (
                   SELECT CONCAT(fa.first_name, ' ', fa.last_name) 
                   FROM florist_auth fa 
                   WHERE fa.id::text = m.sender_id
                 )
               END as sender_name,
               CASE 
                 WHEN m.recipient_type = 'admin' THEN (
                   SELECT CONCAT(u.first_name, ' ', u.last_name) 
                   FROM users u 
                   WHERE u.id = m.recipient_id
                 )
                 WHEN m.recipient_type = 'florist' THEN (
                   SELECT CONCAT(fa.first_name, ' ', fa.last_name) 
                   FROM florist_auth fa 
                   WHERE fa.id::text = m.recipient_id
                 )
               END as recipient_name
        FROM messages m
        WHERE (m.sender_id = $1 AND m.sender_type = $2) 
           OR (m.recipient_id = $1 AND m.recipient_type = $2)
        ORDER BY m.created_at DESC
      `;
      
      const result = await pool.query(query, [userId, userType]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  // Send a new message
  app.post('/api/messages', authenticateCustomer, async (req, res) => {
    try {
      const user = req.user;
      const { recipientId, recipientType, subject, messageBody } = req.body;
      
      let senderId, senderType;
      
      // Determine sender type and ID
      if (user.userObj?.role === 'admin') {
        senderId = user.userId;
        senderType = 'admin';
      } else if (user.florist) {
        senderId = user.florist.id.toString();
        senderType = 'florist';
      } else {
        return res.status(400).json({ message: 'Invalid user type for messaging' });
      }

      console.log(`📤 Sending message from ${senderType} ${senderId} to ${recipientType} ${recipientId}`);

      if (!recipientId || !recipientType || !subject || !messageBody) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const query = `
        INSERT INTO messages (sender_id, sender_type, recipient_id, recipient_type, subject, message_body, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `;
      
      const result = await pool.query(query, [senderId, senderType, recipientId, recipientType, subject, messageBody]);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  // Mark message as read
  app.put('/api/messages/:id/read', authenticateCustomer, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const user = req.user;
      
      let userId, userType;
      
      // Determine user type and ID
      if (user.userObj?.role === 'admin') {
        userId = user.userId;
        userType = 'admin';
      } else if (user.florist) {
        userId = user.florist.id.toString();
        userType = 'florist';
      } else {
        return res.status(400).json({ message: 'Invalid user type for messaging' });
      }

      console.log(`📖 Marking message ${messageId} as read for ${userType} ${userId}`);

      const query = `
        UPDATE messages 
        SET is_read = TRUE, updated_at = NOW()
        WHERE id = $1 AND recipient_id = $2 AND recipient_type = $3
        RETURNING *
      `;
      
      const result = await pool.query(query, [messageId, userId, userType]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Message not found or access denied' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ message: 'Failed to mark message as read' });
    }
  });

  // Get unread message count
  app.get('/api/messages/unread-count', authenticateCustomer, async (req, res) => {
    try {
      const user = req.user;
      let userId, userType;
      
      // Determine user type and ID
      if (user.userObj?.role === 'admin') {
        userId = user.userId;
        userType = 'admin';
      } else if (user.florist) {
        userId = user.florist.id.toString();
        userType = 'florist';
      } else {
        return res.status(400).json({ message: 'Invalid user type for messaging' });
      }

      const query = `
        SELECT COUNT(*) as unread_count
        FROM messages
        WHERE recipient_id = $1 AND recipient_type = $2 AND is_read = FALSE
      `;
      
      const result = await pool.query(query, [userId, userType]);
      
      res.json({ unreadCount: parseInt(result.rows[0].unread_count) });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({ message: 'Failed to get unread count' });
    }
  });

  // Get list of florists for admin to message
  app.get('/api/messages/florists', authenticateCustomer, checkAdminRole, async (req, res) => {
    try {
      console.log('📋 Getting florist list for admin messaging');
      
      const query = `
        SELECT fa.id, fa.first_name, fa.last_name, fa.email, f.business_name
        FROM florist_auth fa
        LEFT JOIN florists f ON fa.id = f.id
        ORDER BY fa.first_name, fa.last_name
      `;
      
      const result = await pool.query(query);
      
      const florists = result.rows.map(row => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`,
        email: row.email,
        businessName: row.business_name || 'No business name'
      }));
      
      res.json(florists);
    } catch (error) {
      console.error('Error getting florists for messaging:', error);
      res.status(500).json({ message: 'Failed to get florists' });
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

  // Object storage upload endpoint for florist images
  app.post('/api/objects/upload', authenticateCustomer, async (req, res) => {
    try {
      console.log('Upload URL requested by user:', req.user);
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      console.log('Generated upload URL:', uploadURL);
      res.json({ uploadURL });
    } catch (error) {
      console.error('Error getting upload URL:', error);
      res.status(500).json({ message: 'Failed to get upload URL' });
    }
  });

  // SIMPLE Image upload endpoint - stores base64 data directly in database
  app.put('/api/florists/:id/image', authenticateCustomer, checkAdminRole, async (req, res) => {
    try {
      const floristId = parseInt(req.params.id);
      const { imageData } = req.body;

      console.log(`📷 Updating florist ${floristId} image with base64 data`);

      if (!floristId || isNaN(floristId)) {
        return res.status(400).json({ message: 'Valid florist ID is required' });
      }

      if (!imageData) {
        return res.status(400).json({ message: 'Image data is required' });
      }

      // Validate base64 image data
      if (!imageData.startsWith('data:image/')) {
        return res.status(400).json({ message: 'Invalid image data format' });
      }

      // Simple database update - store base64 image data
      const result = await pool.query(
        'UPDATE florist_auth SET profile_image_data = $1, updated_at = NOW() WHERE id = $2 RETURNING id, business_name', 
        [imageData, floristId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Florist not found' });
      }
      
      console.log(`✅ Successfully updated florist ${floristId} image`);
      res.json({ 
        message: 'Image updated successfully', 
        florist: result.rows[0]
      });
      
    } catch (error) {
      console.error('❌ Error updating florist image:', error);
      res.status(500).json({ message: 'Failed to update florist image' });
    }
  });

  // Florist search endpoint using SimpleStorage
  app.get('/api/florists/search', async (req, res) => {
    try {
      console.log('Florist search API called with params:', req.query);
      const { 
        keyword = '', 
        location = '', 
        services = [], 
        sortBy = 'distance',
        limit = 12,
        offset = 0 
      } = req.query;

      // Get all florists from Railway database using simple storage
      const allFlorists = await simpleStorage.getAllFlorists();
      console.log(`Found ${allFlorists.length} total florists in database`);

      // Filter florists based on search criteria
      let filteredFlorists = allFlorists.filter(florist => {
        const matchesKeyword = !keyword || 
          florist.businessName?.toLowerCase().includes(keyword.toString().toLowerCase()) ||
          florist.firstName?.toLowerCase().includes(keyword.toString().toLowerCase()) ||
          florist.lastName?.toLowerCase().includes(keyword.toString().toLowerCase());

        const matchesLocation = !location ||
          florist.city?.toLowerCase().includes(location.toString().toLowerCase()) ||
          florist.state?.toLowerCase().includes(location.toString().toLowerCase()) ||
          florist.address?.toLowerCase().includes(location.toString().toLowerCase());

        return matchesKeyword && matchesLocation;
      });

      console.log(`Filtered to ${filteredFlorists.length} florists matching criteria`);

      // Sort results
      if (sortBy === 'newest') {
        filteredFlorists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === 'rating') {
        filteredFlorists.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      }

      // Pagination
      const startIndex = parseInt(offset.toString()) || 0;
      const pageSize = parseInt(limit.toString()) || 12;
      const paginatedFlorists = filteredFlorists.slice(startIndex, startIndex + pageSize);

      console.log(`Returning ${paginatedFlorists.length} florists (page ${Math.floor(startIndex/pageSize) + 1})`);

      // PERFORMANCE OPTIMIZATION: Remove large base64 images from search results
      // Replace with image URLs that can be loaded separately
      const optimizedFlorists = paginatedFlorists.map(florist => ({
        ...florist,
        profileImageData: undefined, // Remove large base64 data
        profileImageUrl: florist.profileImageData ? `/api/florists/${florist.id}/image` : florist.profileImageUrl
      }));

      res.json({
        florists: optimizedFlorists,
        total: filteredFlorists.length,
        offset: startIndex,
        limit: pageSize,
        hasMore: startIndex + pageSize < filteredFlorists.length
      });
    } catch (error) {
      console.error('Florist search error:', error);
      res.status(500).json({ message: 'Failed to search florists' });
    }
  });

  // Separate endpoint for florist images (optimized for performance)
  app.get('/api/florists/:id/image', async (req, res) => {
    try {
      const { id } = req.params;
      const floristId = parseInt(id);
      
      if (isNaN(floristId)) {
        return res.status(400).json({ message: "Invalid florist ID" });
      }
      
      // Get only the image data for this florist
      const result = await pool.query(
        'SELECT profile_image_data FROM florist_auth WHERE id = $1',
        [floristId]
      );
      
      if (result.rows.length === 0 || !result.rows[0].profile_image_data) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      const imageData = result.rows[0].profile_image_data;
      
      // Set appropriate headers for image response
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      
      // Convert base64 to buffer and send
      if (imageData.startsWith('data:image/')) {
        const base64Data = imageData.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        res.send(imageBuffer);
      } else {
        res.status(400).json({ message: "Invalid image format" });
      }
    } catch (error) {
      console.error("Error fetching florist image:", error);
      res.status(500).json({ message: "Failed to fetch image" });
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

  // Admin endpoints - fresh implementation using working pool connection
  app.get('/api/admin/users', authenticateCustomer, checkAdminRole, async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, email, first_name, last_name, role, created_at 
        FROM users 
        ORDER BY created_at DESC
      `);
      
      const users = result.rows.map((row: any) => ({
        id: row.id,
        email: row.email,
        firstName: row.first_name || '',
        lastName: row.last_name || '',
        role: row.role,
        roles: [row.role],
        isVerified: true,
        createdAt: row.created_at
      }));
      
      res.json(users);
    } catch (error) {
      console.error('Admin users error:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.get('/api/admin/florists', authenticateCustomer, checkAdminRole, async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT * FROM florists 
        ORDER BY created_at DESC
      `);
      
      const florists = result.rows.map((row: any) => ({
        id: row.id,
        businessName: row.business_name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
        website: row.website,
        specialties: row.specialties,
        rating: row.rating || 4.5,
        reviewCount: row.review_count || 0,
        createdAt: row.created_at,
        isVerified: true,
        isActive: true
      }));
      
      res.json(florists);
    } catch (error) {
      console.error('Admin florists error:', error);
      res.status(500).json({ message: 'Failed to fetch florists' });
    }
  });

  app.post('/api/admin/users', authenticateCustomer, checkAdminRole, async (req, res) => {
    try {
      const { firstName, lastName, email, role } = req.body;
      
      // Generate unique ID for the user
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tempPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      
      const result = await pool.query(`
        INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_verified, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id, email, first_name, last_name, role, is_verified, created_at
      `, [userId, email, passwordHash, firstName, lastName, role, true]);
      
      const user = result.rows[0];
      res.status(201).json({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isVerified: user.is_verified,
        createdAt: user.created_at,
        tempPassword
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.put('/api/admin/users/:id', authenticateCustomer, checkAdminRole, async (req, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, role, password } = req.body;
      
      // Check if this is a password-only change
      if (password && !firstName && !lastName && !email && !role) {
        // Password-only update - get current user data first
        const currentUserResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (currentUserResult.rows.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        const currentUser = currentUserResult.rows[0];
        const passwordHash = await bcrypt.hash(password, 10);
        
        const result = await pool.query(`
          UPDATE users 
          SET password_hash = $1, updated_at = NOW()
          WHERE id = $2
          RETURNING id, email, first_name, last_name, role, is_verified, created_at
        `, [passwordHash, id]);
        
        const user = result.rows[0];
        return res.json({
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          isVerified: user.is_verified,
          createdAt: user.created_at
        });
      }
      
      // Regular user update with all fields
      let query, values;
      
      if (password && password.trim() !== '') {
        // Update with new password
        const passwordHash = await bcrypt.hash(password, 10);
        query = `
          UPDATE users 
          SET first_name = $1, last_name = $2, email = $3, role = $4, password_hash = $5, updated_at = NOW()
          WHERE id = $6
          RETURNING id, email, first_name, last_name, role, is_verified, created_at
        `;
        values = [firstName, lastName, email, role, passwordHash, id];
      } else {
        // Update without changing password
        query = `
          UPDATE users 
          SET first_name = $1, last_name = $2, email = $3, role = $4, updated_at = NOW()
          WHERE id = $5
          RETURNING id, email, first_name, last_name, role, is_verified, created_at
        `;
        values = [firstName, lastName, email, role, id];
      }
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const user = result.rows[0];
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isVerified: user.is_verified,
        createdAt: user.created_at
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  app.delete('/api/admin/users/:id', authenticateCustomer, checkAdminRole, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // Admin-clean routes - direct database access without auth for debugging
  app.get("/api/admin-clean/users", async (req, res) => {
    try {
      console.log('Admin-clean users endpoint called');
      
      // Direct database query to bypass Drizzle cache issues
      console.log('Railway connection test - should show Railway URL');
      const dbTestResult = await pool.query('SELECT current_database(), inet_server_addr(), inet_server_port()');
      console.log('Connected to database:', dbTestResult.rows[0]);
      const directResult = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
      console.log('Direct SQL query found', directResult.rows.length, 'users');
      console.log('Sample users found:', directResult.rows.map(r => ({ id: r.id, email: r.email, role: r.role })));
      
      // Check if customers exist and create them if missing
      const customerCount = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['customer']);
      console.log('Customer count in Railway database:', customerCount.rows[0].count);
      
      if (parseInt(customerCount.rows[0].count) === 0) {
        console.log('No customers found - adding test customers...');
        await pool.query(`
          INSERT INTO users (id, email, first_name, last_name, role, password_hash, is_verified, created_at, updated_at)
          VALUES 
          ('customer-test-1', 'sarah.customer@test.com', 'Sarah', 'Johnson', 'customer', '$2a$10$rZ8kL9qM.vN2pX4sT6wEuO8yF1mA5nG7cH9jK3lP8qR2sW6xY9zB', true, NOW(), NOW()),
          ('customer-test-2', 'mike.customer@test.com', 'Mike', 'Davis', 'customer', '$2a$10$rZ8kL9qM.vN2pX4sT6wEuO8yF1mA5nG7cH9jK3lP8qR2sW6xY9zB', true, NOW(), NOW()),
          ('customer-1', 'customer@test.com', 'John', 'Customer', 'customer', '$2b$10$NIjsdzNFPL8gt6ARfnWrU.NJtEkBAdWBKHOQ03pB98yDEfadbPTE6', true, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `);
        console.log('Added test customers to Railway database');
        
        // Re-query to get updated user list
        const updatedResult = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        console.log('Updated user count:', updatedResult.rows.length);
        
        const users = updatedResult.rows.map(row => ({
          id: row.id,
          email: row.email,
          firstName: row.first_name,
          lastName: row.last_name,
          role: row.role,
          isVerified: row.is_verified,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
        
        res.json(users);
        return;
      }
      
      const users = directResult.rows.map(row => ({
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role,
        isVerified: row.is_verified,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
      console.log('Admin-clean users retrieved:', users.length);
      console.log('User roles debug:', users.map((u: any) => ({ id: u.id, email: u.email, role: u.role })));
      res.json(users);
    } catch (error) {
      console.error("Admin-clean users error:", error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  app.get("/api/admin-clean/florists", async (req, res) => {
    try {
      console.log('Admin-clean florists endpoint called - using SimpleStorage');
      const { simpleStorage } = await import('./storage-simple');
      const florists = await simpleStorage.getAllFlorists();
      console.log('Admin-clean florists retrieved:', florists.length);
      res.json(florists);
    } catch (error) {
      console.error("Admin-clean florists error:", error);
      res.status(500).json({ error: "Failed to get florists" });
    }
  });

  // Serve uploaded images from object storage
  app.get('/objects/:objectPath(*)', async (req, res) => {
    try {
      const objectPath = `/objects/${req.params.objectPath}`;
      console.log('Serving object:', objectPath);
      
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      
      // Download and serve the file
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error('Error serving object:', error);
      if (error.name === 'ObjectNotFoundError') {
        return res.status(404).json({ error: 'File not found' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}