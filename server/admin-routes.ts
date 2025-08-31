import type { Express } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Pool } from 'pg';

// Use the exact same connection as db.ts
const pool = new Pool({ 
  connectionString: "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb",
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Simple admin authentication middleware
const adminAuth = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Handle main admin special case
    if (decoded.email === 'alaaroubi@gmail.com' && decoded.isMainAdmin) {
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
      return res.status(403).json({ message: 'Admin access required' });
    }

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
      
      // First check if we can connect to database
      const testResult = await pool.query('SELECT current_database()');
      console.log('CLEAN ADMIN: Connected to database:', testResult.rows[0].current_database);
      
      // Check if users table exists
      const tableCheck = await pool.query(`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_name = 'users' AND table_schema = 'public'
      `);
      console.log('CLEAN ADMIN: Users table exists:', tableCheck.rows[0].count > 0);
      
      // Get total count
      const countResult = await pool.query('SELECT COUNT(*) as total FROM users');
      console.log('CLEAN ADMIN: Total users in database:', countResult.rows[0].total);
      
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

  // Get all florists
  app.get('/api/admin/florists', adminAuth, async (req, res) => {
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