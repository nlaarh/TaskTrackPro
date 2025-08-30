const { Client } = require('pg');

async function createRealisticReviews() {
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
    const florists = await client.query('SELECT id, business_name FROM florists ORDER BY id');
    console.log(`Found ${florists.rows.length} florists`);

    // Realistic customer review data with full contact information
    const customerReviews = [
      {
        rating: 5,
        comment: "Absolutely stunning wedding arrangements! Sarah was incredibly helpful and understood our vision perfectly. The flowers lasted throughout our entire celebration.",
        customer: {
          firstName: "Jennifer",
          lastName: "Martinez",
          email: "jennifer.martinez@email.com",
          phone: "(555) 123-4567",
          userId: "customer_jennifer_martinez"
        }
      },
      {
        rating: 5,
        comment: "Outstanding service for our corporate event. The centerpieces were elegant and professional, and they delivered exactly on time. Highly recommend!",
        customer: {
          firstName: "Michael",
          lastName: "Chen",
          email: "m.chen@businessmail.com",
          phone: "(555) 234-5678",
          userId: "customer_michael_chen"
        }
      },
      {
        rating: 4,
        comment: "Beautiful anniversary bouquet that exceeded my expectations. The flowers were fresh and the arrangement was creative. Will definitely order again.",
        customer: {
          firstName: "Emily",
          lastName: "Rodriguez",
          email: "emily.rod@gmail.com",
          phone: "(555) 345-6789",
          userId: "customer_emily_rodriguez"
        }
      },
      {
        rating: 5,
        comment: "The sympathy arrangement was tasteful and beautiful. They handled our order with such care and compassion during a difficult time. Thank you.",
        customer: {
          firstName: "David",
          lastName: "Thompson",
          email: "dthompson@yahoo.com",
          phone: "(555) 456-7890",
          userId: "customer_david_thompson"
        }
      },
      {
        rating: 5,
        comment: "Amazing birthday surprise arrangement! My wife was thrilled with the colorful roses and lilies. Great communication throughout the process.",
        customer: {
          firstName: "James",
          lastName: "Wilson",
          email: "james.wilson@outlook.com",
          phone: "(555) 567-8901",
          userId: "customer_james_wilson"
        }
      },
      {
        rating: 4,
        comment: "Lovely Mother's Day bouquet with excellent customer service. The staff was knowledgeable and helped me choose the perfect flowers.",
        customer: {
          firstName: "Lisa",
          lastName: "Chang",
          email: "lisa.chang@hotmail.com",
          phone: "(555) 678-9012",
          userId: "customer_lisa_chang"
        }
      },
      {
        rating: 5,
        comment: "The bridal bouquet was even more beautiful than I imagined! Attention to detail was incredible and it perfectly matched our wedding theme.",
        customer: {
          firstName: "Amanda",
          lastName: "Davis",
          email: "amanda.davis@protonmail.com",
          phone: "(555) 789-0123",
          userId: "customer_amanda_davis"
        }
      },
      {
        rating: 4,
        comment: "Great selection of seasonal flowers for our holiday decorations. Professional delivery and the arrangements looked fantastic in our lobby.",
        customer: {
          firstName: "Robert",
          lastName: "Kim",
          email: "robert.kim@company.com",
          phone: "(555) 890-1234",
          userId: "customer_robert_kim"
        }
      }
    ];

    // Create 5-6 reviews per florist with realistic customer data
    for (const florist of florists.rows) {
      console.log(`\nCreating reviews for ${florist.business_name}...`);
      const numReviews = 5 + Math.floor(Math.random() * 2); // 5 or 6 reviews
      
      for (let i = 0; i < numReviews && i < customerReviews.length; i++) {
        const review = customerReviews[i];
        const reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() - Math.floor(Math.random() * 90)); // Reviews from last 3 months
        
        await client.query(`
          INSERT INTO reviews (florist_id, user_id, rating, comment, created_at)
          VALUES ($1, $2, $3, $4, $5)
        `, [florist.id, review.customer.userId, review.rating, review.comment, reviewDate]);
        
        console.log(`  ✓ Added review by ${review.customer.firstName} ${review.customer.lastName} (${review.rating} stars)`);
      }
    }

    // Show final statistics
    console.log('\n📊 Review Statistics by Florist:');
    const stats = await client.query(`
      SELECT 
        f.business_name,
        f.phone,
        f.email,
        f.website,
        COUNT(r.id) as review_count,
        ROUND(AVG(r.rating), 1) as average_rating
      FROM florists f 
      LEFT JOIN reviews r ON f.id = r.florist_id
      GROUP BY f.id, f.business_name, f.phone, f.email, f.website
      HAVING COUNT(r.id) > 0
      ORDER BY f.id
    `);
    
    stats.rows.forEach(row => {
      console.log(`\n${row.business_name}:`);
      console.log(`  📞 Phone: ${row.phone || 'Not provided'}`);
      console.log(`  📧 Email: ${row.email || 'Not provided'}`);
      console.log(`  🌐 Website: ${row.website || 'Not provided'}`);
      console.log(`  ⭐ ${row.review_count} reviews, ${row.average_rating} average rating`);
    });

    console.log('\n✅ Successfully created realistic customer review data with full contact information!');

  } catch (error) {
    console.error('Error creating reviews:', error);
  } finally {
    await client.end();
  }
}

createRealisticReviews().catch(console.error);