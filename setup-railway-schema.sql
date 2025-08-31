-- Create complete schema for Railway database matching local Neon structure
-- This ensures all tables and columns match exactly

-- Drop existing tables to recreate with correct structure
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS florist_auth CASCADE;
DROP TABLE IF EXISTS florists CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS florist_catalog CASCADE;
DROP TABLE IF EXISTS florist_services CASCADE;

-- Create users table with password_hash column
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  role VARCHAR DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  password_hash VARCHAR NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR,
  reset_token VARCHAR,
  reset_token_expires TIMESTAMP
);

-- Create florist_auth table for florist authentication
CREATE TABLE florist_auth (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  business_name VARCHAR,
  address VARCHAR,
  city VARCHAR,
  state VARCHAR,
  zip_code VARCHAR,
  phone VARCHAR,
  profile_image_url TEXT,
  profile_summary TEXT,
  years_of_experience INTEGER DEFAULT 0,
  specialties TEXT[],
  business_hours JSONB,
  website VARCHAR,
  social_media JSONB,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  password_hash VARCHAR NOT NULL,
  services_offered TEXT[]
);

-- Create florists table for business profiles
CREATE TABLE florists (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  business_name VARCHAR,
  description TEXT,
  address VARCHAR,
  city VARCHAR,
  state VARCHAR,
  zip_code VARCHAR,
  phone VARCHAR,
  website VARCHAR,
  email VARCHAR,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  services TEXT[],
  specialties TEXT[],
  hours JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table for multi-role support
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, role)
);

-- Create reviews table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  florist_id INTEGER REFERENCES florists(id) ON DELETE CASCADE,
  customer_name VARCHAR NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inquiries table
CREATE TABLE inquiries (
  id SERIAL PRIMARY KEY,
  florist_id INTEGER REFERENCES florists(id) ON DELETE CASCADE,
  customer_name VARCHAR NOT NULL,
  customer_email VARCHAR NOT NULL,
  customer_phone VARCHAR,
  event_type VARCHAR,
  event_date DATE,
  budget_range VARCHAR,
  message TEXT,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create florist_catalog table for portfolio images
CREATE TABLE florist_catalog (
  id SERIAL PRIMARY KEY,
  florist_id INTEGER REFERENCES florists(id) ON DELETE CASCADE,
  image_url VARCHAR NOT NULL,
  caption VARCHAR,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create florist_services table
CREATE TABLE florist_services (
  id SERIAL PRIMARY KEY,
  florist_id INTEGER REFERENCES florists(id) ON DELETE CASCADE,
  service_name VARCHAR NOT NULL,
  description TEXT,
  price_range VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table for session storage
CREATE TABLE sessions (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (sid)
);

-- Create indexes for performance
CREATE INDEX idx_florists_location ON florists(latitude, longitude);
CREATE INDEX idx_florists_city_state ON florists(city, state);
CREATE INDEX idx_reviews_florist_id ON reviews(florist_id);
CREATE INDEX idx_inquiries_florist_id ON inquiries(florist_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_sessions_expire ON sessions(expire);

-- Insert initial admin user
INSERT INTO users (id, email, first_name, last_name, role, password_hash, is_verified) VALUES
('admin-1', 'alaaroubi@gmail.com', 'Alaa', 'Roubi', 'admin', '$2b$10$Onb2W3B7SpzpDqUKwjkmGOFpRznAo/U1Ydmnm0buSLsALNvqcMkhS', true);

COMMIT;