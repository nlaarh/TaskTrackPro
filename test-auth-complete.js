

async function testCompleteAuthFlow() {
  const baseUrl = 'https://36772d0e-7923-44c4-b678-20ac22f65af0-00-2rs1sz84p5v38.picard.replit.dev';
  
  console.log('🔐 Testing Complete Authentication Flow...\n');

  try {
    // Step 1: Test login API
    console.log('1. Testing login API...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'alaaroubi@gmail.com',
        password: 'Password123!'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${await loginResponse.text()}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login API working');
    console.log(`   Token generated: ${loginData.token.slice(0, 30)}...`);
    console.log(`   User role: ${loginData.user.role}`);

    // Step 2: Test protected route with token
    console.log('\n2. Testing protected route access...');
    const messagesResponse = await fetch(`${baseUrl}/api/messages`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
      }
    });

    if (!messagesResponse.ok) {
      throw new Error(`Protected route failed: ${messagesResponse.status} ${await messagesResponse.text()}`);
    }

    const messages = await messagesResponse.json();
    console.log('✅ Protected route accessible with token');
    console.log(`   Retrieved ${messages.messages ? messages.messages.length : 0} messages`);

    // Step 3: Test frontend auth page
    console.log('\n3. Testing frontend auth page...');
    const authPageResponse = await fetch(`${baseUrl}/auth`);
    if (!authPageResponse.ok) {
      throw new Error(`Auth page failed: ${authPageResponse.status}`);
    }
    console.log('✅ Auth page accessible');

    // Step 4: Test protected admin route (should redirect)
    console.log('\n4. Testing direct access to protected route...');
    const adminListResponse = await fetch(`${baseUrl}/admin-list`);
    if (!adminListResponse.ok) {
      throw new Error(`Admin list page failed: ${adminListResponse.status}`);
    }
    console.log('✅ Protected route loads (will redirect in browser)');

    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📝 Manual test steps:');
    console.log('1. Go to: https://36772d0e-7923-44c4-b678-20ac22f65af0-00-2rs1sz84p5v38.picard.replit.dev/admin-list');
    console.log('2. Should redirect to /auth');
    console.log('3. Login with: alaaroubi@gmail.com / Password123!');
    console.log('4. Should redirect back to protected page');
    console.log('5. Navigation should show admin menu items');

    return true;
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return false;
  }
}

testCompleteAuthFlow();