const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Payment = require("../models/Payment");
const Wallet = require("../models/Wallet");
const Project = require("../models/Project");
const User = require("../models/User");
const { isAuthenticated } = require("../middleware/auth");
const paymentService = require("../services/paymentService");

// Get supported payment methods
router.get("/methods", isAuthenticated, async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: "credit_card",
        name: "Credit Card",
        icon: "credit-card",
        fees: 2.9,
        processingTime: "Instant",
        supported: true,
        description: "Visa, Mastercard, American Express",
      },
      {
        id: "bank_transfer",
        name: "Bank Transfer (ACH)",
        icon: "building-2",
        fees: 0.5,
        processingTime: "1-3 business days",
        supported: true,
        description: "Direct bank account transfer",
      },
      {
        id: "crypto",
        name: "Cryptocurrency",
        icon: "coins",
        fees: 1.0,
        processingTime: "10-30 minutes",
        supported: true,
        description: "ETH, BTC, USDC, USDT",
      },
    ];

    res.json({
      success: true,
      data: {
        methods: paymentMethods,
        defaultMethod: "credit_card",
      },
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment methods",
      message: error.message,
    });
  }
});

// Get user wallets/payment sources
router.get("/wallets", isAuthenticated, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });

    const wallets = [
      {
        id: "main_wallet",
        type: "USD",
        name: "Main USD Wallet",
        balance: wallet?.totalUsdBalance || 0,
        available: wallet?.availableUsdBalance || 0,
        frozen: wallet?.frozenUsdBalance || 0,
        isDefault: true,
      },
      {
        id: "carbon_wallet",
        type: "CARBON",
        name: "Carbon Credits",
        balance: wallet?.totalCarbonBalance || 0,
        available: wallet?.availableCarbonBalance || 0,
        frozen: wallet?.frozenCarbonBalance || 0,
        unit: "tCO₂",
      },
    ];

    res.json({
      success: true,
      data: {
        wallets,
        totalUsdValue: wallet?.totalUsdBalance || 0,
        totalCarbonCredits: wallet?.totalCarbonBalance || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching wallets:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch wallet information",
      message: error.message,
    });
  }
});

// Calculate payment total with fees
router.post("/calculate", isAuthenticated, async (req, res) => {
  try {
    const { amount, pricePerUnit, paymentMethod, projectId } = req.body;

    if (!amount || !pricePerUnit || amount <= 0 || pricePerUnit <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount or price per unit",
      });
    }

    // Verify project availability if provided
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project || project.availableCredits < amount) {
        return res.status(400).json({
          success: false,
          error: "Insufficient credits available in selected project",
        });
      }
    }

    const baseValue = amount * pricePerUnit;
    const platformFee = baseValue * 0.005; // 0.5% platform fee
    const blockchainFee = 25; // Fixed blockchain transaction fee

    // Payment method specific fees
    let paymentFee = 0;
    let paymentFeeRate = 0;

    switch (paymentMethod) {
      case "credit_card":
        paymentFeeRate = 0.029; // 2.9%
        paymentFee = baseValue * paymentFeeRate;
        break;
      case "bank_transfer":
        paymentFeeRate = 0.005; // 0.5%
        paymentFee = baseValue * paymentFeeRate;
        break;
      case "crypto":
        paymentFeeRate = 0.01; // 1.0%
        paymentFee = baseValue * paymentFeeRate;
        break;
      default:
        paymentFeeRate = 0.029;
        paymentFee = baseValue * paymentFeeRate;
    }

    const totalFees = platformFee + blockchainFee + paymentFee;
    const total = baseValue + totalFees;

    res.json({
      success: true,
      data: {
        baseValue: parseFloat(baseValue.toFixed(2)),
        platformFee: parseFloat(platformFee.toFixed(2)),
        blockchainFee: blockchainFee,
        paymentFee: parseFloat(paymentFee.toFixed(2)),
        paymentFeeRate: paymentFeeRate,
        totalFees: parseFloat(totalFees.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        breakdown: {
          "Carbon Credits": parseFloat(baseValue.toFixed(2)),
          "Platform Fee (0.5%)": parseFloat(platformFee.toFixed(2)),
          [`Payment Processing (${(paymentFeeRate * 100).toFixed(1)}%)`]:
            parseFloat(paymentFee.toFixed(2)),
          "Blockchain Fee": blockchainFee,
        },
        currency: "USD",
        paymentMethod: paymentMethod,
      },
    });
  } catch (error) {
    console.error("Error calculating payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to calculate payment total",
      message: error.message,
    });
  }
});

// Process payment
router.post("/process", isAuthenticated, async (req, res) => {
  try {
    const { transactionData, paymentMethod, paymentDetails, calculation } =
      req.body;

    // Validate user wallet balance
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(400).json({
        success: false,
        error: "User wallet not found",
      });
    }

    // Generate unique payment ID
    const paymentId = `PAY-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Process real payment using PaymentService
    const paymentResult = await paymentService.processPayment({
      paymentMethod,
      amount: calculation.total,
      paymentDetails,
      metadata: {
        userId: req.user._id.toString(),
        paymentId,
        carbonAmount: transactionData.amount,
        projectId: transactionData.project?.id,
      },
    });

    // Create payment record using Payment model
    const payment = new Payment({
      paymentId,
      user: req.user._id,
      amount: calculation.total,
      currency: "USD",
      paymentMethod,
      status: "processing",
      paymentDetails: {
        // Credit card details
        cardNumber: paymentDetails.cardNumber, // Will be masked by pre-save middleware
        cvv: paymentDetails.cvv, // Will be removed by pre-save middleware
        expiryDate: paymentDetails.expiryDate,
        cardholderName: paymentDetails.cardholderName,

        // Bank transfer details
        accountNumber: paymentDetails.accountNumber, // Will be masked by pre-save middleware
        routingNumber: paymentDetails.routingNumber,
        accountType: paymentDetails.accountType,

        // Crypto details
        walletAddress: paymentDetails.walletAddress,
        cryptoType: paymentDetails.cryptoType,

        // Billing address
        billingAddress: paymentDetails.billingAddress,
        savePaymentMethod: paymentDetails.savePaymentMethod,
      },
      fees: {
        platformFee: calculation.platformFee,
        paymentFee: calculation.paymentFee,
        blockchainFee: calculation.blockchainFee,
        totalFees: calculation.totalFees,
      },
      metadata: {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip || req.connection.remoteAddress,
      },
    });

    // Add processor information to payment record
    payment.processorName = paymentResult.processor;
    payment.processorTransactionId = paymentResult.transactionId;
    await payment.save();

    if (paymentResult.success) {
      // Create the actual transaction
      const transaction = new Transaction({
        user: req.user._id,
        project: transactionData.project?.id,
        type: transactionData.type || "purchase",
        amount: transactionData.amount,
        pricePerUnit: transactionData.pricePerUnit,
        totalValue: calculation.baseValue,
        fees: calculation.totalFees,
        paymentMethod,
        paymentId,
        status: "confirmed",
        metadata: {
          paymentBreakdown: calculation.breakdown,
          paymentMethod,
          processorTransactionId: paymentResult.transactionId,
          processor: paymentResult.processor,
        },
        blockchainHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Will be updated when blockchain tx confirms
        blockchainStatus: "pending", // Will be updated by blockchain service
        confirmations: 0, // Will be updated by blockchain service
      });

      await transaction.save();

      // Update user wallet
      if (transactionData.type === "purchase") {
        wallet.availableUsdBalance -= calculation.total;
        wallet.availableCarbonBalance += transactionData.amount;
        wallet.totalCarbonBalance += transactionData.amount;
        wallet.totalUsdBalance -= calculation.total;
        await wallet.save();
      }

      // Update project availability
      if (transactionData.project?.id) {
        const project = await Project.findById(transactionData.project.id);
        if (project) {
          project.availableCredits -= transactionData.amount;
          project.totalSold += transactionData.amount;
          await project.save();
        }
      }

      // Update payment record
      payment.transactionId = transaction._id;
      await payment.markAsCompleted({
        gatewayTransactionId: paymentResult.transactionId,
        responseCode: "200",
        responseMessage: "Payment successful",
        authorizationCode:
          paymentResult.processorResponse?.id || paymentResult.transactionId,
      });

      res.json({
        success: true,
        data: {
          paymentId,
          transactionId: transaction._id,
          amount: calculation.total,
          status: paymentResult.status || "completed",
          processor: paymentResult.processor,
          processorTransactionId: paymentResult.transactionId,
          blockchainHash: transaction.blockchainHash,
          confirmations: transaction.confirmations,
          // Include payment-specific URLs for crypto/PayPal
          paymentUrl: paymentResult.paymentUrl,
          approvalUrl: paymentResult.approvalUrl,
          receipt: {
            id: paymentId,
            date: new Date().toISOString(),
            amount: calculation.total,
            carbonCredits: transactionData.amount,
            project: transactionData.project?.name,
            fees: calculation.breakdown,
            processor: paymentResult.processor,
          },
        },
      });
    } else {
      // Payment failed
      await payment.markAsFailed({
        errorCode: paymentResult.errorCode || "PAYMENT_FAILED",
        errorMessage: paymentResult.error || "Payment processing failed",
      });

      res.status(400).json({
        success: false,
        error: "Payment processing failed",
        details: {
          paymentId,
          status: "failed",
          reason: paymentResult.error,
          processor: paymentResult.processor,
          errorCode: paymentResult.errorCode,
        },
      });
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({
      success: false,
      error: "Payment processing failed",
      message: error.message,
    });
  }
});

// Verify payment status
router.get("/verify/:paymentId", isAuthenticated, async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Query the payment record
    const payment = await Payment.findOne({
      paymentId,
      user: req.user._id,
    }).populate("transactionId");

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    res.json({
      success: true,
      data: {
        paymentId,
        transactionId: payment.transactionId?._id,
        status: payment.status,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        blockchainHash: payment.transactionId?.blockchainHash,
        confirmations: payment.transactionId?.confirmations,
        createdAt: payment.createdAt,
        completedAt: payment.processingDetails.completedAt,
        processingTime: payment.processingTimeFormatted,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      error: "Payment verification failed",
      message: error.message,
    });
  }
});

// Get payment history
router.get("/history", isAuthenticated, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentMethod,
      startDate,
      endDate,
    } = req.query;

    const query = { user: req.user._id };

    // Add filters
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate({
        path: "transactionId",
        populate: {
          path: "project",
          select: "name type location",
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    // Format payment history
    const paymentHistory = payments.map((payment) => ({
      id: payment.paymentId,
      transactionId: payment.transactionId?._id,
      amount: payment.amount,
      carbonCredits: payment.transactionId?.amount,
      project: payment.transactionId?.project,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      blockchainHash: payment.transactionId?.blockchainHash,
      fees: payment.fees,
      createdAt: payment.createdAt,
      completedAt: payment.processingDetails.completedAt,
      processingTime: payment.processingTimeFormatted,
    }));

    res.json({
      success: true,
      data: {
        payments: paymentHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
        summary: {
          totalSpent: paymentHistory.reduce((sum, p) => sum + p.amount, 0),
          totalCredits: paymentHistory.reduce(
            (sum, p) => sum + (p.carbonCredits || 0),
            0
          ),
          successfulPayments: paymentHistory.filter(
            (p) => p.status === "completed"
          ).length,
          totalFees: paymentHistory.reduce(
            (sum, p) => sum + (p.fees?.totalFees || 0),
            0
          ),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment history",
      message: error.message,
    });
  }
});

// Cancel payment (if still in pending/processing state)
router.post("/cancel/:paymentId", isAuthenticated, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findOne({
      paymentId,
      user: req.user._id,
    }).populate("transactionId");

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    if (!["pending", "processing"].includes(payment.status)) {
      return res.status(400).json({
        success: false,
        error: "Payment cannot be cancelled in current status",
      });
    }

    // Update payment status
    payment.status = "cancelled";
    payment.processingDetails.cancelledAt = new Date();
    await payment.addAuditEntry("payment_cancelled", { reason }, req.user._id);
    await payment.save();

    // Update associated transaction if it exists
    if (payment.transactionId) {
      payment.transactionId.status = "cancelled";
      payment.transactionId.cancellationReason = reason;
      await payment.transactionId.save();

      // Reverse any wallet changes if needed
      const wallet = await Wallet.findOne({ user: req.user._id });
      if (wallet && payment.transactionId.type === "purchase") {
        wallet.availableUsdBalance += payment.amount;
        wallet.totalUsdBalance += payment.amount;
        wallet.availableCarbonBalance -= payment.transactionId.amount;
        wallet.totalCarbonBalance -= payment.transactionId.amount;
        await wallet.save();
      }
    }

    res.json({
      success: true,
      data: {
        paymentId,
        status: "cancelled",
        reason,
        cancelledAt: payment.processingDetails.cancelledAt,
      },
    });
  } catch (error) {
    console.error("Error cancelling payment:", error);
    res.status(500).json({
      success: false,
      error: "Payment cancellation failed",
      message: error.message,
    });
  }
});

module.exports = router;
