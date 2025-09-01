const { Pool } = require('pg');
const fs = require('fs');

const RAILWAY_DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64String = imageBuffer.toString('base64');
    return `data:image/png;base64,${base64String}`;
  } catch (error) {
    console.error('Error converting image:', error);
    return null;
  }
}

async function distributeVariedImages() {
  console.log('🌸 Distributing varied flower arrangements to all florists...');
  
  const pool = new Pool({ 
    connectionString: RAILWAY_DATABASE_URL, 
    ssl: false 
  });
  
  try {
    // List of all different flower arrangement images
    const flowerImages = [
      'attached_assets/generated_images/Professional_flower_arrangement_vase_1e9a6aa0.png',
      'attached_assets/generated_images/Wedding_bouquet_arrangement_a3e2d32f.png', 
      'attached_assets/generated_images/Spring_flower_arrangement_eda010cf.png',
      'attached_assets/generated_images/Luxury_rose_arrangement_1b8bbe13.png',
      'attached_assets/generated_images/Mixed_flower_bouquet_6f57f23d.png',
      'attached_assets/generated_images/White_rose_bridal_bouquet_33c4ac23.png',
      'attached_assets/generated_images/Sunflower_spring_arrangement_9640eedc.png',
      'attached_assets/generated_images/Red_rose_luxury_bouquet_f55e2d2f.png',
      'attached_assets/generated_images/Tropical_modern_arrangement_0348ad34.png',
      'attached_assets/generated_images/Pastel_garden_bouquet_f2f02087.png'
    ];
    
    // Convert all images to base64
    const base64Images = [];
    for (const imagePath of flowerImages) {
      console.log(`Converting ${imagePath}...`);
      const base64 = imageToBase64(imagePath);
      if (base64) {
        base64Images.push(base64);
        console.log(`✅ Converted ${imagePath.split('/').pop()} (${Math.round(base64.length/1000)}KB)`);
      }
    }
    
    console.log(`📸 Successfully converted ${base64Images.length} varied flower arrangements`);
    
    // Get all florists
    const floristsQuery = await pool.query(
      'SELECT id, business_name FROM florist_auth ORDER BY id'
    );
    
    console.log(`🌺 Distributing to ${floristsQuery.rows.length} florists...`);
    
    // Distribute different images to each florist
    for (let i = 0; i < floristsQuery.rows.length; i++) {
      const florist = floristsQuery.rows[i];
      const imageIndex = i % base64Images.length;
      const imageData = base64Images[imageIndex];
      
      await pool.query(
        'UPDATE florist_auth SET profile_image_data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [imageData, florist.id]
      );
      
      const imageType = flowerImages[imageIndex].split('/').pop().replace('.png', '');
      console.log(`✅ ${florist.business_name} (ID: ${florist.id}) → ${imageType}`);
    }
    
    // Verify distribution
    const verifyQuery = await pool.query(`
      SELECT 
        COUNT(*) as total_florists,
        COUNT(DISTINCT profile_image_data) as unique_images,
        AVG(LENGTH(profile_image_data)) as avg_size
      FROM florist_auth 
      WHERE profile_image_data IS NOT NULL
    `);
    
    const stats = verifyQuery.rows[0];
    console.log(`\n🎉 SUCCESS! Distribution complete:`);
    console.log(`   • ${stats.total_florists} florists updated`);
    console.log(`   • ${stats.unique_images} unique flower arrangements`);
    console.log(`   • Average image size: ${Math.round(stats.avg_size/1000)}KB`);
    console.log(`\nAll florists now have beautiful, varied flower arrangement photos!`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error distributing images:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

distributeVariedImages();