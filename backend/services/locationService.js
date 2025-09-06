const logger = require('../utils/logger');

/**
 * Location suggestions service for environmental projects
 * Provides area-based suggestions for different project types
 */

// Environmental project location database for India
const PROJECT_LOCATIONS = {
  mangroves: [
    {
      name: "Sundarbans National Park",
      state: "West Bengal",
      coordinates: { latitude: 21.9497, longitude: 88.4297 },
      area: "Mangrove ecosystem",
      description: "World Heritage Site with rich mangrove biodiversity"
    },
    {
      name: "Bhitarkanika Wildlife Sanctuary", 
      state: "Odisha",
      coordinates: { latitude: 20.6270, longitude: 86.9120 },
      area: "Mangrove ecosystem",
      description: "Important nesting site for Olive Ridley turtles"
    },
    {
      name: "Pichavaram Mangrove Forest",
      state: "Tamil Nadu", 
      coordinates: { latitude: 11.4270, longitude: 79.7897 },
      area: "Mangrove ecosystem",
      description: "Second largest mangrove forest in India"
    },
    {
      name: "Godavari Mangroves",
      state: "Andhra Pradesh",
      coordinates: { latitude: 16.7833, longitude: 82.2167 },
      area: "Coastal delta",
      description: "Important breeding ground for marine life"
    },
    {
      name: "Coringa Wildlife Sanctuary",
      state: "Andhra Pradesh", 
      coordinates: { latitude: 16.7500, longitude: 82.2167 },
      area: "Mangrove ecosystem",
      description: "Rich biodiversity with saltwater crocodiles"
    }
  ],
  
  seagrass: [
    {
      name: "Gulf of Mannar Marine National Park",
      state: "Tamil Nadu",
      coordinates: { latitude: 8.8167, longitude: 78.2000 },
      area: "Marine ecosystem", 
      description: "UNESCO Biosphere Reserve with diverse seagrass beds"
    },
    {
      name: "Palk Bay",
      state: "Tamil Nadu",
      coordinates: { latitude: 9.2833, longitude: 79.3167 },
      area: "Marine ecosystem",
      description: "Rich seagrass meadows supporting marine biodiversity"
    },
    {
      name: "Lakshadweep Islands",
      state: "Lakshadweep", 
      coordinates: { latitude: 10.5667, longitude: 72.6417 },
      area: "Coral island ecosystem",
      description: "Pristine coral reefs with healthy seagrass beds"
    },
    {
      name: "Andaman and Nicobar Islands",
      state: "Andaman and Nicobar",
      coordinates: { latitude: 11.7401, longitude: 92.6586 },
      area: "Island ecosystem",
      description: "Diverse marine habitats with seagrass meadows"
    },
    {
      name: "Chilika Lake",
      state: "Odisha",
      coordinates: { latitude: 19.7167, longitude: 85.3167 },
      area: "Brackish water lagoon",
      description: "Asia's largest brackish water lagoon"
    }
  ],
  
  wetlands: [
    {
      name: "Chilika Lake",
      state: "Odisha", 
      coordinates: { latitude: 19.7167, longitude: 85.3167 },
      area: "Brackish water lagoon",
      description: "Major wintering ground for migratory birds"
    },
    {
      name: "Pulicat Lake",
      state: "Tamil Nadu",
      coordinates: { latitude: 13.6500, longitude: 80.1667 },
      area: "Saltwater lagoon",
      description: "Second largest brackish water ecosystem in India"
    },
    {
      name: "Kolleru Lake", 
      state: "Andhra Pradesh",
      coordinates: { latitude: 16.7000, longitude: 81.1833 },
      area: "Freshwater lake",
      description: "Important bird sanctuary and fish breeding ground"
    },
    {
      name: "Vembanad Lake",
      state: "Kerala",
      coordinates: { latitude: 9.6167, longitude: 76.4167 },
      area: "Backwater ecosystem", 
      description: "Largest lake in Kerala with rich biodiversity"
    },
    {
      name: "Loktak Lake",
      state: "Manipur",
      coordinates: { latitude: 24.5167, longitude: 93.7833 },
      area: "Freshwater lake",
      description: "Unique floating islands ecosystem"
    }
  ],
  
  agroforestry: [
    {
      name: "Western Ghats - Kodagu",
      state: "Karnataka",
      coordinates: { latitude: 12.3375, longitude: 75.8069 },
      area: "Hill region",
      description: "Coffee plantations with shade trees"
    },
    {
      name: "Nilgiri Hills",
      state: "Tamil Nadu", 
      coordinates: { latitude: 11.4058, longitude: 76.6950 },
      area: "Mountain ecosystem",
      description: "Tea gardens with biodiversity conservation"
    },
    {
      name: "Satpura Range",
      state: "Madhya Pradesh",
      coordinates: { latitude: 22.5000, longitude: 78.5000 },
      area: "Forest ecosystem",
      description: "Mixed deciduous forests with agricultural integration"
    },
    {
      name: "Aravalli Range",
      state: "Rajasthan", 
      coordinates: { latitude: 24.6000, longitude: 73.7000 },
      area: "Dry deciduous forest",
      description: "Restoration of degraded lands through agroforestry"
    },
    {
      name: "Eastern Ghats",
      state: "Andhra Pradesh",
      coordinates: { latitude: 18.0000, longitude: 79.0000 },
      area: "Hill ecosystem",
      description: "Integrated farming systems with tree crops"
    }
  ]
};

/**
 * Get location suggestions based on project type
 * @param {string} projectType - Type of environmental project
 * @param {string} searchQuery - Optional search query to filter results
 * @returns {Array} Array of location suggestions
 */
const getLocationSuggestions = (projectType, searchQuery = '') => {
  try {
    // Normalize project type
    const normalizedType = projectType.toLowerCase().replace('_', '').replace(' ', '');
    
    // Map project types to location categories
    const typeMapping = {
      mangroves: 'mangroves',
      seagrass: 'seagrass', 
      wetlands: 'wetlands',
      agroforestry: 'agroforestry',
      reforestation: 'agroforestry', // Use agroforestry locations for reforestation
      biodiversityconservation: 'wetlands', // Use wetlands for biodiversity projects
      sustainableagriculture: 'agroforestry'
    };
    
    const category = typeMapping[normalizedType] || 'wetlands';
    const locations = PROJECT_LOCATIONS[category] || [];
    
    // Filter by search query if provided
    if (searchQuery && searchQuery.length > 1) {
      const query = searchQuery.toLowerCase();
      return locations.filter(location => 
        location.name.toLowerCase().includes(query) ||
        location.state.toLowerCase().includes(query) ||
        location.area.toLowerCase().includes(query)
      );
    }
    
    return locations;
    
  } catch (error) {
    logger.error('Error getting location suggestions:', error);
    return [];
  }
};

/**
 * Get detailed information about a specific location
 * @param {string} locationName - Name of the location
 * @returns {Object|null} Location details or null if not found
 */
const getLocationDetails = (locationName) => {
  try {
    const query = locationName.toLowerCase();
    
    for (const category of Object.values(PROJECT_LOCATIONS)) {
      const location = category.find(loc => 
        loc.name.toLowerCase().includes(query)
      );
      if (location) {
        return location;
      }
    }
    
    return null;
    
  } catch (error) {
    logger.error('Error getting location details:', error);
    return null;
  }
};

/**
 * Find nearby locations based on coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} radiusKm - Search radius in kilometers (default: 100km)
 * @returns {Array} Array of nearby locations
 */
const findNearbyLocations = (latitude, longitude, radiusKm = 100) => {
  try {
    const allLocations = Object.values(PROJECT_LOCATIONS).flat();
    
    return allLocations.filter(location => {
      const distance = calculateDistance(
        latitude, 
        longitude, 
        location.coordinates.latitude, 
        location.coordinates.longitude
      );
      return distance <= radiusKm;
    }).sort((a, b) => {
      const distA = calculateDistance(latitude, longitude, a.coordinates.latitude, a.coordinates.longitude);
      const distB = calculateDistance(latitude, longitude, b.coordinates.latitude, b.coordinates.longitude);
      return distA - distB;
    });
    
  } catch (error) {
    logger.error('Error finding nearby locations:', error);
    return [];
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude  
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Reverse geocoding simulation (in production, use Google Maps API)
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<string>} Formatted address
 */
const reverseGeocode = async (latitude, longitude) => {
  try {
    // Find the nearest known location
    const nearbyLocations = findNearbyLocations(latitude, longitude, 50);
    
    if (nearbyLocations.length > 0) {
      const nearest = nearbyLocations[0];
      return `Near ${nearest.name}, ${nearest.state}, India`;
    }
    
    // Fallback to approximate location based on coordinates
    const states = {
      'kerala': { lat: [8, 12], lon: [74, 77] },
      'tamilnadu': { lat: [8, 13.5], lon: [76, 81] },
      'karnataka': { lat: [11.5, 18], lon: [74, 78.5] },
      'andhra pradesh': { lat: [12.5, 19.5], lon: [77, 85] },
      'odisha': { lat: [17.5, 22.5], lon: [81.5, 87.5] },
      'west bengal': { lat: [21, 27], lon: [85.5, 89.5] }
    };
    
    for (const [state, bounds] of Object.entries(states)) {
      if (latitude >= bounds.lat[0] && latitude <= bounds.lat[1] &&
          longitude >= bounds.lon[0] && longitude <= bounds.lon[1]) {
        return `${state.charAt(0).toUpperCase() + state.slice(1)}, India`;
      }
    }
    
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}, India`;
    
  } catch (error) {
    logger.error('Error in reverse geocoding:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

module.exports = {
  getLocationSuggestions,
  getLocationDetails, 
  findNearbyLocations,
  reverseGeocode,
  calculateDistance
};