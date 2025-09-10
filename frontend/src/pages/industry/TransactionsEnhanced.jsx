// src/pages/industry/TransactionsEnhanced.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  FileBarChart,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  ExternalLink,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";

// Real API integration
import transactionAPI from "../../services/transactionAPI";
import PaymentModal from "../../components/PaymentModal";

const TransactionsEnhanced = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
  });
  const [analytics, setAnalytics] = useState({
    totalVolume: 0,
    totalValue: 0,
    averagePrice: 0,
    monthlyChange: 0,
  });

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [purchaseData, setPurchaseData] = useState(null);

  // Mock data for demo purposes
  const mockData = [
    {
      id: "TX-2025-001847",
      type: "purchase",
      status: "completed",
      project: {
        id: "BC-144",
        name: "Mangrove Revival – Bay East",
        type: "Mangroves",
        location: "Odisha, IN",
      },
      amount: 450,
      price: 28.9,
      totalValue: 13005,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      blockchainHash:
        "0x7a3b9c2d1e4f5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
      certificate: "CERT-2025-001847",
      vendor: "EcoCarbon Solutions",
      fees: 65.025,
      estimatedCO2Offset: 450,
      methodology: "VM0033",
    },
    {
      id: "TX-2025-001846",
      type: "sale",
      status: "completed",
      project: {
        id: "BC-128",
        name: "Seagrass Bloom – West Coast",
        type: "Seagrass",
        location: "Goa, IN",
      },
      amount: 180,
      price: 26.2,
      totalValue: 4716,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      blockchainHash:
        "0x9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
      certificate: "CERT-2025-001846",
      buyer: "GreenTech Industries",
      fees: 23.58,
      estimatedCO2Offset: 180,
    },
  ];

  // Load transactions on component mount
  useEffect(() => {
    fetchTransactions();
    fetchAnalytics();

    // Set up real-time updates (replace with WebSocket in production)
    const interval = setInterval(() => {
      fetchTransactions();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Try real API call first
      const response = await transactionAPI.getTransactions(filters);

      if (response.success) {
        setTransactions(response.data);
      } else {
        console.log("API not available, using mock data");
        setTransactions(mockData);
      }
    } catch (error) {
      console.log("Using mock data due to API error:", error.message);
      // Fallback to mock data for demo purposes if API fails
      setTransactions(mockData);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Try real API call first
      const response = await transactionAPI.getTransactionAnalytics();

      if (response.success) {
        setAnalytics({
          totalVolume: response.data.totalVolume || 0,
          totalValue: response.data.totalValue || 0,
          averagePrice: response.data.averagePrice || 0,
          monthlyChange: response.data.percentageChange || 0,
        });
      } else {
        // Fallback to mock analytics
        setAnalytics({
          totalVolume: 1830,
          totalValue: 50321,
          averagePrice: 27.5,
          monthlyChange: 12.3,
        });
      }
    } catch (error) {
      console.log("Using mock analytics due to API error:", error.message);
      // Fallback to mock analytics
      setAnalytics({
        totalVolume: 1830,
        totalValue: 50321,
        averagePrice: 27.5,
        monthlyChange: 12.3,
      });
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        !filters.search ||
        tx.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        tx.project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        tx.project.id.toLowerCase().includes(filters.search.toLowerCase());

      const matchesType = filters.type === "all" || tx.type === filters.type;
      const matchesStatus =
        filters.status === "all" || tx.status === filters.status;

      const txDate = new Date(tx.timestamp);
      const matchesDateFrom =
        !filters.dateFrom || txDate >= new Date(filters.dateFrom);
      const matchesDateTo =
        !filters.dateTo || txDate <= new Date(filters.dateTo);

      const matchesMinAmount =
        !filters.minAmount || tx.amount >= parseFloat(filters.minAmount);
      const matchesMaxAmount =
        !filters.maxAmount || tx.amount <= parseFloat(filters.maxAmount);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesMinAmount &&
        matchesMaxAmount
      );
    });
  }, [transactions, filters]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      failed: "bg-red-100 text-red-800 border-red-200",
    };
    return `px-2 py-1 rounded-full text-xs font-semibold border ${
      styles[status] || "bg-gray-100 text-gray-800"
    }`;
  };

  const exportTransactions = () => {
    // Generate CSV export
    const csvContent = [
      [
        "Transaction ID",
        "Type",
        "Status",
        "Project",
        "Amount (tCO₂)",
        "Price ($/t)",
        "Total Value ($)",
        "Date",
        "Blockchain Hash",
      ].join(","),
      ...filteredTransactions.map((tx) =>
        [
          tx.id,
          tx.type,
          tx.status,
          tx.project.name,
          tx.amount,
          tx.price,
          tx.totalValue,
          new Date(tx.timestamp).toLocaleString(),
          tx.blockchainHash || "N/A",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carbon_transactions_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBuyCredits = () => {
    // For demo purposes, we'll use mock data for the purchase
    const mockPurchaseData = {
      project: {
        id: "BC-144",
        name: "Mangrove Revival – Bay East",
        type: "Mangroves",
        location: "Odisha, IN",
      },
      amount: 100,
      pricePerUnit: 28.9,
      type: "purchase",
    };

    setPurchaseData(mockPurchaseData);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentResult) => {
    // Refresh transactions after successful payment
    fetchTransactions();
    fetchAnalytics();

    // Show success message (you might want to add a toast notification)
    console.log("Payment successful:", paymentResult);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 hover:border-cyan-400/50 transition-all">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-cyan-400" />
            <div>
              <p className="text-gray-400 text-sm">Total Volume</p>
              <p className="text-2xl font-bold">
                {analytics.totalVolume.toLocaleString()} tCO₂
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 hover:border-emerald-400/50 transition-all">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold">
                ${analytics.totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 hover:border-blue-400/50 transition-all">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-gray-400 text-sm">Avg Price</p>
              <p className="text-2xl font-bold">
                ${analytics.averagePrice.toFixed(2)}/t
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 hover:border-purple-400/50 transition-all">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-gray-400 text-sm">Monthly Change</p>
              <p className="text-2xl font-bold text-emerald-400">
                +{analytics.monthlyChange}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">
            Transaction History
          </h1>
          <p className="text-gray-400 mt-1">
            Comprehensive view of all carbon credit transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBuyCredits}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-semibold"
          >
            <ShoppingCart className="w-4 h-4" />
            Buy Credits
          </button>
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={exportTransactions}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            Recent Transactions ({filteredTransactions.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-[#2a2a2a] rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <h3 className="font-semibold">{transaction.id}</h3>
                        <p className="text-sm text-gray-400">
                          {transaction.project.name} (
                          {transaction.project.location})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">
                          {transaction.amount} tCO₂
                        </p>
                        <p className="text-sm text-gray-400">
                          ${transaction.price}/t
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-400">
                          ${transaction.totalValue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={getStatusBadge(transaction.status)}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        transactionData={purchaseData}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default TransactionsEnhanced;
