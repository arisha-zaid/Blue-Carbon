const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const locationService = require('../services/locationService');

/**
 * @route   GET /api/locations/suggestions
 * @desc    Get location suggestions for environmental projects
 * @access  Public
 */
router.get('/suggestions',
  [
    query('type').optional().isIn([
      'mangroves', 'seagrass', 'wetlands', 'agroforestry', 'reforestation',
      'renewable_energy', 'waste_management', 'carbon_capture',
      'biodiversity_conservation', 'sustainable_agriculture', 'clean_water', 'green_technology', 'other'
    ]).withMessage('Invalid project type'),
    query('search').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Search query must be 1-100 characters'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { type = 'wetlands', search = '', limit = 10 } = req.query;
      
      const suggestions = locationService.getLocationSuggestions(type, search);
      const limitedSuggestions = suggestions.slice(0, parseInt(limit));

      res.json({
        success: true,
        data: limitedSuggestions.map(location => ({
          name: location.name,
          state: location.state,
          fullName: `${location.name}, ${location.state}`,
          coordinates: location.coordinates,
          area: location.area,
          description: location.description
        })),
        meta: {
          total: suggestions.length,
          returned: limitedSuggestions.length,
          projectType: type,
          searchQuery: search
        }
      });

    } catch (error) {
      logger.api.error('GET', '/api/locations/suggestions', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get location suggestions',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route   GET /api/locations/nearby
 * @desc    Find nearby environmental project locations
 * @access  Public
 */
router.get('/nearby',
  [
    query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    query('radius').optional().isInt({ min: 1, max: 500 }).withMessage('Radius must be between 1 and 500 km'),
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { latitude, longitude, radius = 100, limit = 10 } = req.query;
      
      const nearbyLocations = locationService.findNearbyLocations(
        parseFloat(latitude),
        parseFloat(longitude), 
        parseInt(radius)
      );
      
      const limitedResults = nearbyLocations.slice(0, parseInt(limit));

      res.json({
        success: true,
        data: limitedResults.map(location => {
          const distance = locationService.calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            location.coordinates.latitude,
            location.coordinates.longitude
          );
          
          return {
            name: location.name,
            state: location.state,
            fullName: `${location.name}, ${location.state}`,
            coordinates: location.coordinates,
            area: location.area,
            description: location.description,
            distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
          };
        }),
        meta: {
          center: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
          radius: parseInt(radius),
          total: nearbyLocations.length,
          returned: limitedResults.length
        }
      });

    } catch (error) {
      logger.api.error('GET', '/api/locations/nearby', error);
      res.status(500).json({
        success: false,
        message: 'Failed to find nearby locations',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route   GET /api/locations/details/:name
 * @desc    Get detailed information about a specific location
 * @access  Public
 */
router.get('/details/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Location name must be at least 2 characters'
      });
    }

    const locationDetails = locationService.getLocationDetails(name.trim());

    if (!locationDetails) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: {
        name: locationDetails.name,
        state: locationDetails.state,
        fullName: `${locationDetails.name}, ${locationDetails.state}`,
        coordinates: locationDetails.coordinates,
        area: locationDetails.area,
        description: locationDetails.description
      }
    });

  } catch (error) {
    logger.api.error('GET', '/api/locations/details/:name', error, req.params.name);
    res.status(500).json({
      success: false,
      message: 'Failed to get location details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/locations/reverse-geocode
 * @desc    Convert coordinates to address (mock implementation)
 * @access  Public
 */
router.post('/reverse-geocode',
  [
    query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { latitude, longitude } = req.query;
      
      const address = await locationService.reverseGeocode(
        parseFloat(latitude),
        parseFloat(longitude)
      );

      res.json({
        success: true,
        data: {
          coordinates: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
          },
          address,
          formatted: address
        }
      });

    } catch (error) {
      logger.api.error('POST', '/api/locations/reverse-geocode', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reverse geocode',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;