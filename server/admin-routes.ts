import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { correctedStorage as storage } from './storage-corrected';

const router = Router();

// Admin authentication middleware
const adminAuth = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Allow main admin bypass
    if (decoded.email === 'alaaroubi@gmail.com' || decoded.userId === 'main-admin') {
      req.user = decoded;
      return next();
    }

    // Check if user has admin role
    if (!decoded.role || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Create user
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;
    
    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate a default password (user should change it)
    const defaultPassword = 'TempPassword123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    const userData = {
      firstName,
      lastName,
      email,
      role,
      passwordHash: hashedPassword,
      isVerified: true
    };

    const user = await storage.createUser(userData);
    
    // Remove password from response
    const { passwordHash, ...userResponse } = user;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Update user
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, isVerified } = req.body;

    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userData = {
      id,
      firstName,
      lastName,
      email,
      role,
      isVerified: isVerified !== undefined ? isVerified : true
    };

    const user = await storage.updateUser(id, userData);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from response
    const { passwordHash, ...userResponse } = user;
    
    res.json(userResponse);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting the main admin
    if (id === 'admin-1' || id === 'main-admin') {
      return res.status(400).json({ message: 'Cannot delete main admin user' });
    }

    const success = await storage.deleteUser(id);
    
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

export default router;