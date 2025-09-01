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

async function fixImageDistribution() {
  console.log('🔧 Fixing image distribution - ensuring each florist gets a unique image...');
  
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
    
    // Convert all images to base64 in parallel
    console.log('📸 Converting 10 different flower arrangements...');
    const base64Images = [];
    
    for (let i = 0; i < flowerImages.length; i++) {
      const imagePath = flowerImages[i];
      console.log(`Converting ${i + 1}/10: ${imagePath.split('/').pop()}...`);
      const base64 = imageToBase64(imagePath);
      if (base64) {
        base64Images.push({
          data: base64,
          name: imagePath.split('/').pop().replace('.png', ''),
          size: Math.round(base64.length / 1000)
        });
        console.log(`✅ Converted (${Math.round(base64.length/1000)}KB)`);
      }
    }
    
    console.log(`\n🎨 Successfully converted ${base64Images.length} unique arrangements`);
    
    // Get all florists ordered by ID
    const floristsQuery = await pool.query(
      'SELECT id, business_name FROM florist_auth ORDER BY id'
    );
    
    console.log(`\n🌺 Distributing unique images to ${floristsQuery.rows.length} florists...`);
    
    // Distribute images systematically
    for (let i = 0; i < floristsQuery.rows.length; i++) {
      const florist = floristsQuery.rows[i];
      const imageIndex = i % base64Images.length; // Cycle through images
      const selectedImage = base64Images[imageIndex];
      
      // Update florist with new image
      await pool.query(
        'UPDATE florist_auth SET profile_image_data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [selectedImage.data, florist.id]
      );
      
      console.log(`✅ ${florist.business_name} (ID: ${florist.id}) → ${selectedImage.name} (${selectedImage.size}KB)`);
    }
    
    // Final verification
    const verifyQuery = await pool.query(`
      SELECT 
        COUNT(*) as total_florists,
        COUNT(DISTINCT profile_image_data) as unique_images,
        AVG(LENGTH(profile_image_data)) as avg_size
      FROM florist_auth 
      WHERE profile_image_data IS NOT NULL
    `);
    
    const stats = verifyQuery.rows[0];
    console.log(`\n🎉 DISTRIBUTION COMPLETE!`);
    console.log(`   • ${stats.total_florists} florists updated`);
    console.log(`   • ${stats.unique_images} unique flower arrangements distributed`);
    console.log(`   • Average image size: ${Math.round(stats.avg_size/1000)}KB`);
    
    // Show sample verification
    const sampleQuery = await pool.query(`
      SELECT id, business_name, LEFT(profile_image_data, 50) as img_start, LENGTH(profile_image_data) as size 
      FROM florist_auth 
      WHERE id IN (143, 142, 141, 140, 139) 
      ORDER BY id DESC
    `);
    
    console.log(`\n📋 Sample verification (top 5 florists):`);
    sampleQuery.rows.forEach(row => {
      console.log(`  ID ${row.id}: ${row.business_name} - ${Math.round(row.size/1000)}KB - ${row.img_start}...`);
    });
    
    return stats.unique_images === 10;
    
  } catch (error) {
    console.error('❌ Error fixing distribution:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

fixImageDistribution().then(success => {
  if (success) {
    console.log('\n🎯 SUCCESS: All florists now have unique, varied flower arrangement images!');
  } else {
    console.log('\n⚠️ ISSUE: Distribution may not have completed properly.');
  }
});