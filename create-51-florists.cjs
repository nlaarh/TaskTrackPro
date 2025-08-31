const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Railway PostgreSQL connection
const pool = new Pool({
  connectionString: "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb",
  ssl: false
});

const floristData = [
  // New York City (15 florists)
  { businessName: "Manhattan Bloom Studio", city: "New York", state: "NY", email: "info@manhattanbloom.com", firstName: "Sarah", lastName: "Chen", phone: "212-555-0101", website: "www.manhattanbloom.com", specialties: ["weddings", "corporate events", "luxury arrangements"], profileSummary: "Premier luxury florist serving Manhattan's elite with exquisite arrangements since 2015", yearsOfExperience: 8 },
  { businessName: "Brooklyn Botanical Designs", city: "Brooklyn", state: "NY", email: "hello@brooklynbotanical.com", firstName: "Maria", lastName: "Rodriguez", phone: "718-555-0102", website: "www.brooklynbotanical.com", specialties: ["sustainable flowers", "weddings", "funeral arrangements"], profileSummary: "Eco-conscious florist specializing in locally-sourced and sustainable floral arrangements", yearsOfExperience: 12 },
  { businessName: "Queens Garden Florist", city: "Queens", state: "NY", email: "orders@queensgarden.com", firstName: "Ahmed", lastName: "Hassan", phone: "718-555-0103", website: "www.queensgarden.com", specialties: ["birthday arrangements", "anniversary bouquets", "sympathy flowers"], profileSummary: "Family-owned florist serving Queens community with fresh, affordable arrangements for over 20 years", yearsOfExperience: 22 },
  { businessName: "Tribeca Flower Boutique", city: "New York", state: "NY", email: "contact@tribecaflower.com", firstName: "Isabella", lastName: "Martinez", phone: "212-555-0104", website: "www.tribecaflower.com", specialties: ["modern arrangements", "corporate events", "holiday decorations"], profileSummary: "Contemporary florist creating innovative arrangements for Tribeca's discerning clientele", yearsOfExperience: 6 },
  { businessName: "Harlem Heritage Flowers", city: "New York", state: "NY", email: "info@harlemheritage.com", firstName: "Jasmine", lastName: "Williams", phone: "212-555-0105", website: "www.harlemheritage.com", specialties: ["cultural celebrations", "weddings", "community events"], profileSummary: "Celebrating Harlem's rich cultural heritage through vibrant, meaningful floral designs", yearsOfExperience: 15 },
  { businessName: "Bronx Bloom Co", city: "Bronx", state: "NY", email: "hello@bronxbloom.com", firstName: "Carlos", lastName: "Morales", phone: "718-555-0106", website: "www.bronxbloom.com", specialties: ["quinceañeras", "baptisms", "graduation arrangements"], profileSummary: "Proudly serving the Bronx community with beautiful arrangements for life's special moments", yearsOfExperience: 9 },
  { businessName: "Staten Island Floral Design", city: "Staten Island", state: "NY", email: "orders@sifloral.com", firstName: "Jennifer", lastName: "Romano", phone: "718-555-0107", website: "www.sifloral.com", specialties: ["wedding bouquets", "prom corsages", "funeral tributes"], profileSummary: "Staten Island's trusted florist for elegant arrangements and personalized service since 2010", yearsOfExperience: 13 },
  { businessName: "Central Park Flowers", city: "New York", state: "NY", email: "info@centralparkflowers.com", firstName: "Michael", lastName: "O'Brien", phone: "212-555-0108", website: "www.centralparkflowers.com", specialties: ["seasonal arrangements", "garden parties", "romantic bouquets"], profileSummary: "Inspired by Central Park's natural beauty, creating arrangements that capture nature's essence", yearsOfExperience: 11 },
  { businessName: "Lower East Side Blooms", city: "New York", state: "NY", email: "contact@lesbloom.com", firstName: "Rachel", lastName: "Goldstein", phone: "212-555-0109", website: "www.lesbloom.com", specialties: ["vintage arrangements", "intimate weddings", "art gallery events"], profileSummary: "Artistic florist blending vintage charm with contemporary style in the heart of LES", yearsOfExperience: 7 },
  { businessName: "Chelsea Market Florals", city: "New York", state: "NY", email: "hello@chelseamarketflorals.com", firstName: "David", lastName: "Kim", phone: "212-555-0110", website: "www.chelseamarketflorals.com", specialties: ["market-fresh arrangements", "daily deliveries", "subscription services"], profileSummary: "Fresh daily selections from Chelsea Market, bringing farm-to-vase quality to your door", yearsOfExperience: 5 },
  { businessName: "Upper East Side Elegance", city: "New York", state: "NY", email: "info@ueselegance.com", firstName: "Patricia", lastName: "Vanderbilt", phone: "212-555-0111", website: "www.ueselegance.com", specialties: ["high-end weddings", "penthouse events", "luxury hotels"], profileSummary: "Exclusive florist serving Manhattan's most prestigious addresses with unparalleled elegance", yearsOfExperience: 18 },
  { businessName: "Greenwich Village Petals", city: "New York", state: "NY", email: "orders@gvpetals.com", firstName: "Antonio", lastName: "Rossi", phone: "212-555-0112", website: "www.gvpetals.com", specialties: ["bohemian arrangements", "artist studios", "cafe displays"], profileSummary: "Bohemian florist capturing Greenwich Village's artistic spirit in every arrangement", yearsOfExperience: 10 },
  { businessName: "Times Square Bloom Bar", city: "New York", state: "NY", email: "contact@tsbloombar.com", firstName: "Stephanie", lastName: "Johnson", phone: "212-555-0113", website: "www.tsbloombar.com", specialties: ["theater opening nights", "Broadway shows", "tourist attractions"], profileSummary: "Broadway's go-to florist for opening nights and special theater events in the heart of Times Square", yearsOfExperience: 8 },
  { businessName: "SoHo Floral Studio", city: "New York", state: "NY", email: "hello@sohofloralstudio.com", firstName: "Alexandra", lastName: "Petrov", phone: "212-555-0114", website: "www.sohofloralstudio.com", specialties: ["fashion week events", "gallery openings", "photo shoots"], profileSummary: "SoHo's premier florist for fashion and art events, creating stunning backdrops for creative industries", yearsOfExperience: 6 },
  { businessName: "Washington Heights Flowers", city: "New York", state: "NY", email: "info@whflowers.com", firstName: "Luis", lastName: "Hernandez", phone: "212-555-0115", website: "www.whflowers.com", specialties: ["Dominican celebrations", "community events", "family gatherings"], profileSummary: "Celebrating Washington Heights' vibrant Dominican culture with colorful, joyful arrangements", yearsOfExperience: 14 },

  // New Jersey (12 florists)
  { businessName: "Princeton Garden Florist", city: "Princeton", state: "NJ", email: "orders@princetongarden.com", firstName: "Elizabeth", lastName: "Thompson", phone: "609-555-0201", website: "www.princetongarden.com", specialties: ["university events", "graduation ceremonies", "academic celebrations"], profileSummary: "Serving Princeton University and surrounding community with scholarly elegance and seasonal beauty", yearsOfExperience: 16 },
  { businessName: "Newark Urban Blooms", city: "Newark", state: "NJ", email: "hello@newarkblooms.com", firstName: "Keisha", lastName: "Washington", phone: "973-555-0202", website: "www.newarkblooms.com", specialties: ["urban gardening", "community workshops", "affordable arrangements"], profileSummary: "Bringing beauty to Newark through community-focused floral design and urban gardening initiatives", yearsOfExperience: 11 },
  { businessName: "Jersey City Heights Florals", city: "Jersey City", state: "NJ", email: "info@jcheightsfloral.com", firstName: "Thomas", lastName: "Murphy", phone: "201-555-0203", website: "www.jcheightsfloral.com", specialties: ["Manhattan deliveries", "corporate accounts", "weekly subscriptions"], profileSummary: "Strategically located to serve both Jersey City and Manhattan with premium floral services", yearsOfExperience: 9 },
  { businessName: "Atlantic City Boardwalk Blooms", city: "Atlantic City", state: "NJ", email: "contact@acboardwalkblooms.com", firstName: "Susan", lastName: "Garcia", phone: "609-555-0204", website: "www.acboardwalkblooms.com", specialties: ["casino events", "hotel lobbies", "convention centers"], profileSummary: "Atlantic City's premier florist for casino events, conventions, and boardwalk celebrations", yearsOfExperience: 13 },
  { businessName: "Hoboken Harbor Flowers", city: "Hoboken", state: "NJ", email: "orders@hobokenharbor.com", firstName: "Daniel", lastName: "Kowalski", phone: "201-555-0205", website: "www.hobokenharbor.com", specialties: ["waterfront weddings", "nautical themes", "yacht parties"], profileSummary: "Waterfront florist specializing in nautical-themed arrangements and harbor view celebrations", yearsOfExperience: 7 },
  { businessName: "Camden Community Florals", city: "Camden", state: "NJ", email: "hello@camdenfloral.com", firstName: "Maria", lastName: "Santos", phone: "856-555-0206", website: "www.camdenfloral.com", specialties: ["community gardens", "school events", "neighborhood celebrations"], profileSummary: "Grassroots florist working to beautify Camden through community partnerships and local events", yearsOfExperience: 12 },
  { businessName: "Trenton State House Flowers", city: "Trenton", state: "NJ", email: "info@trentonstatehouse.com", firstName: "Robert", lastName: "Wilson", phone: "609-555-0207", website: "www.trentonstatehouse.com", specialties: ["government events", "political ceremonies", "state functions"], profileSummary: "Official florist for New Jersey state government events and political ceremonies", yearsOfExperience: 20 },
  { businessName: "Paterson Falls Florals", city: "Paterson", state: "NJ", email: "contact@patersonfalls.com", firstName: "Fatima", lastName: "Al-Hassan", phone: "973-555-0208", website: "www.patersonfalls.com", specialties: ["Middle Eastern celebrations", "multicultural events", "religious ceremonies"], profileSummary: "Celebrating Paterson's diverse community with culturally-inspired floral arrangements", yearsOfExperience: 8 },
  { businessName: "Edison Innovation Blooms", city: "Edison", state: "NJ", email: "orders@edisonblooms.com", firstName: "Priya", lastName: "Patel", phone: "732-555-0209", website: "www.edisonblooms.com", specialties: ["tech company events", "innovation ceremonies", "Indian celebrations"], profileSummary: "Modern florist serving Edison's tech corridor with innovative arrangements for forward-thinking companies", yearsOfExperience: 6 },
  { businessName: "New Brunswick University Florals", city: "New Brunswick", state: "NJ", email: "hello@nbuniversity.com", firstName: "James", lastName: "Anderson", phone: "732-555-0210", website: "www.nbuniversity.com", specialties: ["Rutgers events", "graduation ceremonies", "research celebrations"], profileSummary: "Proud partner of Rutgers University, celebrating academic achievements and campus events", yearsOfExperience: 15 },
  { businessName: "Cape May Victorian Flowers", city: "Cape May", state: "NJ", email: "info@capemayvictorian.com", firstName: "Margaret", lastName: "Whitman", phone: "609-555-0211", website: "www.capemayvictorian.com", specialties: ["Victorian arrangements", "bed & breakfast displays", "historic tours"], profileSummary: "Preserving Cape May's Victorian charm through period-appropriate floral arrangements", yearsOfExperience: 19 },
  { businessName: "Asbury Park Music Florals", city: "Asbury Park", state: "NJ", email: "contact@apmusicfloral.com", firstName: "Michelle", lastName: "Stone", phone: "732-555-0212", website: "www.apmusicfloral.com", specialties: ["concert venues", "music festivals", "boardwalk events"], profileSummary: "Rock and roll florist bringing musical energy to Asbury Park's legendary music scene", yearsOfExperience: 10 },

  // Rochester, NY (12 florists)
  { businessName: "Rochester Rose Gardens", city: "Rochester", state: "NY", email: "info@rochesterrose.com", firstName: "Linda", lastName: "Foster", phone: "585-555-0301", website: "www.rochesterrose.com", specialties: ["rose gardens", "romantic weddings", "anniversary celebrations"], profileSummary: "Rochester's rose specialists, creating romantic arrangements inspired by our city's famous gardens", yearsOfExperience: 21 },
  { businessName: "Finger Lakes Florals", city: "Rochester", state: "NY", email: "orders@fingerlakesflorals.com", firstName: "Mark", lastName: "Stevens", phone: "585-555-0302", website: "www.fingerlakesflorals.com", specialties: ["winery events", "vineyard weddings", "wine country celebrations"], profileSummary: "Capturing the beauty of Finger Lakes wine country in elegant, nature-inspired arrangements", yearsOfExperience: 14 },
  { businessName: "East Rochester Blooms", city: "Rochester", state: "NY", email: "hello@eastrochester.com", firstName: "Angela", lastName: "Davis", phone: "585-555-0303", website: "www.eastrochester.com", specialties: ["neighborhood events", "family celebrations", "seasonal displays"], profileSummary: "Community-focused florist serving East Rochester with personalized service and fresh arrangements", yearsOfExperience: 8 },
  { businessName: "Genesee River Florals", city: "Rochester", state: "NY", email: "contact@geneseeriver.com", firstName: "Brian", lastName: "Clark", phone: "585-555-0304", website: "www.geneseeriver.com", specialties: ["waterfront events", "river weddings", "outdoor ceremonies"], profileSummary: "Riverside florist specializing in outdoor ceremonies and events along the beautiful Genesee River", yearsOfExperience: 12 },
  { businessName: "Highland Park Flowers", city: "Rochester", state: "NY", email: "info@highlandparkflowers.com", firstName: "Nancy", lastName: "Miller", phone: "585-555-0305", website: "www.highlandparkflowers.com", specialties: ["lilac festivals", "spring celebrations", "park events"], profileSummary: "Celebrating Rochester's famous Lilac Festival and Highland Park's natural beauty year-round", yearsOfExperience: 17 },
  { businessName: "Strong Museum Event Florals", city: "Rochester", state: "NY", email: "orders@strongmuseum.com", firstName: "Jennifer", lastName: "Taylor", phone: "585-555-0306", website: "www.strongmuseum.com", specialties: ["museum events", "educational programs", "family celebrations"], profileSummary: "Official florist for Strong National Museum of Play, creating educational and fun arrangements", yearsOfExperience: 9 },
  { businessName: "University of Rochester Blooms", city: "Rochester", state: "NY", email: "hello@urochester.com", firstName: "Paul", lastName: "Johnson", phone: "585-555-0307", website: "www.urochester.com", specialties: ["academic ceremonies", "research celebrations", "campus events"], profileSummary: "Serving University of Rochester campus with scholarly elegance and academic tradition", yearsOfExperience: 13 },
  { businessName: "Rochester Institute Florals", city: "Rochester", state: "NY", email: "contact@ritflorals.com", firstName: "Lisa", lastName: "Brown", phone: "585-555-0308", website: "www.ritflorals.com", specialties: ["tech events", "innovation ceremonies", "student celebrations"], profileSummary: "Modern florist serving RIT's innovative community with cutting-edge floral designs", yearsOfExperience: 7 },
  { businessName: "Park Avenue District Flowers", city: "Rochester", state: "NY", email: "info@parkavenueflowers.com", firstName: "Karen", lastName: "Wilson", phone: "585-555-0309", website: "www.parkavenueflowers.com", specialties: ["boutique events", "upscale dining", "gallery openings"], profileSummary: "Upscale florist serving Park Avenue's dining and cultural district with sophisticated arrangements", yearsOfExperience: 11 },
  { businessName: "Pittsford Village Florals", city: "Rochester", state: "NY", email: "orders@pittsfordvillage.com", firstName: "Dorothy", lastName: "Anderson", phone: "585-555-0310", website: "www.pittsfordvillage.com", specialties: ["village events", "historic celebrations", "canal festivals"], profileSummary: "Charming village florist celebrating Pittsford's historic canal heritage and community spirit", yearsOfExperience: 16 },
  { businessName: "Rochester Public Market Blooms", city: "Rochester", state: "NY", email: "hello@rpmbloom.com", firstName: "Carlos", lastName: "Rodriguez", phone: "585-555-0311", website: "www.rpmbloom.com", specialties: ["market fresh flowers", "farmers market displays", "local sourcing"], profileSummary: "Public Market vendor bringing farm-fresh flowers directly from local growers to customers", yearsOfExperience: 6 },
  { businessName: "Corn Hill Arts Florals", city: "Rochester", state: "NY", email: "contact@cornhillarts.com", firstName: "Sandra", lastName: "Lee", phone: "585-555-0312", website: "www.cornhillarts.com", specialties: ["arts festivals", "creative workshops", "artist collaborations"], profileSummary: "Artist-florist creating unique arrangements that celebrate Rochester's vibrant arts community", yearsOfExperience: 10 },

  // Buffalo, NY (12 florists)
  { businessName: "Buffalo Elmwood Florals", city: "Buffalo", state: "NY", email: "info@elmwoodflorals.com", firstName: "Patricia", lastName: "Kowalski", phone: "716-555-0401", website: "www.elmwoodflorals.com", specialties: ["Elmwood Village events", "gallery districts", "indie celebrations"], profileSummary: "Hip florist serving Buffalo's trendy Elmwood Village with artistic, locally-inspired arrangements", yearsOfExperience: 9 },
  { businessName: "Niagara Falls Wedding Flowers", city: "Buffalo", state: "NY", email: "orders@niagarafalls.com", firstName: "Michael", lastName: "O'Connor", phone: "716-555-0402", website: "www.niagarafalls.com", specialties: ["destination weddings", "waterfall ceremonies", "honeymoon packages"], profileSummary: "Destination wedding specialist creating magical moments at Niagara Falls and surrounding areas", yearsOfExperience: 15 },
  { businessName: "Buffalo Bills Team Florals", city: "Buffalo", state: "NY", email: "hello@billsteamfloral.com", firstName: "John", lastName: "Smith", phone: "716-555-0403", website: "www.billsteamfloral.com", specialties: ["sports events", "team celebrations", "stadium displays"], profileSummary: "Official florist for Buffalo Bills, bringing team spirit to sports celebrations and victory parties", yearsOfExperience: 12 },
  { businessName: "Canalside Event Flowers", city: "Buffalo", state: "NY", email: "contact@canalsideflowers.com", firstName: "Maria", lastName: "Giuseppe", phone: "716-555-0404", website: "www.canalsideflowers.com", specialties: ["waterfront events", "outdoor concerts", "festival displays"], profileSummary: "Waterfront event specialist serving Canalside's concerts, festivals, and outdoor celebrations", yearsOfExperience: 8 },
  { businessName: "Buffalo State College Blooms", city: "Buffalo", state: "NY", email: "info@buffalostatefloral.com", firstName: "Sarah", lastName: "Johnson", phone: "716-555-0405", website: "www.buffalostatefloral.com", specialties: ["graduation ceremonies", "academic events", "student celebrations"], profileSummary: "Proud partner of Buffalo State College, celebrating student achievements and campus milestones", yearsOfExperience: 11 },
  { businessName: "Allentown Arts District Florals", city: "Buffalo", state: "NY", email: "orders@allentownarts.com", firstName: "Rebecca", lastName: "Martinez", phone: "716-555-0406", website: "www.allentownarts.com", specialties: ["gallery openings", "theater events", "artistic collaborations"], profileSummary: "Creative florist celebrating Allentown's historic arts district with innovative, artistic arrangements", yearsOfExperience: 7 },
  { businessName: "Buffalo Zoo Garden Blooms", city: "Buffalo", state: "NY", email: "hello@buffalozoo.com", firstName: "Thomas", lastName: "Williams", phone: "716-555-0407", website: "www.buffalozoo.com", specialties: ["zoo events", "animal-themed parties", "conservation celebrations"], profileSummary: "Official florist for Buffalo Zoo, creating wild and wonderful arrangements for conservation events", yearsOfExperience: 14 },
  { businessName: "Delaware Park Flowers", city: "Buffalo", state: "NY", email: "contact@delawarepark.com", firstName: "Katherine", lastName: "Brown", phone: "716-555-0408", website: "www.delawarepark.com", specialties: ["park weddings", "outdoor ceremonies", "nature celebrations"], profileSummary: "Park wedding specialist creating beautiful outdoor ceremonies in Delaware Park's natural setting", yearsOfExperience: 13 },
  { businessName: "Buffalo Botanical Gardens", city: "Buffalo", state: "NY", email: "info@buffalobotanical.com", firstName: "Dr. Helen", lastName: "Thompson", phone: "716-555-0409", website: "www.buffalobotanical.com", specialties: ["botanical education", "conservatory events", "exotic arrangements"], profileSummary: "Educational florist at Buffalo Botanical Gardens, sharing botanical knowledge through beautiful displays", yearsOfExperience: 18 },
  { businessName: "East Aurora Village Florals", city: "Buffalo", state: "NY", email: "orders@eastauror.com", firstName: "Mary", lastName: "Davis", phone: "716-555-0410", website: "www.eastaurora.com", specialties: ["village charm", "antique arrangements", "historic celebrations"], profileSummary: "Charming village florist preserving East Aurora's historic character through period-inspired arrangements", yearsOfExperience: 16 },
  { businessName: "Buffalo Sabres Arena Flowers", city: "Buffalo", state: "NY", email: "hello@sabresarena.com", firstName: "David", lastName: "Miller", phone: "716-555-0411", website: "www.sabresarena.com", specialties: ["hockey celebrations", "arena events", "championship parties"], profileSummary: "Official florist for Buffalo Sabres, bringing hockey spirit to sports celebrations and fan events", yearsOfExperience: 10 },
  { businessName: "Buffalo Harbor Lights Florals", city: "Buffalo", state: "NY", email: "contact@harborlights.com", firstName: "Jennifer", lastName: "Wilson", phone: "716-555-0412", website: "www.harborlights.com", specialties: ["harbor events", "lighthouse celebrations", "maritime themes"], profileSummary: "Maritime florist celebrating Buffalo's Great Lakes heritage with nautical-themed arrangements", yearsOfExperience: 6 }
];

async function create51Florists() {
  console.log('🌺 Creating 51 comprehensive florist test data...');
  
  try {
    // Clear existing florist_auth data (keep the successful ones but start fresh)
    console.log('📝 Starting fresh florist data creation...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < floristData.length; i++) {
      const florist = floristData[i];
      const id = i + 100; // Start from 100 to avoid conflicts
      
      try {
        // Hash password 
        const hashedPassword = await bcrypt.hash('Password123!', 10);
        
        // Create profile image placeholder (we'll add real ones later)
        const profileImagePlaceholder = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
        
        console.log(`  Creating florist ${i + 1}/51: ${florist.businessName} in ${florist.city}, ${florist.state}`);
        
        await pool.query(`
          INSERT INTO florist_auth (
            id, email, first_name, last_name, business_name, city, state, phone, 
            website, specialties, profile_summary, years_of_experience, 
            is_verified, created_at, password_hash, profile_image_url,
            address, zip_code
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT (id) DO UPDATE SET
            business_name = EXCLUDED.business_name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            website = EXCLUDED.website,
            specialties = EXCLUDED.specialties,
            profile_summary = EXCLUDED.profile_summary
        `, [
          id,
          florist.email,
          florist.firstName,
          florist.lastName,
          florist.businessName,
          florist.city,
          florist.state,
          florist.phone,
          florist.website,
          florist.specialties,
          florist.profileSummary,
          florist.yearsOfExperience,
          true, // is_verified
          new Date(),
          hashedPassword,
          profileImagePlaceholder,
          `${Math.floor(Math.random() * 9999) + 1} Main St`, // Random address
          `${Math.floor(Math.random() * 90000) + 10000}` // Random zip
        ]);
        
        successCount++;
        
      } catch (error) {
        console.error(`  ❌ Error creating florist ${florist.businessName}:`, error.message);
        errorCount++;
      }
    }
    
    // Summary
    console.log(`\n✅ FLORIST CREATION COMPLETE!`);
    console.log(`   Successfully created: ${successCount} florists`);
    console.log(`   Errors: ${errorCount}`);
    
    // Verify final count
    const result = await pool.query('SELECT COUNT(*) FROM florist_auth');
    console.log(`   Total florists in database: ${result.rows[0].count}`);
    
    // Show breakdown by location
    const locationResult = await pool.query(`
      SELECT city, state, COUNT(*) as count 
      FROM florist_auth 
      GROUP BY city, state 
      ORDER BY state, city
    `);
    
    console.log('\n📍 FLORIST LOCATIONS:');
    locationResult.rows.forEach(row => {
      console.log(`   ${row.city}, ${row.state}: ${row.count} florists`);
    });
    
  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    await pool.end();
  }
}

create51Florists();