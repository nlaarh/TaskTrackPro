import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use the external PostgreSQL database as specified in replit.md
const DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

// Create pool with explicit configuration to ensure clean connections
export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Set schema on each connection
  async onConnect(client) {
    await client.query('SET search_path TO public');
  }
});

export const db = drizzle(pool, { schema });