const { Pool } = require('pg');
const fs = require('fs');

const RAILWAY_DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

// Generate simple test images as base64
function createTestImageBase64(color, name) {
  // Create a simple SVG image and convert to base64
  const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="${color}"/>
    <circle cx="100" cy="70" r="30" fill="white" opacity="0.8"/>
    <rect x="40" y="120" width="120" height="60" rx="30" fill="white" opacity="0.8"/>
    <text x="100" y="150" font-family="Arial" font-size="16" text-anchor="middle" fill="${color}">${name}</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function addTestImages() {
  console.log('🖼️ Creating test images and storing in database...');
  
  const pool = new Pool({ 
    connectionString: RAILWAY_DATABASE_URL, 
    ssl: false 
  });
  
  try {
    // Get first 5 florists to add images to
    const floristsQuery = await pool.query(
      'SELECT id, business_name FROM florist_auth ORDER BY id LIMIT 5'
    );
    
    const testColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];
    
    console.log(`📸 Adding test images to ${floristsQuery.rows.length} florists...`);
    
    for (let i = 0; i < floristsQuery.rows.length; i++) {
      const florist = floristsQuery.rows[i];
      const color = testColors[i % testColors.length];
      const shortName = florist.business_name.split(' ')[0];
      
      const imageData = createTestImageBase64(color, shortName);
      
      await pool.query(
        'UPDATE florist_auth SET profile_image_data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [imageData, florist.id]
      );
      
      console.log(`✅ Added ${color} image to ${florist.business_name} (ID: ${florist.id})`);
    }
    
    // Verify the images were stored
    const verifyQuery = await pool.query(
      'SELECT id, business_name, LENGTH(profile_image_data) as image_size FROM florist_auth WHERE profile_image_data IS NOT NULL ORDER BY id LIMIT 5'
    );
    
    console.log('\n📊 Verification - Florists with stored image data:');
    verifyQuery.rows.forEach(row => {
      console.log(`  ID ${row.id}: ${row.business_name} (${row.image_size} bytes)`);
    });
    
    console.log('\n🎉 Test images successfully created and stored in database!');
    return true;
    
  } catch (error) {
    console.error('❌ Error creating test images:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

addTestImages();