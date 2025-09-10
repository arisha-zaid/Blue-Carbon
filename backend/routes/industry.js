const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const Project = require("../models/Project");
const User = require("../models/User");
const { isAuthenticated, isIndustryOrAdmin } = require("../middleware/auth");

// ===========================================
// TRANSACTION MANAGEMENT ENDPOINTS
// ===========================================

// Get all transactions with advanced filtering
router.get("/transactions", isAuthenticated, async (req, res) => {
  try {
    const {
      status,
      type,
      project,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (project) filter.project = project;
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const transactions = await Transaction.find(filter)
      .populate("project", "name location type creditPrice availableCredits")
      .populate("user", "name email")
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + transactions.length < totalCount,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transactions",
      message: error.message,
    });
  }
});

// Get single transaction details
router.get("/transactions/:id", isAuthenticated, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate(
      "project",
      "name location type creditPrice availableCredits metadata"
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transaction",
      message: error.message,
    });
  }
});

// Create new transaction
router.post("/transactions", isAuthenticated, async (req, res) => {
  try {
    const { projectId, amount, type, pricePerUnit, description } = req.body;

    // Input validation
    if (!projectId || !amount || !type || !pricePerUnit) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: projectId, amount, type, pricePerUnit",
      });
    }

    if (amount <= 0 || pricePerUnit <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount and price must be greater than 0",
      });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    // Get or create user wallet
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = new Wallet({ user: req.user._id });
      await wallet.save();
    }

    // Calculate fees and total value
    const totalValue = amount * pricePerUnit;
    const platformFee = totalValue * 0.005; // 0.5% platform fee
    const blockchainFee = 25; // Fixed blockchain fee
    const totalFees = platformFee + blockchainFee;

    // Check balances based on transaction type
    if (type === "purchase") {
      const requiredBalance = totalValue + totalFees;
      if (wallet.availableUsdBalance < requiredBalance) {
        return res.status(400).json({
          success: false,
          error: "Insufficient USD balance for this purchase",
          required: requiredBalance,
          available: wallet.availableUsdBalance,
        });
      }

      // Check project availability
      if (project.availableCredits < amount) {
        return res.status(400).json({
          success: false,
          error: "Insufficient credits available in this project",
          requested: amount,
          available: project.availableCredits,
        });
      }

      // Lock USD balance for pending transaction
      await wallet.lockBalance(requiredBalance, 0);
    } else if (type === "sale") {
      if (wallet.availableCarbonBalance < amount) {
        return res.status(400).json({
          success: false,
          error: "Insufficient carbon credits for this sale",
          requested: amount,
          available: wallet.availableCarbonBalance,
        });
      }

      // Lock carbon credits for pending transaction
      await wallet.lockBalance(0, amount);
    }

    // Create transaction
    const transaction = new Transaction({
      user: req.user._id,
      project: projectId,
      type,
      amount,
      pricePerUnit,
      totalValue,
      fees: {
        platformFee,
        blockchainFee,
        totalFees,
      },
      metadata: {
        description:
          description || `${type} of ${amount} tCO₂ from ${project.name}`,
        compliance: {
          standard: project.metadata?.standard,
          vintage: project.metadata?.vintage,
          methodology: project.metadata?.methodology,
        },
      },
    });

    await transaction.save();

    // Populate transaction data for response
    await transaction.populate("project", "name location type creditPrice");

    res.status(201).json({
      success: true,
      data: transaction,
      message: "Transaction created successfully",
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create transaction",
      message: error.message,
    });
  }
});

// Confirm pending transaction
router.post("/transactions/:id/confirm", isAuthenticated, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "pending",
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Pending transaction not found",
      });
    }

    const wallet = await Wallet.findOne({ user: req.user._id });
    const project = await Project.findById(transaction.project);

    if (transaction.type === "purchase") {
      // Process purchase
      const totalCost = transaction.totalValue + transaction.fees.totalFees;

      // Update wallet balances
      wallet.usdBalance -= totalCost;
      await wallet.unlockBalance(totalCost, 0);
      await wallet.addCarbonCredits(
        transaction.amount,
        transaction.project,
        transaction.pricePerUnit,
        project.metadata?.vintage,
        project.metadata?.standard
      );

      // Update project availability
      project.availableCredits -= transaction.amount;
      await project.save();
    } else if (transaction.type === "sale") {
      // Process sale
      const saleRevenue = transaction.totalValue - transaction.fees.totalFees;

      // Update wallet balances
      wallet.usdBalance += saleRevenue;
      await wallet.unlockBalance(0, transaction.amount);
      await wallet.removeCarbonCredits(transaction.amount, transaction.project);
    }

    // Update transaction status
    transaction.status = "confirmed";
    transaction.confirmedAt = new Date();
    await transaction.save();

    await transaction.populate("project", "name location type creditPrice");

    res.json({
      success: true,
      data: transaction,
      message: "Transaction confirmed successfully",
    });
  } catch (error) {
    console.error("Error confirming transaction:", error);
    res.status(500).json({
      success: false,
      error: "Failed to confirm transaction",
      message: error.message,
    });
  }
});

// Cancel pending transaction
router.post("/transactions/:id/cancel", isAuthenticated, async (req, res) => {
  try {
    const { reason } = req.body;

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "pending",
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Pending transaction not found",
      });
    }

    const wallet = await Wallet.findOne({ user: req.user._id });

    // Unlock balances
    if (transaction.type === "purchase") {
      const totalCost = transaction.totalValue + transaction.fees.totalFees;
      await wallet.unlockBalance(totalCost, 0);
    } else if (transaction.type === "sale") {
      await wallet.unlockBalance(0, transaction.amount);
    }

    // Update transaction status
    transaction.status = "cancelled";
    transaction.cancelledAt = new Date();
    transaction.cancellationReason = reason || "Cancelled by user";
    transaction.cancelledBy = req.user._id;
    await transaction.save();

    res.json({
      success: true,
      data: transaction,
      message: "Transaction cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling transaction:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel transaction",
      message: error.message,
    });
  }
});

// ===========================================
// WALLET MANAGEMENT ENDPOINTS
// ===========================================

// Get wallet balance and portfolio
router.get("/wallet/balance", isAuthenticated, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id }).populate(
      "portfolio.projectId",
      "name location type metadata"
    );

    if (!wallet) {
      // Create new wallet if doesn't exist
      wallet = new Wallet({ user: req.user._id });
      await wallet.save();
    }

    res.json({
      success: true,
      data: {
        usdBalance: wallet.usdBalance,
        availableUsdBalance: wallet.availableUsdBalance,
        lockedUsdBalance: wallet.lockedUsdBalance,
        carbonBalance: wallet.carbonBalance,
        availableCarbonBalance: wallet.availableCarbonBalance,
        lockedCarbonBalance: wallet.lockedCarbonBalance,
        retiredCarbonBalance: wallet.retiredCarbonBalance,
        totalCarbonOwned: wallet.totalCarbonOwned,
        estimatedPortfolioValue: wallet.estimatedPortfolioValue,
        portfolio: wallet.portfolio,
        stats: {
          totalPurchased: wallet.totalPurchased,
          totalSold: wallet.totalSold,
          totalRetired: wallet.totalRetired,
          totalTransactions: wallet.totalTransactions,
        },
        lastUpdated: wallet.lastUpdated,
        lastTransactionDate: wallet.lastTransactionDate,
      },
    });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch wallet balance",
      message: error.message,
    });
  }
});

// Get carbon credit balance details
router.get("/wallet/carbon-balance", isAuthenticated, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id }).populate(
      "portfolio.projectId",
      "name location type metadata"
    );

    if (!wallet) {
      return res.json({
        success: true,
        data: {
          available: 0,
          locked: 0,
          retired: 0,
          total: 0,
          portfolio: [],
        },
      });
    }

    res.json({
      success: true,
      data: {
        available: wallet.availableCarbonBalance,
        locked: wallet.lockedCarbonBalance,
        retired: wallet.retiredCarbonBalance,
        total: wallet.totalCarbonOwned,
        portfolio: wallet.portfolio,
      },
    });
  } catch (error) {
    console.error("Error fetching carbon balance:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch carbon balance",
      message: error.message,
    });
  }
});

// Update wallet balance (deposit/withdraw)
router.post("/wallet/update", isAuthenticated, async (req, res) => {
  try {
    const { action, amount } = req.body;

    if (!action || !amount || !["deposit", "withdraw"].includes(action)) {
      return res.status(400).json({
        success: false,
        error:
          'Invalid action or amount. Action must be "deposit" or "withdraw"',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = new Wallet({ user: req.user._id });
    }

    if (action === "deposit") {
      wallet.usdBalance += parseFloat(amount);
    } else if (action === "withdraw") {
      if (wallet.availableUsdBalance < amount) {
        return res.status(400).json({
          success: false,
          error: "Insufficient available balance for withdrawal",
          available: wallet.availableUsdBalance,
          requested: amount,
        });
      }
      wallet.usdBalance -= parseFloat(amount);
    }

    await wallet.save();

    res.json({
      success: true,
      data: {
        balance: wallet.usdBalance,
        availableBalance: wallet.availableUsdBalance,
        action,
        amount: parseFloat(amount),
      },
      message: `${action} completed successfully`,
    });
  } catch (error) {
    console.error("Error updating wallet:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update wallet balance",
      message: error.message,
    });
  }
});

// ===========================================
// ANALYTICS AND REPORTING ENDPOINTS
// ===========================================

// Get transaction analytics
router.get("/analytics/transactions", isAuthenticated, async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Aggregate transaction data
    const analytics = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$type",
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          totalValue: { $sum: "$totalValue" },
          averageAmount: { $avg: "$amount" },
          averagePrice: { $avg: "$pricePerUnit" },
        },
      },
    ]);

    // Get monthly breakdown
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            type: "$type",
          },
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
          value: { $sum: "$totalValue" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      data: {
        period,
        summary: analytics,
        monthlyBreakdown: monthlyData,
        dateRange: {
          start: startDate,
          end: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching transaction analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics",
      message: error.message,
    });
  }
});

// Export transactions as CSV
router.get("/transactions/export", isAuthenticated, async (req, res) => {
  try {
    const { status, type, startDate, endDate } = req.query;

    // Build filter
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate("project", "name location type")
      .sort({ createdAt: -1 });

    // Convert to CSV format
    const csvHeaders = [
      "Transaction ID",
      "Date",
      "Type",
      "Project Name",
      "Amount (tCO₂)",
      "Price per Unit",
      "Total Value",
      "Fees",
      "Status",
      "Reference ID",
    ];

    const csvRows = transactions.map((tx) => [
      tx._id,
      tx.createdAt.toISOString().split("T")[0],
      tx.type,
      tx.project?.name || "N/A",
      tx.amount,
      tx.pricePerUnit,
      tx.totalValue,
      tx.fees.totalFees,
      tx.status,
      tx.referenceId,
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="transactions-${
        new Date().toISOString().split("T")[0]
      }.csv"`
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting transactions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to export transactions",
      message: error.message,
    });
  }
});

module.exports = router;
