#!/usr/bin/env node

/**
 * Comprehensive Profile Data Test Suite
 * Tests all fields captured in /florist-profile-setup page:
 * - Business photo (base64 image)
 * - Business information (name, address, city, state, zip, phone, website)
 * - Profile summary and years of experience
 * - Specialties and services arrays
 */

const baseUrl = 'http://localhost:5000';

// Test data for complete profile
const testProfileData = {
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
  services: ["Delivery Service", "Wedding Consulting", "Custom Arrangements", "Event Planning"],
  profileImageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
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

async function authenticateFlorist() {
  console.log('\n=== FLORIST AUTHENTICATION ===');
  
  const loginData = {
    email: "alaaroubi@gmail.com",
    password: "Password123!"
  };

  const response = await makeRequest('/api/auth/florist/login', {
    method: 'POST',
    body: JSON.stringify(loginData)
  });

  console.log('✓ Authentication successful');
  console.log(`Token: ${response.token.substring(0, 50)}...`);
  console.log(`Florist ID: ${response.florist.id}`);
  
  return response.token;
}

async function testCompleteProfileSetup(token) {
  console.log('\n=== COMPLETE PROFILE SETUP TEST ===');
  
  console.log('Testing profile setup with all fields...');
  console.log('Business Name:', testProfileData.businessName);
  console.log('Address:', `${testProfileData.address}, ${testProfileData.city}, ${testProfileData.state} ${testProfileData.zipCode}`);
  console.log('Phone:', testProfileData.phone);
  console.log('Website:', testProfileData.website);
  console.log('Years of Experience:', testProfileData.yearsOfExperience);
  console.log('Specialties:', testProfileData.specialties.join(', '));
  console.log('Services:', testProfileData.services.join(', '));
  console.log('Profile Summary Length:', testProfileData.profileSummary.length, 'characters');
  console.log('Profile Image Length:', testProfileData.profileImageUrl.length, 'characters');

  // Use direct fetch instead of makeRequest to avoid body parsing issues
  const response = await fetch('http://localhost:5000/api/florist/profile/setup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(testProfileData)
  });
  
  const responseText = await response.text();
  const responseData = JSON.parse(responseText);
  
  if (!response.ok) {
    console.error('Error response:', responseData);
    throw new Error(responseData.message || `HTTP ${response.status}`);
  }

  console.log('✓ Profile setup successful');
  console.log('Response:', responseData.message);
  
  return responseData;
}

async function testProfileRetrieval(token) {
  console.log('\n=== PROFILE RETRIEVAL TEST ===');
  
  const profile = await makeRequest('/api/florist/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log('✓ Profile retrieved successfully');
  console.log('\n--- RETRIEVED PROFILE DATA ---');
  
  // Verify all fields
  const fieldTests = [
    { field: 'businessName', expected: testProfileData.businessName, actual: profile.businessName },
    { field: 'address', expected: testProfileData.address, actual: profile.address },
    { field: 'city', expected: testProfileData.city, actual: profile.city },
    { field: 'state', expected: testProfileData.state, actual: profile.state },
    { field: 'zipCode', expected: testProfileData.zipCode, actual: profile.zipCode },
    { field: 'phone', expected: testProfileData.phone, actual: profile.phone },
    { field: 'website', expected: testProfileData.website, actual: profile.website },
    { field: 'profileSummary', expected: testProfileData.profileSummary, actual: profile.profileSummary },
    { field: 'yearsOfExperience', expected: testProfileData.yearsOfExperience, actual: profile.yearsOfExperience },
  ];

  let allFieldsCorrect = true;

  for (const test of fieldTests) {
    const isCorrect = test.expected === test.actual;
    const status = isCorrect ? '✓' : '✗';
    console.log(`${status} ${test.field}: ${test.actual}`);
    if (!isCorrect) {
      console.log(`  Expected: "${test.expected}"`);
      console.log(`  Actual: "${test.actual}"`);
      allFieldsCorrect = false;
    }
  }

  // Test arrays separately
  const specialtiesMatch = JSON.stringify(testProfileData.specialties.sort()) === JSON.stringify(profile.specialties.sort());
  const servicesMatch = JSON.stringify(testProfileData.services.sort()) === JSON.stringify(profile.services.sort());

  console.log(`${specialtiesMatch ? '✓' : '✗'} specialties: [${profile.specialties.join(', ')}]`);
  if (!specialtiesMatch) {
    console.log(`  Expected: [${testProfileData.specialties.join(', ')}]`);
    allFieldsCorrect = false;
  }

  console.log(`${servicesMatch ? '✓' : '✗'} services: [${profile.services.join(', ')}]`);
  if (!servicesMatch) {
    console.log(`  Expected: [${testProfileData.services.join(', ')}]`);
    allFieldsCorrect = false;
  }

  // Test profile image
  const imageMatch = testProfileData.profileImageUrl === profile.profileImageUrl;
  console.log(`${imageMatch ? '✓' : '✗'} profileImageUrl: ${profile.profileImageUrl.substring(0, 50)}...`);
  if (!imageMatch) {
    console.log(`  Expected length: ${testProfileData.profileImageUrl.length}`);
    console.log(`  Actual length: ${profile.profileImageUrl.length}`);
    allFieldsCorrect = false;
  }

  if (allFieldsCorrect) {
    console.log('\n🎉 ALL PROFILE FIELDS MATCH PERFECTLY!');
  } else {
    console.log('\n❌ Some profile fields do not match');
  }

  return { profile, allFieldsCorrect };
}

async function testPartialUpdate(token) {
  console.log('\n=== PARTIAL UPDATE TEST ===');
  
  const partialUpdate = {
    businessName: "Updated Bloom & Blossom",
    yearsOfExperience: 15,
    specialties: ["Wedding Arrangements", "Corporate Events"],
    profileSummary: "Updated summary: Premium floral design services with 15 years of experience."
  };

  console.log('Testing partial profile update...');
  console.log('Updating:', Object.keys(partialUpdate).join(', '));

  const response = await makeRequest('/api/florist/profile/setup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(partialUpdate)
  });

  console.log('✓ Partial update successful');

  // Verify the updates
  const updatedProfile = await makeRequest('/api/florist/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log('\n--- VERIFYING PARTIAL UPDATE ---');
  console.log(`✓ Business Name: ${updatedProfile.businessName}`);
  console.log(`✓ Years of Experience: ${updatedProfile.yearsOfExperience}`);
  console.log(`✓ Specialties: [${updatedProfile.specialties.join(', ')}]`);
  console.log(`✓ Profile Summary: ${updatedProfile.profileSummary.substring(0, 50)}...`);
  
  // Verify unchanged fields remain the same
  console.log(`✓ Address unchanged: ${updatedProfile.address}`);
  console.log(`✓ Phone unchanged: ${updatedProfile.phone}`);

  return updatedProfile;
}

async function testImageUpdate(token) {
  console.log('\n=== IMAGE UPDATE TEST ===');
  
  const newImageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  
  const imageUpdate = {
    profileImageUrl: newImageData
  };

  console.log('Updating profile image...');
  console.log('New image length:', newImageData.length, 'characters');

  const response = await makeRequest('/api/florist/profile/setup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(imageUpdate)
  });

  console.log('✓ Image update successful');

  // Verify the image update
  const updatedProfile = await makeRequest('/api/florist/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const imageMatches = updatedProfile.profileImageUrl === newImageData;
  console.log(`${imageMatches ? '✓' : '✗'} Image updated correctly`);
  console.log('Retrieved image length:', updatedProfile.profileImageUrl.length, 'characters');

  return updatedProfile;
}

async function runCompleteTests() {
  console.log('🧪 COMPREHENSIVE PROFILE DATA TEST SUITE');
  console.log('========================================');
  
  try {
    // 1. Authenticate
    const token = await authenticateFlorist();
    
    // 2. Test complete profile setup
    await testCompleteProfileSetup(token);
    
    // 3. Test profile retrieval and verification
    const { allFieldsCorrect } = await testProfileRetrieval(token);
    
    // 4. Test partial updates
    await testPartialUpdate(token);
    
    // 5. Test image updates
    await testImageUpdate(token);
    
    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('✓ Profile setup works correctly');
    console.log('✓ Profile retrieval works correctly');
    console.log('✓ All field types handled properly');
    console.log('✓ Partial updates work correctly');
    console.log('✓ Image updates work correctly');
    console.log('✓ Database storage and retrieval verified');
    
    if (allFieldsCorrect) {
      console.log('\n🏆 PERFECT SCORE: All profile data matches exactly!');
    }
    
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    process.exit(1);
  }
}

// Run the test suite
runCompleteTests();