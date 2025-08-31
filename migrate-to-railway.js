import { Pool } from 'pg';

// Local Neon database (source)
const localPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Remote Railway database (destination)  
const railwayPool = new Pool({
  connectionString: "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb",
  ssl: false
});

async function migrateData() {
  console.log('🚀 Starting data migration from Neon to Railway...');
  
  try {
    // Test connections
    console.log('📡 Testing database connections...');
    await localPool.query('SELECT 1');
    await railwayPool.query('SELECT 1');
    console.log('✅ Both database connections successful');
    
    // 1. Migrate users table
    console.log('\n👥 Migrating users...');
    const usersResult = await localPool.query('SELECT * FROM users ORDER BY created_at');
    console.log(`Found ${usersResult.rows.length} users to migrate`);
    
    for (const user of usersResult.rows) {
      console.log(`  → Migrating user: ${user.email}`);
      await railwayPool.query(`
        INSERT INTO users (id, email, first_name, last_name, profile_image_url, role, created_at, updated_at, password_hash, is_verified, verification_token, reset_token, reset_token_expires)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        password_hash = EXCLUDED.password_hash
      `, [
        user.id, user.email, user.first_name, user.last_name, user.profile_image_url,
        user.role, user.created_at, user.updated_at, user.password_hash, user.is_verified,
        user.verification_token, user.reset_token, user.reset_token_expires
      ]);
    }
    console.log(`✅ Migrated ${usersResult.rows.length} users`);
    
    // 2. Migrate florist_auth table  
    console.log('\n🌺 Migrating florist authentication...');
    const floristAuthResult = await localPool.query('SELECT * FROM florist_auth ORDER BY created_at');
    console.log(`Found ${floristAuthResult.rows.length} florist auth records to migrate`);
    
    for (const auth of floristAuthResult.rows) {
      console.log(`  → Migrating florist auth: ${auth.email}`);
      await railwayPool.query(`
        INSERT INTO florist_auth (id, email, first_name, last_name, business_name, address, city, state, zip_code, phone, profile_image_url, profile_summary, years_of_experience, specialties, business_hours, website, social_media, is_verified, created_at, updated_at, password_hash, services_offered)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        business_name = EXCLUDED.business_name,
        phone = EXCLUDED.phone,
        password_hash = EXCLUDED.password_hash
      `, [
        auth.id, auth.email, auth.first_name, auth.last_name, auth.business_name,
        auth.address, auth.city, auth.state, auth.zip_code, auth.phone,
        auth.profile_image_url, auth.profile_summary, auth.years_of_experience,
        auth.specialties, auth.business_hours, auth.website, auth.social_media,
        auth.is_verified, auth.created_at, auth.updated_at, auth.password_hash,
        auth.services_offered
      ]);
    }
    console.log(`✅ Migrated ${floristAuthResult.rows.length} florist auth records`);
    
    // 3. Migrate florists table (business profiles)
    console.log('\n🏪 Migrating florist business profiles...');
    const floristsResult = await localPool.query('SELECT * FROM florists ORDER BY created_at');
    console.log(`Found ${floristsResult.rows.length} florist businesses to migrate`);
    
    for (const florist of floristsResult.rows) {
      if (florist.id) {
        console.log(`  → Migrating florist business: ${florist.business_name || florist.email}`);
        await railwayPool.query(`
          INSERT INTO florists (id, user_id, business_name, description, address, city, state, zip_code, phone, website, email, latitude, longitude, is_verified, is_active, rating, review_count, services, specialties, hours, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          ON CONFLICT (id) DO UPDATE SET
          business_name = EXCLUDED.business_name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          website = EXCLUDED.website
        `, [
          florist.id, florist.user_id, florist.business_name, florist.description,
          florist.address, florist.city, florist.state, florist.zip_code, florist.phone,
          florist.website, florist.email, florist.latitude, florist.longitude,
          florist.is_verified, florist.is_active, florist.rating, florist.review_count,
          florist.services, florist.specialties, florist.hours, florist.created_at, florist.updated_at
        ]);
      }
    }
    console.log(`✅ Migrated ${floristsResult.rows.length} florist businesses`);
    
    // 4. Verify migration
    console.log('\n🔍 Verifying migration...');
    const railwayUsers = await railwayPool.query('SELECT COUNT(*) as count FROM users');
    const railwayFloristAuth = await railwayPool.query('SELECT COUNT(*) as count FROM florist_auth');
    const railwayFlorists = await railwayPool.query('SELECT COUNT(*) as count FROM florists');
    
    console.log(`📊 Migration Summary:`);
    console.log(`  Users: ${railwayUsers.rows[0].count}`);
    console.log(`  Florist Auth: ${railwayFloristAuth.rows[0].count}`);
    console.log(`  Florist Businesses: ${railwayFlorists.rows[0].count}`);
    
    console.log('\n🎉 Data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await localPool.end();
    await railwayPool.end();
  }
}

// Run migration
migrateData().then(() => {
  console.log('✨ Migration script finished');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Migration script failed:', error);
  process.exit(1);
});