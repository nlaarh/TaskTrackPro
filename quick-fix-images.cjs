const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ 
  connectionString: 'postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb', 
  ssl: false 
});

function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64String = imageBuffer.toString('base64');
  return `data:image/png;base64,${base64String}`;
}

async function quickFix() {
  try {
    console.log('🚀 QUICK FIX: Converting real flower image...');
    
    // Convert one good flower image
    const goodImage = imageToBase64('attached_assets/generated_images/Professional_flower_arrangement_vase_1e9a6aa0.png');
    console.log(`✅ Converted image: ${goodImage.length} chars`);
    
    // Update the florists that are showing on homepage (IDs 143, 142, 141, etc.)
    const criticalIds = [143, 142, 141, 140, 139, 138, 137, 136, 135, 134, 133, 132, 131, 130];
    
    for (const id of criticalIds) {
      await pool.query(
        'UPDATE florist_auth SET profile_image_data = $1 WHERE id = $2',
        [goodImage, id]
      );
      console.log(`✅ Updated florist ${id}`);
    }
    
    console.log(`🎉 SUCCESS: Updated ${criticalIds.length} critical florists!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

quickFix();