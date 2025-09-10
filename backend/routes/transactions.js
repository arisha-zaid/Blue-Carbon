const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const Project = require("../models/Project");
const { isAuthenticated } = require("../middleware/auth");

// ===========================================
// GENERAL TRANSACTION ENDPOINTS (NON-INDUSTRY)
// ===========================================

// Get market data for transaction pricing
router.get("/market/data", async (req, res) => {
  try {
    // Calculate market statistics from real transaction data
    const marketStats = await Transaction.aggregate([
      {
        $match: {
          status: "completed",
          type: "purchase",
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        },
      },
      {
        $group: {
          _id: null,
          averagePrice: { $avg: "$pricePerUnit" },
          minPrice: { $min: "$pricePerUnit" },
          maxPrice: { $max: "$pricePerUnit" },
          totalVolume: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    // Get price trends by project type
    const priceByProjectType = await Transaction.aggregate([
      {
        $match: {
          status: "completed",
          type: "purchase",
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "project",
          foreignField: "_id",
          as: "projectData",
        },
      },
      {
        $unwind: "$projectData",
      },
      {
        $group: {
          _id: "$projectData.type",
          averagePrice: { $avg: "$pricePerUnit" },
          volume: { $sum: "$amount" },
          transactions: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        overall: marketStats[0] || {
          averagePrice: 45,
          minPrice: 25,
          maxPrice: 85,
          totalVolume: 0,
          totalTransactions: 0,
        },
        byProjectType: priceByProjectType,
        lastUpdated: new Date(),
        currency: "USD",
        unit: "tCO₂",
      },
    });
  } catch (error) {
    console.error("Error fetching market data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch market data",
      message: error.message,
    });
  }
});

// Get project availability for transactions
router.get("/projects/:id/availability", isAuthenticated, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    // Get recent transaction activity for this project
    const recentActivity = await Transaction.find({
      project: req.params.id,
      status: { $in: ["completed", "confirmed"] },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("amount pricePerUnit createdAt type");

    res.json({
      success: true,
      data: {
        projectId: project._id,
        projectName: project.name,
        availableCredits: project.availableCredits || 0,
        currentPrice: project.creditPrice || 0,
        priceRange: {
          min: project.creditPrice * 0.9,
          max: project.creditPrice * 1.1,
        },
        recentActivity,
        metadata: {
          vintage: project.metadata?.vintage,
          standard: project.metadata?.standard,
          methodology: project.metadata?.methodology,
        },
        lastUpdated: project.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching project availability:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch project availability",
      message: error.message,
    });
  }
});

// Calculate transaction fees
router.post("/calculate-fees", isAuthenticated, async (req, res) => {
  try {
    const { amount, pricePerUnit } = req.body;

    if (!amount || !pricePerUnit || amount <= 0 || pricePerUnit <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount or price per unit",
      });
    }

    const baseValue = amount * pricePerUnit;
    const platformFee = baseValue * 0.005; // 0.5% platform fee
    const blockchainFee = 25; // Fixed blockchain transaction fee
    const total = baseValue + platformFee + blockchainFee;

    res.json({
      success: true,
      data: {
        baseValue: parseFloat(baseValue.toFixed(2)),
        platformFee: parseFloat(platformFee.toFixed(2)),
        blockchainFee: blockchainFee,
        totalFees: parseFloat((platformFee + blockchainFee).toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        breakdown: {
          "Base Value": parseFloat(baseValue.toFixed(2)),
          "Platform Fee (0.5%)": parseFloat(platformFee.toFixed(2)),
          "Blockchain Fee": blockchainFee,
        },
      },
    });
  } catch (error) {
    console.error("Error calculating fees:", error);
    res.status(500).json({
      success: false,
      error: "Failed to calculate fees",
      message: error.message,
    });
  }
});

// Get blockchain transaction status
router.get("/blockchain/:hash/status", isAuthenticated, async (req, res) => {
  try {
    const { hash } = req.params;

    // Find transaction by blockchain hash
    const transaction = await Transaction.findOne({ blockchainHash: hash });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found on blockchain",
      });
    }

    // Simulate blockchain status check
    const blockchainStatus = {
      hash: hash,
      status: transaction.blockchainStatus,
      confirmations: transaction.confirmations,
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      gasUsed: Math.floor(Math.random() * 100000) + 21000,
      timestamp: transaction.createdAt,
      network: "ethereum-mainnet",
    };

    res.json({
      success: true,
      data: blockchainStatus,
    });
  } catch (error) {
    console.error("Error fetching blockchain status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch blockchain status",
      message: error.message,
    });
  }
});

// Validate transaction data
router.post("/validate", isAuthenticated, async (req, res) => {
  try {
    const { projectId, amount, type, pricePerUnit } = req.body;
    const errors = [];

    if (!projectId) {
      errors.push("Project selection is required");
    }

    if (!amount || amount <= 0) {
      errors.push("Amount must be greater than 0");
    }

    if (
      !type ||
      !["purchase", "sale", "transfer", "retirement"].includes(type)
    ) {
      errors.push("Invalid transaction type");
    }

    if (!pricePerUnit || pricePerUnit <= 0) {
      errors.push("Invalid price per unit");
    }

    // Check project exists and has availability
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        errors.push("Selected project does not exist");
      } else if (type === "purchase" && project.availableCredits < amount) {
        errors.push(
          `Only ${project.availableCredits} tCO₂ available in this project`
        );
      }
    }

    // Check user balances
    if (req.user._id) {
      const wallet = await Wallet.findOne({ user: req.user._id });

      if (type === "purchase") {
        const totalCost =
          amount * pricePerUnit + amount * pricePerUnit * 0.005 + 25;
        if (!wallet || wallet.availableUsdBalance < totalCost) {
          errors.push(
            `Insufficient USD balance. Required: $${totalCost.toFixed(
              2
            )}, Available: $${wallet?.availableUsdBalance || 0}`
          );
        }
      } else if (
        type === "sale" &&
        (!wallet || wallet.availableCarbonBalance < amount)
      ) {
        errors.push(
          `Insufficient carbon credits. Required: ${amount} tCO₂, Available: ${
            wallet?.availableCarbonBalance || 0
          }`
        );
      }
    }

    // Industry-specific validations
    const userRole = req.user.role;
    if (userRole === "industry") {
      if (type === "purchase" && amount > 10000) {
        errors.push(
          "Single purchase cannot exceed 10,000 tCO₂ without pre-approval"
        );
      }
    }

    res.json({
      success: true,
      data: {
        isValid: errors.length === 0,
        errors: errors,
        warnings: [], // Could add warnings for large transactions, etc.
      },
    });
  } catch (error) {
    console.error("Error validating transaction:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate transaction",
      message: error.message,
    });
  }
});

module.exports = router;
