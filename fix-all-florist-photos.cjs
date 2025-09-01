const { Pool } = require('pg');

const RAILWAY_DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

// Beautiful flower arrangement photos matching the user's example
const FLOWER_IMAGES = [
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&q=80', // Beautiful mixed bouquet
  'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=400&fit=crop&q=80', // Pink roses arrangement
  'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400&h=400&fit=crop&q=80', // White and purple bouquet
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=80', // Elegant white roses
  'https://images.unsplash.com/photo-1606890737451-6ac2b99f7c3c?w=400&h=400&fit=crop&q=80'  // Colorful spring arrangement
];

async function fixAllFloristPhotos() {
  console.log('🌺 Fixing ALL florist photos with beautiful flower arrangements...');
  
  const pool = new Pool({ 
    connectionString: RAILWAY_DATABASE_URL, 
    ssl: false,
    max: 10,
    idleTimeoutMillis: 30000
  });
  
  try {
    // First, get all florists to see the real data
    const allFlorists = await pool.query('SELECT id, business_name, profile_image_url FROM florist_auth ORDER BY id');
    console.log(`📊 Found ${allFlorists.rows.length} florists in the database`);
    
    // Show first few for debugging
    console.log('First 5 florists:');
    allFlorists.rows.slice(0, 5).forEach(florist => {
      console.log(`  ID: ${florist.id}, Name: ${florist.business_name}, Image: ${florist.profile_image_url ? florist.profile_image_url.substring(0, 50) + '...' : 'NULL'}`);
    });
    
    // Update ALL florists with flower images
    let updatedCount = 0;
    for (let i = 0; i < allFlorists.rows.length; i++) {
      const florist = allFlorists.rows[i];
      const flowerImageUrl = FLOWER_IMAGES[i % FLOWER_IMAGES.length];
      
      const updateResult = await pool.query(
        'UPDATE florist_auth SET profile_image_url = $1, updated_at = NOW() WHERE id = $2',
        [flowerImageUrl, florist.id]
      );
      
      updatedCount++;
      console.log(`✅ Updated "${florist.business_name}" (ID: ${florist.id}) with flower image ${(i % FLOWER_IMAGES.length) + 1}`);
    }
    
    console.log(`🌸 Successfully updated ${updatedCount} florists with beautiful flower arrangement photos!`);
    
    // Verify the updates
    const verification = await pool.query('SELECT id, business_name, LEFT(profile_image_url, 60) as image_url FROM florist_auth ORDER BY id LIMIT 10');
    console.log('\n✅ Verification - Updated florists:');
    verification.rows.forEach(florist => {
      console.log(`  ${florist.business_name}: ${florist.image_url}...`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
    console.log('🔐 Database connection closed');
  }
}

fixAllFloristPhotos();