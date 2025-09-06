const express = require('express');
const router = express.Router();
const { body, validationResult, param, query } = require('express-validator');
const multer = require('multer');
const { isAuthenticated: auth } = require('../middleware/auth');
const logger = require('../utils/logger');
const ipfsService = require('../services/ipfsService');
const blockchainService = require('../services/blockchainService');
const Project = require('../models/Project');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for project documents
    files: 20
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'video/mp4', 'video/mpeg', 'video/quicktime',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

/**
 * @route   POST /api/projects
 * @desc    Create a new environmental project
 * @access  Private
 */
router.post('/',
  auth,
  upload.array('documents', 20),
  [
    body('name').trim().isLength({ min: 3, max: 200 }).withMessage('Name must be 3-200 characters'),
    body('description').trim().isLength({ min: 50, max: 5000 }).withMessage('Description must be 50-5000 characters'),
    body('type').isIn([
      'reforestation', 'renewable_energy', 'waste_management', 'carbon_capture',
      'biodiversity_conservation', 'sustainable_agriculture', 'clean_water', 'green_technology', 'other'
    ]).withMessage('Invalid project type'),
    body('location.address').trim().notEmpty().withMessage('Address is required'),
    body('location.country').trim().notEmpty().withMessage('Country is required'),
    body('location.coordinates.latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('location.coordinates.longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('funding.goal').isFloat({ min: 100 }).withMessage('Funding goal must be at least 100'),
    body('carbonImpact.estimatedReduction').optional().isInt({ min: 0 }),
    body('area').optional().isFloat({ min: 0 }).withMessage('Area must be non-negative')
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

      const {
        name, description, shortDescription, type, category, tags = [],
        location, endDate, duration, carbonImpact = {}, biodiversityImpact = {},
        socialImpact = {}, funding, organization = {}, stakeholders = [],
        risks = [], area, phase = 'planning'
      } = req.body;

      // Process uploaded documents
      const documentList = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const ipfsResult = await ipfsService.uploadWithMetadata(file.buffer, {
              filename: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              userId: req.user._id,
              projectName: name,
              uploadType: 'project_document'
            });

            let docType = 'other';
            if (file.originalname.toLowerCase().includes('proposal')) docType = 'proposal';
            else if (file.originalname.toLowerCase().includes('report')) docType = 'report';
            else if (file.mimetype.startsWith('image/')) docType = 'image';
            else if (file.mimetype.startsWith('video/')) docType = 'video';

            documentList.push({
              name: file.originalname,
              type: docType,
              ipfsHash: ipfsResult.file.hash,
              url: ipfsResult.file.url,
              uploadedBy: req.user._id
            });

          } catch (error) {
            logger.error(`Failed to upload document ${file.originalname}:`, error);
          }
        }
      }

      // Create project
      const projectData = {
        name,
        description,
        shortDescription: shortDescription || description.substring(0, 500),
        type,
        category,
        tags,
        location: {
          address: location.address,
          coordinates: location.coordinates,
          city: location.city,
          state: location.state,
          country: location.country,
          region: location.region,
          area: area || location.area,
          elevation: location.elevation
        },
        owner: req.user._id,
        team: [{
          user: req.user._id,
          role: 'project_manager',
          permissions: ['view', 'edit', 'manage_funding', 'report']
        }],
        organization: {
          name: organization.name || req.user.organization?.name,
          type: organization.type,
          website: organization.website,
          contact: organization.contact
        },
        endDate: new Date(endDate),
        duration,
        phase,
        funding: {
          goal: parseFloat(funding.goal),
          currency: funding.currency || 'USD',
          breakdown: funding.breakdown || {}
        },
        carbonImpact: {
          baseline: carbonImpact.baseline || {},
          projections: carbonImpact.projections || [{
            year: new Date(endDate).getFullYear(),
            estimatedReduction: carbonImpact.estimatedReduction || 0,
            confidence: 'medium'
          }]
        },
        biodiversityImpact: {
          speciesProtected: biodiversityImpact.speciesProtected || [],
          habitatRestored: biodiversityImpact.habitatRestored || 0,
          ecosystemServices: biodiversityImpact.ecosystemServices || []
        },
        socialImpact: {
          beneficiaries: socialImpact.beneficiaries || 0,
          communities: socialImpact.communities || [],
          jobs: socialImpact.jobs || { created: 0, type: [] }
        },
        documents: documentList,
        stakeholders: stakeholders.map(sh => ({
          name: sh.name,
          type: sh.type,
          contact: sh.contact,
          role: sh.role,
          involvement: sh.involvement || 'secondary'
        })),
        risks: risks.map(risk => ({
          category: risk.category,
          description: risk.description,
          probability: risk.probability || 'medium',
          impact: risk.impact || 'medium',
          mitigation: risk.mitigation,
          status: 'open'
        })),
        settings: {
          isPublic: req.body.isPublic !== false,
          allowPublicFunding: req.body.allowPublicFunding !== false,
          autoUpdateProgress: true,
          notifications: {
            funding: true,
            milestones: true,
            verification: true
          }
        },
        lastModifiedBy: req.user._id
      };

      const project = new Project(projectData);
      await project.save();

      // Upload project metadata to IPFS
      try {
        const projectMetadata = {
          projectId: project._id,
          name,
          type,
          description: shortDescription || description.substring(0, 500),
          location: location.address,
          fundingGoal: funding.goal,
          estimatedCarbonReduction: carbonImpact.estimatedReduction || 0,
          owner: req.user._id,
          createdAt: project.createdAt,
          documentCount: documentList.length
        };

        const metadataResult = await ipfsService.uploadJSON(
          projectMetadata,
          `project_${project._id}_metadata.json`
        );

        project.blockchain.ipfsHash = metadataResult.hash;
        await project.save();

      } catch (error) {
        logger.warn('Failed to upload project metadata to IPFS:', error.message);
      }

      logger.api.request('POST', '/api/projects', req.user._id, {
        projectId: project._id,
        name,
        type,
        fundingGoal: funding.goal
      });

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project.getPublicData()
      });

    } catch (error) {
      logger.api.error('POST', '/api/projects', error, req.user._id);
      res.status(500).json({
        success: false,
        message: 'Failed to create project',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route   GET /api/projects
 * @desc    Get projects with filtering and pagination
 * @access  Public
 */
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('type').optional().isIn([
      'reforestation', 'renewable_energy', 'waste_management', 'carbon_capture',
      'biodiversity_conservation', 'sustainable_agriculture', 'clean_water', 'green_technology', 'other'
    ]),
    query('status').optional().isIn([
      'draft', 'proposed', 'under_review', 'approved', 'active', 'paused', 'completed', 'verified', 'rejected', 'cancelled'
    ]),
    query('category').optional().isIn(['mitigation', 'adaptation', 'conservation', 'restoration']),
    query('sortBy').optional().isIn(['createdAt', 'name', 'fundingGoal', 'fundingPercentage', 'totalCarbonReduction']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
    query('search').optional().trim()
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

      const {
        page = 1, limit = 20, type, status, category, country, city,
        minFunding, maxFunding, isVerified, sortBy = 'createdAt',
        sortOrder = 'desc', search, nearLatitude, nearLongitude, maxDistance = 100
      } = req.query;

      // Build filter
      const filter = { 'settings.isPublic': true };
      
      if (type) filter.type = type;
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (country) filter['location.country'] = new RegExp(country, 'i');
      if (city) filter['location.city'] = new RegExp(city, 'i');
      if (minFunding) filter['funding.goal'] = { $gte: parseFloat(minFunding) };
      if (maxFunding) {
        filter['funding.goal'] = { 
          ...filter['funding.goal'], 
          $lte: parseFloat(maxFunding) 
        };
      }
      if (isVerified === 'true') filter['verification.isVerified'] = true;

      // Text search
      if (search) {
        filter.$or = [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Geographic search
      if (nearLatitude && nearLongitude) {
        filter['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(nearLongitude), parseFloat(nearLatitude)]
            },
            $maxDistance: parseFloat(maxDistance) * 1000
          }
        };
      }

      // Sort configuration
      const sortConfig = {};
      if (sortBy === 'fundingPercentage') {
        // This would require aggregation for calculated fields
        sortConfig['funding.raised'] = sortOrder === 'asc' ? 1 : -1;
      } else {
        sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1;
      }

      const skip = (page - 1) * limit;
      const [projects, total] = await Promise.all([
        Project.find(filter)
          .sort(sortConfig)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('owner', 'firstName lastName organization profilePicture')
          .populate('team.user', 'firstName lastName')
          .select('-blockchain -__v -verification.verifiedBy.comments')
          .lean(),
        Project.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: projects.map(project => ({
          ...project,
          fundingPercentage: project.funding.goal > 0 ? 
            Math.round((project.funding.raised / project.funding.goal) * 100) : 0
        })),
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
          count: projects.length,
          totalRecords: total
        },
        filters: { type, status, category, country, city, isVerified, search }
      });

    } catch (error) {
      logger.api.error('GET', '/api/projects', error, req.user?._id);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch projects',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route   GET /api/projects/statistics
 * @desc    Get project statistics
 * @access  Public
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = await Project.getStatistics();
    
    // Additional aggregations
    const typeStats = await Project.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, totalFunding: { $sum: '$funding.raised' } } }
    ]);

    const countryStats = await Project.aggregate([
      { $group: { _id: '$location.country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        typeBreakdown: typeStats.reduce((acc, item) => {
          acc[item._id] = { count: item.count, funding: item.totalFunding };
          return acc;
        }, {}),
        topCountries: countryStats
      }
    });

  } catch (error) {
    logger.error('Failed to get project statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Public/Private (based on project visibility)
 */
router.get('/:id',
  param('id').isMongoId().withMessage('Invalid project ID'),
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

      const project = await Project.findById(req.params.id)
        .populate('owner', 'firstName lastName organization profilePicture email')
        .populate('team.user', 'firstName lastName organization')
        .populate('verification.verifiedBy.verifier', 'firstName lastName organization')
        .populate('milestones.evidence.verifiedBy', 'firstName lastName');

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check view permissions
      if (!project.canBeViewedBy(req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Increment view count
      project.analytics.views += 1;
      await project.save();

      const responseData = project.canBeViewedBy(req.user) 
        ? project.getPublicData() 
        : project.getPublicData();

      res.json({
        success: true,
        data: responseData
      });

    } catch (error) {
      logger.api.error('GET', `/api/projects/${req.params.id}`, error, req.user?._id);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch project',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route   POST /api/projects/:id/fund
 * @desc    Fund a project
 * @access  Private
 */
router.post('/:id/fund',
  auth,
  param('id').isMongoId().withMessage('Invalid project ID'),
  [
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
    body('currency').optional().isIn(['USD', 'EUR', 'ETH', 'INR']),
    body('fundingType').optional().isIn(['grant', 'donation', 'investment', 'government', 'crowdfunding']),
    body('message').optional().trim().isLength({ max: 500 }),
    body('isRecurring').optional().isBoolean(),
    body('isAnonymous').optional().isBoolean()
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

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      if (!project.settings.allowPublicFunding) {
        return res.status(403).json({
          success: false,
          message: 'This project is not accepting public funding'
        });
      }

      const {
        amount,
        currency = 'USD',
        fundingType = 'donation',
        message = '',
        isRecurring = false,
        recurringInterval,
        isAnonymous = false
      } = req.body;

      const fundingData = {
        funder: isAnonymous ? {
          name: 'Anonymous',
          isAnonymous: true
        } : {
          name: `${req.user.firstName} ${req.user.lastName}`,
          email: req.user.email,
          organization: req.user.organization?.name,
          isAnonymous: false
        },
        amount: parseFloat(amount),
        currency,
        fundingType,
        message,
        isRecurring,
        recurringInterval
      };

      await project.addFunding(fundingData);

      // Add progress update
      const fundingPercentage = Math.round((project.funding.raised / project.funding.goal) * 100);
      await project.addProgressUpdate(
        `Received ${currency} ${amount} funding from ${isAnonymous ? 'anonymous donor' : req.user.firstName}`,
        undefined, // Don't update overall progress
        req.user._id
      );

      logger.api.request('POST', `/api/projects/${req.params.id}/fund`, req.user._id, {
        amount, currency, fundingType
      });

      res.json({
        success: true,
        message: 'Funding added successfully',
        data: {
          fundingReceived: amount,
          totalRaised: project.funding.raised,
          fundingPercentage,
          remainingGoal: Math.max(0, project.funding.goal - project.funding.raised)
        }
      });

    } catch (error) {
      logger.api.error('POST', `/api/projects/${req.params.id}/fund`, error, req.user._id);
      res.status(500).json({
        success: false,
        message: 'Failed to add funding',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;