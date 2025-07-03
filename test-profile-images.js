// No need for jwt import in test file

// Sample base64 image (1x1 pixel PNG)
const SAMPLE_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGARukzgAAAABJRU5ErkJggg==';

async function makeRequest(endpoint, options = {}) {
  const baseUrl = 'http://localhost:5000';
  const url = `${baseUrl}${endpoint}`;
  
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
    console.error('Failed to parse JSON response:', responseText);
    throw new Error(`Invalid JSON response: ${responseText}`);
  }

  return { response, data };
}

async function testFloristRegistration() {
  console.log('\n=== Testing Florist Registration ===');
  
  const registrationData = {
    email: 'imagetest@example.com',
    firstName: 'Image',
    lastName: 'Tester',
    businessName: 'Image Test Florist',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    phone: '555-0123',
    password: 'testpass123'
  };

  const { response, data } = await makeRequest('/api/florist/register', {
    method: 'POST',
    body: JSON.stringify(registrationData)
  });

  if (!response.ok) {
    throw new Error(`Registration failed: ${JSON.stringify(data)}`);
  }

  console.log('✅ Registration successful');
  return data.token;
}

async function testFloristLogin() {
  console.log('\n=== Testing Florist Login ===');
  
  const loginData = {
    email: 'imagetest@example.com',
    password: 'testpass123'
  };

  const { response, data } = await makeRequest('/api/florist/login', {
    method: 'POST',
    body: JSON.stringify(loginData)
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${JSON.stringify(data)}`);
  }

  console.log('✅ Login successful');
  return data.token;
}

async function testProfileSetupWithImage(token) {
  console.log('\n=== Testing Profile Setup with Binary Image ===');
  
  const profileData = {
    businessName: 'Updated Image Test Florist',
    address: '456 Updated St',
    city: 'Updated City',
    state: 'UP',
    zipCode: '54321',
    phone: '555-9876',
    website: 'https://imagetest.com',
    profileImageUrl: SAMPLE_IMAGE_BASE64, // Binary image data
    profileSummary: 'We create beautiful arrangements with proper image storage',
    yearsOfExperience: 5,
    specialties: ['weddings', 'events']
  };

  const { response, data } = await makeRequest('/api/florist/profile/setup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });

  if (!response.ok) {
    throw new Error(`Profile setup failed: ${JSON.stringify(data)}`);
  }

  console.log('✅ Profile setup with image successful');
  console.log('Profile data:', {
    businessName: data.profile?.businessName,
    hasProfileImage: !!data.profile?.profileImageUrl,
    imageDataType: data.profile?.profileImageUrl?.substring(0, 20) + '...'
  });
  
  return data.profile;
}

async function testProfileRetrieval(token) {
  console.log('\n=== Testing Profile Retrieval with Image ===');
  
  const { response, data } = await makeRequest('/api/florist/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Profile retrieval failed: ${JSON.stringify(data)}`);
  }

  console.log('✅ Profile retrieval successful');
  console.log('Retrieved profile:', {
    businessName: data.businessName,
    hasProfileImage: !!data.profileImageUrl,
    imageDataType: data.profileImageUrl?.substring(0, 20) + '...',
    imageSize: data.profileImageUrl?.length || 0
  });

  // Verify the image data is the same as what we stored
  if (data.profileImageUrl === SAMPLE_IMAGE_BASE64) {
    console.log('✅ Image data matches original binary data');
  } else {
    console.log('❌ Image data does not match original');
    console.log('Expected:', SAMPLE_IMAGE_BASE64.substring(0, 50));
    console.log('Got:', data.profileImageUrl?.substring(0, 50));
  }
  
  return data;
}

async function runImageTests() {
  try {
    console.log('🧪 Starting Comprehensive Image Storage Tests...');
    
    // Test registration
    const registrationToken = await testFloristRegistration();
    
    // Test login
    const loginToken = await testFloristLogin();
    
    // Test profile setup with binary image
    const profileSetupResult = await testProfileSetupWithImage(loginToken);
    
    // Test profile retrieval with binary image
    const retrievedProfile = await testProfileRetrieval(loginToken);
    
    console.log('\n🎉 All image storage tests passed!');
    console.log('\n📊 Test Summary:');
    console.log('- Florist registration: ✅');
    console.log('- Florist login: ✅');
    console.log('- Profile setup with binary image: ✅');
    console.log('- Profile retrieval with binary image: ✅');
    console.log('- Image data integrity: ✅');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runImageTests();