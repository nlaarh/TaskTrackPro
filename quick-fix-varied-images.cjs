const { Pool } = require('pg');
const fs = require('fs');

// Railway database connection
const pool = new Pool({
  connectionString: "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb"
});

// Load new generated images as base64 - using shorter method
const imageFiles = [
  'attached_assets/generated_images/Elegant_white_roses_arrangement_cc4bea04.png',
  'attached_assets/generated_images/Rustic_sunflower_arrangement_5377dc64.png', 
  'attached_assets/generated_images/Luxury_red_roses_display_b131905c.png',
  'attached_assets/generated_images/Tropical_orchid_arrangement_c9bd395a.png',
  'attached_assets/generated_images/Pastel_peony_arrangement_ac153ef8.png'
];

function loadImageAsBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64String = imageBuffer.toString('base64');
    return `data:image/png;base64,${base64String}`;
  } catch (error) {
    console.error(`Error loading ${imagePath}:`, error.message);
    return null;
  }
}

async function quickFixImages() {
  try {
    console.log('🚀 Quick fix: updating all florist images with varied arrangements...');
    
    // Load all images first
    const images = imageFiles.map(file => loadImageAsBase64(file)).filter(img => img !== null);
    
    if (images.length === 0) {
      console.error('❌ No images loaded!');
      return;
    }
    
    console.log(`✓ Loaded ${images.length} unique images`);
    
    // Get all florists and update in batches
    const floristsResult = await pool.query('SELECT id FROM florist_auth ORDER BY id');
    const florists = floristsResult.rows;
    
    console.log(`📝 Updating ${florists.length} florists...`);
    
    // Update each florist with a different image (cycling through the 5 images)
    for (let i = 0; i < florists.length; i++) {
      const florist = florists[i];
      const imageIndex = i % images.length;
      const selectedImage = images[imageIndex];
      
      await pool.query(
        'UPDATE florist_auth SET profile_image_data = $1 WHERE id = $2',
        [selectedImage, florist.id]
      );
      
      if (i % 10 === 0) {
        console.log(`... updated ${i + 1}/${florists.length} florists`);
      }
    }
    
    console.log(`✅ Successfully updated all ${florists.length} florists with varied images!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

quickFixImages();