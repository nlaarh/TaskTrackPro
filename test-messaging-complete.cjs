// Using native fetch in Node.js 18+

async function testMessagingSystem() {
  console.log('🔐 Testing Admin Login...');
  
  // Step 1: Admin Login
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alaaroubi@gmail.com',
      password: 'Password123!'
    })
  });
  
  const loginData = await loginResponse.json();
  console.log('✅ Admin login successful');
  console.log('👤 User:', loginData.user);
  
  const token = loginData.token;
  console.log('🔑 Token received:', token.substring(0, 50) + '...');
  
  // Step 2: Test Messages API
  console.log('\n📨 Testing Messages API...');
  const messagesResponse = await fetch('http://localhost:5000/api/messages', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (messagesResponse.ok) {
    const messages = await messagesResponse.json();
    console.log('✅ Messages retrieved:', messages.length, 'messages');
    messages.forEach((msg, i) => {
      console.log(`  ${i+1}. ${msg.subject} (${msg.is_read ? 'Read' : 'Unread'})`);
    });
  } else {
    console.log('❌ Messages API failed:', messagesResponse.status, await messagesResponse.text());
  }
  
  // Step 3: Test Unread Count
  console.log('\n📊 Testing Unread Count API...');
  const unreadResponse = await fetch('http://localhost:5000/api/messages/unread-count', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (unreadResponse.ok) {
    const unreadData = await unreadResponse.json();
    console.log('✅ Unread count:', unreadData.unreadCount);
  } else {
    console.log('❌ Unread count API failed:', unreadResponse.status, await unreadResponse.text());
  }
  
  // Step 4: Test Florists API
  console.log('\n👥 Testing Florists API...');
  const floristsResponse = await fetch('http://localhost:5000/api/messages/florists', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (floristsResponse.ok) {
    const florists = await floristsResponse.json();
    console.log('✅ Florists retrieved:', florists.length, 'florists');
    console.log('  First 3 florists:', florists.slice(0, 3).map(f => f.businessName));
  } else {
    console.log('❌ Florists API failed:', floristsResponse.status, await floristsResponse.text());
  }
  
  // Step 5: Test Send Message API
  console.log('\n📤 Testing Send Message API...');
  const sendResponse = await fetch('http://localhost:5000/api/messages', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subject: 'Test Message from API',
      messageBody: 'This is a test message sent via API to verify the messaging system is working correctly.',
      recipientId: '6',
      recipientType: 'florist'
    })
  });
  
  if (sendResponse.ok) {
    const sentMessage = await sendResponse.json();
    console.log('✅ Message sent successfully:', sentMessage.subject);
  } else {
    console.log('❌ Send message API failed:', sendResponse.status, await sendResponse.text());
  }
  
  console.log('\n🎉 MESSAGING SYSTEM TEST COMPLETE!');
  console.log('💾 Token for browser localStorage:', token);
  console.log('📋 User data for browser localStorage:', JSON.stringify(loginData.user));
}

testMessagingSystem().catch(console.error);