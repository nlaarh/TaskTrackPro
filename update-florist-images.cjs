const { Client } = require('pg');
const fs = require('fs');

async function updateFloristImages() {
  const client = new Client({
    connectionString: 'postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Read the beautiful flower images you provided
    const flowerImage1 = fs.readFileSync('attached_assets/FB336NV-X_LOL_preset_ftd-mx-hero-sv-new_1756562464474.webp');
    const flowerImage2 = fs.readFileSync('attached_assets/Flowers_1756562464475.webp');

    // Convert to base64
    const flowerImage1Base64 = 'data:image/webp;base64,' + flowerImage1.toString('base64');
    const flowerImage2Base64 = 'data:image/webp;base64,' + flowerImage2.toString('base64');

    console.log('Flower Image 1 size:', flowerImage1Base64.length);
    console.log('Flower Image 2 size:', flowerImage2Base64.length);

    // Update all florists with proper flower arrangement images
    const florists = await client.query('SELECT id, business_name FROM florists ORDER BY id');
    console.log(`Found ${florists.rows.length} florists to update`);

    for (let i = 0; i < florists.rows.length; i++) {
      const florist = florists.rows[i];
      // Alternate between the two beautiful flower images
      const imageToUse = i % 2 === 0 ? flowerImage1Base64 : flowerImage2Base64;
      
      await client.query(
        'UPDATE florists SET profile_image_url = $1 WHERE id = $2',
        [imageToUse, florist.id]
      );
      
      console.log(`✓ Updated ${florist.business_name} with flower arrangement image ${(i % 2) + 1}`);
    }

    console.log('\n✅ All florist images updated with proper flower arrangements!');

  } catch (error) {
    console.error('Error updating florist images:', error);
  } finally {
    await client.end();
  }
}

updateFloristImages().catch(console.error);