const { Pool } = require('pg');

const RAILWAY_DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

async function debugSpecificFlorist() {
  console.log('🔍 Checking Canalside Event Flowers specifically...');
  
  const pool = new Pool({ 
    connectionString: RAILWAY_DATABASE_URL, 
    ssl: false 
  });
  
  try {
    // Find Canalside Event Flowers
    const floristQuery = await pool.query(
      "SELECT * FROM florist_auth WHERE business_name ILIKE '%canalside%' OR business_name ILIKE '%event%'"
    );
    
    if (floristQuery.rows.length > 0) {
      const florist = floristQuery.rows[0];
      console.log('✅ Found Canalside Event Flowers:');
      console.log('  ID:', florist.id);
      console.log('  Name:', florist.business_name);
      console.log('  Email:', florist.email);
      console.log('  Profile Image URL:', florist.profile_image_url || 'NULL/EMPTY');
      console.log('  Updated At:', florist.updated_at);
      
      // Check if this florist appears in the API response format
      console.log('\n📋 API Response Format for this florist:');
      const apiFlorist = {
        id: florist.id,
        businessName: florist.business_name || 'Unnamed Business',
        email: florist.email,
        firstName: florist.first_name,
        lastName: florist.last_name,
        address: florist.address,
        city: florist.city,
        state: florist.state,
        zipCode: florist.zip_code,
        phone: florist.phone,
        website: florist.website,
        profileSummary: florist.profile_summary,
        yearsOfExperience: florist.years_of_experience || 0,
        specialties: florist.specialties || [],
        services: florist.services_offered || [],
        profileImageUrl: florist.profile_image_url,
        businessHours: florist.business_hours,
        isFeatured: florist.is_verified || false,
        createdAt: florist.created_at,
        updatedAt: florist.updated_at
      };
      
      console.log('  API profileImageUrl field:', apiFlorist.profileImageUrl);
    } else {
      console.log('❌ Canalside Event Flowers not found');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

debugSpecificFlorist();