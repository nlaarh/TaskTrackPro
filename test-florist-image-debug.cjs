const { Pool } = require('pg');

const RAILWAY_DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

async function debugFloristImages() {
  console.log('🔍 Checking florist image data...');
  
  const pool = new Pool({ 
    connectionString: RAILWAY_DATABASE_URL, 
    ssl: false 
  });
  
  try {
    // Check for florists with images
    const imagesQuery = await pool.query(
      'SELECT id, business_name, profile_image_url FROM florist_auth WHERE profile_image_url IS NOT NULL AND profile_image_url != \'\' ORDER BY updated_at DESC LIMIT 5'
    );
    
    console.log(`📸 Found ${imagesQuery.rows.length} florists with profile images:`);
    imagesQuery.rows.forEach(row => {
      console.log(`  ID ${row.id}: ${row.business_name}`);
      console.log(`    Image: ${row.profile_image_url.substring(0, 80)}...`);
    });
    
    // Check recent updates (should include the one from logs showing ID 141)
    const recentQuery = await pool.query(
      'SELECT id, business_name, profile_image_url, updated_at FROM florist_auth WHERE id = 141'
    );
    
    if (recentQuery.rows.length > 0) {
      const florist = recentQuery.rows[0];
      console.log(`✅ Florist ID 141 (should have recent image):`);
      console.log(`  Name: ${florist.business_name}`);
      console.log(`  Image: ${florist.profile_image_url || 'NULL/EMPTY'}`);
      console.log(`  Updated: ${florist.updated_at}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

debugFloristImages();