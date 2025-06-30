import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use external PostgreSQL database as specified by user
// Modified to use the correct Railway hostname for SSL certificate match
const DATABASE_URL = "postgresql://flouristm:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote-production.up.railway.app:18615/flouristdb";

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined // Skip hostname verification
  }
});
export const db = drizzle({ client: pool, schema });