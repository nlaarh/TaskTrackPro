import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use the external PostgreSQL database as specified in replit.md
const DATABASE_URL = "postgresql://postgres:postgres@yamanote.proxy.rlwy.net:18615/flouristdb";

export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: false, // Railway typically doesn't require SSL for proxy connections
  options: '-c search_path=floristdb' // Use floristdb schema
});

export const db = drizzle(pool, { schema });