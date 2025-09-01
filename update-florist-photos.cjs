const { Pool } = require('pg');

// Railway database connection
const pool = new Pool({
  connectionString: "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb",
  ssl: false
});

// Beautiful florist shop and floral arrangement photos
const floristPhotos = [
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Beautiful flower arrangement
  "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Pink roses bouquet
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Mixed flower bouquet
  "https://images.unsplash.com/photo-1595347097560-69238724e7bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Sunflower arrangement
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Purple flower vase
  "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Wedding bouquet
  "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Red roses
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Spring flowers
  "https://images.unsplash.com/photo-1595347097560-69238724e7bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Colorful bouquet
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Elegant arrangement
  "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Bridal flowers
  "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Romantic roses
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Fresh flowers
  "https://images.unsplash.com/photo-1595347097560-69238724e7bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Garden bouquet
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Premium arrangement
  "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Designer bouquet
  "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Classic roses
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Seasonal flowers
  "https://images.unsplash.com/photo-1595347097560-69238724e7bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", // Summer bouquet
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80"  // Luxury arrangement
];

async function updateFloristPhotos() {
  console.log('🌸 Starting florist photo updates...');
  
  try {
    // Connect to database
    await pool.connect();
    console.log('✅ Connected to Railway database');
    
    // Get all florists
    const result = await pool.query('SELECT id, business_name FROM florist_auth ORDER BY id');
    console.log(`📊 Found ${result.rows.length} florists to update`);
    
    // Update each florist with a photo
    let updated = 0;
    for (const [index, florist] of result.rows.entries()) {
      const photoUrl = floristPhotos[index % floristPhotos.length];
      
      await pool.query(
        'UPDATE florist_auth SET profile_image_url = $1 WHERE id = $2',
        [photoUrl, florist.id]
      );
      
      console.log(`✅ Updated ${florist.business_name} with photo ${index % floristPhotos.length + 1}`);
      updated++;
    }
    
    console.log(`🎉 Successfully updated ${updated} florist photos!`);
    console.log('🌺 All florists now have beautiful floral arrangement photos');
    
  } catch (error) {
    console.error('❌ Error updating florist photos:', error);
  } finally {
    await pool.end();
  }
}

updateFloristPhotos();