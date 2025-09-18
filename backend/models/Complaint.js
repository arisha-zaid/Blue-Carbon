const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["image", "video", "document", "audio"],
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: String,
  size: Number,
  mimeType: String,
  url: String,
  ipfsHash: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Allow null for anonymous uploads
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  verifiedAt: Date,
  description: String,
});

const updateSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      "submitted",
      "under_review",
      "investigating",
      "resolved",
      "rejected",
      "escalated",
    ],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  attachments: [String], // IPFS hashes
});

const complaintSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
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
    category: {
      type: String,
      enum: [
        "air_pollution",
        "water_pollution",
        "soil_contamination",
        "noise_violation",
        "waste_management",
        "forest_destruction",
        "illegal_dumping",
        "other",
      ],
      required: true,
    },
    subcategory: String,
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // Location Information
    location: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      city: String,
      state: String,
      country: {
        type: String,
        default: "India",
      },
      pincode: String,
      landmark: String,
    },

    // Complainant Information
    complainant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return !this.isAnonymous;
      },
    },
    contactInfo: {
      name: String,
      email: String,
      phone: String,
      alternatePhone: String,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // Status and Tracking
    status: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "investigating",
        "resolved",
        "rejected",
        "escalated",
      ],
      default: "submitted",
    },
    complaintNumber: {
      type: String,
      unique: true,
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedAt: Date,
    department: String,

    // Resolution Information
    resolution: {
      summary: String,
      actions: [String],
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      resolvedAt: Date,
      followUpRequired: {
        type: Boolean,
        default: false,
      },
      followUpDate: Date,
      satisfactionRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
    },

    // Evidence and Documentation
    evidence: [evidenceSchema],
    documents: [String], // IPFS hashes
    additionalNotes: String,

    // Timeline and Updates
    updates: [updateSchema],
    estimatedResolutionDate: Date,
    actualResolutionDate: Date,

    // Blockchain Integration
    blockchainData: {
      complaintId: String, // On-chain complaint ID
      txHash: String, // Transaction hash of complaint submission
      blockNumber: Number,
      ipfsHash: String, // Hash of complaint data stored on IPFS
      isOnChain: {
        type: Boolean,
        default: false,
      },
      lastSyncedAt: Date,
    },

    // Community Interaction
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    supportingComplaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint",
      },
    ],
    relatedComplaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint",
      },
    ],

    // Urgency and Impact
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "medium",
    },
    impactArea: {
      type: String,
      enum: ["local", "district", "state", "national", "global"],
      default: "local",
    },
    affectedPopulation: Number,
    environmentalImpact: {
      severity: {
        type: String,
        enum: ["minor", "moderate", "severe", "critical"],
      },
      duration: {
        type: String,
        enum: ["temporary", "short_term", "long_term", "permanent"],
      },
      reversibility: {
        type: String,
        enum: ["reversible", "partially_reversible", "irreversible"],
      },
    },

    // Validation and Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,
    verificationNotes: String,

    // Privacy and Permissions
    isPublic: {
      type: Boolean,
      default: true,
    },
    sensitiveInformation: {
      type: Boolean,
      default: false,
    },
    allowMediaSharing: {
      type: Boolean,
      default: true,
    },

    // System Fields
    source: {
      type: String,
      enum: ["web", "mobile", "api", "phone", "email", "in_person"],
      default: "web",
    },
    tags: [String],
    metadata: mongoose.Schema.Types.Mixed,

    // Audit Trail
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
complaintSchema.index({ complaintNumber: 1 }, { unique: true });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ "location.coordinates": "2dsphere" });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ priority: 1, urgency: 1 });
complaintSchema.index({ "blockchainData.complaintId": 1 });
complaintSchema.index({ tags: 1 });

// Virtual fields
complaintSchema.virtual("age").get(function () {
  return Date.now() - this.createdAt;
});

complaintSchema.virtual("daysOpen").get(function () {
  const now = this.actualResolutionDate || new Date();
  return Math.ceil((now - this.createdAt) / (1000 * 60 * 60 * 24));
});

complaintSchema.virtual("isOverdue").get(function () {
  if (!this.estimatedResolutionDate || this.status === "resolved") return false;
  return new Date() > this.estimatedResolutionDate;
});

// Pre-save middleware to generate complaint number
complaintSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    // Find the last complaint for this month
    const lastComplaint = await this.constructor
      .findOne({
        complaintNumber: new RegExp(`^CMP${year}${month}`),
      })
      .sort({ complaintNumber: -1 });

    let sequence = 1;
    if (lastComplaint) {
      const lastSequence = parseInt(lastComplaint.complaintNumber.substr(-4));
      sequence = lastSequence + 1;
    }

    this.complaintNumber = `CMP${year}${month}${String(sequence).padStart(
      4,
      "0"
    )}`;
  }
  next();
});

// Pre-save middleware to update version
complaintSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  next();
});

// Methods
complaintSchema.methods.addUpdate = function (
  status,
  message,
  updatedBy,
  isPublic = true
) {
  this.updates.push({
    status,
    message,
    updatedBy,
    isPublic,
    timestamp: new Date(),
  });

  if (this.status !== status) {
    this.status = status;
  }

  return this.save();
};

complaintSchema.methods.addEvidence = function (evidenceData) {
  this.evidence.push({
    ...evidenceData,
    uploadedAt: new Date(),
  });

  return this.save();
};

complaintSchema.methods.assignTo = function (userId, assignedBy) {
  this.assignedTo = userId;
  this.assignedAt = new Date();
  this.lastModifiedBy = assignedBy;

  return this.addUpdate("under_review", `Assigned to ${userId}`, assignedBy);
};

complaintSchema.methods.resolve = function (resolutionData, resolvedBy) {
  this.status = "resolved";
  this.resolution = {
    ...resolutionData,
    resolvedBy,
    resolvedAt: new Date(),
  };
  this.actualResolutionDate = new Date();
  this.lastModifiedBy = resolvedBy;

  return this.addUpdate(
    "resolved",
    resolutionData.summary || "Complaint resolved",
    resolvedBy
  );
};

complaintSchema.methods.getPublicData = function () {
  const obj = this.toObject();

  // Remove sensitive information if anonymous
  if (this.isAnonymous) {
    delete obj.complainant;
    delete obj.contactInfo;
  }

  // Remove sensitive fields if not public
  if (!this.isPublic) {
    delete obj.contactInfo;
    if (this.sensitiveInformation) {
      obj.description = "Description hidden for privacy";
      obj.location.address = `${obj.location.city}, ${obj.location.state}`;
    }
  }

  return obj;
};

complaintSchema.methods.canBeViewedBy = function (user) {
  // Admin and assigned users can view all
  if (
    user &&
    (user.role === "admin" ||
      user._id.equals(this.assignedTo) ||
      user._id.equals(this.complainant))
  ) {
    return true;
  }

  // Public complaints can be viewed by all
  return this.isPublic;
};

complaintSchema.methods.canBeEditedBy = function (user) {
  if (!user) return false;

  // Admin can edit all
  if (user.role === "admin") return true;

  // Complainant can edit their own (if not resolved)
  if (user._id.equals(this.complainant) && this.status !== "resolved") {
    return true;
  }

  // Assigned user can edit
  if (user._id.equals(this.assignedTo)) return true;

  return false;
};

// Static methods
complaintSchema.statics.getStatistics = async function () {
  const pipeline = [
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ];

  const statusCounts = await this.aggregate(pipeline);

  const total = await this.countDocuments();
  const resolved = await this.countDocuments({ status: "resolved" });
  const pending = await this.countDocuments({
    status: { $in: ["submitted", "under_review", "investigating"] },
  });

  const avgResolutionTime = await this.aggregate([
    {
      $match: {
        status: "resolved",
        actualResolutionDate: { $exists: true },
      },
    },
    {
      $group: {
        _id: null,
        avgTime: {
          $avg: {
            $subtract: ["$actualResolutionDate", "$createdAt"],
          },
        },
      },
    },
  ]);

  return {
    total,
    resolved,
    pending,
    resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(2) : 0,
    avgResolutionDays: avgResolutionTime[0]
      ? Math.round(avgResolutionTime[0].avgTime / (1000 * 60 * 60 * 24))
      : 0,
    statusBreakdown: statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };
};

complaintSchema.statics.findSimilar = function (complaint) {
  return this.find({
    _id: { $ne: complaint._id },
    category: complaint.category,
    "location.city": complaint.location.city,
    status: { $ne: "resolved" },
  }).limit(5);
};

module.exports = mongoose.model("Complaint", complaintSchema);
