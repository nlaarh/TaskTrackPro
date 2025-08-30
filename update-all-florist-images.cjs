const { Client } = require('pg');
const fs = require('fs');

async function updateAllFloristImages() {
  const client = new Client({
    connectionString: 'postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Get the correct flower arrangement image from existing florist (Rochester Petals & Co)
    const existingFlorist = await client.query(`
      SELECT profile_image_url 
      FROM florists 
      WHERE profile_image_url IS NOT NULL AND LENGTH(profile_image_url) > 100000
      LIMIT 1
    `);

    if (existingFlorist.rows.length === 0) {
      console.log('No existing flower image found');
      return;
    }

    const flowerImageData = existingFlorist.rows[0].profile_image_url;
    console.log(`Found flower image data: ${flowerImageData.length} characters`);

    // Get all florists that need image updates (those without profile images)
    const floristsToUpdate = await client.query(`
      SELECT id, business_name, profile_image_url
      FROM florists 
      WHERE profile_image_url IS NULL OR LENGTH(profile_image_url) < 50000
      ORDER BY id
    `);

    console.log(`Found ${floristsToUpdate.rows.length} florists that need image updates`);

    // Update each florist with the flower arrangement image
    for (const florist of floristsToUpdate.rows) {
      try {
        await client.query(`
          UPDATE florists 
          SET profile_image_url = $1 
          WHERE id = $2
        `, [flowerImageData, florist.id]);
        
        console.log(`✓ Updated ${florist.business_name} with flower arrangement image`);
      } catch (error) {
        console.log(`✗ Error updating ${florist.business_name}:`, error.message);
      }
    }

    // Verify updates
    const verifyQuery = await client.query(`
      SELECT 
        business_name,
        city,
        state,
        LENGTH(profile_image_url) as image_size
      FROM florists 
      WHERE profile_image_url IS NOT NULL
      ORDER BY city, business_name
      LIMIT 10
    `);

    console.log('\n📊 Image Update Verification (sample):');
    verifyQuery.rows.forEach(row => {
      console.log(`  ${row.business_name} (${row.city}, ${row.state}): ${row.image_size} chars`);
    });

    console.log('\n✅ All florist images updated with flower arrangements!');

  } catch (error) {
    console.error('Error updating florist images:', error);
  } finally {
    await client.end();
  }
}

updateAllFloristImages().catch(console.error);