const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const RAILWAY_DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

// Convert real flower images to base64
function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64String = imageBuffer.toString('base64');
    const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error('Error converting image:', error);
    return null;
  }
}

async function updateAllFloristsWithRealImages() {
  console.log('🌸 Updating all florists with real flower arrangement images...');
  
  const pool = new Pool({ 
    connectionString: RAILWAY_DATABASE_URL, 
    ssl: false 
  });
  
  try {
    // List of generated real flower images
    const flowerImages = [
      'attached_assets/generated_images/Professional_flower_arrangement_vase_1e9a6aa0.png',
      'attached_assets/generated_images/Wedding_bouquet_arrangement_a3e2d32f.png', 
      'attached_assets/generated_images/Spring_flower_arrangement_eda010cf.png',
      'attached_assets/generated_images/Luxury_rose_arrangement_1b8bbe13.png',
      'attached_assets/generated_images/Mixed_flower_bouquet_6f57f23d.png'
    ];
    
    // Convert images to base64
    const base64Images = [];
    for (const imagePath of flowerImages) {
      console.log(`Converting ${imagePath}...`);
      const base64 = imageToBase64(imagePath);
      if (base64) {
        base64Images.push(base64);
        console.log(`✅ Converted ${path.basename(imagePath)} (${base64.length} chars)`);
      } else {
        console.log(`❌ Failed to convert ${imagePath}`);
      }
    }
    
    if (base64Images.length === 0) {
      console.log('❌ No images were successfully converted');
      return false;
    }
    
    console.log(`📸 Successfully converted ${base64Images.length} real flower images`);
    
    // Get all florists
    const floristsQuery = await pool.query(
      'SELECT id, business_name FROM florist_auth ORDER BY id'
    );
    
    console.log(`🌺 Updating ${floristsQuery.rows.length} florists with real flower images...`);
    
    for (let i = 0; i < floristsQuery.rows.length; i++) {
      const florist = floristsQuery.rows[i];
      const imageData = base64Images[i % base64Images.length]; // Cycle through images
      
      await pool.query(
        'UPDATE florist_auth SET profile_image_data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [imageData, florist.id]
      );
      
      const imageIndex = (i % base64Images.length) + 1;
      console.log(`✅ Updated ${florist.business_name} (ID: ${florist.id}) with real flower image ${imageIndex}`);
      
      // Add small delay to avoid overwhelming the system
      if (i % 10 === 9) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Verify the images were stored
    const verifyQuery = await pool.query(
      'SELECT COUNT(*) as count FROM florist_auth WHERE profile_image_data IS NOT NULL'
    );
    
    console.log(`\n🎉 Successfully updated ${verifyQuery.rows[0].count} florists with real flower arrangement images!`);
    console.log('All florists now have professional, realistic flower arrangement photos.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error updating florist images:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

updateAllFloristsWithRealImages();