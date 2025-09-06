const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const CommunityProfile = require("../models/CommunityProfile");
const User = require("../models/User");
// Use only the isAuthenticated middleware, keep existing variable name 'auth'
const { isAuthenticated: auth } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads/community-documents");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images and documents are allowed"));
    }
  },
});

// @route   GET /api/community/profiles
// @desc    Get all community profiles (public)
// @access  Public
router.get("/profiles", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      state,
      district,
      communityType,
      ecosystemTypes,
      activities,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filters
    const filters = {
      profileStatus: "Verified",
      "visibility.isPublicProfile": true,
    };

    if (state) filters["location.state"] = new RegExp(state, "i");
    if (district) filters["location.district"] = new RegExp(district, "i");
    if (communityType) filters.communityType = communityType;
    if (ecosystemTypes) {
      filters["location.ecosystemTypes"] = { $in: ecosystemTypes.split(",") };
    }
    if (activities) {
      filters["blueCarbonActivities.interests"] = { $in: activities.split(",") };
    }

    // Build search query
    if (search) {
      filters.$or = [
        { communityName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "location.district": { $regex: search, $options: "i" } },
        { "location.state": { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const communities = await CommunityProfile.find(filters)
      .populate("userId", "firstName lastName profilePicture")
      .select("-documents -activityHistory -financialInfo")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CommunityProfile.countDocuments(filters);

    res.json({
      success: true,
      data: {
        communities: communities.map(community => community.getPublicProfile()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCommunities: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching community profiles:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching community profiles",
      error: error.message,
    });
  }
});

// @route   GET /api/community/profile/:id
// @desc    Get community profile by ID
// @access  Public
router.get("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid community profile ID",
      });
    }

    const community = await CommunityProfile.findById(id)
      .populate("userId", "firstName lastName profilePicture email")
      .populate("projectsParticipated.projectId", "name status description");

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community profile not found",
      });
    }

    // Check if profile is public or user has access
    if (!community.visibility.isPublicProfile && community.profileStatus !== "Verified") {
      return res.status(403).json({
        success: false,
        message: "This community profile is not public",
      });
    }

    res.json({
      success: true,
      data: community.getPublicProfile(),
    });
  } catch (error) {
    console.error("Error fetching community profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching community profile",
      error: error.message,
    });
  }
});

// @route   GET /api/community/my-profile
// @desc    Get current user's community profile
// @access  Private
router.get("/my-profile", auth, async (req, res) => {
  try {
    const community = await CommunityProfile.findOne({ userId: req.user._id })
      .populate("userId", "firstName lastName profilePicture email")
      .populate("projectsParticipated.projectId", "name status description");

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community profile not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...community.toObject(),
        completionPercentage: community.getCompletionPercentage(),
      },
    });
  } catch (error) {
    console.error("Error fetching user's community profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching community profile",
      error: error.message,
    });
  }
});

// @route   POST /api/community/profile
// @desc    Create community profile
// @access  Private
router.post("/profile", auth, async (req, res) => {
  try {
    // Check if user already has a community profile
    const existingProfile = await CommunityProfile.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Community profile already exists for this user",
      });
    }

    // Verify user role
    const user = await User.findById(req.user._id);
    if (user.role !== "community") {
      return res.status(403).json({
        success: false,
        message: "Only community users can create community profiles",
      });
    }

    const communityData = {
      userId: req.user._id,
      ...req.body,
    };

    const community = new CommunityProfile(communityData);
    await community.save();

    // Populate user data
    await community.populate("userId", "firstName lastName profilePicture email");

    res.status(201).json({
      success: true,
      message: "Community profile created successfully",
      data: {
        ...community.toObject(),
        completionPercentage: community.getCompletionPercentage(),
      },
    });
  } catch (error) {
    console.error("Error creating community profile:", error);
    
    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating community profile",
      error: error.message,
    });
  }
});

// @route   PUT /api/community/profile
// @desc    Update community profile
// @access  Private
router.put("/profile", auth, async (req, res) => {
  try {
    const community = await CommunityProfile.findOne({ userId: req.user._id });
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community profile not found",
      });
    }

    // Check if profile is under review or verified
    if (community.profileStatus === "Under Review") {
      return res.status(400).json({
        success: false,
        message: "Cannot update profile while under review",
      });
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        community[key] = req.body[key];
      }
    });

    // If profile was verified and now being updated, set to draft
    if (community.profileStatus === "Verified") {
      community.profileStatus = "Draft";
    }

    await community.save();
    await community.populate("userId", "firstName lastName profilePicture email");

    res.json({
      success: true,
      message: "Community profile updated successfully",
      data: {
        ...community.toObject(),
        completionPercentage: community.getCompletionPercentage(),
      },
    });
  } catch (error) {
    console.error("Error updating community profile:", error);
    
    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating community profile",
      error: error.message,
    });
  }
});

// @route   POST /api/community/profile/submit
// @desc    Submit community profile for review
// @access  Private
router.post("/profile/submit", auth, async (req, res) => {
  try {
    const community = await CommunityProfile.findOne({ userId: req.user.id });
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community profile not found",
      });
    }

    if (community.profileStatus !== "Draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft profiles can be submitted for review",
      });
    }

    // Check completion percentage
    const completionPercentage = community.getCompletionPercentage();
    if (completionPercentage < 70) {
      return res.status(400).json({
        success: false,
        message: `Profile is only ${completionPercentage}% complete. Please complete at least 70% before submitting.`,
      });
    }

    community.profileStatus = "Submitted";
    community.submittedAt = new Date();
    
    // Add activity history
    community.activityHistory.push({
      activity: "Profile Submitted for Review",
      performedBy: req.user._id,
      description: "Community profile submitted for verification",
    });

    await community.save();

    res.json({
      success: true,
      message: "Community profile submitted for review successfully",
      data: {
        profileStatus: community.profileStatus,
        submittedAt: community.submittedAt,
      },
    });
  } catch (error) {
    console.error("Error submitting community profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting community profile",
      error: error.message,
    });
  }
});

// @route   POST /api/community/profile/documents
// @desc    Upload community documents
// @access  Private
router.post("/profile/documents", auth, upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document file provided",
      });
    }

    const { documentType, documentNumber } = req.body;

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: "Document type is required",
      });
    }

    const community = await CommunityProfile.findOne({ userId: req.user._id });
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community profile not found",
      });
    }

    const documentData = {
      documentType,
      documentNumber,
      documentUrl: req.file.path,
      uploadDate: new Date(),
    };

    community.documents.push(documentData);
    
    // Add activity history
    community.activityHistory.push({
      activity: "Document Uploaded",
      performedBy: req.user._id,
      description: `Uploaded ${documentType}`,
    });

    await community.save();

    res.json({
      success: true,
      message: "Document uploaded successfully",
      data: {
        document: documentData,
        totalDocuments: community.documents.length,
      },
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({
      success: false,
      message: "Server error while uploading document",
      error: error.message,
    });
  }
});

// @route   GET /api/community/nearby
// @desc    Get nearby communities
// @access  Public
router.get("/nearby", async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 50000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const nearbyCommunities = await CommunityProfile.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(maxDistance)
    ).populate("userId", "firstName lastName profilePicture");

    res.json({
      success: true,
      data: {
        communities: nearbyCommunities.map(community => community.getPublicProfile()),
        searchCenter: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        maxDistance: parseInt(maxDistance),
      },
    });
  } catch (error) {
    console.error("Error finding nearby communities:", error);
    res.status(500).json({
      success: false,
      message: "Server error while finding nearby communities",
      error: error.message,
    });
  }
});

// @route   GET /api/community/stats
// @desc    Get community statistics
// @access  Public
router.get("/stats", async (req, res) => {
  try {
    const stats = await CommunityProfile.aggregate([
      {
        $match: {
          profileStatus: "Verified",
          "visibility.isPublicProfile": true,
        },
      },
      {
        $group: {
          _id: null,
          totalCommunities: { $sum: 1 },
          totalPopulation: { $sum: "$demographics.totalPopulation" },
          totalHouseholds: { $sum: "$demographics.totalHouseholds" },
          stateDistribution: {
            $push: "$location.state",
          },
          communityTypeDistribution: {
            $push: "$communityType",
          },
          ecosystemTypeDistribution: {
            $push: "$location.ecosystemTypes",
          },
        },
      },
    ]);

    const stateStats = await CommunityProfile.aggregate([
      {
        $match: {
          profileStatus: "Verified",
          "visibility.isPublicProfile": true,
        },
      },
      {
        $group: {
          _id: "$location.state",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const communityTypeStats = await CommunityProfile.aggregate([
      {
        $match: {
          profileStatus: "Verified",
          "visibility.isPublicProfile": true,
        },
      },
      {
        $group: {
          _id: "$communityType",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalCommunities: 0,
          totalPopulation: 0,
          totalHouseholds: 0,
        },
        stateDistribution: stateStats,
        communityTypeDistribution: communityTypeStats,
      },
    });
  } catch (error) {
    console.error("Error fetching community statistics:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching statistics",
      error: error.message,
    });
  }
});

// @route   DELETE /api/community/profile
// @desc    Delete community profile
// @access  Private
router.delete("/profile", auth, async (req, res) => {
  try {
    const community = await CommunityProfile.findOne({ userId: req.user._id });
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community profile not found",
      });
    }

    // Delete associated documents
    community.documents.forEach((doc) => {
      if (fs.existsSync(doc.documentUrl)) {
        fs.unlinkSync(doc.documentUrl);
      }
    });

    await CommunityProfile.findByIdAndDelete(community._id);

    res.json({
      success: true,
      message: "Community profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting community profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting community profile",
      error: error.message,
    });
  }
});

module.exports = router;