const { Pool } = require('pg');

const RAILWAY_DATABASE_URL = "postgresql://postgres:RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx@yamanote.proxy.rlwy.net:18615/floristdb";

// Create professional flower arrangement images as base64
function createFlowerArrangementImage(colors, arrangement) {
  const svg = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="vase" cx="50%" cy="80%" r="30%">
        <stop offset="0%" style="stop-color:#f8f8f8"/>
        <stop offset="100%" style="stop-color:#e0e0e0"/>
      </radialGradient>
      <radialGradient id="flower1" cx="50%" cy="50%" r="40%">
        <stop offset="0%" style="stop-color:${colors.primary}"/>
        <stop offset="100%" style="stop-color:${colors.primaryDark}"/>
      </radialGradient>
      <radialGradient id="flower2" cx="50%" cy="50%" r="40%">
        <stop offset="0%" style="stop-color:${colors.secondary}"/>
        <stop offset="100%" style="stop-color:${colors.secondaryDark}"/>
      </radialGradient>
      <radialGradient id="flower3" cx="50%" cy="50%" r="40%">
        <stop offset="0%" style="stop-color:${colors.accent}"/>
        <stop offset="100%" style="stop-color:${colors.accentDark}"/>
      </radialGradient>
    </defs>
    
    <!-- Background -->
    <rect width="300" height="300" fill="#fefefe"/>
    
    <!-- Vase -->
    <ellipse cx="150" cy="250" rx="60" ry="40" fill="url(#vase)" stroke="#d0d0d0" stroke-width="2"/>
    <ellipse cx="150" cy="210" rx="45" ry="25" fill="url(#vase)" stroke="#d0d0d0" stroke-width="2"/>
    
    <!-- Stems -->
    <line x1="130" y1="210" x2="120" y2="120" stroke="#4a7c4a" stroke-width="3"/>
    <line x1="150" y1="210" x2="150" y2="100" stroke="#4a7c4a" stroke-width="3"/>
    <line x1="170" y1="210" x2="180" y2="130" stroke="#4a7c4a" stroke-width="3"/>
    <line x1="140" y1="215" x2="200" y2="140" stroke="#4a7c4a" stroke-width="2"/>
    <line x1="160" y1="215" x2="100" y2="150" stroke="#4a7c4a" stroke-width="2"/>
    
    <!-- Leaves -->
    <ellipse cx="125" cy="160" rx="8" ry="15" fill="#5a8a5a" transform="rotate(-20 125 160)"/>
    <ellipse cx="175" cy="170" rx="8" ry="15" fill="#5a8a5a" transform="rotate(25 175 170)"/>
    <ellipse cx="110" cy="180" rx="6" ry="12" fill="#5a8a5a" transform="rotate(-45 110 180)"/>
    
    <!-- Main Flowers -->
    ${arrangement.flowers.map((flower, i) => `
      <!-- Flower ${i + 1} -->
      <g transform="translate(${flower.x}, ${flower.y})">
        <!-- Petals -->
        ${Array.from({length: flower.petals}, (_, p) => {
          const angle = (360 / flower.petals) * p;
          return `<ellipse cx="${Math.cos(angle * Math.PI / 180) * 12}" cy="${Math.sin(angle * Math.PI / 180) * 12}" 
                    rx="${flower.size}" ry="${flower.size * 1.5}" 
                    fill="url(#flower${(i % 3) + 1})" 
                    transform="rotate(${angle})"/>`;
        }).join('')}
        <!-- Center -->
        <circle cx="0" cy="0" r="${flower.size * 0.4}" fill="#ffd700"/>
      </g>
    `).join('')}
    
    <!-- Small filler flowers -->
    <circle cx="190" cy="145" r="8" fill="${colors.secondary}" opacity="0.8"/>
    <circle cx="110" cy="155" r="6" fill="${colors.accent}" opacity="0.8"/>
    <circle cx="170" cy="125" r="7" fill="${colors.primary}" opacity="0.7"/>
    
    <!-- Baby's breath effect -->
    <circle cx="125" cy="140" r="2" fill="white" opacity="0.9"/>
    <circle cx="175" cy="135" r="2" fill="white" opacity="0.9"/>
    <circle cx="140" cy="160" r="2" fill="white" opacity="0.9"/>
    <circle cx="160" cy="145" r="2" fill="white" opacity="0.9"/>
    <circle cx="135" cy="125" r="2" fill="white" opacity="0.9"/>
    
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const flowerArrangements = [
  {
    colors: { primary: '#ff69b4', primaryDark: '#e75480', secondary: '#ffa500', secondaryDark: '#ff8c00', accent: '#9370db', accentDark: '#8a2be2' },
    flowers: [
      { x: 120, y: 120, petals: 6, size: 15 },
      { x: 150, y: 100, petals: 8, size: 18 },
      { x: 180, y: 130, petals: 5, size: 12 },
      { x: 200, y: 140, petals: 6, size: 14 },
      { x: 100, y: 150, petals: 7, size: 13 }
    ]
  },
  {
    colors: { primary: '#ff6b9d', primaryDark: '#e63b7a', secondary: '#c44569', secondaryDark: '#b33a5c', accent: '#f8b500', accentDark: '#e6a500' },
    flowers: [
      { x: 130, y: 110, petals: 8, size: 16 },
      { x: 155, y: 95, petals: 6, size: 20 },
      { x: 175, y: 125, petals: 7, size: 14 },
      { x: 195, y: 145, petals: 5, size: 12 },
      { x: 105, y: 160, petals: 6, size: 13 }
    ]
  },
  {
    colors: { primary: '#ff7675', primaryDark: '#e84393', secondary: '#fd79a8', secondaryDark: '#e84393', accent: '#fdcb6e', accentDark: '#f39c12' },
    flowers: [
      { x: 125, y: 115, petals: 7, size: 17 },
      { x: 160, y: 105, petals: 9, size: 19 },
      { x: 185, y: 135, petals: 6, size: 15 },
      { x: 190, y: 150, petals: 5, size: 11 },
      { x: 110, y: 145, petals: 8, size: 14 }
    ]
  },
  {
    colors: { primary: '#fab1a0', primaryDark: '#e17055', secondary: '#ff7675', secondaryDark: '#d63031', accent: '#a29bfe', accentDark: '#6c5ce7' },
    flowers: [
      { x: 135, y: 120, petals: 6, size: 16 },
      { x: 145, y: 95, petals: 8, size: 21 },
      { x: 170, y: 130, petals: 7, size: 13 },
      { x: 200, y: 145, petals: 5, size: 12 },
      { x: 115, y: 155, petals: 6, size: 14 }
    ]
  },
  {
    colors: { primary: '#e17055', primaryDark: '#d63031', secondary: '#fd79a8', secondaryDark: '#e84393', accent: '#fdcb6e', accentDark: '#f39c12' },
    flowers: [
      { x: 140, y: 125, petals: 8, size: 15 },
      { x: 150, y: 100, petals: 6, size: 18 },
      { x: 175, y: 135, petals: 7, size: 14 },
      { x: 185, y: 140, petals: 5, size: 13 },
      { x: 120, y: 150, petals: 6, size: 12 }
    ]
  }
];

async function updateAllFloristImages() {
  console.log('🌸 Creating professional flower arrangement images for all florists...');
  
  const pool = new Pool({ 
    connectionString: RAILWAY_DATABASE_URL, 
    ssl: false 
  });
  
  try {
    // Get all florists
    const floristsQuery = await pool.query(
      'SELECT id, business_name FROM florist_auth ORDER BY id'
    );
    
    console.log(`🌺 Updating ${floristsQuery.rows.length} florists with flower arrangement images...`);
    
    for (let i = 0; i < floristsQuery.rows.length; i++) {
      const florist = floristsQuery.rows[i];
      const arrangement = flowerArrangements[i % flowerArrangements.length];
      
      const imageData = createFlowerArrangementImage(arrangement.colors, arrangement);
      
      await pool.query(
        'UPDATE florist_auth SET profile_image_data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [imageData, florist.id]
      );
      
      console.log(`✅ Updated ${florist.business_name} (ID: ${florist.id}) with flower arrangement`);
      
      // Add small delay to avoid overwhelming the system
      if (i % 10 === 9) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Verify the images were stored
    const verifyQuery = await pool.query(
      'SELECT COUNT(*) as count FROM florist_auth WHERE profile_image_data IS NOT NULL'
    );
    
    console.log(`\n🎉 Successfully updated ${verifyQuery.rows[0].count} florists with flower arrangement images!`);
    console.log('All florists now have professional flower arrangement profile pictures.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error updating florist images:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

updateAllFloristImages();