const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting complete login and tab test...');
  
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  try {
    // Navigate to auth page
    console.log('📝 Navigating to auth page...');
    await page.goto('http://localhost:5000/auth');
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Fill login form
    console.log('🔐 Filling login form...');
    await page.type('input[type="email"]', 'alaaroubi@gmail.com');
    await page.type('input[type="password"]', 'Password123!');
    
    // Submit form
    console.log('📤 Submitting login...');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    console.log('⏳ Waiting for dashboard...');
    await page.waitForNavigation({ timeout: 15000 });
    
    const currentUrl = page.url();
    console.log('🌐 Current URL:', currentUrl);
    
    if (currentUrl.includes('/admin-dashboard')) {
      console.log('✅ Successfully redirected to admin dashboard!');
      
      // Test tab clicks
      console.log('🔄 Testing tab clicks...');
      
      // Click Customers tab
      await page.click('div:has-text("Customers")');
      await page.waitForTimeout(1000);
      console.log('📊 Clicked Customers tab');
      
      // Click Florists tab  
      await page.click('div:has-text("Florists")');
      await page.waitForTimeout(1000);
      console.log('🏪 Clicked Florists tab');
      
      // Click Users tab
      await page.click('div:has-text("All Users")');
      await page.waitForTimeout(1000);
      console.log('👥 Clicked Users tab');
      
      console.log('🎉 All tests completed successfully!');
    } else {
      console.log('❌ Login failed - not redirected to dashboard');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();