const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "ETH", "BTC", "USDC", "USDT"],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["credit_card", "bank_transfer", "crypto", "wallet"],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },

    // Payment Details (masked sensitive info)
    paymentDetails: {
      // Credit Card
      maskedCardNumber: String,
      cardType: String,
      expiryDate: String,
      cardholderName: String,

      // Bank Transfer
      maskedAccountNumber: String,
      routingNumber: String,
      accountType: {
        type: String,
        enum: ["checking", "savings"],
      },
      bankName: String,

      // Crypto
      walletAddress: String,
      cryptoType: String,
      transactionHash: String,
      blockConfirmations: Number,

      // Billing Address
      billingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },

      // Save payment method preference
      savePaymentMethod: Boolean,
    },

    // Fee Breakdown
    fees: {
      platformFee: {
        type: Number,
        default: 0,
      },
      paymentFee: {
        type: Number,
        default: 0,
      },
      blockchainFee: {
        type: Number,
        default: 0,
      },
      totalFees: {
        type: Number,
        default: 0,
      },
    },

    // Gateway Response Data
    gatewayResponse: {
      gatewayName: String,
      gatewayTransactionId: String,
      gatewayReference: String,
      responseCode: String,
      responseMessage: String,
      authorizationCode: String,
      avsResult: String,
      cvvResult: String,
      riskScore: Number,
    },

    // Processing Details
    processingDetails: {
      initiatedAt: Date,
      processedAt: Date,
      completedAt: Date,
      failedAt: Date,
      cancelledAt: Date,
      processingTime: Number, // in milliseconds
    },

    // Error Handling
    errorDetails: {
      errorCode: String,
      errorMessage: String,
      retryCount: {
        type: Number,
        default: 0,
      },
      lastRetryAt: Date,
    },

    // Refund Information
    refundDetails: {
      refundId: String,
      refundAmount: Number,
      refundReason: String,
      refundedAt: Date,
      refundStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
      },
    },

    // Audit Trail
    auditTrail: [
      {
        action: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        details: mongoose.Schema.Types.Mixed,
        ipAddress: String,
        userAgent: String,
      },
    ],

    // Metadata
    metadata: {
      userAgent: String,
      ipAddress: String,
      sessionId: String,
      referrer: String,
      deviceInfo: {
        type: String,
        browser: String,
        os: String,
      },
      geolocation: {
        country: String,
        region: String,
        city: String,
        timezone: String,
      },
      riskAssessment: {
        riskLevel: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "low",
        },
        riskScore: Number,
        riskFactors: [String],
      },
    },

    // Compliance & Verification
    compliance: {
      kycVerified: {
        type: Boolean,
        default: false,
      },
      amlChecked: {
        type: Boolean,
        default: false,
      },
      fraudChecked: {
        type: Boolean,
        default: false,
      },
      sanctionScreened: {
        type: Boolean,
        default: false,
      },
      complianceScore: Number,
      verificationLevel: {
        type: String,
        enum: ["none", "basic", "enhanced", "premium"],
        default: "basic",
      },
    },
  },
  {
    timestamps: true,
    collection: "payments",
  }
);

// Indexes for performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ paymentMethod: 1, status: 1 });
paymentSchema.index({ "gatewayResponse.gatewayTransactionId": 1 });
paymentSchema.index({ "paymentDetails.transactionHash": 1 });

// Virtual for total amount including fees
paymentSchema.virtual("totalAmount").get(function () {
  return this.amount + (this.fees.totalFees || 0);
});

// Virtual for processing time in human readable format
paymentSchema.virtual("processingTimeFormatted").get(function () {
  if (!this.processingDetails.processingTime) return null;

  const time = this.processingDetails.processingTime;
  if (time < 1000) return `${time}ms`;
  if (time < 60000) return `${Math.round(time / 1000)}s`;
  return `${Math.round(time / 60000)}min`;
});

// Instance Methods
paymentSchema.methods.markAsProcessing = function () {
  this.status = "processing";
  this.processingDetails.processedAt = new Date();
  return this.save();
};

paymentSchema.methods.markAsCompleted = function (gatewayData = {}) {
  this.status = "completed";
  this.processingDetails.completedAt = new Date();
  if (this.processingDetails.initiatedAt) {
    this.processingDetails.processingTime =
      this.processingDetails.completedAt - this.processingDetails.initiatedAt;
  }
  if (gatewayData) {
    this.gatewayResponse = { ...this.gatewayResponse, ...gatewayData };
  }
  return this.save();
};

paymentSchema.methods.markAsFailed = function (errorData = {}) {
  this.status = "failed";
  this.processingDetails.failedAt = new Date();
  if (errorData) {
    this.errorDetails = { ...this.errorDetails, ...errorData };
  }
  return this.save();
};

paymentSchema.methods.addAuditEntry = function (
  action,
  details = {},
  user = null
) {
  this.auditTrail.push({
    action,
    details,
    user,
    timestamp: new Date(),
  });
  return this.save();
};

// Static Methods
paymentSchema.statics.getPaymentStats = function (userId, dateRange = {}) {
  const match = { user: userId };

  if (dateRange.start || dateRange.end) {
    match.createdAt = {};
    if (dateRange.start) match.createdAt.$gte = new Date(dateRange.start);
    if (dateRange.end) match.createdAt.$lte = new Date(dateRange.end);
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        totalFees: { $sum: "$fees.totalFees" },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
        },
        averageAmount: { $avg: "$amount" },
        averageProcessingTime: { $avg: "$processingDetails.processingTime" },
      },
    },
  ]);
};

paymentSchema.statics.getPaymentsByMethod = function (userId, timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);

  return this.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: startDate },
        status: "completed",
      },
    },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        averageAmount: { $avg: "$amount" },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);
};

// Pre-save middleware
paymentSchema.pre("save", function (next) {
  if (this.isNew) {
    this.processingDetails.initiatedAt = new Date();
  }

  // Mask sensitive payment details
  if (
    this.paymentDetails?.cardNumber &&
    !this.paymentDetails.maskedCardNumber
  ) {
    this.paymentDetails.maskedCardNumber =
      "****-****-****-" + this.paymentDetails.cardNumber.slice(-4);
    this.paymentDetails.cardNumber = undefined;
  }

  if (
    this.paymentDetails?.accountNumber &&
    !this.paymentDetails.maskedAccountNumber
  ) {
    this.paymentDetails.maskedAccountNumber =
      "****" + this.paymentDetails.accountNumber.slice(-4);
    this.paymentDetails.accountNumber = undefined;
  }

  // Remove sensitive CVV data
  if (this.paymentDetails?.cvv) {
    this.paymentDetails.cvv = undefined;
  }

  next();
});

// Post-save middleware for audit logging
paymentSchema.post("save", function (doc) {
  if (doc.isNew) {
    console.log(`New payment created: ${doc.paymentId} for user ${doc.user}`);
  }
});

module.exports = mongoose.model("Payment", paymentSchema);
