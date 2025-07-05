/**
 * Debug script to isolate the makeRequest function issue
 */

const baseUrl = 'http://localhost:5000';

// EXACT copy of makeRequest function from test-profile-complete.js
async function makeRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  console.log(`Making request to: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON response:', responseText.substring(0, 200));
      throw new Error('Invalid JSON response');
    }

    console.log(`Response status: ${response.status}`);
    if (!response.ok) {
      console.error('Error response:', data);
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`Request failed for ${endpoint}:`, error.message);
    throw error;
  }
}

async function debugMakeRequest() {
  console.log('🐛 DEBUG makeRequest FUNCTION WITH SIMPLE DATA');
  
  // First, login to get a token
  console.log('\n=== AUTHENTICATION ===');
  const loginData = {
    email: "alaaroubi@gmail.com",
    password: "Password123!"
  };

  const loginResponse = await makeRequest('/api/auth/florist/login', {
    method: 'POST',
    body: JSON.stringify(loginData)
  });

  console.log('✓ Authentication successful');
  const token = loginResponse.token;
  
  // Test profile setup with SIMPLE data using makeRequest function
  console.log('\n=== PROFILE SETUP WITH makeRequest ===');
  
  const simpleProfileData = {
    businessName: "Simple Test Florist",
    address: "123 Simple St",
    city: "Simple City",
    state: "CA",
    zipCode: "12345",
    phone: "(555) 123-4567"
  };
  
  console.log('Simple data to send:', JSON.stringify(simpleProfileData, null, 2));
  
  const profileResponse = await makeRequest('/api/florist/profile/setup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(simpleProfileData)
  });

  console.log('✓ Profile setup successful with makeRequest');
  console.log('Response:', profileResponse.message);
}

debugMakeRequest().catch(console.error);