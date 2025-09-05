import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import apiService from "../services/api";
import { useUser } from "../context/UserContext";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { setRole } = useUser();
  const [status, setStatus] = useState("processing"); // processing, success, error

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get("token");
        const role = searchParams.get("role");
        const error = searchParams.get("error");

        if (error) {
          setStatus("error");
          addNotification({
            type: "error",
            message: "Google authentication failed. Please try again.",
          });
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        if (!token || !role) {
          setStatus("error");
          addNotification({
            type: "error",
            message: "Authentication incomplete. Please try logging in again.",
          });
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        // Store the token and role
  apiService.setAuthToken(token);
  apiService.setUserRole(role);
  setRole(role); // Update context

        // Get user data
        try {
          const userResponse = await apiService.getCurrentUser();
          if (userResponse.success) {
            apiService.setUserData(userResponse.data.user);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }

        setStatus("success");
        addNotification({
          type: "success",
          message: "Google authentication successful! Welcome to Carbon SIH.",
        });

        // Redirect to appropriate dashboard
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

        setTimeout(() => navigate(redirectPath), 1500);
      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        addNotification({
          type: "error",
          message: "Authentication failed. Please try again.",
        });
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, addNotification]);

  const renderContent = () => {
    switch (status) {
      case "processing":
        return (
          <div className="text-center">
            <Loader className="w-16 h-16 text-emerald-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Completing Authentication
            </h2>
            <p className="text-gray-600">
              Please wait while we complete your Google sign-in...
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Successful!
            </h2>
            <p className="text-gray-600">
              Redirecting you to your dashboard...
            </p>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600">
              Redirecting you to the login page...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
