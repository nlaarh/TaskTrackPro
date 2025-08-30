const { Client } = require('pg');

async function createReviewsTable() {
  const client = new Client({
    connectionString: 'postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create reviews table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        florist_id INTEGER REFERENCES florists(id) ON DELETE CASCADE,
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(florist_id, user_email)
      )
    `);
    
    console.log('✓ Reviews table created/verified');

    // Check current review count
    const countResult = await client.query('SELECT COUNT(*) as count FROM reviews');
    console.log(`Current reviews in database: ${countResult.rows[0].count}`);

    console.log('✅ Reviews table setup complete');

  } catch (error) {
    console.error('Error setting up reviews table:', error);
  } finally {
    await client.end();
  }
}

createReviewsTable().catch(console.error);