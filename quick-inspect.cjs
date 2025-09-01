const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb",
  ssl: false
});

async function quickInspect() {
  try {
    console.log('🔍 QUICK DATABASE STRUCTURE ANALYSIS\n');
    
    // Check what tables exist
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 TABLES:', tables.rows.map(r => r.table_name).join(', '));
    
    // Check florist_auth table structure  
    console.log('\n🔸 FLORIST_AUTH TABLE ANALYSIS:');
    const floristAuthCount = await pool.query('SELECT COUNT(*) FROM florist_auth');
    console.log(`  Total records: ${floristAuthCount.rows[0].count}`);
    
    // First check what columns exist
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'florist_auth'
      ORDER BY ordinal_position;
    `);
    console.log('  Columns:', columns.rows.map(c => `${c.column_name}(${c.data_type})`).join(', '));
    
    const floristAuthSample = await pool.query(`
      SELECT * FROM florist_auth LIMIT 3
    `);
    console.log('  Sample florist records:');
    floristAuthSample.rows.forEach((row, idx) => {
      console.log(`    ${idx + 1}. ${row.business_name} (${row.first_name} ${row.last_name}) - ${row.email}`);
    });
    
    // Check users table structure
    console.log('\n🔸 USERS TABLE ANALYSIS:');
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`  Total records: ${usersCount.rows[0].count}`);
    
    const customerCount = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'customer'`);
    console.log(`  Customer records: ${customerCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

quickInspect();