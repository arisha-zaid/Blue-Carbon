// src/services/transactionAPI.js

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BLOCKCHAIN_API_URL =
  import.meta.env.VITE_BLOCKCHAIN_URL || "http://localhost:5000/api";

class TransactionAPI {
  constructor() {
    this.authToken = localStorage.getItem("authToken");
    this.userRole = localStorage.getItem("role");
  }

  // Helper method for API requests
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body !== "string") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Request failed" }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Get all transactions for current user
  async getTransactions(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const queryString = params.toString();
    const endpoint = `/industry/transactions${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request(endpoint);
  }

  // Get single transaction details
  async getTransaction(transactionId) {
    return this.request(`/industry/transactions/${transactionId}`);
  }

  // Create new transaction (purchase/sale)
  async createTransaction(transactionData) {
    const { projectId, amount, type, pricePerUnit } = transactionData;

    // Validate transaction data
    if (!projectId || !amount || !type) {
      throw new Error("Missing required transaction fields");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Check user wallet balance for purchases
    if (type === "purchase") {
      const requiredBalance = amount * pricePerUnit;
      const wallet = await this.getWalletBalance();

      if (wallet.balance < requiredBalance) {
        throw new Error("Insufficient funds for this transaction");
      }
    }

    // Check user carbon credit balance for sales
    if (type === "sale") {
      const carbonBalance = await this.getCarbonBalance();

      if (carbonBalance.available < amount) {
        throw new Error("Insufficient carbon credits for this sale");
      }
    }

    return this.request("/industry/transactions", {
      method: "POST",
      body: {
        projectId: projectId,
        amount: amount,
        type: type,
        pricePerUnit: pricePerUnit,
        description: transactionData.description,
      },
    });
  }

  // Confirm pending transaction
  async confirmTransaction(transactionId) {
    return this.request(`/industry/transactions/${transactionId}/confirm`, {
      method: "POST",
    });
  }

  // Cancel pending transaction
  async cancelTransaction(transactionId, reason) {
    return this.request(`/industry/transactions/${transactionId}/cancel`, {
      method: "POST",
      body: { reason },
    });
  }

  // Get transaction analytics
  async getTransactionAnalytics(period = "30d") {
    return this.request(`/industry/analytics/transactions?period=${period}`);
  }

  // Get wallet balance
  async getWalletBalance() {
    return this.request("/industry/wallet/balance");
  }

  // Get carbon credit balance
  async getCarbonBalance() {
    return this.request("/industry/wallet/carbon-balance");
  }

  // Update wallet balance (deposit/withdraw)
  async updateWalletBalance(action, amount) {
    return this.request("/industry/wallet/update", {
      method: "POST",
      body: {
        action, // 'deposit' or 'withdraw'
        amount: parseFloat(amount),
      },
    });
  }

  // Get blockchain transaction status
  async getBlockchainStatus(transactionHash) {
    try {
      return this.request(`/transactions/blockchain/${transactionHash}/status`);
    } catch (error) {
      console.error("Blockchain API error:", error);
      return { status: "unknown", confirmations: 0 };
    }
  }

  // Submit transaction to blockchain
  async submitToBlockchain(transactionData) {
    const blockchainPayload = {
      from: transactionData.from_address,
      to: transactionData.to_address,
      amount: transactionData.amount,
      data: {
        project_id: transactionData.project_id,
        carbon_credits: transactionData.amount,
        certificate_hash: transactionData.certificate_hash,
        metadata: transactionData.metadata,
      },
    };

    try {
      const response = await fetch(`${BLOCKCHAIN_API_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify(blockchainPayload),
      });

      if (!response.ok) {
        throw new Error("Blockchain submission failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Blockchain submission error:", error);
      throw error;
    }
  }

  // Generate transaction certificate
  async generateCertificate(transactionId) {
    const response = await this.request(
      `/transactions/${transactionId}/certificate`,
      {
        method: "POST",
      }
    );

    // Download the certificate
    if (response.download_url) {
      const link = document.createElement("a");
      link.href = response.download_url;
      link.download = `carbon-certificate-${transactionId}.pdf`;
      link.click();
    }

    return response;
  }

  // Export transactions as CSV
  async exportTransactions(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const queryString = params.toString();
    const url = `${API_BASE_URL}/industry/transactions/export${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Export failed");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `transactions-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();

    window.URL.revokeObjectURL(downloadUrl);
  }

  // Set up real-time transaction updates
  setupRealTimeUpdates(callback) {
    // Placeholder for real-time updates - would need socket.io-client
    console.log(
      "Real-time updates setup - feature available when socket.io-client is installed"
    );

    // Return cleanup function
    return () => {
      console.log("Real-time updates cleanup");
    };
  }

  // Get market data for pricing
  async getMarketData() {
    return this.request("/transactions/market/data");
  }

  // Get project availability
  async getProjectAvailability(projectId) {
    return this.request(`/transactions/projects/${projectId}/availability`);
  }

  // Calculate transaction fees
  async calculateTransactionFees(amount, pricePerUnit) {
    return this.request("/transactions/calculate-fees", {
      method: "POST",
      body: { amount, pricePerUnit },
    });
  }

  // Validate transaction before submission
  async validateTransaction(transactionData) {
    return this.request("/transactions/validate", {
      method: "POST",
      body: transactionData,
    });
  }

  // Industry-specific: Get emission offset calculations
  async calculateEmissionOffset(companyData) {
    return this.request("/industry/emission-offset", {
      method: "POST",
      body: companyData,
    });
  }

  // Industry-specific: Set up recurring purchases
  async setupRecurringPurchase(recurringData) {
    return this.request("/industry/recurring-purchase", {
      method: "POST",
      body: recurringData,
    });
  }

  // Industry-specific: Get compliance reports
  async getComplianceReport(reportType, period) {
    return this.request(`/industry/compliance/${reportType}?period=${period}`);
  }
}

// Create singleton instance
const transactionAPI = new TransactionAPI();

export default transactionAPI;
