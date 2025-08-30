const { Client } = require('pg');

async function createReviewsForAll() {
  const client = new Client({
    connectionString: 'postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Clear existing reviews
    await client.query('DELETE FROM reviews');
    console.log('Cleared existing reviews');

    // Get all florists
    const florists = await client.query('SELECT id, business_name, city, state FROM florists ORDER BY id');
    console.log(`Found ${florists.rows.length} florists to create reviews for`);

    // Extended realistic customer review data
    const customerReviews = [
      { rating: 5, comment: "Absolutely stunning wedding arrangements! The flowers were fresh and beautifully designed. Perfect for our special day.", userId: "customer_jennifer_martinez" },
      { rating: 5, comment: "Outstanding service for our corporate event. The centerpieces were elegant and professional, delivered exactly on time.", userId: "customer_michael_chen" },
      { rating: 4, comment: "Beautiful anniversary bouquet that exceeded expectations. The flowers were fresh and the arrangement was creative.", userId: "customer_emily_rodriguez" },
      { rating: 5, comment: "The sympathy arrangement was tasteful and beautiful. They handled our order with such care and compassion.", userId: "customer_david_thompson" },
      { rating: 5, comment: "Amazing birthday surprise arrangement! The colorful roses and lilies were perfect. Great communication throughout.", userId: "customer_james_wilson" },
      { rating: 4, comment: "Lovely Mother's Day bouquet with excellent customer service. The staff was knowledgeable and helpful.", userId: "customer_lisa_chang" },
      { rating: 5, comment: "The bridal bouquet was even more beautiful than I imagined! Attention to detail was incredible.", userId: "customer_amanda_davis" },
      { rating: 4, comment: "Great selection of seasonal flowers for our holiday decorations. Professional delivery and setup.", userId: "customer_robert_kim" },
      { rating: 5, comment: "Fantastic work on our graduation party centerpieces. Creative designs and fresh flowers that lasted days.", userId: "customer_sarah_johnson" },
      { rating: 5, comment: "Perfect Valentine's Day surprise! The roses were gorgeous and my partner was thrilled.", userId: "customer_thomas_anderson" },
      { rating: 4, comment: "Excellent service for our baby shower. The pastel arrangements were exactly what we wanted.", userId: "customer_maria_gonzalez" },
      { rating: 5, comment: "Outstanding funeral arrangements that honored our loved one beautifully. Very respectful service.", userId: "customer_charles_williams" },
      { rating: 5, comment: "The holiday wreath and garlands transformed our home. Exceptional quality and craftsmanship.", userId: "customer_patricia_brown" },
      { rating: 4, comment: "Great experience for our office opening. Professional consultation and timely delivery.", userId: "customer_daniel_lee" },
      { rating: 5, comment: "Incredible work on our anniversary dinner setup. The romantic ambiance was perfect.", userId: "customer_michelle_taylor" },
      { rating: 5, comment: "Beautiful housewarming bouquet that brightened our new home. Will definitely order again.", userId: "customer_kevin_clark" },
      { rating: 4, comment: "Lovely get-well arrangement for my mother. The cheerful colors lifted her spirits immediately.", userId: "customer_stephanie_white" },
      { rating: 5, comment: "Amazing prom corsages and boutonnieres. The teens loved them and they lasted the whole night.", userId: "customer_brandon_harris" },
      { rating: 5, comment: "Perfect church wedding decorations. The altar arrangements were breathtaking.", userId: "customer_nicole_martin" },
      { rating: 4, comment: "Great selection for our corporate appreciation event. Professional and budget-friendly.", userId: "customer_andrew_garcia" }
    ];

    // Create 3-6 reviews per florist
    let totalReviews = 0;
    for (const florist of florists.rows) {
      const numReviews = 3 + Math.floor(Math.random() * 4); // 3-6 reviews
      console.log(`Creating ${numReviews} reviews for ${florist.business_name} in ${florist.city}, ${florist.state}`);
      
      // Shuffle reviews for variety
      const shuffledReviews = [...customerReviews].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numReviews; i++) {
        const review = shuffledReviews[i % shuffledReviews.length];
        const reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() - Math.floor(Math.random() * 180)); // Reviews from last 6 months
        
        await client.query(`
          INSERT INTO reviews (florist_id, user_id, rating, comment, created_at)
          VALUES ($1, $2, $3, $4, $5)
        `, [florist.id, review.userId, review.rating, review.comment, reviewDate]);
        
        totalReviews++;
      }
    }

    console.log(`\n✅ Created ${totalReviews} reviews for ${florists.rows.length} florists`);

    // Show final statistics
    const stats = await client.query(`
      SELECT 
        f.business_name,
        f.city,
        f.state,
        COUNT(r.id) as review_count,
        ROUND(AVG(r.rating), 1) as average_rating
      FROM florists f 
      LEFT JOIN reviews r ON f.id = r.florist_id
      GROUP BY f.id, f.business_name, f.city, f.state
      HAVING COUNT(r.id) > 0
      ORDER BY f.city, f.business_name
      LIMIT 10
    `);
    
    console.log('\n📊 Sample Review Statistics:');
    stats.rows.forEach(row => {
      console.log(`  ${row.business_name} (${row.city}, ${row.state}): ${row.review_count} reviews, ${row.average_rating}⭐`);
    });

  } catch (error) {
    console.error('Error creating reviews:', error);
  } finally {
    await client.end();
  }
}

createReviewsForAll().catch(console.error);