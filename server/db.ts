import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use the external PostgreSQL database as specified in replit.md
const DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

// Parse the connection string and add search_path parameter
const url = new URL(DATABASE_URL);
url.searchParams.set('options', '-c search_path=public');

export const pool = new Pool({ 
  connectionString: url.toString(),
  ssl: false, // Railway typically doesn't require SSL for proxy connections
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });