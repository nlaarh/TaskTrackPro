/**
 * Script to create test florist data with images for different NY areas
 */

const fs = require('fs');
const path = require('path');

// Function to convert image to base64
function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64String = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).slice(1);
    return `data:image/${ext};base64,${base64String}`;
  } catch (error) {
    console.error(`Error reading image ${imagePath}:`, error.message);
    return null;
  }
}

// Test florist data
const floristData = [
  {
    // Manhattan florist
    auth: {
      email: 'manhattan.blooms@gmail.com',
      password: 'Password123!',
      firstName: 'Isabella',
      lastName: 'Rodriguez'
    },
    profile: {
      businessName: 'Manhattan Blooms',
      address: '142 W 57th St',
      city: 'New York',
      state: 'NY',
      zipCode: '10019',
      phone: '(212) 555-0142',
      website: 'https://manhattanblooms.com',
      profileSummary: 'Premier floral designer in the heart of Manhattan, specializing in luxury weddings and corporate events. Over 15 years of experience creating stunning arrangements for NYC\'s most discerning clients.',
      yearsOfExperience: 15,
      specialties: ['Wedding Arrangements', 'Corporate Events', 'Luxury Designs'],
      services: ['Same-Day Service', 'Delivery Service', 'Wedding Planning'],
      imagePath: 'attached_assets/generated_images/Manhattan_flower_shop_storefront_39b16498.png'
    }
  },
  {
    // New Jersey florist
    auth: {
      email: 'garden.elegance@gmail.com',
      password: 'Password123!',
      firstName: 'Sarah',
      lastName: 'Chen'
    },
    profile: {
      businessName: 'Garden Elegance',
      address: '245 Main Street',
      city: 'Princeton',
      state: 'NJ',
      zipCode: '08540',
      phone: '(609) 555-0245',
      website: 'https://gardenelegance.com',
      profileSummary: 'Creating timeless floral designs for New Jersey weddings and special occasions. Known for romantic, garden-inspired arrangements using locally sourced blooms.',
      yearsOfExperience: 8,
      specialties: ['Wedding Arrangements', 'Garden Style', 'Bridal Bouquets'],
      services: ['Wedding Planning', 'Delivery Service', 'Consultation'],
      imagePath: 'attached_assets/generated_images/New_Jersey_wedding_florist_0e2f9167.png'
    }
  },
  {
    // Rochester florist
    auth: {
      email: 'rochester.petals@gmail.com',
      password: 'Password123!',
      firstName: 'Michael',
      lastName: 'Thompson'
    },
    profile: {
      businessName: 'Rochester Petals & Co',
      address: '78 Park Avenue',
      city: 'Rochester',
      state: 'NY',
      zipCode: '14607',
      phone: '(585) 555-0078',
      website: 'https://rochesterpetals.com',
      profileSummary: 'Family-owned flower shop serving Rochester for over 20 years. Specializing in seasonal arrangements, sympathy flowers, and celebrating life\'s special moments with beautiful blooms.',
      yearsOfExperience: 20,
      specialties: ['Seasonal Arrangements', 'Sympathy Flowers', 'Holiday Decorations'],
      services: ['Same-Day Service', 'Delivery Service', 'Custom Arrangements'],
      imagePath: 'attached_assets/generated_images/Rochester_autumn_flower_shop_ab1d3029.png'
    }
  },
  {
    // NYC Corporate florist
    auth: {
      email: 'corporate.flowers@gmail.com',
      password: 'Password123!',
      firstName: 'David',
      lastName: 'Kim'
    },
    profile: {
      businessName: 'Executive Florals NYC',
      address: '1230 Avenue of the Americas',
      city: 'New York',
      state: 'NY',
      zipCode: '10020',
      phone: '(212) 555-1230',
      website: 'https://executivefloralsnyc.com',
      profileSummary: 'Sophisticated floral solutions for Fortune 500 companies and high-end corporate events. Contemporary designs that elevate any business environment or special occasion.',
      yearsOfExperience: 12,
      specialties: ['Corporate Events', 'Modern Designs', 'Executive Gifts'],
      services: ['Corporate Contracts', 'Same-Day Service', 'Event Planning'],
      imagePath: 'attached_assets/generated_images/NY_corporate_flower_arrangements_70c774a2.png'
    }
  }
];

async function createTestFlorists() {
  console.log('🌸 Creating test florist data with images...\n');

  for (const florist of floristData) {
    try {
      console.log(`Creating florist: ${florist.profile.businessName}`);
      
      // Convert image to base64
      const profileImageUrl = imageToBase64(florist.profile.imagePath);
      if (!profileImageUrl) {
        console.log(`❌ Failed to load image for ${florist.profile.businessName}`);
        continue;
      }

      // Step 1: Register florist auth
      const registerResponse = await fetch('http://localhost:5000/api/auth/florist/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(florist.auth)
      });

      if (!registerResponse.ok) {
        const error = await registerResponse.json();
        console.log(`⚠️  Registration issue for ${florist.auth.email}: ${error.message}`);
        // Continue anyway - might already exist
      }

      // Step 2: Login to get token
      const loginResponse = await fetch('http://localhost:5000/api/auth/florist/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: florist.auth.email,
          password: florist.auth.password
        })
      });

      if (!loginResponse.ok) {
        console.log(`❌ Login failed for ${florist.auth.email}`);
        continue;
      }

      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Step 3: Create business profile with image
      const profileData = {
        ...florist.profile,
        profileImageUrl: profileImageUrl
      };
      delete profileData.imagePath; // Remove path, not needed for API

      const profileResponse = await fetch('http://localhost:5000/api/florist/profile/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (profileResponse.ok) {
        const result = await profileResponse.json();
        console.log(`✅ ${florist.profile.businessName} created successfully`);
        console.log(`   Location: ${florist.profile.city}, ${florist.profile.state}`);
        console.log(`   Image size: ${Math.round(profileImageUrl.length / 1024)}KB`);
      } else {
        const error = await profileResponse.json();
        console.log(`❌ Profile setup failed for ${florist.profile.businessName}: ${error.message}`);
      }

    } catch (error) {
      console.log(`❌ Error creating ${florist.profile.businessName}: ${error.message}`);
    }

    console.log(''); // Add spacing
  }

  console.log('🎉 Test florist creation completed!');
}

// Run the script
createTestFlorists().catch(console.error);