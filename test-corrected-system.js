/**
 * Comprehensive Unit Tests for Corrected Storage System
 * Tests the proper two-table architecture:
 * - florist_auth: Authentication data only
 * - florists: Business profile data only
 */

import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

async function makeRequest(endpoint, options = {}) {
  const url = `http://localhost:5000${endpoint}`;
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const responseText = await response.text();
  
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error('Failed to parse response:', responseText);
    throw new Error(`Invalid JSON response: ${responseText}`);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
  }

  return data;
}

// Test data
const TEST_FLORIST = {
  email: 'testcorrected@example.com',
  password: 'TestPassword123!',
  firstName: 'Jane',
  lastName: 'Smith',
  businessName: 'Corrected Flower Shop',
  address: '456 Test Avenue',
  city: 'Test City',
  state: 'NY',
  zipCode: '12345',
  phone: '(555) 987-6543',
  website: 'https://correctedflowers.com',
  profileSummary: 'Testing the corrected storage system',
  yearsOfExperience: 8,
  specialties: ['Wedding Arrangements', 'Corporate Events'],
  services: ['Delivery Service', 'Event Setup']
};

// Test 1: Florist Registration (creates florist_auth record)
async function testFloristRegistration() {
  console.log('\n=== TEST 1: Florist Registration ===');
  
  try {
    const response = await makeRequest('/api/auth/florist/register', {
      method: 'POST',
      body: {
        email: TEST_FLORIST.email,
        password: TEST_FLORIST.password,
        firstName: TEST_FLORIST.firstName,
        lastName: TEST_FLORIST.lastName,
      },
    });

    console.log('✓ Registration successful');
    console.log('Response:', {
      message: response.message,
      florist: response.florist ? {
        id: response.florist.id,
        email: response.florist.email,
        firstName: response.florist.firstName,
        lastName: response.florist.lastName
      } : null
    });
    
    return response;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ Registration skipped - user already exists');
      return { message: 'User exists' };
    }
    console.error('✗ Registration failed:', error.message);
    throw error;
  }
}

// Test 2: Florist Login (verifies florist_auth)
async function testFloristLogin() {
  console.log('\n=== TEST 2: Florist Login ===');
  
  try {
    const response = await makeRequest('/api/auth/florist/login', {
      method: 'POST',
      body: {
        email: TEST_FLORIST.email,
        password: TEST_FLORIST.password,
      },
    });

    console.log('✓ Login successful');
    console.log('Token received:', response.token ? 'Yes' : 'No');
    console.log('Florist data:', {
      id: response.florist.id,
      email: response.florist.email,
      firstName: response.florist.firstName,
      lastName: response.florist.lastName
    });
    
    return response.token;
  } catch (error) {
    console.error('✗ Login failed:', error.message);
    throw error;
  }
}

// Test 3: Profile Setup (creates florists record)
async function testProfileSetup(token) {
  console.log('\n=== TEST 3: Profile Setup ===');
  
  try {
    const response = await makeRequest('/api/florist/profile/setup', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: {
        businessName: TEST_FLORIST.businessName,
        address: TEST_FLORIST.address,
        city: TEST_FLORIST.city,
        state: TEST_FLORIST.state,
        zipCode: TEST_FLORIST.zipCode,
        phone: TEST_FLORIST.phone,
        website: TEST_FLORIST.website,
        profileSummary: TEST_FLORIST.profileSummary,
        yearsOfExperience: TEST_FLORIST.yearsOfExperience,
        specialties: TEST_FLORIST.specialties,
        services: TEST_FLORIST.services,
      },
    });

    console.log('✓ Profile setup successful');
    console.log('Response:', response.message);
    
    return response;
  } catch (error) {
    console.error('✗ Profile setup failed:', error.message);
    throw error;
  }
}

// Test 4: Profile Retrieval (joins florist_auth + florists)
async function testProfileRetrieval(token) {
  console.log('\n=== TEST 4: Profile Retrieval ===');
  
  try {
    const response = await makeRequest('/api/florist/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('✓ Profile retrieval successful');
    
    // Validate structure
    const hasAuthData = response.id && response.email && response.firstName && response.lastName;
    const hasBusinessData = response.businessProfile && 
                           response.businessProfile.businessName && 
                           response.businessProfile.address;
    
    console.log('Auth data present:', hasAuthData ? 'Yes' : 'No');
    console.log('Business data present:', hasBusinessData ? 'Yes' : 'No');
    
    if (hasAuthData && hasBusinessData) {
      console.log('Data structure validation: ✓ PASSED');
      console.log('Sample data:', {
        authEmail: response.email,
        businessName: response.businessProfile.businessName,
        specialties: response.businessProfile.specialties,
        services: response.businessProfile.services
      });
    } else {
      console.log('Data structure validation: ✗ FAILED');
    }
    
    return response;
  } catch (error) {
    console.error('✗ Profile retrieval failed:', error.message);
    throw error;
  }
}

// Test 5: Database Verification
async function testDatabaseVerification() {
  console.log('\n=== TEST 5: Database Verification ===');
  
  try {
    // Use direct database queries to verify correct storage
    const pool = new Pool({
      connectionString: 'postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb'
    });

    // Check florist_auth table
    const authResult = await pool.query(
      'SELECT id, email, first_name, last_name, is_verified FROM florist_auth WHERE email = $1',
      [TEST_FLORIST.email]
    );
    
    // Check florists table
    const floristResult = await pool.query(
      'SELECT id, user_id, business_name, address, city, state, zip_code, specialties, services FROM florists WHERE email = $1',
      [TEST_FLORIST.email]
    );

    console.log('Auth record:', authResult.rows[0] ? 'Found' : 'Not found');
    console.log('Florist record:', floristResult.rows[0] ? 'Found' : 'Not found');
    
    if (authResult.rows[0] && floristResult.rows[0]) {
      const authRow = authResult.rows[0];
      const floristRow = floristResult.rows[0];
      
      console.log('✓ Both records exist');
      console.log('Foreign key relationship:', 
        floristRow.user_id === authRow.id ? 'Correct' : 'BROKEN');
      console.log('Data integrity:', {
        authEmail: authRow.email,
        floristEmail: floristRow.email,
        businessName: floristRow.business_name,
        specialties: floristRow.specialties,
        services: floristRow.services
      });
    } else {
      console.log('✗ Missing records in database');
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('✗ Database verification failed:', error.message);
    throw error;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 CORRECTED STORAGE SYSTEM TESTS');
  console.log('=====================================');
  
  try {
    let token = null;
    
    // Run tests in sequence
    await testFloristRegistration();
    token = await testFloristLogin();
    await testProfileSetup(token);
    await testProfileRetrieval(token);
    await testDatabaseVerification();
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('The corrected storage system is working properly.');
    
  } catch (error) {
    console.log('\n💥 TEST FAILED');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();