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