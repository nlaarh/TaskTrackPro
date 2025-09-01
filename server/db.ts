import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use ONLY the Railway PostgreSQL database - no local Neon database
const RAILWAY_DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

// FORCE Railway database - ignore any environment DATABASE_URL
console.log('Using Railway PostgreSQL database ONLY:', RAILWAY_DATABASE_URL);
console.log('Ignoring environment DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Not set');

// Create connection pool for Railway database only
export const pool = new Pool({ 
  connectionString: RAILWAY_DATABASE_URL,
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