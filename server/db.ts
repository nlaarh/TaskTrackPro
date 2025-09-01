import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// COMPLETELY REMOVE NEON - USE ONLY RAILWAY DATABASE
const RAILWAY_DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

// DESTROY environment DATABASE_URL to force Railway only
delete process.env.DATABASE_URL;
delete process.env.PGDATABASE;
delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGPASSWORD;

console.log('🔥 REMOVED ALL NEON DATABASE ENVIRONMENT VARIABLES');
console.log('✅ USING RAILWAY DATABASE ONLY:', RAILWAY_DATABASE_URL);

// Create connection pool for Railway database EXCLUSIVELY
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