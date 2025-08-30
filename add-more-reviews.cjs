const { Client } = require('pg');

async function addMoreReviews() {
  const client = new Client({
    connectionString: 'postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Get all florists
    const florists = await client.query('SELECT id, business_name FROM florists ORDER BY id');
    console.log(`Found ${florists.rows.length} florists`);

    // Additional unique review data with different email addresses
    const additionalReviews = [
      {
        rating: 5,
        comment: "Outstanding customer service! They went above and beyond to create the perfect wedding centerpieces.",
        author: "Rachel Davis",
        email: "rachel.davis@email.com"
      },
      {
        rating: 4,
        comment: "Fresh flowers and creative designs. The birthday bouquet was exactly what I had in mind.",
        author: "Thomas Anderson",
        email: "t.anderson@email.com"
      },
      {
        rating: 5,
        comment: "Professional and reliable. Our corporate event flowers were stunning and delivered on time.",
        author: "Maria Gonzalez",
        email: "maria.g@email.com"
      },
      {
        rating: 5,
        comment: "The sympathy arrangement was beautiful and tastefully done. Thank you for your compassion.",
        author: "James Wright",
        email: "james.wright@email.com"
      },
      {
        rating: 4,
        comment: "Love their seasonal selections! The autumn centerpiece lasted for weeks and looked amazing.",
        author: "Catherine Liu",
        email: "catherine.liu@email.com"
      },
      {
        rating: 5,
        comment: "Incredible attention to detail. The bridal bouquet was even more beautiful than I imagined.",
        author: "Nicole Brown",
        email: "nicole.brown@email.com"
      },
      {
        rating: 5,
        comment: "Fast delivery and gorgeous arrangements. Perfect for our anniversary dinner!",
        author: "Kevin Park",
        email: "kevin.park@email.com"
      },
      {
        rating: 4,
        comment: "Great experience overall. The staff was helpful and the flowers were very fresh.",
        author: "Stephanie Miller",
        email: "s.miller@email.com"
      }
    ];

    // Create additional reviews for each florist
    for (const florist of florists.rows) {
      console.log(`\nAdding more reviews for ${florist.business_name}...`);
      
      // Add 3-4 additional reviews per florist
      const numReviews = 3 + Math.floor(Math.random() * 2); // 3 or 4 reviews
      
      for (let i = 0; i < numReviews && i < additionalReviews.length; i++) {
        const review = additionalReviews[i];
        
        // Create review date (within last 4 months)
        const reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() - Math.floor(Math.random() * 120));
        
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
    console.log('\n📊 Final Review Statistics:');
    const stats = await client.query(`
      SELECT 
        f.business_name,
        COUNT(r.id) as review_count,
        ROUND(AVG(r.rating), 1) as average_rating
      FROM florists f 
      LEFT JOIN reviews r ON f.id = r.florist_id
      GROUP BY f.id, f.business_name
      ORDER BY f.id
    `);
    
    stats.rows.forEach(row => {
      if (row.review_count > 0) {
        console.log(`  ${row.business_name}: ${row.review_count} reviews, ${row.average_rating}⭐`);
      }
    });

    console.log('\n✅ Successfully added more review data!');

  } catch (error) {
    console.error('Error adding reviews:', error);
  } finally {
    await client.end();
  }
}

addMoreReviews().catch(console.error);