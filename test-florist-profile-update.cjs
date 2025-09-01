const { Pool } = require('pg');

const RAILWAY_DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

async function testFloristProfileUpdate() {
  console.log('🧪 Testing florist profile update functionality...');
  
  const pool = new Pool({ 
    connectionString: RAILWAY_DATABASE_URL, 
    ssl: false 
  });
  
  try {
    // Get a test florist ID
    const testFlorist = await pool.query('SELECT id, business_name, email FROM florist_auth LIMIT 1');
    if (testFlorist.rows.length === 0) {
      throw new Error('No florists found for testing');
    }
    
    const floristId = testFlorist.rows[0].id;
    const originalName = testFlorist.rows[0].business_name;
    const email = testFlorist.rows[0].email;
    
    console.log(`📋 Testing with florist ID: ${floristId}, Name: ${originalName}`);
    
    // Test data
    const testProfileData = {
      businessName: `${originalName} - UPDATED TEST`,
      address: '123 Test Street UPDATED',
      city: 'Test City UPDATED', 
      state: 'NY',
      zipCode: '12345',
      phone: '555-TEST-123',
      website: 'https://test-updated.com',
      profileImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&q=80',
      profileSummary: 'This is a test profile update summary',
      yearsOfExperience: 15,
      specialties: ['wedding flowers', 'corporate events', 'test specialty']
    };
    
    console.log('📤 Updating florist profile...');
    
    // Simulate the updateFloristProfile method
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;
    
    const fieldMappings = {
      'businessName': 'business_name',
      'zipCode': 'zip_code', 
      'profileImageUrl': 'profile_image_url',
      'profileSummary': 'profile_summary',
      'yearsOfExperience': 'years_of_experience',
      'specialties': 'specialties',
      'services': 'services_offered',
      'address': 'address',
      'city': 'city',
      'state': 'state',
      'phone': 'phone',
      'website': 'website'
    };
    
    Object.keys(testProfileData).forEach(key => {
      const dbField = fieldMappings[key];
      if (dbField && testProfileData[key] !== undefined) {
        updateFields.push(`${dbField} = $${paramIndex + 1}`);
        updateValues.push(testProfileData[key]);
        paramIndex++;
      }
    });
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    const query = `
      UPDATE florist_auth 
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [floristId, ...updateValues]);
    
    if (result.rows.length === 0) {
      throw new Error('❌ Update failed - no rows affected');
    }
    
    const updatedFlorist = result.rows[0];
    console.log('✅ Profile updated successfully!');
    console.log('📊 Updated fields:');
    console.log(`  Business Name: ${updatedFlorist.business_name}`);
    console.log(`  Address: ${updatedFlorist.address}`);
    console.log(`  City: ${updatedFlorist.city}`);  
    console.log(`  Phone: ${updatedFlorist.phone}`);
    console.log(`  Website: ${updatedFlorist.website}`);
    console.log(`  Profile Image: ${updatedFlorist.profile_image_url ? updatedFlorist.profile_image_url.substring(0, 50) + '...' : 'NULL'}`);
    console.log(`  Years Experience: ${updatedFlorist.years_of_experience}`);
    console.log(`  Specialties: ${JSON.stringify(updatedFlorist.specialties)}`);
    
    // Restore original name to avoid polluting data
    await pool.query(
      'UPDATE florist_auth SET business_name = $1 WHERE id = $2', 
      [originalName, floristId]
    );
    console.log('🔄 Restored original business name');
    
    console.log('🎉 Florist profile update test PASSED!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
    return false;
  } finally {
    await pool.end();
  }
  
  return true;
}

testFloristProfileUpdate();