import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Railway database connection - the ONLY database we use
const RAILWAY_DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

// Force environment to use Railway database
process.env.DATABASE_URL = RAILWAY_DATABASE_URL;

console.log('✅ USING RAILWAY DATABASE ONLY:', RAILWAY_DATABASE_URL);

// Create connection pool for Railway database
export const pool = new Pool({ 
  connectionString: RAILWAY_DATABASE_URL,
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

// Test database connection
pool.query('SELECT current_database(), inet_server_addr(), inet_server_port()').then(result => {
  const { current_database, inet_server_addr, inet_server_port } = result.rows[0];
  console.log('✅ Connected to database:', current_database);
  console.log('Connected to:', { current_database, inet_server_addr, inet_server_port });
  
  if (current_database !== 'floristdb') {
    console.error('❌ WARNING: Connected to wrong database! Expected floristdb but got:', current_database);
  }
}).catch(err => {
  console.error('❌ Database connection test failed:', err);
});