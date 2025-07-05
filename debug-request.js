/**
 * Debug script to test the profile setup request
 */

async function debugRequest() {
  console.log('🐛 DEBUG REQUEST TEST');
  
  // First, login to get a token
  console.log('Step 1: Login...');
  const loginResponse = await fetch('http://localhost:5000/api/auth/florist/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: "alaaroubi@gmail.com",
      password: "Password123!"
    })
  });
  
  const loginData = await loginResponse.json();
  console.log('Login response status:', loginResponse.status);
  console.log('Login successful:', !!loginData.token);
  
  if (!loginData.token) {
    console.error('Login failed');
    return;
  }
  
  // Now test profile setup with minimal data
  console.log('\nStep 2: Profile setup...');
  const profileData = {
    businessName: "Debug Test Florist",
    address: "123 Test St",
    city: "Test City",
    state: "CA",
    zipCode: "12345",
    phone: "(555) 123-4567"
  };
  
  console.log('Profile data to send:', JSON.stringify(profileData, null, 2));
  
  const profileResponse = await fetch('http://localhost:5000/api/florist/profile/setup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${loginData.token}`
    },
    body: JSON.stringify(profileData)
  });
  
  console.log('Profile response status:', profileResponse.status);
  
  const responseText = await profileResponse.text();
  console.log('Profile response text:', responseText);
  
  try {
    const profileResult = JSON.parse(responseText);
    console.log('Profile response JSON:', profileResult);
  } catch (e) {
    console.error('Failed to parse response as JSON');
  }
}

debugRequest().catch(console.error);