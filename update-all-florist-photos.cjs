const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { floristAuth } = require('./shared/schema.ts');
const { eq } = require('drizzle-orm');

const RAILWAY_DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

// Beautiful flower arrangement photos
const FLOWER_IMAGES = [
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&q=80', // Beautiful mixed bouquet
  'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=400&fit=crop&q=80', // Pink roses arrangement
  'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400&h=400&fit=crop&q=80', // White and purple bouquet
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=80', // Elegant white roses
  'https://images.unsplash.com/photo-1606890737451-6ac2b99f7c3c?w=400&h=400&fit=crop&q=80'  // Colorful spring arrangement
];

async function updateAllFloristPhotos() {
  console.log('🌺 Starting to update all florist photos with beautiful flower arrangements...');
  
  try {
    const pool = new Pool({ connectionString: RAILWAY_DATABASE_URL, ssl: false });
    const db = drizzle(pool, { schema: { floristAuth } });
    
    console.log('✅ Connected to database');
    
    // Get all florists
    const allFlorists = await db.select().from(floristAuth);
    console.log(`📊 Found ${allFlorists.length} florists to update`);
    
    // Update each florist with a beautiful flower image
    let updatedCount = 0;
    for (let i = 0; i < allFlorists.length; i++) {
      const florist = allFlorists[i];
      const flowerImageUrl = FLOWER_IMAGES[i % FLOWER_IMAGES.length];
      
      await db
        .update(floristAuth)
        .set({ 
          profileImageUrl: flowerImageUrl,
          updatedAt: new Date()
        })
        .where(eq(floristAuth.id, florist.id));
        
      updatedCount++;
      console.log(`✅ Updated ${florist.businessName} (ID: ${florist.id}) with flower image ${(i % FLOWER_IMAGES.length) + 1}`);
    }
    
    console.log(`🌸 Successfully updated ${updatedCount} florists with beautiful flower arrangement photos!`);
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error updating florist photos:', error);
  }
}

updateAllFloristPhotos();