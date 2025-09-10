const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // USD Balance
    usdBalance: { type: Number, default: 0, min: 0 },
    lockedUsdBalance: { type: Number, default: 0, min: 0 }, // Locked in pending transactions

    // Carbon Credit Balance
    carbonBalance: { type: Number, default: 0, min: 0 }, // Available carbon credits (tCO₂)
    lockedCarbonBalance: { type: Number, default: 0, min: 0 }, // Locked in pending transactions
    retiredCarbonBalance: { type: Number, default: 0, min: 0 }, // Permanently retired credits

    // Portfolio tracking
    portfolio: [
      {
        projectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Project",
          required: true,
        },
        amount: { type: Number, required: true, min: 0 },
        averagePrice: { type: Number, required: true },
        purchaseDate: { type: Date, default: Date.now },
        vintage: { type: Number }, // Credit vintage year
        standard: { type: String }, // VCS, Gold Standard, etc.
      },
    ],

    // Transaction history summary
    totalPurchased: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    totalRetired: { type: Number, default: 0 },
    totalTransactions: { type: Number, default: 0 },

    // Timestamps
    lastUpdated: { type: Date, default: Date.now },
    lastTransactionDate: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for available USD balance
walletSchema.virtual("availableUsdBalance").get(function () {
  return Math.max(0, this.usdBalance - this.lockedUsdBalance);
});

// Virtual for available carbon balance
walletSchema.virtual("availableCarbonBalance").get(function () {
  return Math.max(0, this.carbonBalance - this.lockedCarbonBalance);
});

// Virtual for total carbon credits ever owned
walletSchema.virtual("totalCarbonOwned").get(function () {
  return this.carbonBalance + this.retiredCarbonBalance + this.totalSold;
});

// Virtual for portfolio value (estimated)
walletSchema.virtual("estimatedPortfolioValue").get(function () {
  return this.portfolio.reduce((total, holding) => {
    return total + holding.amount * holding.averagePrice;
  }, 0);
});

// Index for faster queries
walletSchema.index({ user: 1 });
walletSchema.index({ lastUpdated: -1 });

// Update lastUpdated on save
walletSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

// Method to add carbon credits from a transaction
walletSchema.methods.addCarbonCredits = function (
  amount,
  projectId,
  price,
  vintage,
  standard
) {
  // Update total balance
  this.carbonBalance += amount;
  this.totalPurchased += amount;
  this.totalTransactions += 1;
  this.lastTransactionDate = new Date();

  // Update portfolio
  const existingHolding = this.portfolio.find(
    (h) => h.projectId.toString() === projectId.toString()
  );

  if (existingHolding) {
    // Calculate weighted average price
    const totalAmount = existingHolding.amount + amount;
    const totalValue =
      existingHolding.amount * existingHolding.averagePrice + amount * price;
    existingHolding.averagePrice = totalValue / totalAmount;
    existingHolding.amount = totalAmount;
  } else {
    // Add new holding
    this.portfolio.push({
      projectId: projectId,
      amount: amount,
      averagePrice: price,
      vintage: vintage,
      standard: standard,
    });
  }

  return this.save();
};

// Method to remove carbon credits (for sales/retirement)
walletSchema.methods.removeCarbonCredits = function (
  amount,
  projectId,
  isRetirement = false
) {
  if (this.availableCarbonBalance < amount) {
    throw new Error("Insufficient carbon credits");
  }

  // Update balances
  this.carbonBalance -= amount;
  this.totalTransactions += 1;
  this.lastTransactionDate = new Date();

  if (isRetirement) {
    this.retiredCarbonBalance += amount;
    this.totalRetired += amount;
  } else {
    this.totalSold += amount;
  }

  // Update portfolio
  const holding = this.portfolio.find(
    (h) => h.projectId.toString() === projectId.toString()
  );
  if (holding) {
    holding.amount -= amount;
    if (holding.amount <= 0) {
      this.portfolio = this.portfolio.filter(
        (h) => h.projectId.toString() !== projectId.toString()
      );
    }
  }

  return this.save();
};

// Method to lock/unlock balances for pending transactions
walletSchema.methods.lockBalance = function (usdAmount = 0, carbonAmount = 0) {
  if (this.availableUsdBalance < usdAmount) {
    throw new Error("Insufficient USD balance to lock");
  }
  if (this.availableCarbonBalance < carbonAmount) {
    throw new Error("Insufficient carbon credits to lock");
  }

  this.lockedUsdBalance += usdAmount;
  this.lockedCarbonBalance += carbonAmount;

  return this.save();
};

walletSchema.methods.unlockBalance = function (
  usdAmount = 0,
  carbonAmount = 0
) {
  this.lockedUsdBalance = Math.max(0, this.lockedUsdBalance - usdAmount);
  this.lockedCarbonBalance = Math.max(
    0,
    this.lockedCarbonBalance - carbonAmount
  );

  return this.save();
};

module.exports = mongoose.model("Wallet", walletSchema);
