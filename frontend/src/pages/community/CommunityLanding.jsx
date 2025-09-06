import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import DashboardHome from "../dashboard/DashboardHome";

// This component guards the community dashboard by ensuring a community profile exists
export default function CommunityLanding() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [canRenderDashboard, setCanRenderDashboard] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        await api.getMyCommunityProfile();
        if (!isMounted) return;
        setCanRenderDashboard(true);
      } catch (err) {
        // If profile missing, backend returns 404
        if (err?.status === 404) {
          navigate("/community/profile-setup", { replace: true });
          return;
        }
        // For other errors, allow dashboard render but log
        console.error("Community profile check failed:", err);
        setCanRenderDashboard(true);
      } finally {
        if (isMounted) setChecking(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (checking) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center text-gray-600">
        Checking your community profile...
      </div>
    );
  }

  if (canRenderDashboard) {
    return <DashboardHome />;
  }

  return null;
}