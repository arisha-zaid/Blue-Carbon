// src/components/LanguageSelector.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिन्दी (Hindi)' },
  { id: 'ta', label: 'தமிழ் (Tamil)' },
  { id: 'bn', label: 'বাংলা (Bengali)' },
  { id: 'ar', label: 'العربية (Arabic)' },
];

export default function LanguageSelector({ value, onChange, className }) {
  const { i18n } = useTranslation();

  const current = (value || i18n.language || 'en').split('-')[0];

  const handleChange = (e) => {
    const lng = e.target.value;
    // Update local state in parent
    onChange && onChange(lng);
    // Persist preference for detector and switch immediately
    try { localStorage.setItem('i18nextLng', lng); } catch {}
    i18n.changeLanguage(lng);
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      className={
        className ||
        'w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#121110] text-gray-200 focus:ring-2 focus:ring-emerald-500'
      }
      aria-label="Language"
    >
      {LANGS.map((l) => (
        <option key={l.id} value={l.id} className="bg-[#1a1a1a] text-gray-200">
          {l.label}
        </option>
      ))}
    </select>
  );
}