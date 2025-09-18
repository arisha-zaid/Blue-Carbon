const express = require("express");
const router = express.Router();
const { body, validationResult, param, query } = require("express-validator");
const multer = require("multer");
const { isAuthenticated: auth } = require("../middleware/auth");
const logger = require("../utils/logger");
const ipfsService = require("../services/ipfsService");
const Complaint = require("../models/Complaint");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/mpeg",
      "audio/mpeg",
      "audio/wav",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});

// Error handler for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB per file.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 10 files per upload.",
      });
    }
  }
  if (error.message === "Invalid file type") {
    return res.status(400).json({
      success: false,
      message:
        "Invalid file type. Allowed types: JPEG, PNG, GIF, MP4, MPEG, MP3, WAV, PDF, DOC, DOCX",
    });
  }
  next(error);
};

/**
 * @route   POST /api/complaints
 * @desc    Create a new complaint
 * @access  Public (can be anonymous)
 */
router.post(
  "/",
  upload.array("evidence", 10),
  handleMulterError,
  [
    body("title")
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage("Title must be between 5-200 characters"),
    body("description")
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage("Description must be between 10-5000 characters"),
    body("category")
      .isIn([
        "air_pollution",
        "water_pollution",
        "soil_contamination",
        "noise_violation",
        "waste_management",
        "forest_destruction",
        "illegal_dumping",
        "other",
      ])
      .withMessage("Invalid category"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "critical"])
      .withMessage("Invalid priority"),
    body("urgency")
      .optional()
      .isIn(["low", "medium", "high", "emergency"])
      .withMessage("Invalid urgency"),
    body("location.address")
      .trim()
      .notEmpty()
      .withMessage("Location address is required"),
    body("location.coordinates.latitude")
      .optional()
      .isFloat({ min: -90, max: 90 }),
    body("location.coordinates.longitude")
      .optional()
      .isFloat({ min: -180, max: 180 }),
    body("contactInfo.name").optional().trim().isLength({ min: 2, max: 100 }),
    body("contactInfo.email")
      .optional()
      .isEmail()
      .withMessage("Invalid email format"),
    body("contactInfo.phone")
      .optional()
      .isMobilePhone()
      .withMessage("Invalid phone number"),
    body("isAnonymous").optional().isBoolean(),
    body("isPublic").optional().isBoolean(),
    body("tags").optional().isArray(),
    body("impactArea")
      .optional()
      .isIn(["local", "district", "state", "national", "global"]),
    body("affectedPopulation").optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        title,
        description,
        category,
        subcategory,
        priority = "medium",
        urgency = "medium",
        location,
        contactInfo = {},
        isAnonymous = false,
        isPublic = true,
        tags = [],
        impactArea = "local",
        affectedPopulation,
        environmentalImpact = {},
        additionalNotes,
        allowMediaSharing = true,
      } = req.body;

      // Validate that either user is authenticated or providing contact info for non-anonymous complaints
      if (!isAnonymous && !req.user && !contactInfo.email) {
        return res.status(400).json({
          success: false,
          message:
            "Contact information is required for non-anonymous complaints",
        });
      }

      // Process uploaded files and upload to IPFS
      const evidenceList = [];
      if (req.files && req.files.length > 0) {
        logger.info(
          `Processing ${req.files.length} evidence files for complaint`
        );

        for (const file of req.files) {
          try {
            // Upload to IPFS
            const ipfsResult = await ipfsService.uploadWithMetadata(
              file.buffer,
              {
                filename: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                userId: req.user?._id,
                uploadType: "complaint_evidence",
              }
            );

            // Determine file type
            let fileType = "document";
            if (file.mimetype.startsWith("image/")) fileType = "image";
            else if (file.mimetype.startsWith("video/")) fileType = "video";
            else if (file.mimetype.startsWith("audio/")) fileType = "audio";

            evidenceList.push({
              type: fileType,
              filename: file.originalname,
              originalName: file.originalname,
              size: file.size,
              mimeType: file.mimetype,
              ipfsHash: ipfsResult.file.hash,
              url: ipfsResult.file.url,
              uploadedBy: req.user?._id || null, // Allow null for anonymous uploads
              description: `Evidence file: ${file.originalname}`,
            });
          } catch (error) {
            logger.error(
              `Failed to upload evidence file ${file.originalname}:`,
              error
            );
            // Continue with other files, but log the error
          }
        }
      }

      // Create complaint
      const complaintData = {
        title,
        description,
        category,
        subcategory,
        priority,
        urgency,
        location: {
          address: location.address,
          coordinates: location.coordinates
            ? {
                latitude: location.coordinates.latitude,
                longitude: location.coordinates.longitude,
              }
            : undefined,
          city: location.city,
          state: location.state,
          country: location.country || "India",
          pincode: location.pincode,
          landmark: location.landmark,
        },
        complainant: isAnonymous ? null : req.user?._id,
        contactInfo: isAnonymous
          ? {}
          : {
              name:
                contactInfo.name ||
                (req.user ? `${req.user.firstName} ${req.user.lastName}` : ""),
              email: contactInfo.email || req.user?.email,
              phone: contactInfo.phone,
              alternatePhone: contactInfo.alternatePhone,
            },
        isAnonymous,
        isPublic,
        evidence: evidenceList,
        tags,
        impactArea,
        affectedPopulation,
        environmentalImpact: {
          severity: environmentalImpact.severity,
          duration: environmentalImpact.duration,
          reversibility: environmentalImpact.reversibility,
        },
        additionalNotes,
        allowMediaSharing,
        source: req.get("User-Agent")?.includes("Mobile") ? "mobile" : "web",
        lastModifiedBy: req.user?._id,
      };

      // Add blockchain data to complaint data if IPFS upload succeeds
      let blockchainData = {};

      // Upload complaint data to IPFS for blockchain integration (if needed)
      try {
        const complaintMetadata = {
          title,
          category,
          priority,
          location: location.address,
          timestamp: new Date(),
          evidenceCount: evidenceList.length,
          isVerified: false,
        };

        const metadataResult = await ipfsService.uploadJSON(
          complaintMetadata,
          `complaint_metadata.json`
        );

        blockchainData = {
          ipfsHash: metadataResult.hash,
          isOnChain: false,
          lastSyncedAt: new Date(),
        };
      } catch (error) {
        logger.warn(
          "Failed to upload complaint metadata to IPFS:",
          error.message
        );
      }

      // Add blockchain data to complaint data
      complaintData.blockchainData = blockchainData;

      const complaint = new Complaint(complaintData);
      await complaint.save();

      logger.api.request("POST", "/api/complaints", req.user?._id, {
        complaintNumber: complaint.complaintNumber,
        category,
        priority,
        evidenceCount: evidenceList.length,
      });

      const responseData =
        isPublic || (req.user && complaint.canBeViewedBy(req.user))
          ? complaint.getPublicData()
          : {
              _id: complaint._id,
              complaintNumber: complaint.complaintNumber,
              title,
              category,
              status: complaint.status,
              createdAt: complaint.createdAt,
              message: "Complaint submitted successfully",
            };

      res.status(201).json({
        success: true,
        message: "Complaint submitted successfully",
        data: responseData,
      });
    } catch (error) {
      logger.error("Failed to create complaint:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit complaint",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

/**
 * @route   GET /api/complaints
 * @desc    Get complaints with filtering and pagination
 * @access  Public
 */
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1-100"),
    query("category")
      .optional()
      .isIn([
        "air_pollution",
        "water_pollution",
        "soil_contamination",
        "noise_violation",
        "waste_management",
        "forest_destruction",
        "illegal_dumping",
        "other",
      ]),
    query("status")
      .optional()
      .isIn([
        "submitted",
        "under_review",
        "investigating",
        "resolved",
        "rejected",
        "escalated",
      ]),
    query("priority").optional().isIn(["low", "medium", "high", "critical"]),
    query("city").optional().trim(),
    query("state").optional().trim(),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "updatedAt", "priority", "upvotes"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
    query("search").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        page = 1,
        limit = 20,
        category,
        status,
        priority,
        city,
        state,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
        includeResolved = "true",
      } = req.query;

      // Build filter query
      const filter = { isPublic: true };

      if (category) filter.category = category;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (city) filter["location.city"] = new RegExp(city, "i");
      if (state) filter["location.state"] = new RegExp(state, "i");

      if (includeResolved === "false") {
        filter.status = { $ne: "resolved" };
      }

      // Text search
      if (search) {
        filter.$or = [
          { title: new RegExp(search, "i") },
          { description: new RegExp(search, "i") },
          { complaintNumber: new RegExp(search, "i") },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      // Sort configuration
      const sortConfig = {};
      sortConfig[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const [complaints, total] = await Promise.all([
        Complaint.find(filter)
          .sort(sortConfig)
          .skip(skip)
          .limit(parseInt(limit))
          .populate("complainant", "firstName lastName organization")
          .populate("assignedTo", "firstName lastName")
          .lean(),
        Complaint.countDocuments(filter),
      ]);

      // Format response data
      const formattedComplaints = complaints.map((complaint) => {
        // Remove sensitive information for public view
        if (complaint.isAnonymous) {
          delete complaint.complainant;
          delete complaint.contactInfo;
        }

        // Remove internal fields
        delete complaint.__v;
        delete complaint.blockchainData;

        return complaint;
      });

      const pagination = {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        count: formattedComplaints.length,
        totalRecords: total,
      };

      res.json({
        success: true,
        data: formattedComplaints,
        pagination,
        filters: {
          category,
          status,
          priority,
          city,
          state,
          search,
        },
      });
    } catch (error) {
      logger.api.error("GET", "/api/complaints", error, req.user?._id);
      res.status(500).json({
        success: false,
        message: "Failed to fetch complaints",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

/**
 * @route   GET /api/complaints/statistics
 * @desc    Get complaint statistics
 * @access  Public
 */
router.get("/statistics", async (req, res) => {
  try {
    const stats = await Complaint.getStatistics();

    // Additional statistics
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const priorityStats = await Complaint.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const monthlyStats = await Complaint.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        categoryBreakdown: categoryStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        priorityBreakdown: priorityStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        monthlyTrend: monthlyStats,
      },
    });
  } catch (error) {
    logger.error("Failed to get complaint statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

/**
 * @route   GET /api/complaints/:id
 * @desc    Get single complaint by ID
 * @access  Public/Private (based on complaint visibility)
 */
router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid complaint ID"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const complaint = await Complaint.findById(req.params.id)
        .populate(
          "complainant",
          "firstName lastName organization profilePicture"
        )
        .populate("assignedTo", "firstName lastName organization")
        .populate("updates.updatedBy", "firstName lastName")
        .populate("evidence.uploadedBy", "firstName lastName")
        .populate("resolution.resolvedBy", "firstName lastName");

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found",
        });
      }

      // Check view permissions
      if (!complaint.canBeViewedBy(req.user)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Increment view count
      complaint.views += 1;
      await complaint.save();

      // Get similar complaints
      const similarComplaints = await Complaint.findSimilar(complaint)
        .select("title category location.city status createdAt upvotes")
        .limit(5);

      const responseData = complaint.canBeViewedBy(req.user)
        ? complaint.getPublicData()
        : complaint.getPublicData();

      res.json({
        success: true,
        data: {
          ...responseData,
          similarComplaints,
        },
      });
    } catch (error) {
      logger.api.error(
        "GET",
        `/api/complaints/${req.params.id}`,
        error,
        req.user?._id
      );
      res.status(500).json({
        success: false,
        message: "Failed to fetch complaint",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

/**
 * @route   PUT /api/complaints/:id
 * @desc    Update complaint
 * @access  Private (complaint owner or admin)
 */
router.put(
  "/:id",
  auth,
  param("id").isMongoId().withMessage("Invalid complaint ID"),
  [
    body("title").optional().trim().isLength({ min: 5, max: 200 }),
    body("description").optional().trim().isLength({ min: 10, max: 5000 }),
    body("priority").optional().isIn(["low", "medium", "high", "critical"]),
    body("additionalNotes").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found",
        });
      }

      // Check edit permissions
      if (!complaint.canBeEditedBy(req.user)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Update allowed fields
      const allowedUpdates = [
        "title",
        "description",
        "priority",
        "additionalNotes",
        "tags",
      ];
      const updates = {};

      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      updates.lastModifiedBy = req.user._id;

      Object.assign(complaint, updates);
      await complaint.save();

      logger.api.request(
        "PUT",
        `/api/complaints/${req.params.id}`,
        req.user._id,
        {
          updates: Object.keys(updates),
        }
      );

      res.json({
        success: true,
        message: "Complaint updated successfully",
        data: complaint.getPublicData(),
      });
    } catch (error) {
      logger.api.error(
        "PUT",
        `/api/complaints/${req.params.id}`,
        error,
        req.user._id
      );
      res.status(500).json({
        success: false,
        message: "Failed to update complaint",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

/**
 * @route   POST /api/complaints/:id/evidence
 * @desc    Add evidence to complaint
 * @access  Private (complaint owner, assigned user, or admin)
 */
router.post(
  "/:id/evidence",
  auth,
  param("id").isMongoId().withMessage("Invalid complaint ID"),
  upload.array("evidence", 5),
  handleMulterError,
  [body("description").optional().trim().isLength({ max: 500 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found",
        });
      }

      // Check permissions (complainant, assigned user, or admin)
      const canAddEvidence =
        complaint.complainant?.equals(req.user._id) ||
        complaint.assignedTo?.equals(req.user._id) ||
        req.user.role === "admin";

      if (!canAddEvidence) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No evidence files uploaded",
        });
      }

      const { description = "" } = req.body;
      const newEvidence = [];

      // Process uploaded files
      for (const file of req.files) {
        try {
          const ipfsResult = await ipfsService.uploadWithMetadata(file.buffer, {
            filename: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            userId: req.user._id,
            complaintId: complaint._id,
            uploadType: "additional_evidence",
          });

          let fileType = "document";
          if (file.mimetype.startsWith("image/")) fileType = "image";
          else if (file.mimetype.startsWith("video/")) fileType = "video";
          else if (file.mimetype.startsWith("audio/")) fileType = "audio";

          const evidenceItem = {
            type: fileType,
            filename: file.originalname,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            ipfsHash: ipfsResult.file.hash,
            url: ipfsResult.file.url,
            uploadedBy: req.user._id,
            description:
              description || `Additional evidence: ${file.originalname}`,
          };

          await complaint.addEvidence(evidenceItem);
          newEvidence.push(evidenceItem);
        } catch (error) {
          logger.error(
            `Failed to upload evidence file ${file.originalname}:`,
            error
          );
        }
      }

      if (newEvidence.length > 0) {
        await complaint.addUpdate(
          complaint.status,
          `${newEvidence.length} additional evidence file(s) uploaded`,
          req.user._id
        );
      }

      res.json({
        success: true,
        message: `${newEvidence.length} evidence file(s) uploaded successfully`,
        data: {
          evidenceCount: newEvidence.length,
          evidence: newEvidence,
        },
      });
    } catch (error) {
      logger.api.error(
        "POST",
        `/api/complaints/${req.params.id}/evidence`,
        error,
        req.user._id
      );
      res.status(500).json({
        success: false,
        message: "Failed to upload evidence",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

/**
 * @route   POST /api/complaints/:id/vote
 * @desc    Vote on complaint (upvote/downvote)
 * @access  Private
 */
router.post(
  "/:id/vote",
  auth,
  param("id").isMongoId().withMessage("Invalid complaint ID"),
  [
    body("vote")
      .isIn(["up", "down"])
      .withMessage('Vote must be "up" or "down"'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      // For this implementation, we'll use a simple approach
      // In production, you might want to track individual votes in a separate collection

      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found",
        });
      }

      const { vote } = req.body;

      if (vote === "up") {
        complaint.upvotes += 1;
      } else {
        complaint.downvotes += 1;
      }

      await complaint.save();

      res.json({
        success: true,
        message: `${vote === "up" ? "Upvote" : "Downvote"} recorded`,
        data: {
          upvotes: complaint.upvotes,
          downvotes: complaint.downvotes,
        },
      });
    } catch (error) {
      logger.api.error(
        "POST",
        `/api/complaints/${req.params.id}/vote`,
        error,
        req.user._id
      );
      res.status(500).json({
        success: false,
        message: "Failed to record vote",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// Admin/Moderator routes

/**
 * @route   PUT /api/complaints/:id/status
 * @desc    Update complaint status
 * @access  Private (Admin/Assigned user)
 */
router.put(
  "/:id/status",
  auth,
  param("id").isMongoId().withMessage("Invalid complaint ID"),
  [
    body("status")
      .isIn([
        "submitted",
        "under_review",
        "investigating",
        "resolved",
        "rejected",
        "escalated",
      ])
      .withMessage("Invalid status"),
    body("message").trim().notEmpty().withMessage("Status message is required"),
    body("isPublic").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found",
        });
      }

      // Check permissions
      const canUpdateStatus =
        req.user.role === "admin" ||
        req.user.role === "government" ||
        complaint.assignedTo?.equals(req.user._id);

      if (!canUpdateStatus) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions to update status",
        });
      }

      const { status, message, isPublic = true } = req.body;

      await complaint.addUpdate(status, message, req.user._id, isPublic);

      logger.api.request(
        "PUT",
        `/api/complaints/${req.params.id}/status`,
        req.user._id,
        {
          oldStatus: complaint.status,
          newStatus: status,
        }
      );

      res.json({
        success: true,
        message: "Complaint status updated successfully",
        data: {
          status: complaint.status,
          lastUpdate: complaint.updates[complaint.updates.length - 1],
        },
      });
    } catch (error) {
      logger.api.error(
        "PUT",
        `/api/complaints/${req.params.id}/status`,
        error,
        req.user._id
      );
      res.status(500).json({
        success: false,
        message: "Failed to update complaint status",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

/**
 * @route   PUT /api/complaints/:id/assign
 * @desc    Assign complaint to user
 * @access  Private (Admin/Moderator)
 */
router.put(
  "/:id/assign",
  auth,
  param("id").isMongoId().withMessage("Invalid complaint ID"),
  [body("assignTo").isMongoId().withMessage("Valid user ID required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      // Check permissions
      if (req.user.role !== "admin" && req.user.role !== "government") {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions to assign complaints",
        });
      }

      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found",
        });
      }

      const { assignTo } = req.body;

      await complaint.assignTo(assignTo, req.user._id);

      res.json({
        success: true,
        message: "Complaint assigned successfully",
        data: {
          assignedTo: complaint.assignedTo,
          assignedAt: complaint.assignedAt,
        },
      });
    } catch (error) {
      logger.api.error(
        "PUT",
        `/api/complaints/${req.params.id}/assign`,
        error,
        req.user._id
      );
      res.status(500).json({
        success: false,
        message: "Failed to assign complaint",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

/**
 * @route   PUT /api/complaints/:id/resolve
 * @desc    Resolve complaint
 * @access  Private (Admin/Assigned user)
 */
router.put(
  "/:id/resolve",
  auth,
  param("id").isMongoId().withMessage("Invalid complaint ID"),
  [
    body("summary")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Summary must be 10-1000 characters"),
    body("actions")
      .optional()
      .isArray()
      .withMessage("Actions must be an array"),
    body("followUpRequired").optional().isBoolean(),
    body("followUpDate")
      .optional()
      .isISO8601()
      .withMessage("Valid follow up date required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found",
        });
      }

      // Check permissions
      const canResolve =
        req.user.role === "admin" ||
        req.user.role === "government" ||
        complaint.assignedTo?.equals(req.user._id);

      if (!canResolve) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions to resolve complaint",
        });
      }

      const {
        summary,
        actions = [],
        followUpRequired = false,
        followUpDate,
      } = req.body;

      const resolutionData = {
        summary,
        actions,
        followUpRequired,
        followUpDate:
          followUpRequired && followUpDate ? new Date(followUpDate) : null,
      };

      await complaint.resolve(resolutionData, req.user._id);

      logger.api.request(
        "PUT",
        `/api/complaints/${req.params.id}/resolve`,
        req.user._id
      );

      res.json({
        success: true,
        message: "Complaint resolved successfully",
        data: {
          status: complaint.status,
          resolution: complaint.resolution,
        },
      });
    } catch (error) {
      logger.api.error(
        "PUT",
        `/api/complaints/${req.params.id}/resolve`,
        error,
        req.user._id
      );
      res.status(500).json({
        success: false,
        message: "Failed to resolve complaint",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

module.exports = router;
