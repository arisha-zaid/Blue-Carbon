// src/pages/dashboard/Settings.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  User,
  Bell,
  Globe2,
  ShieldCheck,
  Moon,
  Sun,
  Languages,
  Download,
  Trash2,
  Save,
  RotateCcw,
  Mail,
  Smartphone,
} from "lucide-react";

const DEFAULTS = {
  // Appearance
  theme: "system", // light | dark | system
  density: "comfortable", // compact | comfortable
  language: "en",
  // Notifications
  emailActivity: true,
  emailAnnouncements: true,
  pushEnabled: false,
  // Privacy & Security
  showProfilePublic: true,
  twoFA: false,
  // Account
  fullName: "Dashboard User",
  email: "user@example.com",
  organization: "",
};

import LanguageSelector from "../../components/LanguageSelector";

const LANGS = [
  { id: "en", label: "English" },
  { id: "hi", label: "हिन्दी (Hindi)" },
  { id: "ta", label: "தமிழ் (Tamil)" },
  { id: "bn", label: "বাংলা (Bengali)" },
  { id: "ar", label: "العربية (Arabic)" },
];

export default function DashboardSettings() {
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [testingPush, setTestingPush] = useState(false);

  // load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dashboard_settings");
      if (stored) setForm(JSON.parse(stored));
    } catch {}
  }, []);

  // theme apply (for demo)
  useEffect(() => {
    if (form.theme === "system") {
      document.documentElement.classList.remove("dark");
      if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      }
      return;
    }
    document.documentElement.classList.toggle("dark", form.theme === "dark");
  }, [form.theme]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    try {
      // replace with API call
      localStorage.setItem("dashboard_settings", JSON.stringify(form));
    } finally {
      setTimeout(() => setSaving(false), 500);
    }
  };

  const resetDefaults = () => {
    setForm(DEFAULTS);
  };

  const exportData = () => {
    const data = JSON.stringify({ settings: form, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "dashboard-settings.json";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const testPush = async () => {
    setTestingPush(true);
    setTimeout(() => setTestingPush(false), 600);
  };

  const densityLabel = useMemo(
    () => (form.density === "compact" ? "Compact" : "Comfortable"),
    [form.density]
  );

  return (
    // <div className="space-y-8">
    //   <header>
    //     <h1 className="text-3xl font-bold">Settings</h1>
    //     <p className="text-gray-600 mt-1">
    //       Personalize your dashboard experience, notifications, and privacy.
    //     </p>
    //   </header>

    //   {/* Profile */}
    //   <section className="bg-white rounded-2xl shadow p-6">
    //     <h3 className="font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
    //       <User className="w-5 h-5 text-emerald-600" /> Profile
    //     </h3>
    //     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //       <TextField
    //         label="Full Name"
    //         value={form.fullName}
    //         onChange={(v) => update({ fullName: v })}
    //         icon={<User className="w-4 h-4 text-gray-500" />}
    //       />
    //       <TextField
    //         label="Email"
    //         value={form.email}
    //         onChange={(v) => update({ email: v })}
    //         icon={<Mail className="w-4 h-4 text-gray-500" />}
    //       />
    //       <TextField
    //         label="Organization (optional)"
    //         value={form.organization}
    //         onChange={(v) => update({ organization: v })}
    //       />
    //     </div>
    //   </section>

    //   {/* Appearance */}
    //   <section className="bg-white rounded-2xl shadow p-6">
    //     <h3 className="font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
    //       <Globe2 className="w-5 h-5 text-emerald-600" /> Appearance & Language
    //     </h3>
    //     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //       <div>
    //         <label className="block text-sm text-gray-600 mb-1">Theme</label>
    //         <div className="flex items-center gap-2">
    //           <Choice
    //             active={form.theme === "light"}
    //             onClick={() => update({ theme: "light" })}
    //             icon={<Sun className="w-4 h-4" />}
    //             label="Light"
    //           />
    //           <Choice
    //             active={form.theme === "dark"}
    //             onClick={() => update({ theme: "dark" })}
    //             icon={<Moon className="w-4 h-4" />}
    //             label="Dark"
    //           />
    //           <Choice
    //             active={form.theme === "system"}
    //             onClick={() => update({ theme: "system" })}
    //             icon={<Globe2 className="w-4 h-4" />}
    //             label="System"
    //           />
    //         </div>
    //       </div>
    //       <div>
    //         <label className="block text-sm text-gray-600 mb-1">Density</label>
    //         <div className="flex items-center gap-2">
    //           <Choice
    //             active={form.density === "comfortable"}
    //             onClick={() => update({ density: "comfortable" })}
    //             label="Comfortable"
    //           />
    //           <Choice
    //             active={form.density === "compact"}
    //             onClick={() => update({ density: "compact" })}
    //             label="Compact"
    //           />
    //         </div>
    //         <div className="text-xs text-gray-500 mt-1">Current: {densityLabel}</div>
    //       </div>
    //       <div>
    //         <label className="block text-sm text-gray-600 mb-1 inline-flex items-center gap-2">
    //           <Languages className="w-4 h-4" /> Language
    //         </label>
    //         <select
    //           value={form.language}
    //           onChange={(e) => update({ language: e.target.value })}
    //           className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
    //         >
    //           {LANGS.map((l) => (
    //             <option key={l.id} value={l.id}>
    //               {l.label}
    //             </option>
    //           ))}
    //         </select>
    //       </div>
    //     </div>
    //   </section>

    //   {/* Notifications */}
    //   <section className="bg-white rounded-2xl shadow p-6">
    //     <h3 className="font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
    //       <Bell className="w-5 h-5 text-emerald-600" /> Notifications
    //     </h3>
    //     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //       <ToggleField
    //         label="Email me about activity"
    //         checked={form.emailActivity}
    //         onChange={(v) => update({ emailActivity: v })}
    //       />
    //       <ToggleField
    //         label="Product updates & announcements"
    //         checked={form.emailAnnouncements}
    //         onChange={(v) => update({ emailAnnouncements: v })}
    //       />
    //       <div>
    //         <ToggleField
    //           label="Enable Push (browser)"
    //           checked={form.pushEnabled}
    //           onChange={(v) => update({ pushEnabled: v })}
    //           icon={<Smartphone className="w-4 h-4 text-emerald-600" />}
    //         />
    //         <button
    //           onClick={testPush}
    //           className="mt-2 px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 text-sm"
    //         >
    //           {testingPush ? "Testing..." : "Send Test Notification"}
    //         </button>
    //       </div>
    //     </div>
    //   </section>

    //   {/* Privacy & Security */}
    //   <section className="bg-white rounded-2xl shadow p-6">
    //     <h3 className="font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
    //       <ShieldCheck className="w-5 h-5 text-emerald-600" /> Privacy & Security
    //     </h3>
    //     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //       <ToggleField
    //         label="Public profile (visible on leaderboard)"
    //         checked={form.showProfilePublic}
    //         onChange={(v) => update({ showProfilePublic: v })}
    //       />
    //       <ToggleField
    //         label="Enable Two-factor Authentication"
    //         checked={form.twoFA}
    //         onChange={(v) => update({ twoFA: v })}
    //       />
    //       <div className="text-xs text-gray-500">
    //         For maximum safety, enable 2FA and keep your email verified.
    //       </div>
    //     </div>
    //   </section>

    //   {/* Data & Account */}
    //   <section className="bg-white rounded-2xl shadow p-6">
    //     <h3 className="font-semibold text-gray-900 mb-4">Data & Account</h3>
    //     <div className="flex flex-col md:flex-row gap-3">
    //       <button
    //         onClick={exportData}
    //         className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
    //       >
    //         <Download className="w-4 h-4" /> Export My Data
    //       </button>
    //       <button
    //         onClick={() => alert("Delete request queued (demo).")}
    //         className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white hover:brightness-110"
    //       >
    //         <Trash2 className="w-4 h-4" /> Request Account Deletion
    //       </button>
    //     </div>
    //   </section>

    //   {/* Actions */}
    //   <div className="flex items-center gap-3">
    //     <button
    //       onClick={save}
    //       disabled={saving}
    //       className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110 disabled:opacity-60"
    //     >
    //       <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
    //     </button>
    //     <button
    //       onClick={resetDefaults}
    //       className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
    //     >
    //       <RotateCcw className="w-4 h-4" /> Reset to Defaults
    //     </button>
    //   </div>
    // </div>
    <div className="space-y-8 bg-[#121110] min-h-screen p-6 text-gray-200">
  <header>
    <h1 className="text-3xl font-bold text-white">Settings</h1>
    <p className="text-gray-400 mt-1">
      Personalize your dashboard experience, notifications, and privacy.
    </p>
  </header>

  {/* Profile */}
  <section className="bg-[#1a1a1a] rounded-2xl shadow p-6 border border-gray-700">
    <h3 className="font-semibold text-gray-100 mb-4 inline-flex items-center gap-2">
      <User className="w-5 h-5 text-emerald-500" /> Profile
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <TextField
        label="Full Name"
        value={form.fullName}
        onChange={(v) => update({ fullName: v })}
        icon={<User className="w-4 h-4 text-gray-400" />}
      />
      <TextField
        label="Email"
        value={form.email}
        onChange={(v) => update({ email: v })}
        icon={<Mail className="w-4 h-4 text-gray-400" />}
      />
      <TextField
        label="Organization (optional)"
        value={form.organization}
        onChange={(v) => update({ organization: v })}
      />
    </div>
  </section>

  {/* Appearance */}
  <section className="bg-[#1a1a1a] rounded-2xl shadow p-6 border border-gray-700">
    <h3 className="font-semibold text-gray-100 mb-4 inline-flex items-center gap-2">
      <Globe2 className="w-5 h-5 text-emerald-500" /> Appearance & Language
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Theme</label>
        <div className="flex items-center gap-2">
          <Choice active={form.theme === "light"} onClick={() => update({ theme: "light" })} icon={<Sun className="w-4 h-4" />} label="Light" />
          <Choice active={form.theme === "dark"} onClick={() => update({ theme: "dark" })} icon={<Moon className="w-4 h-4" />} label="Dark" />
          <Choice active={form.theme === "system"} onClick={() => update({ theme: "system" })} icon={<Globe2 className="w-4 h-4" />} label="System" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Density</label>
        <div className="flex items-center gap-2">
          <Choice active={form.density === "comfortable"} onClick={() => update({ density: "comfortable" })} label="Comfortable" />
          <Choice active={form.density === "compact"} onClick={() => update({ density: "compact" })} label="Compact" />
        </div>
        <div className="text-xs text-gray-500 mt-1">Current: {densityLabel}</div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1 inline-flex items-center gap-2">
          <Languages className="w-4 h-4" /> Language
        </label>
        <LanguageSelector
          value={form.language}
          onChange={(lng) => update({ language: lng })}
        />
      </div>
    </div>
  </section>

  {/* Notifications */}
  <section className="bg-[#1a1a1a] rounded-2xl shadow p-6 border border-gray-700">
    <h3 className="font-semibold text-gray-100 mb-4 inline-flex items-center gap-2">
      <Bell className="w-5 h-5 text-emerald-500" /> Notifications
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ToggleField label="Email me about activity" checked={form.emailActivity} onChange={(v) => update({ emailActivity: v })} />
      <ToggleField label="Product updates & announcements" checked={form.emailAnnouncements} onChange={(v) => update({ emailAnnouncements: v })} />
      <div>
        <ToggleField label="Enable Push (browser)" checked={form.pushEnabled} onChange={(v) => update({ pushEnabled: v })} icon={<Smartphone className="w-4 h-4 text-emerald-500" />} />
        <button onClick={testPush} className="mt-2 px-3 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-[#2a2a2a] text-sm">
          {testingPush ? "Testing..." : "Send Test Notification"}
        </button>
      </div>
    </div>
  </section>

  {/* Privacy & Security */}
  <section className="bg-[#1a1a1a] rounded-2xl shadow p-6 border border-gray-700">
    <h3 className="font-semibold text-gray-100 mb-4 inline-flex items-center gap-2">
      <ShieldCheck className="w-5 h-5 text-emerald-500" /> Privacy & Security
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ToggleField label="Public profile (visible on leaderboard)" checked={form.showProfilePublic} onChange={(v) => update({ showProfilePublic: v })} />
      <ToggleField label="Enable Two-factor Authentication" checked={form.twoFA} onChange={(v) => update({ twoFA: v })} />
      <div className="text-xs text-gray-500">
        For maximum safety, enable 2FA and keep your email verified.
      </div>
    </div>
  </section>

  {/* Data & Account */}
  <section className="bg-[#1a1a1a] rounded-2xl shadow p-6 border border-gray-700">
    <h3 className="font-semibold text-gray-100 mb-4">Data & Account</h3>
    <div className="flex flex-col md:flex-row gap-3">
      <button
        onClick={exportData}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-[#2a2a2a]"
      >
        <Download className="w-4 h-4" /> Export My Data
      </button>
      <button
        onClick={() => alert("Delete request queued (demo).")}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white hover:brightness-110"
      >
        <Trash2 className="w-4 h-4" /> Request Account Deletion
      </button>
    </div>
  </section>

  {/* Actions */}
  <div className="flex items-center gap-3">
    <button
      onClick={save}
      disabled={saving}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110 disabled:opacity-60"
    >
      <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
    </button>
    <button
      onClick={resetDefaults}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-[#2a2a2a]"
    >
      <RotateCcw className="w-4 h-4" /> Reset to Defaults
    </button>
  </div>
</div>

  );
}

/* Reusable UI bits */
function TextField({ label, value, onChange, placeholder, icon }) {
  return (
    // <div>
    //   <label className="block text-sm text-gray-600 mb-1">{label}</label>
    //   <div className="relative">
    //     {icon ? <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div> : null}
    //     <input
    //       value={value}
    //       onChange={(e) => onChange(e.target.value)}
    //       placeholder={placeholder}
    //       className={`w-full ${icon ? "pl-9" : "pl-3"} pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500`}
    //     />
    //   </div>
    // </div>
    <div>
  <label className="block text-sm text-gray-400 mb-1">{label}</label>
  <div className="relative">
    {icon ? (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </div>
    ) : null}
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full ${
        icon ? "pl-9" : "pl-3"
      } pr-3 py-2 rounded-lg border border-gray-700 bg-[#121110] text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
    />
  </div>
</div>

  );
}

function ToggleField({ label, checked, onChange, icon }) {
  return (
    // <label className="flex items-center justify-between px-4 py-3 rounded-xl border hover:bg-gray-50 cursor-pointer">
    //   <span className="text-sm text-gray-700 inline-flex items-center gap-2">
    //     {icon} {label}
    //   </span>
    //   <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    // </label>
    <label className="flex items-center justify-between px-4 py-2 rounded-xl border border-gray-600 bg-[#121110] cursor-pointer 
  hover:border-emerald-900 hover:shadow-[0_0_6px_#10b981] transition">
  <span className="text-sm text-gray-300 inline-flex items-center gap-2">
    {icon} {label}
  </span>
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    className="form-checkbox h-4 w-4 text-emerald-600 bg-[#1a1a1a] border-gray-600 rounded focus:ring-emerald-600"
  />
</label>

  );
}

function Choice({ active, onClick, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border text-sm ${
        active ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "text-gray-700 hover:bg-gray-50"
      } inline-flex items-center gap-2`}
    >
      {icon} {label}
    </button>
  );
}