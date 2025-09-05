const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const { isAuthenticated: auth, isGovernmentOrAdmin } = require('../middleware/auth');
const blockchainService = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const logger = require('../utils/logger');
const Complaint = require('../models/Complaint');
const Project = require('../models/Project');

// Middleware to check blockchain connection
const checkBlockchainConnection = (req, res, next) => {
  if (!blockchainService.isConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Blockchain service unavailable',
      error: 'Unable to connect to blockchain network'
    });
  }
  next();
};

// Carbon Credits Routes

/**
 * @route   GET /api/blockchain/credits/balance/:address
 * @desc    Get carbon credit balance for an address
 * @access  Public
 */
router.get('/credits/balance/:address',
  param('address').isEthereumAddress().withMessage('Invalid Ethereum address'),
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

      const { address } = req.params;
      const balance = await blockchainService.getCreditBalance(address);

      res.json({
        success: true,
        data: {
          address,
          balance,
          balanceFormatted: `${balance} CC`
        }
      });
    } catch (error) {
      logger.blockchain.error('Get credit balance', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get credit balance',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/blockchain/credits/issue
 * @desc    Issue carbon credits
 * @access  Private (Admin/Minter role)
 */
router.post('/credits/issue',
  auth,
  checkBlockchainConnection,
  [
    body('to').isEthereumAddress().withMessage('Invalid recipient address'),
    body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
    body('methodology').notEmpty().withMessage('Methodology is required')
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

      // Check if user has minter role (implement role check)
      if (req.user.role !== 'admin' && !req.user.permissions?.includes('mint_credits')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to issue credits'
        });
      }

      const {
        to,
        amount,
        projectId,
        location,
        expiryDate,
        methodology,
        additionalData = {}
      } = req.body;

      // Upload additional data to IPFS
      let ipfsHash = '';
      if (Object.keys(additionalData).length > 0) {
        const ipfsResult = await ipfsService.uploadJSON({
          projectId,
          location,
          methodology,
          amount,
          issuedBy: req.user._id,
          issuedAt: new Date(),
          ...additionalData
        }, `credit_${projectId}_${Date.now()}.json`);
        ipfsHash = ipfsResult.hash;
      }

      const result = await blockchainService.issueCredits({
        to,
        amount,
        projectId,
        location,
        expiryDate,
        methodology,
        ipfsHash
      });

      logger.blockchain.transaction(result.txHash, 'issue_credits', {
        to,
        amount,
        projectId,
        gasUsed: result.gasUsed
      });

      res.json({
        success: true,
        message: 'Carbon credits issued successfully',
        data: {
          ...result,
          ipfsHash
        }
      });
    } catch (error) {
      logger.blockchain.error('Issue credits', error, req.body);
      res.status(500).json({
        success: false,
        message: 'Failed to issue carbon credits',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/blockchain/credits/retire
 * @desc    Retire carbon credits
 * @access  Private
 */
router.post('/credits/retire',
  auth,
  checkBlockchainConnection,
  [
    body('creditId').isInt({ min: 1 }).withMessage('Valid credit ID is required'),
    body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
    body('reason').notEmpty().withMessage('Retirement reason is required')
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

      const { creditId, amount, reason } = req.body;

      const result = await blockchainService.retireCredits(creditId, amount, reason);

      logger.blockchain.transaction(result.txHash, 'retire_credits', {
        creditId,
        amount,
        reason,
        user: req.user._id,
        gasUsed: result.gasUsed
      });

      res.json({
        success: true,
        message: 'Carbon credits retired successfully',
        data: result
      });
    } catch (error) {
      logger.blockchain.error('Retire credits', error, req.body);
      res.status(500).json({
        success: false,
        message: 'Failed to retire carbon credits',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/blockchain/credits/:creditId
 * @desc    Get carbon credit details
 * @access  Public
 */
router.get('/credits/:creditId',
  param('creditId').isInt({ min: 1 }).withMessage('Valid credit ID is required'),
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

      const { creditId } = req.params;
      const credit = await blockchainService.getCreditDetails(creditId);

      // Get additional data from IPFS if available
      let additionalData = null;
      if (credit.ipfsHash && ipfsService.isAvailable()) {
        try {
          additionalData = await ipfsService.getJSON(credit.ipfsHash);
        } catch (error) {
          logger.warn('Failed to fetch credit data from IPFS:', error.message);
        }
      }

      res.json({
        success: true,
        data: {
          ...credit,
          additionalData
        }
      });
    } catch (error) {
      logger.blockchain.error('Get credit details', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get credit details',
        error: error.message
      });
    }
  }
);

// Complaint Routes

/**
 * @route   POST /api/blockchain/complaints
 * @desc    Submit complaint to blockchain
 * @access  Private
 */
router.post('/complaints',
  auth,
  checkBlockchainConnection,
  [
    body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('description').trim().isLength({ min: 10, max: 5000 }).withMessage('Description must be 10-5000 characters'),
    body('category').isIn([0, 1, 2, 3, 4, 5, 6, 7]).withMessage('Invalid category'),
    body('priority').isIn([0, 1, 2, 3]).withMessage('Invalid priority'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('isAnonymous').isBoolean().optional()
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
        title,
        description,
        category,
        priority,
        location,
        evidenceFiles = [],
        isAnonymous = false
      } = req.body;

      // Upload evidence to IPFS
      const evidenceHashes = [];
      if (evidenceFiles.length > 0) {
        for (const file of evidenceFiles) {
          const ipfsResult = await ipfsService.uploadFile(
            Buffer.from(file.data, 'base64'),
            {
              filename: file.filename,
              mimeType: file.mimeType
            }
          );
          evidenceHashes.push(ipfsResult.hash);
        }
      }

      // Upload complaint metadata to IPFS
      const complaintData = {
        title,
        description,
        category,
        priority,
        location,
        evidenceHashes,
        submittedBy: isAnonymous ? null : req.user._id,
        submittedAt: new Date(),
        version: '1.0'
      };

      const metadataResult = await ipfsService.uploadJSON(
        complaintData,
        `complaint_${Date.now()}.json`
      );

      // Submit to blockchain
      const result = await blockchainService.submitComplaint({
        title,
        description,
        category,
        priority,
        location,
        evidenceHashes,
        isAnonymous
      });

      // Save to database with blockchain reference
      const complaint = new Complaint({
        title,
        description,
        category: ['air_pollution', 'water_pollution', 'soil_contamination', 
                  'noise_violation', 'waste_management', 'forest_destruction', 
                  'illegal_dumping', 'other'][category],
        priority: ['low', 'medium', 'high', 'critical'][priority],
        location: { address: location },
        complainant: isAnonymous ? null : req.user._id,
        isAnonymous,
        blockchainData: {
          complaintId: result.complaintId,
          txHash: result.txHash,
          blockNumber: result.blockNumber,
          ipfsHash: metadataResult.hash,
          isOnChain: true,
          lastSyncedAt: new Date()
        },
        evidence: evidenceFiles.map((file, index) => ({
          type: file.type || 'document',
          filename: file.filename,
          originalName: file.originalName,
          size: file.size,
          mimeType: file.mimeType,
          ipfsHash: evidenceHashes[index],
          uploadedBy: req.user._id
        }))
      });

      await complaint.save();

      logger.blockchain.transaction(result.txHash, 'submit_complaint', {
        complaintId: result.complaintId,
        category,
        priority,
        user: req.user._id,
        gasUsed: result.gasUsed
      });

      res.status(201).json({
        success: true,
        message: 'Complaint submitted to blockchain successfully',
        data: {
          ...result,
          complaintNumber: complaint.complaintNumber,
          ipfsHash: metadataResult.hash,
          evidenceHashes
        }
      });
    } catch (error) {
      logger.blockchain.error('Submit complaint', error, req.body);
      res.status(500).json({
        success: false,
        message: 'Failed to submit complaint to blockchain',
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/blockchain/complaints/:complaintId/status
 * @desc    Update complaint status on blockchain
 * @access  Private (Admin/Validator role)
 */
router.put('/complaints/:complaintId/status',
  auth,
  checkBlockchainConnection,
  [
    param('complaintId').isInt({ min: 1 }).withMessage('Valid complaint ID is required'),
    body('status').isIn([0, 1, 2, 3, 4, 5]).withMessage('Invalid status'),
    body('message').trim().notEmpty().withMessage('Status message is required')
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

      // Check permissions
      if (req.user.role !== 'admin' && !req.user.permissions?.includes('validate_complaints')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to update complaint status'
        });
      }

      const { complaintId } = req.params;
      const { status, message } = req.body;

      const result = await blockchainService.updateComplaintStatus(complaintId, status, message);

      // Update database record
      const complaint = await Complaint.findOne({
        'blockchainData.complaintId': complaintId
      });

      if (complaint) {
        const statusNames = ['submitted', 'under_review', 'investigating', 'resolved', 'rejected', 'escalated'];
        await complaint.addUpdate(statusNames[status], message, req.user._id);
      }

      logger.blockchain.transaction(result.txHash, 'update_complaint_status', {
        complaintId,
        status,
        message,
        user: req.user._id,
        gasUsed: result.gasUsed
      });

      res.json({
        success: true,
        message: 'Complaint status updated on blockchain',
        data: result
      });
    } catch (error) {
      logger.blockchain.error('Update complaint status', error, req.body);
      res.status(500).json({
        success: false,
        message: 'Failed to update complaint status',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/blockchain/complaints/:complaintId
 * @desc    Get complaint details from blockchain
 * @access  Public
 */
router.get('/complaints/:complaintId',
  param('complaintId').isInt({ min: 1 }).withMessage('Valid complaint ID is required'),
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

      const { complaintId } = req.params;
      const complaint = await blockchainService.getComplaint(complaintId);

      // Get additional data from IPFS
      let metadata = null;
      if (complaint.evidenceHashes.length > 0) {
        const evidenceData = [];
        for (const hash of complaint.evidenceHashes) {
          try {
            const data = await ipfsService.getFile(hash);
            evidenceData.push({ hash, data: data.toString('base64') });
          } catch (error) {
            logger.warn(`Failed to fetch evidence from IPFS: ${hash}`);
          }
        }
        metadata = { evidence: evidenceData };
      }

      res.json({
        success: true,
        data: {
          ...complaint,
          metadata
        }
      });
    } catch (error) {
      logger.blockchain.error('Get complaint from blockchain', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get complaint from blockchain',
        error: error.message
      });
    }
  }
);

// Project Routes

/**
 * @route   POST /api/blockchain/projects
 * @desc    Register project on blockchain
 * @access  Private
 */
router.post('/projects',
  auth,
  checkBlockchainConnection,
  [
    body('name').trim().isLength({ min: 3, max: 200 }).withMessage('Name must be 3-200 characters'),
    body('description').trim().isLength({ min: 10, max: 5000 }).withMessage('Description must be 10-5000 characters'),
    body('projectType').isIn([0, 1, 2, 3, 4, 5, 6, 7]).withMessage('Invalid project type'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('estimatedCO2Reduction').isInt({ min: 1 }).withMessage('CO2 reduction must be positive'),
    body('fundingGoal').isFloat({ min: 0 }).withMessage('Funding goal must be non-negative')
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
        name,
        description,
        projectType,
        location,
        endDate,
        estimatedCO2Reduction,
        fundingGoal,
        documents = []
      } = req.body;

      // Upload documents to IPFS
      const documentHashes = [];
      if (documents.length > 0) {
        for (const doc of documents) {
          const ipfsResult = await ipfsService.uploadFile(
            Buffer.from(doc.data, 'base64'),
            {
              filename: doc.filename,
              mimeType: doc.mimeType
            }
          );
          documentHashes.push(ipfsResult.hash);
        }
      }

      // Upload project metadata to IPFS
      const projectData = {
        name,
        description,
        projectType,
        location,
        endDate,
        estimatedCO2Reduction,
        fundingGoal,
        documentHashes,
        owner: req.user._id,
        createdAt: new Date(),
        version: '1.0'
      };

      const metadataResult = await ipfsService.uploadJSON(
        projectData,
        `project_${name.replace(/\s+/g, '_')}_${Date.now()}.json`
      );

      // Register on blockchain
      const result = await blockchainService.registerProject({
        name,
        description,
        projectType,
        location,
        endDate,
        estimatedCO2Reduction,
        fundingGoal,
        documents: documentHashes
      });

      // Save to database
      const project = new Project({
        name,
        description,
        type: ['reforestation', 'renewable_energy', 'waste_management', 'carbon_capture',
               'biodiversity_conservation', 'sustainable_agriculture', 'clean_water', 'other'][projectType],
        location: { address: location },
        owner: req.user._id,
        endDate: new Date(endDate),
        carbonImpact: {
          projections: [{
            year: new Date(endDate).getFullYear(),
            estimatedReduction: estimatedCO2Reduction,
            confidence: 'medium'
          }]
        },
        funding: {
          goal: fundingGoal
        },
        blockchain: {
          projectId: result.projectId,
          txHash: result.txHash,
          blockNumber: result.blockNumber,
          ipfsHash: metadataResult.hash,
          isOnChain: true,
          lastSyncedAt: new Date()
        },
        documents: documents.map((doc, index) => ({
          name: doc.filename,
          type: doc.type || 'other',
          ipfsHash: documentHashes[index],
          uploadedBy: req.user._id
        }))
      });

      await project.save();

      logger.blockchain.transaction(result.txHash, 'register_project', {
        projectId: result.projectId,
        name,
        projectType,
        user: req.user._id,
        gasUsed: result.gasUsed
      });

      res.status(201).json({
        success: true,
        message: 'Project registered on blockchain successfully',
        data: {
          ...result,
          ipfsHash: metadataResult.hash,
          documentHashes,
          projectDbId: project._id
        }
      });
    } catch (error) {
      logger.blockchain.error('Register project', error, req.body);
      res.status(500).json({
        success: false,
        message: 'Failed to register project on blockchain',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/blockchain/projects/:projectId/fund
 * @desc    Fund project on blockchain
 * @access  Private
 */
router.post('/projects/:projectId/fund',
  auth,
  checkBlockchainConnection,
  [
    param('projectId').isInt({ min: 1 }).withMessage('Valid project ID is required'),
    body('amount').isFloat({ min: 0.001 }).withMessage('Amount must be at least 0.001 ETH'),
    body('message').optional().trim().isLength({ max: 500 }).withMessage('Message too long')
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

      const { projectId } = req.params;
      const { amount, message = '' } = req.body;

      const result = await blockchainService.fundProject(projectId, amount, message);

      // Update database record
      const project = await Project.findOne({
        'blockchain.projectId': projectId
      });

      if (project) {
        await project.addFunding({
          funder: {
            name: `${req.user.firstName} ${req.user.lastName}`,
            email: req.user.email,
            organization: req.user.organization?.name
          },
          amount: parseFloat(amount),
          currency: 'ETH',
          transactionHash: result.txHash,
          blockNumber: result.blockNumber,
          fundingType: 'donation',
          message
        });
      }

      logger.blockchain.transaction(result.txHash, 'fund_project', {
        projectId,
        amount,
        user: req.user._id,
        gasUsed: result.gasUsed
      });

      res.json({
        success: true,
        message: 'Project funded successfully',
        data: result
      });
    } catch (error) {
      logger.blockchain.error('Fund project', error, req.body);
      res.status(500).json({
        success: false,
        message: 'Failed to fund project',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/blockchain/projects/:projectId
 * @desc    Get project details from blockchain
 * @access  Public
 */
router.get('/projects/:projectId',
  param('projectId').isInt({ min: 1 }).withMessage('Valid project ID is required'),
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

      const { projectId } = req.params;
      const project = await blockchainService.getProject(projectId);

      // Get additional data from IPFS
      let metadata = null;
      if (project.documents.length > 0) {
        const documents = [];
        for (const hash of project.documents) {
          try {
            const stats = await ipfsService.getStats(hash);
            documents.push({
              hash,
              url: `https://ipfs.io/ipfs/${hash}`,
              ...stats
            });
          } catch (error) {
            logger.warn(`Failed to get document stats from IPFS: ${hash}`);
          }
        }
        metadata = { documents };
      }

      res.json({
        success: true,
        data: {
          ...project,
          metadata
        }
      });
    } catch (error) {
      logger.blockchain.error('Get project from blockchain', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get project from blockchain',
        error: error.message
      });
    }
  }
);

// Utility Routes

/**
 * @route   GET /api/blockchain/status
 * @desc    Get blockchain service status
 * @access  Public
 */
router.get('/status', async (req, res) => {
  try {
    const isConnected = blockchainService.isConnected();
    const walletAddress = blockchainService.getWalletAddress();
    
    let balance = null;
    let gasPrice = null;
    let blockNumber = null;
    
    if (isConnected) {
      try {
        balance = await blockchainService.getBalance();
        gasPrice = await blockchainService.getCurrentGasPrice();
        blockNumber = await blockchainService.provider.getBlockNumber();
      } catch (error) {
        logger.warn('Failed to get blockchain status details:', error.message);
      }
    }

    res.json({
      success: true,
      data: {
        isConnected,
        walletAddress,
        balance,
        gasPrice,
        blockNumber,
        network: process.env.ETHEREUM_NETWORK || 'sepolia',
        ipfsAvailable: ipfsService.isAvailable()
      }
    });
  } catch (error) {
    logger.blockchain.error('Get blockchain status', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain status',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/blockchain/transaction/:txHash
 * @desc    Get transaction receipt
 * @access  Public
 */
router.get('/transaction/:txHash',
  param('txHash').isLength({ min: 66, max: 66 }).withMessage('Invalid transaction hash'),
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

      const { txHash } = req.params;
      const receipt = await blockchainService.getTransactionReceipt(txHash);

      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.json({
        success: true,
        data: {
          hash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          status: receipt.status === 1 ? 'success' : 'failed',
          from: receipt.from,
          to: receipt.to,
          logs: receipt.logs.length
        }
      });
    } catch (error) {
      logger.blockchain.error('Get transaction receipt', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transaction receipt',
        error: error.message
      });
    }
  }
);

module.exports = router;