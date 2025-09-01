const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Railway database connection
const pool = new Pool({
  connectionString: "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb"
});

// Load new generated images as base64
const imageFiles = [
  'attached_assets/generated_images/Elegant_white_roses_arrangement_cc4bea04.png',
  'attached_assets/generated_images/Rustic_sunflower_arrangement_5377dc64.png', 
  'attached_assets/generated_images/Luxury_red_roses_display_b131905c.png',
  'attached_assets/generated_images/Tropical_orchid_arrangement_c9bd395a.png',
  'attached_assets/generated_images/Pastel_peony_arrangement_ac153ef8.png'
];

const imageDescriptions = [
  'Elegant white roses with baby\'s breath in crystal vase',
  'Rustic sunflower and wildflower arrangement in wooden crate',
  'Luxury red and burgundy roses in black vase',
  'Tropical orchid and bird of paradise arrangement',
  'Delicate pastel peony and eucalyptus in mason jar'
];

async function loadImageAsBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64String = imageBuffer.toString('base64');
    const mimeType = 'image/png';
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error(`Error loading image ${imagePath}:`, error.message);
    return null;
  }
}

async function distributeNewImages() {
  try {
    console.log('🌸 Starting distribution of NEW varied floral arrangements...');
    
    // Get all florists
    const floristsResult = await pool.query('SELECT id, business_name FROM florist_auth ORDER BY id');
    const florists = floristsResult.rows;
    
    console.log(`Found ${florists.length} florists to update`);

    // Load all new images as base64
    const imageData = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const base64Data = await loadImageAsBase64(imageFiles[i]);
      if (base64Data) {
        imageData.push({
          data: base64Data,
          description: imageDescriptions[i]
        });
        console.log(`✓ Loaded ${imageDescriptions[i]}`);
      }
    }

    if (imageData.length === 0) {
      console.error('❌ No images could be loaded!');
      return;
    }

    console.log(`\n📸 Distributing ${imageData.length} unique arrangements to ${florists.length} florists...`);
    
    // Distribute images in a pattern to ensure variety
    let updateCount = 0;
    
    for (let i = 0; i < florists.length; i++) {
      const florist = florists[i];
      const imageIndex = i % imageData.length;
      const selectedImage = imageData[imageIndex];
      
      try {
        const updateResult = await pool.query(
          'UPDATE florist_auth SET profile_image_data = $1 WHERE id = $2',
          [selectedImage.data, florist.id]
        );
        
        if (updateResult.rowCount > 0) {
          updateCount++;
          console.log(`✓ Updated ${florist.business_name} with ${selectedImage.description}`);
        } else {
          console.log(`⚠️  No update for ${florist.business_name} (ID: ${florist.id})`);
        }
      } catch (error) {
        console.error(`❌ Failed to update ${florist.business_name}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully updated ${updateCount} florists with NEW varied arrangements!`);
    
    // Show distribution summary
    console.log('\n📊 Distribution Summary:');
    for (let i = 0; i < imageData.length; i++) {
      const count = Math.ceil(florists.length / imageData.length);
      console.log(`${imageDescriptions[i]}: ~${count} florists`);
    }
    
  } catch (error) {
    console.error('❌ Error in distributeNewImages:', error);
  } finally {
    await pool.end();
  }
}

distributeNewImages();