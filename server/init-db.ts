import { Pool } from 'pg';

// Database connection for FloriHub schema creation
// Try different credential combinations
const DATABASE_CONFIGS = [
  "postgresql://postgres:postgres@yamanote.proxy.rlwy.net:18615/flouristdb",
  "postgresql://postgres:@yamanote.proxy.rlwy.net:18615/flouristdb",
  "postgresql://flouristdb:postgres@yamanote.proxy.rlwy.net:18615/flouristdb",
  "postgresql://root:postgres@yamanote.proxy.rlwy.net:18615/flouristdb"
];

async function tryConnection(config: string): Promise<Pool | null> {
  try {
    const pool = new Pool({ 
      connectionString: config,
      ssl: false
    });
    
    const client = await pool.connect();
    client.release();
    console.log(`✅ Connected successfully with: ${config.replace(/:([^@:]+)@/, ':****@')}`);
    return pool;
  } catch (error) {
    console.log(`❌ Failed with: ${config.replace(/:([^@:]+)@/, ':****@')}`);
    return null;
  }
}

// SQL to create all required tables for FloriHub
const createTablesSQL = `
-- Create floristdb schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS floristdb;

-- Set search path to use floristdb schema
SET search_path TO floristdb;

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS floristdb.sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON floristdb.sessions (expire);

-- Users table for customer authentication (Replit Auth)
CREATE TABLE IF NOT EXISTS floristdb.users (
  id VARCHAR PRIMARY KEY NOT NULL,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  role VARCHAR DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Florist authentication table (separate from users)
CREATE TABLE IF NOT EXISTS floristdb.florist_auth (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR,
  reset_token VARCHAR,
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Florists table for business profiles
CREATE TABLE IF NOT EXISTS floristdb.florists (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES floristdb.florist_auth(id),
  email VARCHAR,
  phone VARCHAR,
  business_name VARCHAR NOT NULL,
  address VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  state VARCHAR NOT NULL,
  zip_code VARCHAR NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  website VARCHAR,
  profile_summary TEXT,
  years_of_experience INTEGER DEFAULT 0,
  specialties TEXT[],
  services TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  profile_image_url VARCHAR,
  hours JSONB,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Florist images table
CREATE TABLE IF NOT EXISTS floristdb.florist_images (
  id SERIAL PRIMARY KEY,
  florist_id INTEGER REFERENCES floristdb.florists(id) ON DELETE CASCADE,
  image_url VARCHAR NOT NULL,
  alt_text VARCHAR,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS floristdb.reviews (
  id SERIAL PRIMARY KEY,
  florist_id INTEGER REFERENCES floristdb.florists(id) ON DELETE CASCADE,
  user_id VARCHAR REFERENCES floristdb.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR,
  comment TEXT,
  event_type VARCHAR,
  event_date DATE,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inquiries table
CREATE TABLE IF NOT EXISTS floristdb.inquiries (
  id SERIAL PRIMARY KEY,
  florist_id INTEGER REFERENCES floristdb.florists(id) ON DELETE CASCADE,
  user_id VARCHAR REFERENCES floristdb.users(id),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  event_type VARCHAR NOT NULL,
  event_date DATE,
  budget_range VARCHAR,
  message TEXT NOT NULL,
  status VARCHAR DEFAULT 'pending',
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Newsletter subscriptions table
CREATE TABLE IF NOT EXISTS floristdb.newsletter_subscriptions (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  is_active BOOLEAN DEFAULT true,
  preferences JSONB,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP
);

-- Saved florists table
CREATE TABLE IF NOT EXISTS floristdb.saved_florists (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES floristdb.users(id) ON DELETE CASCADE,
  florist_id INTEGER REFERENCES floristdb.florists(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, florist_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_florists_location ON floristdb.florists (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_florists_city_state ON floristdb.florists (city, state);
CREATE INDEX IF NOT EXISTS idx_florists_featured ON floristdb.florists (is_featured);
CREATE INDEX IF NOT EXISTS idx_florists_active ON floristdb.florists (is_active);
CREATE INDEX IF NOT EXISTS idx_reviews_florist ON floristdb.reviews (florist_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON floristdb.reviews (rating);
CREATE INDEX IF NOT EXISTS idx_inquiries_florist ON floristdb.inquiries (florist_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON floristdb.inquiries (status);
`;

async function initializeDatabase() {
  console.log('Trying to connect to PostgreSQL database...');
  
  let pool: Pool | null = null;
  
  // Try different credential combinations
  for (const config of DATABASE_CONFIGS) {
    pool = await tryConnection(config);
    if (pool) break;
  }
  
  if (!pool) {
    console.error('❌ Could not connect with any credential combination');
    console.log('\nTried configurations:');
    DATABASE_CONFIGS.forEach(config => {
      console.log('- ' + config.replace(/:([^@:]+)@/, ':****@'));
    });
    process.exit(1);
  }
  
  try {
    const client = await pool.connect();
    console.log('\nCreating FloriHub schema...');
    await client.query(createTablesSQL);
    console.log('Database schema created successfully!');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'floristdb'
      ORDER BY table_name;
    `);
    
    console.log('\nCreated tables:');
    result.rows.forEach(row => {
      console.log('- ' + row.table_name);
    });
    
    client.release();
    await pool.end();
    
    console.log('\n✅ FloriHub database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();