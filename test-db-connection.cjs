const { Pool } = require('pg');

const DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: false,
  options: '-c search_path=public'
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✓ Connected to database');
    
    // Test query with schema
    const result = await client.query('SELECT current_schema()');
    console.log('Current schema:', result.rows[0].current_schema);
    
    // Test florist_auth table access
    const authTest = await client.query('SELECT COUNT(*) FROM florist_auth');
    console.log('✓ florist_auth table accessible, count:', authTest.rows[0].count);
    
    // Test search_path
    const searchPath = await client.query('SHOW search_path');
    console.log('Search path:', searchPath.rows[0].search_path);
    
    client.release();
    console.log('✓ Connection test completed successfully');
    
  } catch (error) {
    console.error('✗ Database connection error:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();