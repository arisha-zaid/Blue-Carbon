import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import apiService from "../services/api";
import { useNotification } from "../context/NotificationContext";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    organization: {
      name: "",
      type: "",
      website: "",
    },
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // Check if user is already logged in
  useEffect(() => {
    if (apiService.isAuthenticated()) {
      const role = apiService.getUserRole();
      navigate(`/${role === "ngo" ? "government" : role}`);
    }
  }, [navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
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
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle next step
  const handleNext = () => {
    setStep(step + 1);
  };

  // Handle previous step
  const handlePrevious = () => {
    setStep(step - 1);
  };

  // Handle form submission → always navigate to selected role
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role) {
      setErrors({ role: "Please select your role" });
      return;
    }

    setLoading(true);

    try {
      // Optional: Show notification
      addNotification({
        type: "success",
        message: "Account created successfully! Redirecting...",
      });

      // Navigate directly based on role
      let redirectPath;
      switch (formData.role) {
        case "admin":
          redirectPath = "/admin";
          break;
        case "government":
          redirectPath = "/government";
          break;
        case "industry":
          redirectPath = "/industry";
          break;
        case "community":
        default:
          redirectPath = "/dashboard";
      }

      navigate(redirectPath);
    } catch (error) {
      addNotification({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Role options
  const roleOptions = [
    {
      value: "community",
      label: "Community",
      icon: "🌱",
      description: "Upload plantation details and track progress",
    },
    {
      value: "industry",
      label: "Industry",
      icon: "🏭",
      description: "Buy carbon credits and offset emissions",
    },
    {
      value: "government",
      label: "Government",
      icon: "🏛️",
      description: "Monitor and verify projects",
    },
    {
      value: "admin",
      label: "Admin",
      icon: "👑",
      description: "System administration and management",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Carbon SIH and start making a difference
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step > stepNumber ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < 2 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? "bg-emerald-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm"
                      placeholder="Enter your first name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select Your Role
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roleOptions.map((role) => (
                    <div
                      key={role.value}
                      className={`p-4 border-2 rounded-lg cursor-pointer ${
                        formData.role === role.value
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200"
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, role: role.value }))
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span>
                          {role.icon} {role.label}
                        </span>
                        {formData.role === role.value && (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {role.description}
                      </p>
                    </div>
                  ))}
                </div>
                {errors.role && (
                  <div className="text-red-600 text-sm mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" /> {errors.role}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-3 border rounded-lg"
              >
                Previous
              </button>
            )}
            {step < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? "Redirecting..." : "Create Account"}
              </button>
            )}
          </div>
        </form>

        {/* Sign In */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-600 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
