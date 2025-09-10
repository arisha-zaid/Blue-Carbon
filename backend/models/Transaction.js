const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    type: {
      type: String,
      enum: ["purchase", "sale", "transfer", "retirement"],
      required: true,
    },
    amount: { type: Number, required: true }, // Carbon credits amount
    pricePerUnit: { type: Number, required: true }, // Price per tCO₂
    totalValue: { type: Number, required: true }, // Total transaction value in USD

    // Fee breakdown
    fees: {
      platformFee: { type: Number, default: 0 },
      blockchainFee: { type: Number, default: 25 },
      totalFees: { type: Number, default: 25 },
    },

    // Status and tracking
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "failed", "cancelled"],
      default: "pending",
    },

    // Blockchain integration
    blockchainHash: { type: String, sparse: true },
    blockchainStatus: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
    confirmations: { type: Number, default: 0 },

    // Certificate and compliance
    certificateUrl: { type: String },
    certificateHash: { type: String },
    retirementCertificate: { type: String }, // For retired credits

    // Counterparty and reference
    counterparty: { type: String }, // Buyer/seller organization
    referenceId: { type: String, unique: true, sparse: true }, // External reference

    // Metadata and notes
    metadata: {
      description: { type: String },
      tags: [{ type: String }],
      compliance: {
        standard: { type: String }, // VCS, Gold Standard, etc.
        vintage: { type: Number }, // Credit vintage year
        methodology: { type: String },
      },
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },

    // Cancellation details
    cancellationReason: { type: String },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for calculating net amount (after fees)
transactionSchema.virtual("netAmount").get(function () {
  return this.totalValue - this.fees.totalFees;
});

// Virtual for transaction age
transactionSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Index for faster queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ project: 1, status: 1 });
transactionSchema.index({ blockchainHash: 1 });
transactionSchema.index({ status: 1, type: 1 });

// Generate reference ID before saving
transactionSchema.pre("save", function (next) {
  if (!this.referenceId) {
    this.referenceId = `TXN-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
  }

  // Calculate total fees
  this.fees.totalFees = this.fees.platformFee + this.fees.blockchainFee;

  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
