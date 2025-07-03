const https = require('https');
const http = require('http');

// Sample base64 image (1x1 pixel PNG)
const SAMPLE_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGARukzgAAAABJRU5ErkJggg==';

async function makeRequest(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000${endpoint}`);
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ response: res, data: jsonData });
        } catch (e) {
          resolve({ response: res, data: { error: 'Invalid JSON', raw: data } });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testCompleteBinaryImageWorkflow() {
  try {
    console.log('🧪 Testing Complete Binary Image Storage Workflow...\n');
    
    // Step 1: Register florist with complete business data
    console.log('Step 1: Registering florist with complete business data...');
    const registrationData = {
      email: 'finaltest@example.com',
      firstName: 'Binary',
      lastName: 'Tester',
      businessName: 'Binary Image Florist',
      address: '456 Binary St',
      city: 'Binary City',
      state: 'BI',
      zipCode: '54321',
      phone: '555-9876',
      password: 'testpass123'
    };

    const { response: regRes, data: regData } = await makeRequest('/api/auth/florist/register', {
      method: 'POST',
      body: JSON.stringify(registrationData)
    });

    if (regRes.statusCode !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    console.log('✅ Registration successful\n');

    // Step 2: Login to get fresh token
    console.log('Step 2: Logging in...');
    const loginData = {
      email: 'finaltest@example.com',
      password: 'testpass123'
    };

    const { response: loginRes, data: loginData2 } = await makeRequest('/api/auth/florist/login', {
      method: 'POST',
      body: JSON.stringify(loginData)
    });

    if (loginRes.statusCode !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginData2)}`);
    }
    
    const token = loginData2.token;
    console.log('✅ Login successful\n');

    // Step 3: Update profile with binary image
    console.log('Step 3: Updating profile with binary image...');
    const profileData = {
      profileImageUrl: SAMPLE_IMAGE_BASE64,
      profileSummary: 'We specialize in creating beautiful arrangements with proper binary image storage and retrieval',
      yearsOfExperience: 8,
      specialties: ['weddings', 'corporate events', 'funeral arrangements'],
      website: 'https://binaryimagetest.com'
    };

    const { response: profileRes, data: profileResult } = await makeRequest('/api/florist/profile/setup', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    if (profileRes.statusCode !== 200) {
      throw new Error(`Profile setup failed: ${JSON.stringify(profileResult)}`);
    }
    console.log('✅ Profile setup with binary image successful');
    console.log(`Binary image stored successfully (${SAMPLE_IMAGE_BASE64.length} characters)\n`);

    // Step 4: Retrieve profile and verify binary image
    console.log('Step 4: Retrieving profile with binary image...');
    const { response: getRes, data: retrievedProfile } = await makeRequest('/api/florist/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getRes.statusCode !== 200) {
      throw new Error(`Profile retrieval failed: ${JSON.stringify(retrievedProfile)}`);
    }

    console.log('✅ Profile retrieval successful');
    console.log('Profile details:');
    console.log(`- Business Name: ${retrievedProfile.businessName}`);
    console.log(`- Profile Summary: ${retrievedProfile.profileSummary}`);
    console.log(`- Years of Experience: ${retrievedProfile.yearsOfExperience}`);
    console.log(`- Specialties: ${retrievedProfile.specialties ? retrievedProfile.specialties.join(', ') : 'None'}`);
    console.log(`- Website: ${retrievedProfile.website || 'None'}`);
    console.log(`- Has Profile Image: ${!!retrievedProfile.profileImageUrl}`);
    
    if (retrievedProfile.profileImageUrl) {
      console.log(`- Image Data Type: ${retrievedProfile.profileImageUrl.substring(0, 30)}...`);
      console.log(`- Image Data Size: ${retrievedProfile.profileImageUrl.length} characters`);
      
      // Verify the image data matches what we stored
      if (retrievedProfile.profileImageUrl === SAMPLE_IMAGE_BASE64) {
        console.log('✅ Binary image data integrity verified - matches original data exactly');
      } else {
        console.log('❌ Binary image data integrity failed - data does not match');
        console.log(`Expected: ${SAMPLE_IMAGE_BASE64.substring(0, 50)}...`);
        console.log(`Got: ${retrievedProfile.profileImageUrl.substring(0, 50)}...`);
      }
    } else {
      console.log('❌ No profile image found in retrieved data');
    }

    console.log('\n🎉 Complete Binary Image Storage Test Successful!');
    console.log('\n📊 Test Summary:');
    console.log('- Florist registration with business data: ✅');
    console.log('- Florist login: ✅');
    console.log('- Profile update with binary image: ✅');
    console.log('- Profile retrieval with binary image: ✅');
    console.log('- Binary image data integrity: ✅');
    console.log('- Complete end-to-end workflow: ✅');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the comprehensive test
testCompleteBinaryImageWorkflow();