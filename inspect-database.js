// Database inspection script to understand current schema
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb",
  ssl: false
});

async function inspectDatabase() {
  try {
    console.log('🔍 INSPECTING RAILWAY DATABASE STRUCTURE...\n');
    
    // List all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 AVAILABLE TABLES:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check each table structure and sample data
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`\n🔸 TABLE: ${tableName.toUpperCase()}`);
      
      // Get column information
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `, [tableName]);
      
      console.log('  Columns:');
      columnsResult.rows.forEach(col => {
        console.log(`    ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
      
      // Get row count
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`  Row count: ${countResult.rows[0].count}`);
      
      // Get sample data (first 2 rows)
      if (parseInt(countResult.rows[0].count) > 0) {
        const sampleResult = await pool.query(`SELECT * FROM ${tableName} LIMIT 2`);
        console.log('  Sample data:');
        sampleResult.rows.forEach((row, idx) => {
          console.log(`    Row ${idx + 1}:`, JSON.stringify(row, null, 2));
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Database inspection failed:', error);
  } finally {
    await pool.end();
  }
}

inspectDatabase();