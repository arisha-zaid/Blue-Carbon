import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import apiService from "../services/api";
import { useUser } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotification();
  const { setRole } = useUser();

  // Check if user is already logged in
  useEffect(() => {
    if (apiService.isAuthenticated()) {
      const role = apiService.getUserRole();
      let redirectPath;
      switch (role) {
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
          redirectPath = "/dashboard";
          break;
        default:
          redirectPath = "/dashboard";
      }
      navigate(redirectPath);
    }
  }, [navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await apiService.login(formData);
      if (response.success) {
        addNotification({
          type: "success",
          message: "Login successful! Welcome back.",
        });
        const role = response.data.user.role;
        setRole(role); // Update context
        let redirectPath;
        switch (role) {
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
            redirectPath = "/dashboard";
            break;
          default:
            redirectPath = "/dashboard";
        }
        navigate(redirectPath);
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle specific error cases
      if (error.message.includes("Account is temporarily locked")) {
        addNotification({
          type: "error",
          message:
            "Account is temporarily locked due to multiple failed attempts. Please try again later.",
        });
      } else if (error.message.includes("Account is deactivated")) {
        addNotification({
          type: "error",
          message: "Account is deactivated. Please contact support.",
        });
      } else if (error.message.includes("Invalid email or password")) {
        setErrors({
          email: "Invalid email or password",
          password: "Invalid email or password",
        });
      } else {
        addNotification({
          type: "error",
          message: error.message || "Login failed. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setErrors({ email: "Please enter your email first" });
      return;
    }

    try {
      const response = await apiService.forgotPassword(formData.email);

      if (response.success) {
        addNotification({
          type: "success",
          message:
            "Password reset link sent to your email. Please check your inbox.",
        });
      }
    } catch (error) {
      addNotification({
        type: "error",
        message: error.message || "Failed to send password reset email.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your Carbon SIH account
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.email
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.password
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </div>
              )}
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
            >
              Forgot your password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Error Display from URL params */}
        {location.search.includes("error=oauth_failed") && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              Google authentication failed. Please try again or use
              email/password login.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
