// Simple test to get admin authentication working
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function createTestUser() {
  // Create proper hash for password123
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash for password123:', hash);
  
  // Test verification
  const isValid = await bcrypt.compare(password, hash);
  console.log('Hash verification works:', isValid);
  
  // Test JWT
  const token = jwt.sign({ userId: 'test-admin', email: 'admin@test.com' }, 'test-secret', { expiresIn: '24h' });
  console.log('Test JWT token:', token);
  
  // Verify JWT
  const decoded = jwt.verify(token, 'test-secret');
  console.log('JWT decoded:', decoded);
}

createTestUser().catch(console.error);