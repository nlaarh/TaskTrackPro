/**
 * Debug script to test with the exact same data structure as the original test
 */

const baseUrl = 'http://localhost:5000';

// Test data for complete profile (without the large image)
const testProfileDataNoImage = {
  businessName: "Bloom & Blossom Florist",
  address: "456 Garden Avenue",
  city: "San Francisco",
  state: "CA",
  zipCode: "94102",
  phone: "(415) 555-0199",
  website: "https://bloomandblossom.com",
  profileSummary: "Creating stunning floral arrangements for life's most precious moments. From intimate gatherings to grand celebrations, we bring your vision to life with fresh, locally-sourced flowers and personalized service.",
  yearsOfExperience: 12,
  specialties: ["Wedding Arrangements", "Corporate Events", "Sympathy Arrangements"],
  services: ["Delivery Service", "Wedding Consulting", "Custom Arrangements", "Event Planning"]
  // NO profileImageUrl
};

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

async function debugTest() {
  console.log('🐛 DEBUG TEST WITH EXACT STRUCTURE (NO IMAGE)');
  
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
  
  // Test profile setup
  console.log('\n=== PROFILE SETUP (NO IMAGE) ===');
  console.log('Data size:', JSON.stringify(testProfileDataNoImage).length, 'characters');
  
  const profileResponse = await makeRequest('/api/florist/profile/setup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(testProfileDataNoImage)
  });

  console.log('✓ Profile setup successful (no image)');
  console.log('Response:', profileResponse.message);
}

debugTest().catch(console.error);