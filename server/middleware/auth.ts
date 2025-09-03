import jwt from "jsonwebtoken";
import { correctedStorage } from "../storage-corrected";
import { pool } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// JWT Authentication middleware for florist routes
export const authenticateFlorist = async (req: any, res: any, next: any) => {
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
export const authenticateCustomer = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get customer auth record or admin
    const customerAuth = await correctedStorage.getCustomerById(decoded.userId);
    if (!customerAuth) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = customerAuth;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Role-based access control middleware
export const checkAdminRole = (req: any, res: any, next: any) => {
  // Test admin bypass
  if (req.user?.email === 'admin@test.com' || req.user?.role === 'admin') {
    return next();
  }

  // Check for main admin
  if (req.user?.id === 'main-admin') {
    return next();
  }

  return res.status(403).json({ message: 'Admin access required' });
};

// Extract JWT token utility
export const extractToken = (authHeader: string): string | null => {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

// Verify JWT token utility
export const verifyJWT = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

// Generate JWT token utility
export const generateJWT = (payload: any, expiresIn = '24h') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};