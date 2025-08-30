const { Client } = require('pg');

async function createTestReviews() {
  const client = new Client({
    connectionString: 'postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // First, get all florists
    const florists = await client.query('SELECT id, business_name FROM florists ORDER BY id');
    console.log(`Found ${florists.rows.length} florists`);

    // Sample review data for each florist
    const reviewTemplates = [
      {
        rating: 5,
        comment: "Absolutely stunning arrangements! The flowers were fresh and beautifully designed. Perfect for our wedding day.",
        author: "Sarah Johnson",
        email: "sarah.j@email.com"
      },
      {
        rating: 5,
        comment: "Outstanding service and gorgeous bouquets. They really understood our vision and delivered beyond expectations.",
        author: "Michael Chen",
        email: "mchen@email.com"
      },
      {
        rating: 4,
        comment: "Beautiful flowers and professional service. Delivery was prompt and the arrangement lasted for over a week.",
        author: "Emily Rodriguez",
        email: "emily.r@email.com"
      },
      {
        rating: 5,
        comment: "Incredible attention to detail! The sympathy arrangement was tasteful and helped us express our condolences perfectly.",
        author: "David Thompson",
        email: "dthompson@email.com"
      },
      {
        rating: 4,
        comment: "Great selection of seasonal flowers. The staff was knowledgeable and helped me choose the perfect anniversary bouquet.",
        author: "Jessica Martinez",
        email: "jess.martinez@email.com"
      },
      {
        rating: 5,
        comment: "Amazing work on our corporate event centerpieces. Professional, creative, and delivered exactly on time.",
        author: "Robert Kim",
        email: "robert.kim@email.com"
      },
      {
        rating: 5,
        comment: "The holiday arrangements were spectacular! Fresh flowers, creative design, and excellent customer service.",
        author: "Amanda Wilson",
        email: "awilson@email.com"
      },
      {
        rating: 4,
        comment: "Lovely bridal bouquet that matched our theme perfectly. The florist was very accommodating with our requests.",
        author: "Lisa Chang",
        email: "lisa.chang@email.com"
      }
    ];

    // Create reviews for each florist
    for (const florist of florists.rows) {
      console.log(`\nCreating reviews for ${florist.business_name}...`);
      
      // Add 5-6 reviews per florist
      const numReviews = 5 + Math.floor(Math.random() * 2); // 5 or 6 reviews
      const usedReviews = [];
      
      for (let i = 0; i < numReviews; i++) {
        // Select a random review template that hasn't been used for this florist
        let reviewIndex;
        do {
          reviewIndex = Math.floor(Math.random() * reviewTemplates.length);
        } while (usedReviews.includes(reviewIndex) && usedReviews.length < reviewTemplates.length);
        
        usedReviews.push(reviewIndex);
        const review = reviewTemplates[reviewIndex];
        
        // Create review date (within last 6 months)
        const reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() - Math.floor(Math.random() * 180));
        
        try {
          await client.query(`
            INSERT INTO reviews (florist_id, user_name, user_email, rating, comment, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            florist.id,
            review.author,
            review.email,
            review.rating,
            review.comment,
            reviewDate
          ]);
          
          console.log(`  ✓ Added review by ${review.author} (${review.rating} stars)`);
        } catch (error) {
          console.log(`  ⚠ Skipping duplicate review by ${review.author}`);
        }
      }
    }

    // Show final statistics
    console.log('\nGetting final review statistics...');
    const stats = await client.query(`
      SELECT 
        f.business_name,
        COUNT(r.id) as review_count,
        ROUND(AVG(r.rating), 1) as average_rating
      FROM florists f 
      LEFT JOIN reviews r ON f.id = r.florist_id
      GROUP BY f.id, f.business_name
      HAVING COUNT(r.id) > 0
      ORDER BY f.id
    `);
    
    console.log('\n📊 Final Review Statistics:');
    stats.rows.forEach(row => {
      console.log(`  ${row.business_name}: ${row.review_count} reviews, ${row.average_rating} avg rating`);
    });

    console.log('\n✅ Successfully created test review data!');

  } catch (error) {
    console.error('Error creating test reviews:', error);
  } finally {
    await client.end();
  }
}

createTestReviews().catch(console.error);