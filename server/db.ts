import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use the external PostgreSQL database as specified in replit.md
// This overrides any environment DATABASE_URL to ensure we use the correct external database
const EXTERNAL_DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

console.log('Using external PostgreSQL database:', EXTERNAL_DATABASE_URL);

// Create connection pool
export const pool = new Pool({ 
  connectionString: EXTERNAL_DATABASE_URL,
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

// Test database connection and verify we're using the correct database
pool.query('SELECT current_database()').then(result => {
  console.log('✅ Connected to database:', result.rows[0].current_database);
  if (result.rows[0].current_database !== 'floristdb') {
    console.error('❌ WARNING: Connected to wrong database! Expected floristdb but got:', result.rows[0].current_database);
  }
}).catch(err => {
  console.error('❌ Database connection test failed:', err);
});