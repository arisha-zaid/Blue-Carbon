// src/pages/admin/Settings.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import {
  Save,
  RotateCcw,
  ShieldCheck,
  LockKeyhole,
  Mail,
  Globe,
  CloudCog,
  Eye,
  EyeOff,
  TestTube2,
  Bell,
  Users,
  KeyRound,
  Power,
  Wrench,
  Languages,
} from "lucide-react";
import LanguageSelector from "../../components/LanguageSelector";

const DEFAULTS = {
  // Platform controls
  maintenanceMode: false,
  allowRegistrations: true,
  allowGoogleAuth: true,

  // Security
  require2FA: true,
  sessionTimeoutMin: 45,
  maxFailedLogins: 5,
  blockDurationMin: 30,

  // Email
  emailFrom: "noreply@bluecarbon.gov",
  emailReplyTo: "support@bluecarbon.gov",
  sendTestEmailTo: "",

  // Roles/Permissions preview (static for demo)
  roleMatrix: {
    Admin: ["All permissions", "User management", "Credit issuance", "Policies"],
    Government: ["Audit projects", "Reports & analytics", "Policies"],
    Industry: ["Marketplace", "Wallet", "Transactions"],
    Community: ["Add project", "Certificates", "Leaderboard"],
  },

  // Data policies
  retentionDaysLogs: 90,
  retentionDaysAudit: 365,
  exportDPOEmail: "dpo@bluecarbon.gov",

  // API/Integrations
  apiBaseUrl: "https://api.example.com/admin",
  apiKey: "",
};

export default function AdminSettings() {
  const { addNotification } = useNotification();
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [revealKey, setRevealKey] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_settings");
      if (stored) setForm(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const maskedKey = useMemo(() => {
    if (!form.apiKey) return "";
    if (revealKey) return form.apiKey;
    const tail = form.apiKey.slice(-4);
    return "•".repeat(Math.max(0, form.apiKey.length - 4)) + tail;
  }, [form.apiKey, revealKey]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.apiBaseUrl) {
      addNotification("API Base URL is required.", "error");
      return;
    }
    if (form.sessionTimeoutMin < 5) {
      addNotification("Session timeout should be at least 5 minutes.", "error");
      return;
    }
    if (form.maxFailedLogins < 1) {
      addNotification("Max failed logins should be at least 1.", "error");
      return;
    }
    setSaving(true);
    try {
      // Replace with API call
      localStorage.setItem("admin_settings", JSON.stringify(form));
      addNotification("Settings saved ✅", "success");
    } catch {
      addNotification("Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setForm(DEFAULTS);
    addNotification("Reverted to defaults.", "info");
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      // Replace with: await fetch(form.apiBaseUrl, { headers: { 'x-api-key': form.apiKey } })
      await new Promise((r) => setTimeout(r, 700));
      addNotification("API reachable ✅", "success");
    } catch {
      addNotification("API connection failed.", "error");
    } finally {
      setTesting(false);
    }
  };

  const sendTestEmail = () => {
    if (!form.sendTestEmailTo) {
      addNotification("Enter a recipient email for the test.", "error");
      return;
    }
    addNotification(`Test email queued to ${form.sendTestEmailTo} ✉️`, "success");
  };

  return (
    // <div className="space-y-8">
    <div className="space-y-8 bg-[#121110] text-gray-200 p-8 rounded-2xl shadow-lg">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-gray-600 mt-1">Platform controls, security, email, and integrations.</p>
        </div>
      </header>

      <form onSubmit={save} className="space-y-8">
        {/* Platform Controls */}
        <Section title="Platform Controls" icon={<Wrench className="w-5 h-5 text-emerald-600" /> }
        className="bg-[#121110]  p-6 rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ToggleField
              label="Maintenance Mode"
              description="Temporarily disable non-admin access."
              checked={form.maintenanceMode}
              onChange={(v) => update({ maintenanceMode: v })}
              icon={<Power className="w-4 h-4 text-rose-600" />}
            />
            <ToggleField
              label="Allow New Registrations"
              description="Enable/disable sign-ups."
              checked={form.allowRegistrations}
              onChange={(v) => update({ allowRegistrations: v })}
              icon={<Users className="w-4 h-4 text-emerald-600" />}
            />
            <ToggleField
              label="Allow Google Auth"
              description="Enable Google login."
              checked={form.allowGoogleAuth}
              onChange={(v) => update({ allowGoogleAuth: v })}
              icon={<Globe className="w-4 h-4 text-blue-600" />}
            />
          </div>
        </Section>
   


        {/* Appearance & Language */}
        <Section title="Appearance & Language" icon={<Globe className="w-5 h-5 text-emerald-600" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </Section>

        {/* Security */}
        <Section title="Security" icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ToggleField
              label="Require 2FA"
              description="Two-factor auth for all admins."
              checked={form.require2FA}
              onChange={(v) => update({ require2FA: v })}
              icon={<LockKeyhole className="w-4 h-4 text-emerald-600" />}
            />
            <NumberField
              label="Session Timeout (min)"
              value={form.sessionTimeoutMin}
              onChange={(v) => update({ sessionTimeoutMin: v })}
            />
            <NumberField
              label="Max Failed Logins"
              value={form.maxFailedLogins}
              onChange={(v) => update({ maxFailedLogins: v })}
            />
            <NumberField
              label="Block Duration (min)"
              value={form.blockDurationMin}
              onChange={(v) => update({ blockDurationMin: v })}
            />
          </div>
        </Section>

        {/* Email */}
        <Section title="Email & Notifications" icon={<Mail className="w-5 h-5 text-emerald-600" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              label="From Address"
              value={form.emailFrom}
              onChange={(v) => update({ emailFrom: v })}
              placeholder="noreply@domain"
            />
            <TextField
              label="Reply-To"
              value={form.emailReplyTo}
              onChange={(v) => update({ emailReplyTo: v })}
              placeholder="support@domain"
            />
            <div>
              <label className="block text-sm text-gray-600 mb-1">Send Test Email</label>
              <div className="flex gap-2">
                <input
                  value={form.sendTestEmailTo}
                  onChange={(e) => update({ sendTestEmailTo: e.target.value })}
                  placeholder="name@company.com"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-500 transition"
                />
                <button
                  type="button"
                  onClick={sendTestEmail}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
                >
                  <Bell className="w-4 h-4" /> Send
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* Roles Preview */}
        <Section title="Roles & Permissions (Preview)" icon={<KeyRound className="w-5 h-5 text-emerald-600" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(form.roleMatrix).map(([role, perms]) => (
              <div key={role} className="rounded-2xl border p-4 hover:border-teal-600 transition
              text-gray-500 hover:text-teal-600">
                <div className="font-semibold  mb-2 ">{role}</div>
                <ul className="text-sm list-disc pl-5 space-y-1 ">
                  {perms.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-xs mt-2 ">
            This is a preview for demonstration. In production, manage granular permissions per role.
          </p>
        </Section>

        {/* Data & Retention */}
        <Section title="Data Policies & Retention" icon={<CloudCog className="w-5 h-5 text-emerald-600" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumberField
              label="Log Retention (days)"
              value={form.retentionDaysLogs}
              onChange={(v) => update({ retentionDaysLogs: v })}
            />
            <NumberField
              label="Audit Retention (days)"
              value={form.retentionDaysAudit}
              onChange={(v) => update({ retentionDaysAudit: v })}
            />
            <TextField
              label="DPO Contact"
              value={form.exportDPOEmail}
              onChange={(v) => update({ exportDPOEmail: v })}
              placeholder="dpo@domain"
            />
          </div>
        </Section>

        {/* API / Integrations */}
        <Section title="API & Integrations" icon={<Globe className="w-5 h-5 text-emerald-600" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              label="API Base URL"
              value={form.apiBaseUrl}
              onChange={(v) => update({ apiBaseUrl: v })}
              placeholder="https://api.example.com/admin"
            />
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm text-gray-600 mb-1">API Key</label>
                <button
                  type="button"
                  onClick={() => setRevealKey((s) => !s)}
                  className="text-sm text-gray-600 hover:underline inline-flex items-center gap-1"
                >
                  {revealKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {revealKey ? "Hide" : "Show"}
                </button>
              </div>
              <input
                value={revealKey ? form.apiKey : maskedKey}
                onChange={(e) => update({ apiKey: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">Do not store API keys client-side in production.</p>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={testing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700  disabled:opacity-60 hover:border-blue-400 hover:text-blue-400 transition"
                >
                  <TestTube2 className="w-4 h-4" /> {testing ? "Testing..." : "Test Connection"}
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-emerald-500 border 
            border-emerald-600 
            hover:bg-emerald-600 hover:text-white  disabled:opacity-60 "
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
          </button>
          <button
            type="button"
            onClick={resetDefaults}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700   hover:border-rose-500 hover:text-rose-600 transition"
          >
            <RotateCcw className="w-4 h-4" /> Reset to Defaults
          </button>
        </div>
      </form>
    </div>
  );
}

/* Reusable UI */
// function Section({ title, icon, children }) {
//   return (
//     <section className="rounded-2xl border border-gray-700 bg-[#1a1a1a] p-6">
//       <h3 className="font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
//         {icon} {title}
//       </h3>
//       {children}
//     </section>
//   );
// }
function Section({ title, icon, children }) {
  return (
    <section className="rounded-2xl border border-gray-700 bg-[#1a1a1a] p-6
                       ">
      <h3 className="font-semibold text-white mb-4 inline-flex items-center gap-2">
        {icon} {title}
      </h3>
      {children}
    </section>
  );
}


function ToggleField({ label, description, checked, onChange, icon }) {
  return (
    <label className="flex items-start justify-between p-4 rounded-xl border hover:border-teal-600 transition cursor-pointer">
      <span className="text-sm  inline-flex flex-col">
        <span className="inline-flex items-center gap-2">{icon} {label}</span>
        {description ? <span className="mt-1 text-xs text-gray-500">{description}</span> : null}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} 
      className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-gray-700 
             text-gray-200 placeholder-gray-500 
             focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-500 transition"/>
    </label>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        // className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
       className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-gray-700 
             text-gray-200 placeholder-gray-500 
             focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-500 transition"
      />
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
       className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-gray-700 
             text-gray-200 placeholder-gray-500 
             focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-500 transition"
        // className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}