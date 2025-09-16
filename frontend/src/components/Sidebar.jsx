// src/components/Sidebar.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import apiService from "../services/api";
import {
  Home,
  FileText,
  Users,
  Award,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { mapRole } from "./RoleBasedRedirect";

export default function Sidebar({ role, isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { t } = useTranslation('common');
  const links = {
    community: [
      { key: "dashboard", path: "/community", icon: <Home size={18} /> },
      {
        key: "communityProfile",
        path: "/community/profile",
        icon: <Users size={18} />,
      },
      {
        key: "addProject",
        path: "/add-project",
        icon: <FileText size={18} />,
      },
      { key: "myProjects", path: "/my-projects", icon: <Users size={18} /> },
      {
        key: "certificates",
        path: "/certificates",
        icon: <Award size={18} />,
      },
      {
        key: "leaderboard",
        path: "/leaderboard",
        icon: <BarChart2 size={18} />,
      },
      {
        key: "settings",
        path: "/dashboard/settings",
        icon: <Settings size={18} />,
      },
      {
        key: "projectsMap",
        path: "/projects/map",
        icon: <BarChart2 size={18} />,
      },
    ],
    industry: [
      { key: "dashboard", path: "/industry", icon: <Home size={18} /> },
      {
        key: "marketplace",
        path: "/industry/marketplace",
        icon: <CreditCard size={18} />,
      },
      {
        key: "transactions",
        path: "/industry/transactions",
        icon: <FileText size={18} />,
      },
      { key: "wallet", path: "/industry/wallet", icon: <Award size={18} /> },
      {
        key: "reports",
        path: "/industry/reports",
        icon: <BarChart2 size={18} />,
      },
      {
        key: "projectsMap",
        path: "/projects/map",
        icon: <BarChart2 size={18} />,
      },
      {
        key: "settings",
        path: "/industry/settings",
        icon: <Settings size={18} />,
      },
    ],
    admin: [
      { key: "dashboard", path: "/admin", icon: <Home size={18} /> },
      {
        key: "projectApproval",
        path: "/admin/project-approval",
        icon: <FileText size={18} />,
      },
      {
        key: "creditIssuance",
        path: "/admin/credit-issuance",
        icon: <CreditCard size={18} />,
      },
      {
        key: "userManagement",
        path: "/admin/user-management",
        icon: <Users size={18} />,
      },
      {
        key: "reports",
        path: "/admin/reports",
        icon: <BarChart2 size={18} />,
      },
      {
        key: "projectsMap",
        path: "/projects/map",
        icon: <BarChart2 size={18} />,
      },
      {
        key: "profile",
        path: "/admin/profile",
        icon: <BarChart2 size={18} />,
      },
      {
        key: "settings",
        path: "/admin/settings",
        icon: <Settings size={18} />,
      },
    ],
    government: [
      { key: "dashboard", path: "/government", icon: <Home size={18} /> },
      {
        key: "reportsAnalytics",
        path: "/government/reports",
        icon: <BarChart2 size={18} />,
      },
      {
        key: "projectsMap",
        path: "/projects/map",
        icon: <BarChart2 size={18} />,
      },
      {
        key: "auditProjects",
        path: "/government/audit-projects",
        icon: <FileText size={18} />,
      },
      {
        key: "policies",
        path: "/government/policies",
        icon: <Settings size={18} />,
      },
      {
        key: "settings",
        path: "/government/settings",
        icon: <Settings size={18} />,
      },
    ],
  };

  const effectiveRole = mapRole(role);
  const roleLinks = links[effectiveRole] || links["community"];

  return (
    <aside
      className="bg-[#121110] shadow-lg w-64 h-screen fixed lg:relative left-0 top-0 lg:h-auto lg:top-auto lg:left-auto z-[9999]"
      aria-hidden={!isOpen}
    >
      {isOpen && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="text-xl font-bold text-teal-400">{t('app.brand')}</div>
            <button
              onClick={onClose}
              aria-label={t('sidebar.close')}
              className="p-2 rounded-md hover:bg-[#1a1a1a]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 p-3 space-y-2 overflow-y-auto h-[calc(100vh-150px)]">
            {roleLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-md font-medium bg-[#1a1a1a] text-gray-300 transition-all duration-300
              ${
                location.pathname === link.path
                  ? "border border-teal-500 text-teal-400 shadow-[0_0_6px_#14b8a6]"
                  : "hover:border hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6]"
              }`}
                onClick={() => {
                  // Only close sidebar on mobile screens
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                {link.icon}
                {t(`sidebar.links.${link.key}`)}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <button
              className="w-full flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-[#1a1a1a] text-gray-300 transition-all duration-300 hover:border hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6]"
              onClick={async () => {
                await apiService.logout();
                navigate("/login");
                // Only close sidebar on mobile screens
                if (window.innerWidth < 1024 && onClose) {
                  onClose();
                }
              }}
            >
              <LogOut size={18} /> {t('sidebar.logout')}
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
