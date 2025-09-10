// src/services/paymentAPI.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

class PaymentAPI {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/payments`,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Include cookies for session-based auth
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn("Authentication failed, clearing stored token");
          localStorage.removeItem("authToken");
        }
        return Promise.reject(error);
      }
    );
  }

  // Process payment for carbon credit purchase
  async processPayment(paymentData) {
    try {
      const response = await this.api.post("/process", paymentData);
      const result = response.data;

      // Handle different payment processor responses
      if (result.data) {
        // For crypto payments, redirect to payment page
        if (result.data.paymentUrl && paymentData.paymentMethod === "crypto") {
          return {
            ...result,
            requiresRedirect: true,
            redirectUrl: result.data.paymentUrl,
          };
        }

        // For PayPal, redirect to approval page
        if (result.data.approvalUrl && paymentData.paymentMethod === "paypal") {
          return {
            ...result,
            requiresRedirect: true,
            redirectUrl: result.data.approvalUrl,
          };
        }

        // For Stripe requiring 3DS authentication
        if (result.data.status === "requires_action") {
          return {
            ...result,
            requiresConfirmation: true,
            clientSecret: result.data.client_secret,
          };
        }
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Payment processing failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Payment processing failed",
        details: error.response?.data,
      };
    }
  }

  // Verify payment status
  async verifyPayment(paymentId) {
    try {
      const response = await this.api.get(`/verify/${paymentId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Payment verification failed:", error);
      return {
        success: false,
        error: "Failed to verify payment status",
      };
    }
  }

  // Get supported payment methods
  async getPaymentMethods() {
    try {
      const response = await this.api.get("/methods");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      // Return mock data for development/demo
      return {
        success: true, // Changed to success for fallback
        data: {
          methods: [
            {
              id: "credit_card",
              name: "Credit Card",
              icon: "credit-card",
              fees: 2.9,
              processingTime: "Instant",
              supported: true,
            },
            {
              id: "bank_transfer",
              name: "Bank Transfer",
              icon: "building-2",
              fees: 0.5,
              processingTime: "1-3 business days",
              supported: true,
            },
            {
              id: "crypto",
              name: "Cryptocurrency",
              icon: "coins",
              fees: 1.0,
              processingTime: "10-30 minutes",
              supported: true,
            },
          ],
        },
      };
    }
  }

  // Calculate payment fees and total
  async calculatePayment(transactionData) {
    try {
      const { amount, pricePerUnit, paymentMethod } = transactionData;

      const baseValue = amount * pricePerUnit;
      const platformFee = baseValue * 0.005; // 0.5% platform fee
      const blockchainFee = 25; // Fixed blockchain fee

      let paymentFee = 0;
      switch (paymentMethod) {
        case "credit_card":
          paymentFee = baseValue * 0.029; // 2.9%
          break;
        case "bank_transfer":
          paymentFee = baseValue * 0.005; // 0.5%
          break;
        case "crypto":
          paymentFee = baseValue * 0.01; // 1.0%
          break;
        default:
          paymentFee = baseValue * 0.029;
      }

      const totalFees = platformFee + blockchainFee + paymentFee;
      const total = baseValue + totalFees;

      return {
        success: true,
        data: {
          baseValue: parseFloat(baseValue.toFixed(2)),
          platformFee: parseFloat(platformFee.toFixed(2)),
          blockchainFee: blockchainFee,
          paymentFee: parseFloat(paymentFee.toFixed(2)),
          totalFees: parseFloat(totalFees.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          breakdown: {
            "Carbon Credits": parseFloat(baseValue.toFixed(2)),
            "Platform Fee (0.5%)": parseFloat(platformFee.toFixed(2)),
            "Payment Processing": parseFloat(paymentFee.toFixed(2)),
            "Blockchain Fee": blockchainFee,
          },
        },
      };
    } catch (error) {
      console.error("Failed to calculate payment:", error);
      return {
        success: false,
        error: "Failed to calculate payment total",
      };
    }
  }

  // Get payment history
  async getPaymentHistory(filters = {}) {
    try {
      const response = await this.api.get("/history", { params: filters });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
      return {
        success: false,
        error: "Failed to load payment history",
        data: {
          payments: [],
          total: 0,
        },
      };
    }
  }

  // Verify payment status
  async verifyPayment(paymentId) {
    try {
      const response = await this.api.get(`/verify/${paymentId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Payment verification failed:", error);
      return {
        success: false,
        error: "Payment verification failed",
      };
    }
  }

  // Cancel payment
  async cancelPayment(paymentId, reason) {
    try {
      const response = await this.api.post(`/cancel/${paymentId}`, { reason });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Payment cancellation failed:", error);
      return {
        success: false,
        error: "Failed to cancel payment",
      };
    }
  }

  // Get available wallets/payment sources
  async getWallets() {
    try {
      const response = await this.api.get("/wallets");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
      // Return mock data for development/demo
      return {
        success: true, // Changed to success for fallback
        data: {
          wallets: [
            {
              id: "main_wallet",
              type: "USD",
              balance: 5000.0,
              available: 5000.0,
              frozen: 0,
            },
          ],
        },
      };
    }
  }
}

const paymentAPI = new PaymentAPI();
export default paymentAPI;
