// Simple test to verify login and admin data
import fetch from 'node-fetch';

async function testLogin() {
  console.log('Testing login API...');
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alaaroubi@gmail.com',
        password: 'Password123!'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful');
      console.log('User:', data.user);
      console.log('Token length:', data.token?.length || 0);
      
      // Test admin endpoints
      console.log('\nTesting admin users endpoint...');
      const usersResponse = await fetch('http://localhost:5000/api/admin-clean/users', {
        headers: { 
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (usersResponse.ok) {
        const users = await usersResponse.json();
        console.log('✅ Users endpoint working, count:', users.length);
      } else {
        console.log('❌ Users endpoint failed:', usersResponse.status);
      }
      
      console.log('\nTesting admin florists endpoint...');
      const floristsResponse = await fetch('http://localhost:5000/api/admin-clean/florists', {
        headers: { 
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (floristsResponse.ok) {
        const florists = await floristsResponse.json();
        console.log('✅ Florists endpoint working, count:', florists.length);
      } else {
        console.log('❌ Florists endpoint failed:', floristsResponse.status);
      }
      
    } else {
      console.log('❌ Login failed:', response.status);
      const text = await response.text();
      console.log('Response:', text.substring(0, 200));
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testLogin();