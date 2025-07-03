// Simple unit test for profile saving and retrieval
const jwt = require('jsonwebtoken');

// Test configuration
const API_BASE = 'http://localhost:5000';
const JWT_SECRET = 'default-secret';

// Test user credentials  
const testFlorist = {
  firstName: 'Test',
  lastName: 'Florist',
  email: 'test@florist.com',
  password: 'test123',
  confirmPassword: 'test123'
};

// Test profile data
const testProfile = {
  businessName: 'Test Flower Shop',
  address: '123 Main St',
  city: 'Test City',
  state: 'CA',
  zipCode: '12345',
  phone: '555-0123',
  website: 'https://testflowers.com',
  profileSummary: 'We create beautiful arrangements for all occasions',
  yearsOfExperience: 5,
  specialties: ['Wedding Arrangements', 'Funeral Services'],
  services: ['Same Day Delivery', 'Custom Arrangements']
};

async function makeRequest(endpoint, options = {}) {
  console.log(`Making ${options.method || 'GET'} request to ${endpoint}`);
  if (options.body) {
    console.log('Request body:', options.body);
  }
  if (options.headers) {
    console.log('Request headers:', options.headers);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  console.log(`${options.method || 'GET'} ${endpoint}: ${response.status}`, data);
  
  return { response, data };
}

async function testAuthentication() {
  console.log('\n=== Testing Authentication ===');
  
  // 1. Register florist
  console.log('\n1. Registering florist...');
  const { response: regResponse, data: regData } = await makeRequest('/api/auth/florist/register', {
    method: 'POST',
    body: JSON.stringify(testFlorist)
  });
  
  // 2. Login florist
  console.log('\n2. Logging in florist...');
  const { response: loginResponse, data: loginData } = await makeRequest('/api/auth/florist/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testFlorist.email,
      password: testFlorist.password
    })
  });
  
  if (loginResponse.ok && loginData.token) {
    console.log('✓ Login successful, token received');
    return loginData.token;
  } else {
    console.log('✗ Login failed');
    return null;
  }
}

async function testProfileOperations(token) {
  console.log('\n=== Testing Profile Operations ===');
  
  // 3. Save profile
  console.log('\n3. Saving profile...');
  const { response: saveResponse, data: saveData } = await makeRequest('/api/florist/profile/setup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(testProfile)
  });
  
  if (saveResponse.ok) {
    console.log('✓ Profile saved successfully');
  } else {
    console.log('✗ Profile save failed');
    return false;
  }
  
  // 4. Retrieve profile
  console.log('\n4. Retrieving profile...');
  const { response: getResponse, data: getData } = await makeRequest('/api/florist/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (getResponse.ok) {
    console.log('✓ Profile retrieved successfully');
    
    // 5. Verify profile data
    console.log('\n5. Verifying profile data...');
    const profile = getData;
    
    const fieldsToCheck = ['businessName', 'address', 'city', 'state', 'zipCode'];
    let allFieldsMatch = true;
    
    for (const field of fieldsToCheck) {
      if (profile[field] === testProfile[field]) {
        console.log(`✓ ${field}: ${profile[field]}`);
      } else {
        console.log(`✗ ${field}: expected "${testProfile[field]}", got "${profile[field]}"`);
        allFieldsMatch = false;
      }
    }
    
    if (allFieldsMatch) {
      console.log('✓ All profile fields match!');
      return true;
    } else {
      console.log('✗ Some profile fields do not match');
      return false;
    }
  } else {
    console.log('✗ Profile retrieval failed');
    return false;
  }
}

async function runTests() {
  console.log('Starting Profile Save/Retrieve Tests...');
  
  try {
    // Test authentication
    const token = await testAuthentication();
    if (!token) {
      console.log('\n❌ Tests failed: Could not authenticate');
      return;
    }
    
    // Test profile operations
    const profileTestPassed = await testProfileOperations(token);
    
    if (profileTestPassed) {
      console.log('\n✅ All tests passed! Profile save and retrieve working correctly.');
    } else {
      console.log('\n❌ Tests failed: Profile operations not working correctly');
    }
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };