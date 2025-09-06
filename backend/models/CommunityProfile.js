const mongoose = require("mongoose");

const communityProfileSchema = new mongoose.Schema(
  {
    // Reference to user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Basic Community Information
    communityName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Community name cannot exceed 100 characters"],
    },
    communityType: {
      type: String,
      enum: [
        "Indigenous Community",
        "Fishing Community", 
        "Coastal Village",
        "Agricultural Community",
        "Conservation Group",
        "Local NGO",
        "Cooperative Society",
        "Self Help Group",
        "Other"
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    
    // Location Information
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      village: {
        type: String,
        trim: true,
      },
      district: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
        match: [/^\d{6}$/, "Please enter a valid 6-digit pincode"],
      },
      coordinates: {
        latitude: {
          type: Number,
          min: [-90, "Latitude must be between -90 and 90"],
          max: [90, "Latitude must be between -90 and 90"],
        },
        longitude: {
          type: Number,
          min: [-180, "Longitude must be between -180 and 180"],
          max: [180, "Longitude must be between -180 and 180"],
        },
      },
      nearestCoast: {
        type: String,
        trim: true,
      },
      ecosystemTypes: [{
        type: String,
        enum: [
          "Mangroves",
          "Seagrass Beds",
          "Salt Marshes", 
          "Tidal Flats",
          "Coral Reefs",
          "Coastal Wetlands",
          "Mudflats",
          "Sandy Beaches",
          "Rocky Shores"
        ],
      }],
    },

    // Community Demographics
    demographics: {
      totalPopulation: {
        type: Number,
        min: [1, "Population must be at least 1"],
        required: true,
      },
      totalHouseholds: {
        type: Number,
        min: [1, "Number of households must be at least 1"],
        required: true,
      },
      primaryLivelihood: [{
        type: String,
        enum: [
          "Fishing",
          "Aquaculture",
          "Agriculture", 
          "Tourism",
          "Handicrafts",
          "Small Business",
          "Daily Wage Labor",
          "Government Service",
          "Other"
        ],
      }],
      languages: [{
        type: String,
        trim: true,
      }],
      literacyRate: {
        type: Number,
        min: [0, "Literacy rate cannot be negative"],
        max: [100, "Literacy rate cannot exceed 100%"],
      },
    },

    // Blue Carbon Engagement
    blueCarbonActivities: {
      currentActivities: [{
        activityType: {
          type: String,
          enum: [
            "Mangrove Restoration",
            "Seagrass Conservation", 
            "Wetland Protection",
            "Coastal Reforestation",
            "Sustainable Fishing",
            "Eco-tourism",
            "Awareness Programs",
            "Research Participation",
            "Other"
          ],
        },
        description: {
          type: String,
          trim: true,
          maxlength: [500, "Activity description cannot exceed 500 characters"],
        },
        startDate: Date,
        areaInvolved: Number, // in hectares
        participantsInvolved: Number,
      }],
      interests: [{
        type: String,
        enum: [
          "Carbon Credit Projects",
          "Ecosystem Restoration", 
          "Biodiversity Conservation",
          "Sustainable Livelihoods",
          "Climate Adaptation",
          "Education & Training",
          "Research Collaboration",
          "Policy Advocacy"
        ],
      }],
      previousExperience: {
        type: String,
        trim: true,
        maxlength: [1000, "Previous experience description cannot exceed 1000 characters"],
      },
      challenges: [{
        type: String,
        enum: [
          "Lack of Technical Knowledge",
          "Limited Financial Resources",
          "Climate Change Impacts",
          "Pollution",
          "Overfishing",
          "Land Rights Issues",
          "Market Access",
          "Infrastructure",
          "Other"
        ],
      }],
    },

    // Contact Information
    contactInfo: {
      primaryContact: {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        designation: {
          type: String,
          trim: true,
        },
        phone: {
          type: String,
          required: true,
          trim: true,
          match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
        },
        email: {
          type: String,
          trim: true,
          lowercase: true,
          match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email",
          ],
        },
      },
      alternateContact: {
        name: String,
        phone: String,
        email: String,
      },
      preferredContactMethod: {
        type: String,
        enum: ["Phone", "Email", "WhatsApp", "In-Person"],
        default: "Phone",
      },
    },

    // Documents and Verification
    documents: [{
      documentType: {
        type: String,
        enum: [
          "Community Registration Certificate",
          "Village Panchayat Letter",
          "NGO Registration",
          "Society Registration", 
          "Trust Deed",
          "Government ID",
          "Address Proof",
          "Bank Account Details",
          "Other"
        ],
        required: true,
      },
      documentNumber: String,
      documentUrl: String, // File path/URL
      uploadDate: {
        type: Date,
        default: Date.now,
      },
      verified: {
        type: Boolean,
        default: false,
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      verifiedAt: Date,
    }],

    // Profile Status
    profileStatus: {
      type: String,
      enum: ["Draft", "Submitted", "Under Review", "Verified", "Rejected"],
      default: "Draft",
    },
    submittedAt: Date,
    verifiedAt: Date,
    rejectionReason: String,

    // Social Media and Web Presence
    socialMedia: {
      website: String,
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
      linkedin: String,
    },

    // Project Participation
    projectsParticipated: [{
      projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
      role: {
        type: String,
        enum: ["Lead", "Partner", "Participant", "Beneficiary"],
      },
      joinedDate: Date,
      contribution: String,
    }],

    // Capacity and Resources
    capacity: {
      manpowerAvailable: Number,
      equipmentOwned: [{
        equipmentType: String,
        quantity: Number,
        condition: {
          type: String,
          enum: ["Excellent", "Good", "Fair", "Poor"],
        },
      }],
      landAccess: {
        ownedLand: Number, // in hectares
        leasedLand: Number, // in hectares
        communityLand: Number, // in hectares
      },
      technicalSkills: [{
        skill: String,
        proficiency: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
        },
        numberOfPeople: Number,
      }],
    },

    // Financial Information
    financialInfo: {
      annualIncome: {
        range: {
          type: String,
          enum: [
            "Below 1 Lakh",
            "1-5 Lakhs",
            "5-10 Lakhs", 
            "10-25 Lakhs",
            "25-50 Lakhs",
            "Above 50 Lakhs"
          ],
        },
        sources: [{
          type: String,
          enum: [
            "Government Grants",
            "NGO Funding",
            "Community Contributions",
            "Income Generating Activities",
            "Donations",
            "Other"
          ],
        }],
      },
      bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        branchName: String,
        ifscCode: String,
      },
    },

    // Activity History
    activityHistory: [{
      activity: String,
      date: {
        type: Date,
        default: Date.now,
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      description: String,
    }],

    // Rating and Reviews
    rating: {
      averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },

    // Visibility Settings
    visibility: {
      isPublicProfile: {
        type: Boolean,
        default: true,
      },
      showContactInfo: {
        type: Boolean,
        default: false,
      },
      showFinancialInfo: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
communityProfileSchema.index({ userId: 1 });
communityProfileSchema.index({ "location.state": 1 });
communityProfileSchema.index({ "location.district": 1 });
communityProfileSchema.index({ communityType: 1 });
communityProfileSchema.index({ profileStatus: 1 });
communityProfileSchema.index({ "location.ecosystemTypes": 1 });
communityProfileSchema.index({ "blueCarbonActivities.interests": 1 });

// Geospatial index for location-based queries
communityProfileSchema.index({ "location.coordinates": "2dsphere" });

// Virtual for formatted address
communityProfileSchema.virtual("formattedAddress").get(function () {
  const loc = this.location;
  return `${loc.address}, ${loc.village ? loc.village + ', ' : ''}${loc.district}, ${loc.state} ${loc.pincode || ''}`.trim();
});

// Method to get public profile data
communityProfileSchema.methods.getPublicProfile = function () {
  const profile = this.toObject();
  
  if (!this.visibility.showContactInfo) {
    delete profile.contactInfo;
  }
  
  if (!this.visibility.showFinancialInfo) {
    delete profile.financialInfo;
  }
  
  // Remove sensitive fields
  delete profile.documents;
  delete profile.activityHistory;
  
  return profile;
};

// Method to calculate completion percentage
communityProfileSchema.methods.getCompletionPercentage = function () {
  const requiredFields = [
    'communityName',
    'communityType', 
    'description',
    'location.address',
    'location.district',
    'location.state',
    'demographics.totalPopulation',
    'demographics.totalHouseholds',
    'contactInfo.primaryContact.name',
    'contactInfo.primaryContact.phone'
  ];
  
  const optionalFields = [
    'location.pincode',
    'location.coordinates.latitude',
    'demographics.primaryLivelihood',
    'blueCarbonActivities.currentActivities',
    'blueCarbonActivities.interests',
    'socialMedia.website'
  ];
  
  let requiredCompleted = 0;
  let optionalCompleted = 0;
  
  requiredFields.forEach(field => {
    if (this.get(field)) requiredCompleted++;
  });
  
  optionalFields.forEach(field => {
    if (this.get(field)) optionalCompleted++;
  });
  
  const requiredPercentage = (requiredCompleted / requiredFields.length) * 70; // 70% weight
  const optionalPercentage = (optionalCompleted / optionalFields.length) * 30; // 30% weight
  
  return Math.round(requiredPercentage + optionalPercentage);
};

// Static method to find nearby communities
communityProfileSchema.statics.findNearby = function (latitude, longitude, maxDistance = 50000) {
  return this.find({
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    },
    profileStatus: "Verified",
    "visibility.isPublicProfile": true
  });
};

// Static method to search communities
communityProfileSchema.statics.searchCommunities = function (searchQuery, filters = {}) {
  const query = {
    profileStatus: "Verified",
    "visibility.isPublicProfile": true,
    ...filters
  };
  
  if (searchQuery) {
    query.$or = [
      { communityName: { $regex: searchQuery, $options: "i" } },
      { description: { $regex: searchQuery, $options: "i" } },
      { "location.district": { $regex: searchQuery, $options: "i" } },
      { "location.state": { $regex: searchQuery, $options: "i" } }
    ];
  }
  
  return this.find(query);
};

module.exports = mongoose.model("CommunityProfile", communityProfileSchema);