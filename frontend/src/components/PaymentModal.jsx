// src/components/PaymentModal.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Building2,
  Coins,
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  User,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";
import paymentAPI from "../services/paymentAPI";

const PaymentModal = ({ isOpen, onClose, transactionData, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Method, 2: Details, 3: Review, 4: Processing
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentCalculation, setPaymentCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [wallets, setWallets] = useState([]);
  const [showCardDetails, setShowCardDetails] = useState(false);

  const [formData, setFormData] = useState({
    // Credit Card
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",

    // Bank Transfer
    accountNumber: "",
    routingNumber: "",
    accountType: "checking",

    // Crypto
    walletAddress: "",
    cryptoType: "ETH",

    // Common
    billingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
    },
    savePaymentMethod: false,
  });

  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
      loadWallets();
    }
  }, [isOpen]);

  useEffect(() => {
    if (transactionData && paymentMethod) {
      calculatePayment();
    }
  }, [transactionData, paymentMethod]);

  const loadPaymentMethods = async () => {
    const response = await paymentAPI.getPaymentMethods();
    if (response.success) {
      setPaymentMethods(response.data.methods || []);
    }
  };

  const loadWallets = async () => {
    const response = await paymentAPI.getWallets();
    if (response.success) {
      setWallets(response.data.wallets || []);
    }
  };

  const calculatePayment = async () => {
    if (!transactionData) return;

    const calculation = await paymentAPI.calculatePayment({
      ...transactionData,
      paymentMethod,
    });

    if (calculation.success) {
      setPaymentCalculation(calculation.data);
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "credit_card":
        return CreditCard;
      case "bank_transfer":
        return Building2;
      case "crypto":
        return Coins;
      default:
        return Wallet;
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const formatCardNumber = (value) => {
    return value
      .replace(/\s+/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
  };

  const formatExpiryDate = (value) => {
    return value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
  };

  const validateStep = () => {
    setError("");

    if (currentStep === 2) {
      if (paymentMethod === "credit_card") {
        if (
          !formData.cardNumber ||
          !formData.expiryDate ||
          !formData.cvv ||
          !formData.cardholderName
        ) {
          setError("Please fill in all required credit card fields");
          return false;
        }
      } else if (paymentMethod === "bank_transfer") {
        if (!formData.accountNumber || !formData.routingNumber) {
          setError("Please fill in all required bank transfer fields");
          return false;
        }
      } else if (paymentMethod === "crypto") {
        if (!formData.walletAddress) {
          setError("Please enter your wallet address");
          return false;
        }
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const processPayment = async () => {
    setLoading(true);
    setCurrentStep(4);
    setError("");

    try {
      const paymentData = {
        transactionData,
        paymentMethod,
        paymentDetails: formData,
        calculation: paymentCalculation,
      };

      const response = await paymentAPI.processPayment(paymentData);

      if (response.success) {
        setTimeout(() => {
          onSuccess(response.data);
          onClose();
          resetModal();
        }, 2000);
      } else {
        setError(response.error);
        setCurrentStep(3); // Go back to review step
      }
    } catch (err) {
      setError("Payment processing failed. Please try again.");
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setPaymentMethod("credit_card");
    setError("");
    setFormData({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      accountNumber: "",
      routingNumber: "",
      accountType: "checking",
      walletAddress: "",
      cryptoType: "ETH",
      billingAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
      },
      savePaymentMethod: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Complete Payment</h2>
            <p className="text-gray-400 text-sm mt-1">
              Step {currentStep} of 4 -{" "}
              {currentStep === 1
                ? "Payment Method"
                : currentStep === 2
                ? "Payment Details"
                : currentStep === 3
                ? "Review & Confirm"
                : "Processing"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step
                      ? "bg-cyan-600 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {currentStep > step ? "✓" : step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      currentStep > step ? "bg-cyan-600" : "bg-gray-700"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Step 1: Payment Method Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Choose Payment Method
              </h3>

              <div className="grid gap-4">
                {paymentMethods.map((method) => {
                  const Icon = getPaymentMethodIcon(method.id);
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        paymentMethod === method.id
                          ? "border-cyan-600 bg-cyan-900/20"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Icon
                          className={`w-8 h-8 ${
                            paymentMethod === method.id
                              ? "text-cyan-400"
                              : "text-gray-400"
                          }`}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">
                            {method.name}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {method.fees}% fee • {method.processingTime}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            paymentMethod === method.id
                              ? "border-cyan-600 bg-cyan-600"
                              : "border-gray-600"
                          }`}
                        >
                          {paymentMethod === method.id && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Payment Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Payment Details
              </h3>

              {paymentMethod === "credit_card" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "cardNumber",
                          formatCardNumber(e.target.value)
                        )
                      }
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-600 focus:outline-none"
                      maxLength="19"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) =>
                          handleInputChange(
                            "expiryDate",
                            formatExpiryDate(e.target.value)
                          )
                        }
                        className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-600 focus:outline-none"
                        maxLength="5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        CVV
                      </label>
                      <div className="relative">
                        <input
                          type={showCardDetails ? "text" : "password"}
                          placeholder="123"
                          value={formData.cvv}
                          onChange={(e) =>
                            handleInputChange(
                              "cvv",
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                          className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-600 focus:outline-none pr-10"
                          maxLength="4"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCardDetails(!showCardDetails)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                          {showCardDetails ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={formData.cardholderName}
                      onChange={(e) =>
                        handleInputChange("cardholderName", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "bank_transfer" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234567890"
                      value={formData.accountNumber}
                      onChange={(e) =>
                        handleInputChange("accountNumber", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Routing Number
                    </label>
                    <input
                      type="text"
                      placeholder="123456789"
                      value={formData.routingNumber}
                      onChange={(e) =>
                        handleInputChange("routingNumber", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Type
                    </label>
                    <select
                      value={formData.accountType}
                      onChange={(e) =>
                        handleInputChange("accountType", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:border-cyan-600 focus:outline-none"
                    >
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                    </select>
                  </div>
                </div>
              )}

              {paymentMethod === "crypto" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cryptocurrency
                    </label>
                    <select
                      value={formData.cryptoType}
                      onChange={(e) =>
                        handleInputChange("cryptoType", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:border-cyan-600 focus:outline-none"
                    >
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="USDC">USD Coin (USDC)</option>
                      <option value="USDT">Tether (USDT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={formData.walletAddress}
                      onChange={(e) =>
                        handleInputChange("walletAddress", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="savePaymentMethod"
                  checked={formData.savePaymentMethod}
                  onChange={(e) =>
                    handleInputChange("savePaymentMethod", e.target.checked)
                  }
                  className="w-4 h-4 text-cyan-600 bg-[#2a2a2a] border border-gray-700 rounded focus:ring-cyan-600"
                />
                <label
                  htmlFor="savePaymentMethod"
                  className="text-sm text-gray-300"
                >
                  Save this payment method for future transactions
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && paymentCalculation && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Review & Confirm
              </h3>

              {/* Transaction Summary */}
              <div className="bg-[#2a2a2a] rounded-xl p-4 border border-gray-700">
                <h4 className="font-semibold text-white mb-3">
                  Transaction Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Project:</span>
                    <span className="text-white">
                      {transactionData?.project?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white">
                      {transactionData?.amount} tCO₂
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price per unit:</span>
                    <span className="text-white">
                      ${transactionData?.pricePerUnit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-[#2a2a2a] rounded-xl p-4 border border-gray-700">
                <h4 className="font-semibold text-white mb-3">
                  Payment Breakdown
                </h4>
                <div className="space-y-2">
                  {Object.entries(paymentCalculation.breakdown).map(
                    ([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400">{key}:</span>
                        <span className="text-white">
                          ${value.toLocaleString()}
                        </span>
                      </div>
                    )
                  )}
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Total:</span>
                      <span className="text-cyan-400 text-lg">
                        ${paymentCalculation.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-emerald-300">
                    Secure Payment
                  </h5>
                  <p className="text-sm text-emerald-200 mt-1">
                    Your payment information is encrypted and processed
                    securely. This transaction will be recorded on the
                    blockchain for transparency.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Processing */}
          {currentStep === 4 && (
            <div className="text-center space-y-6">
              <div className="flex flex-col items-center">
                {loading ? (
                  <>
                    <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-4" />
                    <h3 className="text-xl font-semibold text-white">
                      Processing Payment...
                    </h3>
                    <p className="text-gray-400">
                      Please do not close this window
                    </p>
                  </>
                ) : error ? (
                  <>
                    <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                    <h3 className="text-xl font-semibold text-white">
                      Payment Failed
                    </h3>
                    <p className="text-gray-400">{error}</p>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-16 h-16 text-emerald-400 mb-4" />
                    <h3 className="text-xl font-semibold text-white">
                      Payment Successful!
                    </h3>
                    <p className="text-gray-400">
                      Your carbon credits will be transferred shortly
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-800">
            <button
              onClick={currentStep === 1 ? onClose : prevStep}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              {currentStep === 1 ? "Cancel" : "Back"}
            </button>

            <div className="flex items-center gap-3">
              {paymentCalculation && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-lg font-semibold text-cyan-400">
                    ${paymentCalculation.total.toLocaleString()}
                  </p>
                </div>
              )}

              <button
                onClick={currentStep === 3 ? processPayment : nextStep}
                disabled={loading}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {currentStep === 3 ? "Confirm Payment" : "Continue"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
