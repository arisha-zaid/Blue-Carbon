import "./index.css";
// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerification from "./pages/OtpVerification";
import OAuthCallback from "./pages/OAuthCallback";

// Dashboards
import Dashboard from "./pages/dashboard/DashboardHome";
import AdminDashboard from "./pages/admin/AdminDashboard";
import IndustryDashboard from "./pages/industry/IndustryDashboard";
import GovernmentDashboard from "./pages/government/GovernmentDashboard";

// Admin sub-pages
import CreditIssuance from "./pages/admin/CreditIssuance";
import UserManagement from "./pages/admin/UserManagement";
import ProjectApproval from "./pages/admin/ProjectApproval";
import Reports from "./pages/admin/Reports";
import AdminProfile from "./pages/admin/Profile";
import AdminSettings from "./pages/admin/Settings";

// Industry sub-pages
import Marketplace from "./pages/industry/Marketplace";
import IndustryReports from "./pages/industry/Reports";
import TransactionsEnhanced from "./pages/industry/TransactionsEnhanced";
import Wallet from "./pages/industry/Wallet";
import IndustrySettings from "./pages/industry/Settings";

// Government sub-pages
import GovernmentReports from "./pages/government/ReportsAnalytics";
import AuditProjects from "./pages/government/AuditProjects";
import Policies from "./pages/government/Policies";
import GovernmentSettings from "./pages/government/Settings";

// Community sub-pages
import ProfileSetup from "./pages/community/ProfileSetup";
import CommunityProfile from "./pages/community/Profile";

// // Admin sub-pages
// import AddProject from "./pages/dashboard/AddProject";
// import Certificates from "./pages/dashboard/Certificates";
// import Leaderboard from "./pages/dashboard/Leaderboard";
// import MyProject from "./pages/dashboard/MyProject";
// import Profile from "./pages/dashboard/Profile";
// import AdminSettings from "./pages/dashboard/Settings";

// General pages
import AddProject from "./pages/AddProject";
import Certificates from "./pages/Certificates";
import Leaderboard from "./pages/Leaderboard";
import ProjectDetails from "./pages/ProjectDetails";
import DashboardSettings from "./pages/dashboard/Settings";

import RoleBasedRedirect from "./components/RoleBasedRedirect";
import ProjectMap from "./components/ProjectMap";

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Standalone routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp" element={<OtpVerification />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          {/* Landing page */}
          <Route path="/" element={<Landing />} />

          {/* Role-based redirect */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />

          {/* Admin dashboard */}
          <Route
            path="/admin"
            element={
              <Layout showSidebar={true}>
                <AdminDashboard />
              </Layout>
            }
          />
          <Route
            path="/admin/project-approval"
            element={
              <Layout showSidebar={true}>
                <ProjectApproval />
              </Layout>
            }
          />
          <Route
            path="/admin/credit-issuance"
            element={
              <Layout showSidebar={true}>
                <CreditIssuance />
              </Layout>
            }
          />
          <Route
            path="/admin/user-management"
            element={
              <Layout showSidebar={true}>
                <UserManagement />
              </Layout>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <Layout showSidebar={true}>
                <Reports />
              </Layout>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <Layout showSidebar={true}>
                <AdminProfile />
              </Layout>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <Layout showSidebar={true}>
                <AdminSettings />
              </Layout>
            }
          />

          {/* Industry dashboard */}
          <Route
            path="/industry"
            element={
              <Layout showSidebar={true}>
                <IndustryDashboard />
              </Layout>
            }
          />
          <Route
            path="/industry/marketplace"
            element={
              <Layout showSidebar={true}>
                <Marketplace />
              </Layout>
            }
          />
          <Route
            path="/industry/transactions"
            element={
              <Layout showSidebar={true}>
                <TransactionsEnhanced />
              </Layout>
            }
          />
          <Route
            path="/industry/wallet"
            element={
              <Layout showSidebar={true}>
                <Wallet />
              </Layout>
            }
          />
          <Route
            path="/industry/reports"
            element={
              <Layout showSidebar={true}>
                <IndustryReports />
              </Layout>
            }
          />
          <Route
            path="/industry/settings"
            element={
              <Layout showSidebar={true}>
                <IndustrySettings />
              </Layout>
            }
          />

          {/* Government dashboard */}
          <Route
            path="/government"
            element={
              <Layout showSidebar={true}>
                <GovernmentDashboard />
              </Layout>
            }
          />
          <Route
            path="/government/reports"
            element={
              <Layout showSidebar={true}>
                <GovernmentReports />
              </Layout>
            }
          />
          <Route
            path="/government/audit-projects"
            element={
              <Layout showSidebar={true}>
                <AuditProjects />
              </Layout>
            }
          />
          <Route
            path="/government/policies"
            element={
              <Layout showSidebar={true}>
                <Policies />
              </Layout>
            }
          />
          <Route
            path="/government/settings"
            element={
              <Layout showSidebar={true}>
                <GovernmentSettings />
              </Layout>
            }
          />

          {/* Community dashboard */}
          <Route
            path="/community"
            element={
              <Layout showSidebar={true}>
                <Dashboard />
              </Layout>
            }
          />

          {/* General pages */}
          <Route
            path="/add-project"
            element={
              <Layout showSidebar={true}>
                <AddProject />
              </Layout>
            }
          />
          <Route
            path="/my-projects"
            element={
              <Layout showSidebar={true}>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/certificates"
            element={
              <Layout showSidebar={true}>
                <Certificates />
              </Layout>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <Layout showSidebar={true}>
                <Leaderboard />
              </Layout>
            }
          />
          <Route
            path="/projects/map"
            element={
              <Layout showSidebar={true}>
                <ProjectMap />
              </Layout>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <Layout showSidebar={true}>
                <DashboardSettings />
              </Layout>
            }
          />
          {/* Community profile setup */}
          <Route
            path="/community/profile-setup"
            element={
              <Layout showSidebar={true}>
                <ProfileSetup />
              </Layout>
            }
          />

          {/* Community profile view */}
          <Route
            path="/community/profile"
            element={
              <Layout showSidebar={true}>
                <CommunityProfile />
              </Layout>
            }
          />

          <Route
            path="/project/:id"
            element={
              <Layout showSidebar={true}>
                <ProjectDetails />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}
