const { Client } = require('pg');

async function createComprehensiveFlorists() {
  const client = new Client({
    connectionString: 'postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Clear existing florists (except the ones already set up)
    const existingCount = await client.query('SELECT COUNT(*) as count FROM florists');
    console.log(`Current florists: ${existingCount.rows[0].count}`);

    // Comprehensive florist data for NYC metro area
    const floristsData = [
      // Manhattan
      { businessName: "Manhattan Rose Garden", city: "New York", state: "NY", zipCode: "10001", area: "Manhattan", phone: "(212) 555-0101", email: "manhattan.roses@gmail.com", website: "https://manhattanrosegarden.com" },
      { businessName: "Central Park Florals", city: "New York", state: "NY", zipCode: "10019", area: "Manhattan", phone: "(212) 555-0102", email: "centralpark.florals@gmail.com", website: "https://centralparkflorals.com" },
      { businessName: "SoHo Bloom Studio", city: "New York", state: "NY", zipCode: "10012", area: "Manhattan", phone: "(212) 555-0103", email: "soho.bloom@gmail.com", website: "https://sohobloom.com" },
      { businessName: "Upper East Side Gardens", city: "New York", state: "NY", zipCode: "10021", area: "Manhattan", phone: "(212) 555-0104", email: "ues.gardens@gmail.com", website: "https://uesgardens.com" },
      { businessName: "Tribeca Flower Market", city: "New York", state: "NY", zipCode: "10013", area: "Manhattan", phone: "(212) 555-0105", email: "tribeca.flowers@gmail.com", website: "https://tribecaflowers.com" },
      { businessName: "Chelsea Floral Design", city: "New York", state: "NY", zipCode: "10011", area: "Manhattan", phone: "(212) 555-0106", email: "chelsea.floral@gmail.com", website: "https://chelseafloral.com" },
      { businessName: "Greenwich Village Blooms", city: "New York", state: "NY", zipCode: "10014", area: "Manhattan", phone: "(212) 555-0107", email: "village.blooms@gmail.com", website: "https://villagebloms.com" },
      { businessName: "Midtown Flower Gallery", city: "New York", state: "NY", zipCode: "10018", area: "Manhattan", phone: "(212) 555-0108", email: "midtown.gallery@gmail.com", website: "https://midtownflowers.com" },

      // Brooklyn
      { businessName: "Brooklyn Heights Florals", city: "Brooklyn", state: "NY", zipCode: "11201", area: "Brooklyn", phone: "(718) 555-0201", email: "bk.heights@gmail.com", website: "https://bkheightsflorals.com" },
      { businessName: "Williamsburg Flower Co", city: "Brooklyn", state: "NY", zipCode: "11211", area: "Brooklyn", phone: "(718) 555-0202", email: "williamsburg.flowers@gmail.com", website: "https://williamsburgflowers.com" },
      { businessName: "Park Slope Petals", city: "Brooklyn", state: "NY", zipCode: "11215", area: "Brooklyn", phone: "(718) 555-0203", email: "parkslope.petals@gmail.com", website: "https://parkslopepetals.com" },
      { businessName: "DUMBO Garden Studio", city: "Brooklyn", state: "NY", zipCode: "11201", area: "Brooklyn", phone: "(718) 555-0204", email: "dumbo.garden@gmail.com", website: "https://dumbogarden.com" },
      { businessName: "Bay Ridge Blooms", city: "Brooklyn", state: "NY", zipCode: "11209", area: "Brooklyn", phone: "(718) 555-0205", email: "bayridge.blooms@gmail.com", website: "https://bayridgeblooms.com" },

      // Queens
      { businessName: "Astoria Flower Market", city: "Astoria", state: "NY", zipCode: "11102", area: "Queens", phone: "(718) 555-0301", email: "astoria.flowers@gmail.com", website: "https://astoriaflowers.com" },
      { businessName: "Flushing Gardens", city: "Flushing", state: "NY", zipCode: "11354", area: "Queens", phone: "(718) 555-0302", email: "flushing.gardens@gmail.com", website: "https://flushinggardens.com" },
      { businessName: "Long Island City Blooms", city: "Long Island City", state: "NY", zipCode: "11101", area: "Queens", phone: "(718) 555-0303", email: "lic.blooms@gmail.com", website: "https://licblooms.com" },
      { businessName: "Forest Hills Florals", city: "Forest Hills", state: "NY", zipCode: "11375", area: "Queens", phone: "(718) 555-0304", email: "foresthills.florals@gmail.com", website: "https://foresthillsflorals.com" },

      // Bronx
      { businessName: "Bronx Botanical Designs", city: "Bronx", state: "NY", zipCode: "10451", area: "Bronx", phone: "(718) 555-0401", email: "bronx.botanical@gmail.com", website: "https://bronxbotanical.com" },
      { businessName: "Riverdale Rose Garden", city: "Bronx", state: "NY", zipCode: "10463", area: "Bronx", phone: "(718) 555-0402", email: "riverdale.roses@gmail.com", website: "https://riverdalerosegarden.com" },

      // Staten Island
      { businessName: "Staten Island Flower Shop", city: "Staten Island", state: "NY", zipCode: "10301", area: "Staten Island", phone: "(718) 555-0501", email: "si.flowers@gmail.com", website: "https://siflowers.com" },
      { businessName: "St. George Blooms", city: "Staten Island", state: "NY", zipCode: "10301", area: "Staten Island", phone: "(718) 555-0502", email: "stgeorge.blooms@gmail.com", website: "https://stgeorgeblooms.com" },

      // New Jersey Cities
      { businessName: "Jersey City Florals", city: "Jersey City", state: "NJ", zipCode: "07302", area: "Jersey City", phone: "(201) 555-0601", email: "jc.florals@gmail.com", website: "https://jerseycityflorals.com" },
      { businessName: "Hoboken Flower Market", city: "Hoboken", state: "NJ", zipCode: "07030", area: "Hoboken", phone: "(201) 555-0602", email: "hoboken.flowers@gmail.com", website: "https://hobokenflowers.com" },
      { businessName: "Newark Garden Center", city: "Newark", state: "NJ", zipCode: "07102", area: "Newark", phone: "(973) 555-0603", email: "newark.garden@gmail.com", website: "https://newarkgarden.com" },
      { businessName: "Princeton Petals", city: "Princeton", state: "NJ", zipCode: "08540", area: "Princeton", phone: "(609) 555-0604", email: "princeton.petals@gmail.com", website: "https://princetonpetals.com" },
      { businessName: "Montclair Flower Studio", city: "Montclair", state: "NJ", zipCode: "07042", area: "Montclair", phone: "(973) 555-0605", email: "montclair.flowers@gmail.com", website: "https://montclairflowers.com" },
      { businessName: "Paterson Rose Garden", city: "Paterson", state: "NJ", zipCode: "07501", area: "Paterson", phone: "(973) 555-0606", email: "paterson.roses@gmail.com", website: "https://patersonroses.com" },

      // Rochester, NY
      { businessName: "Rochester Flower Gallery", city: "Rochester", state: "NY", zipCode: "14604", area: "Rochester", phone: "(585) 555-0701", email: "rochester.gallery@gmail.com", website: "https://rochesterflowergallery.com" },
      { businessName: "Lilac City Blooms", city: "Rochester", state: "NY", zipCode: "14607", area: "Rochester", phone: "(585) 555-0702", email: "lilaccity.blooms@gmail.com", website: "https://lilaccityblooms.com" },
      { businessName: "Park Avenue Florals", city: "Rochester", state: "NY", zipCode: "14607", area: "Rochester", phone: "(585) 555-0703", email: "parkave.florals@gmail.com", website: "https://parkaveflorals.com" },

      // Buffalo, NY
      { businessName: "Buffalo Botanical Designs", city: "Buffalo", state: "NY", zipCode: "14202", area: "Buffalo", phone: "(716) 555-0801", email: "buffalo.botanical@gmail.com", website: "https://buffalobotanical.com" },
      { businessName: "Elmwood Village Flowers", city: "Buffalo", state: "NY", zipCode: "14222", area: "Buffalo", phone: "(716) 555-0802", email: "elmwood.flowers@gmail.com", website: "https://elmwoodflowers.com" },
      { businessName: "Queen City Garden Studio", city: "Buffalo", state: "NY", zipCode: "14201", area: "Buffalo", phone: "(716) 555-0803", email: "queencity.garden@gmail.com", website: "https://queencitygarden.com" },

      // Long Island
      { businessName: "Hamptons Flower Market", city: "Southampton", state: "NY", zipCode: "11968", area: "Long Island", phone: "(631) 555-0901", email: "hamptons.flowers@gmail.com", website: "https://hamptonsflowers.com" },
      { businessName: "Garden City Blooms", city: "Garden City", state: "NY", zipCode: "11530", area: "Long Island", phone: "(516) 555-0902", email: "gardencity.blooms@gmail.com", website: "https://gardencityblooms.com" },
      { businessName: "Huntington Florals", city: "Huntington", state: "NY", zipCode: "11743", area: "Long Island", phone: "(631) 555-0903", email: "huntington.florals@gmail.com", website: "https://huntingtonflorals.com" },

      // Additional NYC Area
      { businessName: "Westchester Rose Garden", city: "White Plains", state: "NY", zipCode: "10601", area: "Westchester", phone: "(914) 555-1001", email: "westchester.roses@gmail.com", website: "https://westchesterroses.com" },
      { businessName: "Yonkers Flower Studio", city: "Yonkers", state: "NY", zipCode: "10701", area: "Westchester", phone: "(914) 555-1002", email: "yonkers.flowers@gmail.com", website: "https://yonkersflowers.com" },
      { businessName: "New Rochelle Blooms", city: "New Rochelle", state: "NY", zipCode: "10801", area: "Westchester", phone: "(914) 555-1003", email: "newrochelle.blooms@gmail.com", website: "https://newrochelleblooms.com" },

      // Connecticut (nearby)
      { businessName: "Stamford Garden Center", city: "Stamford", state: "CT", zipCode: "06901", area: "Connecticut", phone: "(203) 555-1101", email: "stamford.garden@gmail.com", website: "https://stamfordgarden.com" },
      { businessName: "Greenwich Flower Market", city: "Greenwich", state: "CT", zipCode: "06830", area: "Connecticut", phone: "(203) 555-1102", email: "greenwich.flowers@gmail.com", website: "https://greenwichflowers.com" },

      // Upstate NY
      { businessName: "Albany Floral Design", city: "Albany", state: "NY", zipCode: "12201", area: "Albany", phone: "(518) 555-1201", email: "albany.floral@gmail.com", website: "https://albanyfloral.com" },
      { businessName: "Syracuse Garden Studio", city: "Syracuse", state: "NY", zipCode: "13201", area: "Syracuse", phone: "(315) 555-1301", email: "syracuse.garden@gmail.com", website: "https://syracusegarden.com" },
      { businessName: "Ithaca Flower Co", city: "Ithaca", state: "NY", zipCode: "14850", area: "Ithaca", phone: "(607) 555-1401", email: "ithaca.flowers@gmail.com", website: "https://ithacaflowers.com" },

      // Additional NJ
      { businessName: "Atlantic City Blooms", city: "Atlantic City", state: "NJ", zipCode: "08401", area: "Atlantic City", phone: "(609) 555-1501", email: "ac.blooms@gmail.com", website: "https://atlanticcityblooms.com" },
      { businessName: "Trenton Rose Garden", city: "Trenton", state: "NJ", zipCode: "08601", area: "Trenton", phone: "(609) 555-1502", email: "trenton.roses@gmail.com", website: "https://trentonroses.com" },
      { businessName: "Camden Flower Market", city: "Camden", state: "NJ", zipCode: "08101", area: "Camden", phone: "(856) 555-1503", email: "camden.flowers@gmail.com", website: "https://camdenflowers.com" },

      // More variety
      { businessName: "Floral Expressions NYC", city: "New York", state: "NY", zipCode: "10016", area: "Manhattan", phone: "(212) 555-1601", email: "expressions.nyc@gmail.com", website: "https://floralexpressionsnyc.com" },
      { businessName: "Brooklyn Artisan Flowers", city: "Brooklyn", state: "NY", zipCode: "11238", area: "Brooklyn", phone: "(718) 555-1602", email: "artisan.brooklyn@gmail.com", website: "https://brooklynartisanflowers.com" },
      { businessName: "Queens Botanical Market", city: "Jamaica", state: "NY", zipCode: "11432", area: "Queens", phone: "(718) 555-1603", email: "botanical.queens@gmail.com", website: "https://queensbotanical.com" }
    ];

    console.log(`\nCreating ${floristsData.length} comprehensive florist profiles...`);

    // Create comprehensive florist data
    for (let i = 0; i < floristsData.length; i++) {
      const florist = floristsData[i];
      
      // Create florist auth record first
      const authQuery = `
        INSERT INTO florist_auth (email, password_hash, first_name, last_name, is_verified)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      
      const firstName = florist.businessName.split(' ')[0];
      const lastName = "Owner";
      
      try {
        const authResult = await client.query(authQuery, [
          florist.email,
          '$2b$10$dummy.hash.for.testing.purposes.only',
          firstName,
          lastName,
          true
        ]);
        
        const authId = authResult.rows[0].id;
        
        // Create business profile
        const profileQuery = `
          INSERT INTO florists (
            user_id, email, phone, business_name, address, city, state, zip_code,
            website, profile_summary, years_of_experience, specialties, services, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `;
        
        await client.query(profileQuery, [
          authId,
          florist.email,
          florist.phone,
          florist.businessName,
          `123 Main St, ${florist.area}`,
          florist.city,
          florist.state,
          florist.zipCode,
          florist.website,
          `Professional florist serving ${florist.area} with beautiful arrangements for all occasions.`,
          Math.floor(Math.random() * 15) + 5, // 5-20 years experience
          [
            "Wedding Arrangements",
            "Corporate Events", 
            "Sympathy Flowers",
            "Birthday Bouquets",
            "Anniversary Arrangements"
          ].slice(0, Math.floor(Math.random() * 3) + 2), // 2-5 specialties
          [
            "Same-Day Delivery",
            "Custom Arrangements", 
            "Event Setup",
            "Consultation",
            "Wedding Planning"
          ].slice(0, Math.floor(Math.random() * 3) + 2), // 2-5 services
          true
        ]);
        
        console.log(`✓ Created ${florist.businessName} in ${florist.city}, ${florist.state}`);
        
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⚠ Skipped ${florist.businessName} (already exists)`);
        } else {
          console.log(`✗ Error creating ${florist.businessName}:`, error.message);
        }
      }
    }

    // Show final count
    const finalCount = await client.query('SELECT COUNT(*) as count FROM florists');
    console.log(`\n📊 Total florists in database: ${finalCount.rows[0].count}`);
    
    // Show distribution by area
    const distribution = await client.query(`
      SELECT city, state, COUNT(*) as count 
      FROM florists 
      GROUP BY city, state 
      ORDER BY count DESC, city
    `);
    
    console.log('\n🗺 Geographic Distribution:');
    distribution.rows.forEach(row => {
      console.log(`  ${row.city}, ${row.state}: ${row.count} florists`);
    });

    console.log('\n✅ Comprehensive florist database created successfully!');

  } catch (error) {
    console.error('Error creating florist database:', error);
  } finally {
    await client.end();
  }
}

createComprehensiveFlorists().catch(console.error);