const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  targetDate: {
    type: Date,
    required: true,
  },
  completedDate: Date,
  isCompleted: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  evidence: {
    description: String,
    files: [String], // IPFS hashes
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,
  },
  budget: {
    allocated: Number,
    spent: Number,
  },
});

const fundingRecordSchema = new mongoose.Schema({
  funder: {
    name: String,
    email: String,
    organization: String,
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: "ETH",
  },
  transactionHash: String,
  blockNumber: Number,
  fundingType: {
    type: String,
    enum: ["grant", "donation", "investment", "government", "crowdfunding"],
    default: "donation",
  },
  message: String,
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringInterval: {
    type: String,
    enum: ["monthly", "quarterly", "yearly"],
  },
  fundedAt: {
    type: Date,
    default: Date.now,
  },
});

const carbonImpactSchema = new mongoose.Schema({
  baseline: {
    co2Equivalent: Number, // tons CO2e
    measurementDate: Date,
    methodology: String,
    verifiedBy: String,
  },
  projections: [
    {
      year: Number,
      estimatedReduction: Number,
      confidence: {
        type: String,
        enum: ["low", "medium", "high"],
      },
    },
  ],
  actualImpact: [
    {
      year: Number,
      month: Number,
      actualReduction: Number,
      measurement: {
        date: Date,
        method: String,
        verifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    },
  ],
  certifications: [
    {
      type: String,
      issuer: String,
      certificateNumber: String,
      issuedDate: Date,
      expiryDate: Date,
      ipfsHash: String,
    },
  ],
});

const projectSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    shortDescription: {
      type: String,
      maxlength: 500,
    },

    // Project Classification
    type: {
      type: String,
      enum: [
        "reforestation",
        "renewable_energy",
        "waste_management",
        "carbon_capture",
        "biodiversity_conservation",
        "sustainable_agriculture",
        "clean_water",
        "green_technology",
        "other",
      ],
      required: true,
    },
    category: {
      type: String,
      enum: ["mitigation", "adaptation", "conservation", "restoration"],
    },
    tags: [String],

    // Location
    location: {
      address: String,
      coordinates: {
        latitude: {
          type: Number,
          min: -90,
          max: 90,
        },
        longitude: {
          type: Number,
          min: -180,
          max: 180,
        },
      },
      city: String,
      state: String,
      country: {
        type: String,
        required: true,
      },
      region: String,
      area: Number, // in hectares or square meters
      elevation: Number,
    },

    // Project Team
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    team: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: [
            "project_manager",
            "technical_lead",
            "environmental_scientist",
            "community_coordinator",
            "financial_manager",
            "advisor",
          ],
        },
        permissions: [
          {
            type: String,
            enum: ["view", "edit", "manage_funding", "verify", "report"],
          },
        ],
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    organization: {
      name: String,
      type: {
        type: String,
        enum: ["ngo", "government", "private", "academic", "community"],
      },
      website: String,
      contact: {
        email: String,
        phone: String,
      },
    },

    // Status and Timeline
    status: {
      type: String,
      enum: [
        "draft",
        "proposed",
        "under_review",
        "Pending MRV",
        "MRV Complete",
        "approved",
        "Blockchain Anchored",
        "Certificate Issued",
        "active",
        "paused",
        "completed",
        "verified",
        "rejected",
        "cancelled",
      ],
      default: "draft",
    },
    phase: {
      type: String,
      enum: [
        "planning",
        "implementation",
        "monitoring",
        "verification",
        "maintenance",
      ],
    },
    startDate: Date,
    endDate: Date,
    actualStartDate: Date,
    actualEndDate: Date,
    duration: Number, // in months

    // Financial Information
    funding: {
      goal: {
        type: Number,
        required: true,
        min: 0,
      },
      raised: {
        type: Number,
        default: 0,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
      breakdown: {
        equipment: Number,
        personnel: Number,
        materials: Number,
        monitoring: Number,
        verification: Number,
        contingency: Number,
        other: Number,
      },
      records: [fundingRecordSchema],
    },

    // Environmental Impact
    carbonImpact: carbonImpactSchema,
    biodiversityImpact: {
      speciesProtected: [String],
      habitatRestored: Number, // in hectares
      ecosystemServices: [String],
    },
    socialImpact: {
      beneficiaries: {
        type: Number,
        default: 0,
      },
      communities: {
        type: [String],
        default: [],
      },
      jobs: {
        created: {
          type: Number,
          default: 0,
        },
        type: {
          type: [String],
          default: [],
        },
      },
      capacity: {
        training: {
          type: Number,
          default: 0,
        },
        skills: {
          type: [String],
          default: [],
        },
      },
    },

    // Documentation
    documents: [
      {
        name: String,
        type: {
          type: String,
          enum: [
            "proposal",
            "report",
            "certificate",
            "image",
            "video",
            "other",
          ],
        },
        ipfsHash: String,
        url: String,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        isPublic: {
          type: Boolean,
          default: true,
        },
      },
    ],
    images: [String], // IPFS hashes or URLs
    videos: [String],

    // Milestones and Progress
    milestones: [milestoneSchema],
    progress: {
      overall: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      lastUpdated: Date,
      updates: [
        {
          message: String,
          progress: Number,
          updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          updatedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // Blockchain Integration
    blockchain: {
      projectId: String, // On-chain project ID
      contractAddress: String,
      txHash: String, // Registration transaction
      blockNumber: Number,
      ipfsHash: String, // Project data hash
      isOnChain: {
        type: Boolean,
        default: false,
      },
      certificateTokenId: String, // NFT certificate ID
      lastSyncedAt: Date,
    },

    // Verification and Approval
    verification: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedBy: [
        {
          verifier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          organization: String,
          verificationDate: Date,
          certificateHash: String,
          expiryDate: Date,
          methodology: String,
          comments: String,
        },
      ],
      standards: [
        {
          name: String, // e.g., 'VCS', 'Gold Standard', 'CDM'
          version: String,
          status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
          },
        },
      ],
    },

    // Monitoring and Reporting
    monitoring: {
      frequency: {
        type: String,
        enum: ["weekly", "monthly", "quarterly", "annually"],
      },
      parameters: [String],
      reports: [
        {
          title: String,
          period: {
            start: Date,
            end: Date,
          },
          summary: String,
          metrics: mongoose.Schema.Types.Mixed,
          ipfsHash: String,
          submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          submittedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      nextReportDue: Date,
    },

    // Community and Stakeholders
    stakeholders: [
      {
        name: String,
        type: {
          type: String,
          enum: ["community", "government", "ngo", "investor", "beneficiary"],
        },
        contact: String,
        role: String,
        involvement: {
          type: String,
          enum: ["primary", "secondary", "observer"],
        },
      },
    ],

    // Risks and Issues
    risks: [
      {
        category: {
          type: String,
          enum: [
            "environmental",
            "financial",
            "technical",
            "social",
            "regulatory",
          ],
        },
        description: String,
        probability: {
          type: String,
          enum: ["low", "medium", "high"],
        },
        impact: {
          type: String,
          enum: ["low", "medium", "high"],
        },
        mitigation: String,
        status: {
          type: String,
          enum: ["open", "monitoring", "closed"],
          default: "open",
        },
      },
    ],

    // Settings and Preferences
    settings: {
      isPublic: {
        type: Boolean,
        default: true,
      },
      allowPublicFunding: {
        type: Boolean,
        default: true,
      },
      autoUpdateProgress: {
        type: Boolean,
        default: true,
      },
      notifications: {
        funding: Boolean,
        milestones: Boolean,
        verification: Boolean,
      },
    },

    // Analytics and Metrics
    analytics: {
      views: {
        type: Number,
        default: 0,
      },
      supporters: {
        type: Number,
        default: 0,
      },
      shareCount: {
        type: Number,
        default: 0,
      },
      rating: {
        average: Number,
        count: Number,
        reviews: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            rating: {
              type: Number,
              min: 1,
              max: 5,
            },
            review: String,
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    },

    // System Fields
    metadata: mongoose.Schema.Types.Mixed,
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
projectSchema.index({ name: "text", description: "text" });
projectSchema.index({ owner: 1 });
projectSchema.index({ status: 1, type: 1 });
projectSchema.index({ "location.coordinates": "2dsphere" });
projectSchema.index({ tags: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ "funding.goal": 1, "funding.raised": 1 });
projectSchema.index({ "verification.isVerified": 1 });
projectSchema.index({ "blockchain.projectId": 1 });

// Virtual fields
projectSchema.virtual("fundingPercentage").get(function () {
  return this.funding.goal > 0
    ? Math.round((this.funding.raised / this.funding.goal) * 100)
    : 0;
});

projectSchema.virtual("totalCarbonReduction").get(function () {
  if (!this.carbonImpact.actualImpact.length) return 0;
  return this.carbonImpact.actualImpact.reduce(
    (total, impact) => total + impact.actualReduction,
    0
  );
});

projectSchema.virtual("daysRemaining").get(function () {
  if (!this.endDate || this.status === "completed") return 0;
  const now = new Date();
  const end = new Date(this.endDate);
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
});

projectSchema.virtual("isOverdue").get(function () {
  if (!this.endDate || this.status === "completed") return false;
  return new Date() > new Date(this.endDate);
});

// Pre-save middleware
projectSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
    this.lastModifiedBy = this.modifiedBy || this.owner;
  }

  // Update progress
  if (this.milestones.length > 0) {
    const completedMilestones = this.milestones.filter((m) => m.isCompleted);
    this.progress.overall = Math.round(
      (completedMilestones.length / this.milestones.length) * 100
    );
    this.progress.lastUpdated = new Date();
  }

  next();
});

// Methods
projectSchema.methods.addFunding = function (fundingData) {
  this.funding.records.push({
    ...fundingData,
    fundedAt: new Date(),
  });

  this.funding.raised += fundingData.amount;
  this.analytics.supporters += 1;

  return this.save();
};

projectSchema.methods.addMilestone = function (milestoneData) {
  this.milestones.push({
    ...milestoneData,
  });

  return this.save();
};

projectSchema.methods.completeMilestone = function (
  milestoneId,
  evidenceData,
  verifiedBy
) {
  const milestone = this.milestones.id(milestoneId);
  if (!milestone) {
    throw new Error("Milestone not found");
  }

  milestone.isCompleted = true;
  milestone.completedDate = new Date();
  milestone.progress = 100;
  milestone.evidence = {
    ...evidenceData,
    verifiedBy,
    verifiedAt: new Date(),
  };

  return this.save();
};

projectSchema.methods.addProgressUpdate = function (
  message,
  progress,
  updatedBy
) {
  this.progress.updates.push({
    message,
    progress,
    updatedBy,
    updatedAt: new Date(),
  });

  if (progress !== undefined) {
    this.progress.overall = progress;
    this.progress.lastUpdated = new Date();
  }

  return this.save();
};

projectSchema.methods.addCarbonMeasurement = function (
  year,
  month,
  actualReduction,
  measurementData
) {
  this.carbonImpact.actualImpact.push({
    year,
    month,
    actualReduction,
    measurement: {
      ...measurementData,
      date: new Date(),
    },
  });

  return this.save();
};

projectSchema.methods.verify = function (verificationData) {
  this.verification.verifiedBy.push({
    ...verificationData,
    verificationDate: new Date(),
  });

  this.verification.isVerified = true;

  if (this.status === "completed") {
    this.status = "verified";
  }

  return this.save();
};

projectSchema.methods.getPublicData = function () {
  const obj = this.toObject();

  // Remove sensitive information
  if (!this.settings.isPublic) {
    delete obj.team;
    delete obj.funding.records;
    delete obj.stakeholders;
  }

  return obj;
};

projectSchema.methods.canBeViewedBy = function (user) {
  // Public projects can be viewed by all
  if (this.settings.isPublic) return true;

  if (!user) return false;

  // Owner and team members can view
  if (user._id.equals(this.owner)) return true;

  const teamMember = this.team.find(
    (member) => member.user && member.user.equals(user._id)
  );
  if (teamMember) return true;

  // Admin can view all
  if (user.role === "admin") return true;

  return false;
};

projectSchema.methods.canBeEditedBy = function (user) {
  if (!user) return false;

  // Owner can edit
  if (user._id.equals(this.owner)) return true;

  // Team members with edit permission
  const teamMember = this.team.find(
    (member) => member.user && member.user.equals(user._id)
  );
  if (teamMember && teamMember.permissions.includes("edit")) {
    return true;
  }

  // Admin can edit
  if (user.role === "admin") return true;

  return false;
};

// Static methods
projectSchema.statics.getStatistics = async function () {
  const pipeline = [
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalFunding: { $sum: "$funding.raised" },
      },
    },
  ];

  const statusStats = await this.aggregate(pipeline);
  const total = await this.countDocuments();
  const totalFunding = await this.aggregate([
    { $group: { _id: null, total: { $sum: "$funding.raised" } } },
  ]);

  const totalCarbonReduction = await this.aggregate([
    { $unwind: "$carbonImpact.actualImpact" },
    {
      $group: {
        _id: null,
        total: { $sum: "$carbonImpact.actualImpact.actualReduction" },
      },
    },
  ]);

  return {
    total,
    totalFunding: totalFunding[0]?.total || 0,
    totalCarbonReduction: totalCarbonReduction[0]?.total || 0,
    statusBreakdown: statusStats.reduce((acc, item) => {
      acc[item._id] = {
        count: item.count,
        funding: item.totalFunding,
      };
      return acc;
    }, {}),
  };
};

projectSchema.statics.findNearby = function (
  latitude,
  longitude,
  maxDistance = 1000
) {
  return this.find({
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance * 1000, // Convert km to meters
      },
    },
  });
};

projectSchema.statics.findByType = function (type, filters = {}) {
  return this.find({
    type,
    ...filters,
  }).populate("owner", "firstName lastName organization");
};

module.exports = mongoose.model("Project", projectSchema);
