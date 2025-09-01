const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: 'postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb', 
  ssl: false 
});

async function fixRemainingImages() {
  try {
    console.log('🔧 Fixing remaining florists with old images...');
    
    // Get reference images from successfully updated florists
    const referenceQuery = await pool.query(
      'SELECT profile_image_data FROM florist_auth WHERE LENGTH(profile_image_data) > 1000000 LIMIT 5'
    );
    
    const referenceImages = referenceQuery.rows.map(row => row.profile_image_data);
    console.log(`Found ${referenceImages.length} reference images`);
    
    // Find florists with old small images
    const oldImagesQuery = await pool.query(
      'SELECT id, business_name FROM florist_auth WHERE LENGTH(profile_image_data) < 100000 ORDER BY id'
    );
    
    console.log(`Updating ${oldImagesQuery.rows.length} florists with old images`);
    
    for (let i = 0; i < oldImagesQuery.rows.length; i++) {
      const florist = oldImagesQuery.rows[i];
      const imageData = referenceImages[i % referenceImages.length];
      
      await pool.query(
        'UPDATE florist_auth SET profile_image_data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [imageData, florist.id]
      );
      
      console.log(`✅ Updated ${florist.business_name} (ID: ${florist.id})`);
    }
    
    console.log('✅ All florists now have realistic flower images!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

fixRemainingImages();