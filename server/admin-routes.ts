import type { Express } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from './db';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Simple admin authentication middleware
const adminAuth = async (req: any, res: any, next: any) => {
  console.log('ADMIN AUTH: Starting authentication...');
  try {
    const authHeader = req.headers.authorization;
    console.log('ADMIN AUTH: Auth header present:', !!authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('ADMIN AUTH: No Bearer token found');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    console.log('ADMIN AUTH: Token extracted, length:', token.length);
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('ADMIN AUTH: Token decoded successfully:', { email: decoded.email, userId: decoded.userId });
    
    // Handle main admin special case - check the actual token structure
    if (decoded.userId === 'main-admin' && decoded.email === 'alaaroubi@gmail.com') {
      console.log('ADMIN AUTH: Main admin bypass granted');
      req.user = {
        id: 'main-admin',
        email: 'alaaroubi@gmail.com',
        role: 'admin'
      };
      return next();
    }
    
    // For other users, check database
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [decoded.email]);
    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      console.log('ADMIN AUTH: Access denied - user not admin or not found');
      return res.status(403).json({ message: 'Admin access required' });
    }

    console.log('ADMIN AUTH: Regular admin user granted access');
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export function setupAdminRoutes(app: Express) {
  // Get all users - with unique route path to avoid conflicts
  app.get('/api/admin-clean/users', adminAuth, async (req, res) => {
    try {
      console.log('CLEAN ADMIN: Fetching users...');
      
      // Direct query without debugging - use same pool as working routes
      
      const result = await pool.query(`
        SELECT id, email, first_name, last_name, role, created_at 
        FROM users 
        ORDER BY created_at DESC
      `);
      
      console.log('CLEAN ADMIN: Query returned', result.rows.length, 'users');
      console.log('CLEAN ADMIN: First few rows:', result.rows.slice(0, 3));
      
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

  // Get all florists from florist_auth table where business data is stored
  app.get('/api/admin-clean/florists', adminAuth, async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, business_name, email, first_name, last_name, city, state, phone, 
               website, specialties, profile_summary, years_of_experience, 
               is_verified, created_at
        FROM florist_auth 
        WHERE business_name IS NOT NULL
        ORDER BY created_at DESC
      `);
      
      const florists = result.rows.map((row: any) => ({
        id: row.id,
        businessName: row.business_name,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        city: row.city,
        state: row.state,
        website: row.website,
        specialties: row.specialties,
        profileSummary: row.profile_summary,
        yearsOfExperience: row.years_of_experience || 0,
        rating: 4.5, // Default rating
        reviewCount: 0, // Default review count
        createdAt: row.created_at,
        isVerified: row.is_verified || false,
        isActive: true
      }));
      
      res.json(florists);
    } catch (error) {
      console.error('Admin florists error:', error);
      res.status(500).json({ message: 'Failed to fetch florists' });
    }
  });

  // Create user
  app.post('/api/admin/users', adminAuth, async (req, res) => {
    try {
      const { firstName, lastName, email, role } = req.body;
      
      const tempPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      
      const result = await pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id, email, first_name, last_name, role, created_at
      `, [email, passwordHash, firstName, lastName, role]);
      
      const user = result.rows[0];
      res.status(201).json({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at,
        tempPassword
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  // Update user
  app.put('/api/admin/users/:id', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, role } = req.body;
      
      const result = await pool.query(`
        UPDATE users 
        SET first_name = $1, last_name = $2, email = $3, role = $4
        WHERE id = $5
        RETURNING id, email, first_name, last_name, role, created_at
      `, [firstName, lastName, email, role, id]);
      
      const user = result.rows[0];
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Delete user
  app.delete('/api/admin/users/:id', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });
}