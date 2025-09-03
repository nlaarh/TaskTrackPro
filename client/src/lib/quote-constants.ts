// Event Types
export const EVENT_TYPES = [
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday Party" },
  { value: "anniversary", label: "Anniversary" },
  { value: "corporate", label: "Corporate Event" },
  { value: "funeral", label: "Funeral Service" },
  { value: "graduation", label: "Graduation" },
  { value: "baby-shower", label: "Baby Shower" },
  { value: "bridal-shower", label: "Bridal Shower" },
  { value: "engagement", label: "Engagement Party" },
  { value: "dinner-party", label: "Dinner Party" },
  { value: "housewarming", label: "Housewarming" },
  { value: "retirement", label: "Retirement Party" },
  { value: "holiday", label: "Holiday Celebration" },
  { value: "other", label: "Other" }
];

// Floral Arrangement Styles
export const STYLES = [
  { value: "classic", label: "Classic & Traditional" },
  { value: "modern", label: "Modern & Contemporary" },
  { value: "rustic", label: "Rustic & Natural" },
  { value: "vintage", label: "Vintage & Romantic" },
  { value: "bohemian", label: "Bohemian & Free-spirited" },
  { value: "minimalist", label: "Minimalist & Clean" },
  { value: "garden", label: "Garden & Wildflower" },
  { value: "tropical", label: "Tropical & Exotic" },
  { value: "elegant", label: "Elegant & Sophisticated" },
  { value: "whimsical", label: "Whimsical & Playful" }
];

// Color Palettes
export const COLOR_PALETTES = [
  { value: "white-green", label: "White & Green", colors: ["#FFFFFF", "#2D5016"] },
  { value: "blush-gold", label: "Blush & Gold", colors: ["#F7CAC9", "#FFD700"] },
  { value: "burgundy-navy", label: "Burgundy & Navy", colors: ["#800020", "#000080"] },
  { value: "sage-cream", label: "Sage & Cream", colors: ["#87A96B", "#F5F5DC"] },
  { value: "lavender-silver", label: "Lavender & Silver", colors: ["#E6E6FA", "#C0C0C0"] },
  { value: "coral-peach", label: "Coral & Peach", colors: ["#FF7F50", "#FFCBA4"] },
  { value: "deep-purple", label: "Deep Purple & Plum", colors: ["#4B0082", "#DDA0DD"] },
  { value: "sunset", label: "Sunset Orange & Yellow", colors: ["#FF4500", "#FFD700"] },
  { value: "forest", label: "Forest Green & Brown", colors: ["#228B22", "#8B4513"] },
  { value: "pastels", label: "Mixed Pastels", colors: ["#FFB6C1", "#E0E6FF", "#F0FFF0"] },
  { value: "bold-bright", label: "Bold & Bright", colors: ["#FF1493", "#00CED1", "#32CD32"] },
  { value: "monochrome", label: "Black & White", colors: ["#000000", "#FFFFFF"] }
];

// Arrangement Types
export const ARRANGEMENT_TYPES = [
  { value: "bouquet", label: "Bridal Bouquet" },
  { value: "bridesmaids", label: "Bridesmaids Bouquets" },
  { value: "boutonniere", label: "Boutonnieres" },
  { value: "corsage", label: "Corsages" },
  { value: "centerpiece", label: "Table Centerpieces" },
  { value: "ceremony-arch", label: "Ceremony Arch" },
  { value: "aisle-petals", label: "Aisle Petals" },
  { value: "altar", label: "Altar Arrangements" },
  { value: "entrance", label: "Entrance Arrangements" },
  { value: "wall-backdrop", label: "Wall/Backdrop Arrangements" },
  { value: "hanging", label: "Hanging Arrangements" },
  { value: "garland", label: "Garlands" },
  { value: "wreaths", label: "Wreaths" },
  { value: "standing-spray", label: "Standing Sprays" },
  { value: "casket", label: "Casket Sprays" },
  { value: "sympathy", label: "Sympathy Arrangements" },
  { value: "corporate", label: "Corporate Arrangements" },
  { value: "gift", label: "Gift Arrangements" }
];

// Popular Flowers
export const FLOWERS = [
  // Roses
  { value: "red-roses", label: "Red Roses", category: "roses", season: "year-round" },
  { value: "white-roses", label: "White Roses", category: "roses", season: "year-round" },
  { value: "pink-roses", label: "Pink Roses", category: "roses", season: "year-round" },
  { value: "yellow-roses", label: "Yellow Roses", category: "roses", season: "year-round" },
  { value: "garden-roses", label: "Garden Roses", category: "roses", season: "year-round" },
  
  // Peonies
  { value: "white-peonies", label: "White Peonies", category: "peonies", season: "spring-summer" },
  { value: "pink-peonies", label: "Pink Peonies", category: "peonies", season: "spring-summer" },
  { value: "coral-peonies", label: "Coral Peonies", category: "peonies", season: "spring-summer" },
  
  // Hydrangeas
  { value: "white-hydrangea", label: "White Hydrangea", category: "hydrangeas", season: "summer-fall" },
  { value: "blue-hydrangea", label: "Blue Hydrangea", category: "hydrangeas", season: "summer-fall" },
  { value: "pink-hydrangea", label: "Pink Hydrangea", category: "hydrangeas", season: "summer-fall" },
  
  // Lilies
  { value: "white-lilies", label: "White Lilies", category: "lilies", season: "year-round" },
  { value: "stargazer-lilies", label: "Stargazer Lilies", category: "lilies", season: "year-round" },
  { value: "calla-lilies", label: "Calla Lilies", category: "lilies", season: "year-round" },
  
  // Tulips
  { value: "white-tulips", label: "White Tulips", category: "tulips", season: "spring" },
  { value: "red-tulips", label: "Red Tulips", category: "tulips", season: "spring" },
  { value: "pink-tulips", label: "Pink Tulips", category: "tulips", season: "spring" },
  { value: "yellow-tulips", label: "Yellow Tulips", category: "tulips", season: "spring" },
  
  // Sunflowers
  { value: "sunflowers", label: "Sunflowers", category: "sunflowers", season: "summer-fall" },
  
  // Chrysanthemums
  { value: "white-mums", label: "White Chrysanthemums", category: "mums", season: "fall" },
  { value: "yellow-mums", label: "Yellow Chrysanthemums", category: "mums", season: "fall" },
  { value: "bronze-mums", label: "Bronze Chrysanthemums", category: "mums", season: "fall" },
  
  // Orchids
  { value: "white-orchids", label: "White Orchids", category: "orchids", season: "year-round" },
  { value: "purple-orchids", label: "Purple Orchids", category: "orchids", season: "year-round" },
  { value: "pink-orchids", label: "Pink Orchids", category: "orchids", season: "year-round" },
  
  // Baby's Breath
  { value: "babys-breath", label: "Baby's Breath", category: "fillers", season: "year-round" },
  
  // Eucalyptus & Greenery
  { value: "eucalyptus", label: "Eucalyptus", category: "greenery", season: "year-round" },
  { value: "ferns", label: "Ferns", category: "greenery", season: "year-round" },
  { value: "ivy", label: "Ivy", category: "greenery", season: "year-round" },
  
  // Seasonal Flowers
  { value: "daffodils", label: "Daffodils", category: "bulbs", season: "spring" },
  { value: "hyacinths", label: "Hyacinths", category: "bulbs", season: "spring" },
  { value: "marigolds", label: "Marigolds", category: "annuals", season: "summer-fall" },
  { value: "asters", label: "Asters", category: "perennials", season: "fall" },
  { value: "poinsettias", label: "Poinsettias", category: "holiday", season: "winter" },
  { value: "holly", label: "Holly", category: "holiday", season: "winter" },
  
  // Wildflowers
  { value: "wildflower-mix", label: "Wildflower Mix", category: "wildflowers", season: "spring-summer" },
  { value: "lavender", label: "Lavender", category: "herbs", season: "summer" },
  { value: "chamomile", label: "Chamomile", category: "herbs", season: "summer" }
];

// Budget Ranges (for filtering and display)
export const BUDGET_RANGES = [
  { value: "under-100", label: "Under $100", min: 0, max: 99 },
  { value: "100-250", label: "$100 - $250", min: 100, max: 250 },
  { value: "250-500", label: "$250 - $500", min: 250, max: 500 },
  { value: "500-1000", label: "$500 - $1,000", min: 500, max: 1000 },
  { value: "1000-2500", label: "$1,000 - $2,500", min: 1000, max: 2500 },
  { value: "2500-5000", label: "$2,500 - $5,000", min: 2500, max: 5000 },
  { value: "over-5000", label: "Over $5,000", min: 5000, max: null }
];

// Quote Status Options
export const QUOTE_STATUSES = [
  { value: "pending", label: "Pending Review", color: "yellow" },
  { value: "in-review", label: "In Review", color: "blue" },
  { value: "quoted", label: "Quoted", color: "green" },
  { value: "accepted", label: "Accepted", color: "emerald" },
  { value: "declined", label: "Declined", color: "red" },
  { value: "cancelled", label: "Cancelled", color: "gray" }
];

// Add-on Services
export const ADD_ON_SERVICES = [
  { value: "delivery", label: "Delivery Service" },
  { value: "setup", label: "Setup Service" },
  { value: "teardown", label: "Teardown Service" },
  { value: "consultation", label: "Design Consultation" },
  { value: "venue-visit", label: "Venue Visit" },
  { value: "trial-run", label: "Trial Run/Preview" },
  { value: "emergency-kit", label: "Emergency Repair Kit" },
  { value: "extra-bouquet", label: "Extra Bouquet for Tossing" },
  { value: "preservation", label: "Bouquet Preservation" },
  { value: "photography", label: "Floral Photography" }
];