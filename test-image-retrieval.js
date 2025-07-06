/**
 * Test script to verify image retrieval in profile setup
 */

async function testImageRetrieval() {
  console.log('=== Testing Image Retrieval in Profile Setup ===\n');

  // Step 1: Login
  const loginResponse = await fetch('http://localhost:5000/api/auth/florist/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alaaroubi@gmail.com',
      password: 'Password123!'
    })
  });

  const loginData = await loginResponse.json();
  console.log('1. Login successful:', !!loginData.token);
  
  const token = loginData.token;

  // Step 2: Get profile data (simulating what frontend does)
  const profileResponse = await fetch('http://localhost:5000/api/florist/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!profileResponse.ok) {
    console.log('❌ Profile fetch failed:', profileResponse.status);
    return;
  }

  const profileData = await profileResponse.json();
  console.log('2. Profile retrieved successfully');
  
  // Step 3: Check image data structure
  console.log('3. Profile structure:');
  console.log('   - Has businessProfile:', !!profileData.businessProfile);
  console.log('   - Business name:', profileData.businessProfile?.businessName);
  
  if (profileData.businessProfile?.profileImageUrl) {
    const imageUrl = profileData.businessProfile.profileImageUrl;
    console.log('4. ✅ Image found:');
    console.log('   - Image format:', imageUrl.substring(0, 30) + '...');
    console.log('   - Image size:', imageUrl.length, 'characters');
    console.log('   - Is valid base64:', imageUrl.startsWith('data:image/'));
    
    // Test if the image would render (basic validation)
    const isValidImage = imageUrl.match(/^data:image\/(png|jpg|jpeg|gif|webp);base64,/);
    console.log('   - Valid image format:', !!isValidImage);
    
    return {
      success: true,
      imageUrl,
      imageSize: imageUrl.length,
      businessName: profileData.businessProfile.businessName
    };
  } else {
    console.log('4. ❌ No image found in profile');
    console.log('   Available fields:', Object.keys(profileData.businessProfile || {}));
    return { success: false };
  }
}

// Run the test
testImageRetrieval()
  .then(result => {
    console.log('\n=== Test Result ===');
    if (result.success) {
      console.log('✅ Image retrieval working correctly');
      console.log(`Business: ${result.businessName}`);
      console.log(`Image size: ${result.imageSize} characters`);
    } else {
      console.log('❌ Image retrieval failed');
    }
  })
  .catch(error => {
    console.error('Test failed:', error.message);
  });