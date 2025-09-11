// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiSearch, FiBell, FiSettings, FiMenu } from "react-icons/fi";
import { Waves } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar({ onSidebarToggle, isAdmin }) {
  const [username, setUsername] = useState("User");
  const [profilePic, setProfilePic] = useState(
    "https://via.placeholder.com/40"
  );

  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user")) || {};
      if (userData.name) {
        setUsername(userData.name);
        setProfilePic(
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            userData.name
          )}&background=random`
        );
      } else if (userData.profilePic) {
        setProfilePic(userData.profilePic);
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
    }
  }, [pathname]);

  const { t, i18n } = useTranslation('common');
  return (
    <nav className="w-full bg-[#1A1A1A] border-b border-gray-800 px-6 py-3 flex justify-between items-center fixed top-0 z-50">
      {/* Hamburger Menu + Logo */}
      <div className="flex items-center space-x-3">
        {onSidebarToggle && (
          <button
            onClick={onSidebarToggle}
            className="p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors lg:hidden"
            aria-label={t('navbar.toggleSidebar')}
          >
            <FiMenu className="h-6 w-6 text-gray-300" />
          </button>
        )}
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-green-600 rounded-lg flex items-center justify-center">
          <Waves className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-teal-400">{t('app.brand_compact')}</h1>
          <p className="text-sm text-gray-400">
            {isAdmin ? t('navbar.adminPortal') : t('navbar.registry')}
          </p>
        </div>
      </div>

      {/* Search + Actions */}
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder={t('navbar.searchPlaceholder')}
            className="pl-10 pr-4 py-2 rounded-full bg-[#2A2A2A] border border-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-[#2A2A2A] transition">
            <FiBell className="text-gray-400 hover:text-gray-200" size={20} />
          </button>
          <button
            className="p-2 rounded-full hover:bg-[#2A2A2A] transition"
            onClick={() => navigate("/dashboard/settings")}
            aria-label={t('navbar.settingsAria')}
          >
            <FiSettings
              className="text-gray-400 hover:text-gray-200"
              size={20}
            />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-2">
          <img
            src={profilePic}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-700"
          />
          <span className="text-gray-200 font-semibold">
            {t('navbar.welcomeBack', { name: username })}
          </span>
          {/* Simple language switcher */}
          <select
            aria-label="language"
            onChange={(e) => { try { localStorage.setItem('i18nextLng', e.target.value); } catch {}; i18n.changeLanguage(e.target.value); }}
            defaultValue={i18n.language?.split('-')[0] || 'en'}
            className="ml-3 bg-[#2A2A2A] border border-gray-700 text-gray-200 rounded px-2 py-1"
          >
            <option value="en">EN</option>
            <option value="hi">हिं</option>
            <option value="ta">த</option>
            <option value="bn">ব</option>
            <option value="ar">ع</option>
          </select>
        </div>
      </div>
    </nav>
  );
}
