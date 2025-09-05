// src/pages/industry/Settings.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import {
  Save,
  RotateCcw,
  TestTube2,
  Eye,
  EyeOff,
  ShieldCheck,
  Bell,
  CreditCard,
  Globe,
  Factory,
  ToggleRight,
} from "lucide-react";

const DEFAULTS = {
  // Spend & Controls
  monthlyCapUsd: 250000, // hard cap on monthly spend
  maxOrderUsd: 50000, // max per order
  require2FA: true,
  // Auto-buy rules
  autoBuyEnabled: false,
  autoBuyTargetTons: 250,
  autoBuyMaxPrice: 28.5, // $/t
  autoBuyProjectTypes: ["Mangroves", "Seagrass"],
  // Vendor Pref
  preferVerifiedOnly: true,
  preferredVendors: ["Mangrove Guild", "Seagrass Co."],
  excludedVendors: [],
  // Notifications
  emailAlerts: true,
  smsAlerts: false,
  priceAlertsEnabled: true,
  priceAlertBelow: 25.0,
  // Wallet/API
  walletAddress: "0xFADE...C0DE",
  apiBaseUrl: "https://api.example.com/industry",
  apiKey: "",
};

const PROJECT_TYPES = ["Mangroves", "Seagrass", "Wetlands"];
const KNOWN_VENDORS = [
  "Mangrove Guild",
  "Seagrass Co.",
  "Wetland Labs",
  "Delta Blue",
  "Green Estuary",
];

export default function IndustrySettings() {
  const { addNotification } = useNotification();
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [revealKey, setRevealKey] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("industry_settings");
      if (stored) setForm(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const maskedApiKey = useMemo(() => {
    if (!form.apiKey) return "";
    if (revealKey) return form.apiKey;
    const tail = form.apiKey.slice(-4);
    return "•".repeat(Math.max(0, form.apiKey.length - 4)) + tail;
  }, [form.apiKey, revealKey]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const toggleArrayValue = (key, value) => {
    setForm((f) => {
      const has = f[key]?.includes(value);
      const next = has ? f[key].filter((v) => v !== value) : [...(f[key] || []), value];
      return { ...f, [key]: next };
    });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.apiBaseUrl) {
      addNotification("API Base URL is required.", "error");
      return;
    }
    if (form.monthlyCapUsd < 0 || form.maxOrderUsd < 0) {
      addNotification("Spend limits must be non-negative.", "error");
      return;
    }
    if (form.autoBuyEnabled) {
      if (form.autoBuyTargetTons <= 0) {
        addNotification("Auto-buy target tons must be > 0.", "error");
        return;
      }
      if (form.autoBuyMaxPrice <= 0) {
        addNotification("Auto-buy max price must be > 0.", "error");
        return;
      }
    }
    setSaving(true);
    try {
      // Replace with backend call
      localStorage.setItem("industry_settings", JSON.stringify(form));
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

  return (
    <div className="space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Industry Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure spending limits, automation rules, vendor preferences, and alerts.
          </p>
        </div>
      </header>

      <form onSubmit={save} className="space-y-8">
        {/* Spend & Controls */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" /> Spend Controls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumberField
              label="Monthly Cap (USD)"
              value={form.monthlyCapUsd}
              onChange={(v) => update({ monthlyCapUsd: v })}
            />
            <NumberField
              label="Max Order (USD)"
              value={form.maxOrderUsd}
              onChange={(v) => update({ maxOrderUsd: v })}
            />
            <ToggleField
              label="Require 2FA for Orders"
              checked={form.require2FA}
              onChange={(v) => update({ require2FA: v })}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
            />
          </div>
        </section>

        {/* Auto-purchase */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ToggleRight className="w-5 h-5 text-emerald-600" /> Auto-Purchase Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ToggleField
              label="Enable Auto-Buy"
              checked={form.autoBuyEnabled}
              onChange={(v) => update({ autoBuyEnabled: v })}
            />
            <NumberField
              label="Target Tons (tCO₂)"
              value={form.autoBuyTargetTons}
              onChange={(v) => update({ autoBuyTargetTons: v })}
              disabled={!form.autoBuyEnabled}
            />
            <NumberField
              label="Max Price ($/t)"
              value={form.autoBuyMaxPrice}
              onChange={(v) => update({ autoBuyMaxPrice: v })}
              step="0.1"
              disabled={!form.autoBuyEnabled}
            />
            <div>
              <div className="block text-sm text-gray-600 mb-1">Project Types</div>
              <div className="flex flex-wrap gap-2">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleArrayValue("autoBuyProjectTypes", t)}
                    disabled={!form.autoBuyEnabled}
                    className={`px-3 py-1 rounded-lg text-sm border ${
                      form.autoBuyProjectTypes.includes(t)
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "text-gray-700 hover:bg-gray-100"
                    } disabled:opacity-50`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Vendor Preferences */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Factory className="w-5 h-5 text-emerald-600" /> Vendor Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ToggleField
              label="Verified Vendors Only"
              checked={form.preferVerifiedOnly}
              onChange={(v) => update({ preferVerifiedOnly: v })}
            />
            <MultiSelect
              label="Preferred Vendors"
              options={KNOWN_VENDORS}
              selected={form.preferredVendors}
              onToggle={(v) => toggleArrayValue("preferredVendors", v)}
            />
            <MultiSelect
              label="Excluded Vendors"
              options={KNOWN_VENDORS}
              selected={form.excludedVendors}
              onToggle={(v) => toggleArrayValue("excludedVendors", v)}
            />
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" /> Notifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ToggleField
              label="Email Alerts"
              checked={form.emailAlerts}
              onChange={(v) => update({ emailAlerts: v })}
            />
            <ToggleField
              label="SMS Alerts"
              checked={form.smsAlerts}
              onChange={(v) => update({ smsAlerts: v })}
            />
            <ToggleField
              label="Price Alerts"
              checked={form.priceAlertsEnabled}
              onChange={(v) => update({ priceAlertsEnabled: v })}
            />
            <NumberField
              label="Alert Below ($/t)"
              value={form.priceAlertBelow}
              onChange={(v) => update({ priceAlertBelow: v })}
              step="0.1"
              disabled={!form.priceAlertsEnabled}
            />
          </div>
        </section>

        {/* Wallet & API */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" /> Wallet & API
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              label="Wallet Address"
              value={form.walletAddress}
              onChange={(v) => update({ walletAddress: v })}
              placeholder="0x..."
            />
            <TextField
              label="API Base URL"
              value={form.apiBaseUrl}
              onChange={(v) => update({ apiBaseUrl: v })}
              placeholder="https://api.example.com/industry"
            />
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm text-gray-600 mb-1">API Key</label>
                <button
                  type="button"
                  onClick={() => setRevealKey((s) => !s)}
                  className="text-sm text-gray-600 hover:underline inline-flex items-center gap-1"
                >
                  {revealKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}{" "}
                  {revealKey ? "Hide" : "Show"}
                </button>
              </div>
              <input
                value={revealKey ? form.apiKey : maskedApiKey}
                onChange={(e) => update({ apiKey: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                type={revealKey ? "text" : "text"}
              />
              <p className="text-xs text-gray-500 mt-1">
                Demo only. Store secrets server-side in production.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={testing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                >
                  <TestTube2 className="w-4 h-4" /> {testing ? "Testing..." : "Test Connection"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110 disabled:opacity-60"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
          </button>
          <button
            type="button"
            onClick={resetDefaults}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
          >
            <RotateCcw className="w-4 h-4" /> Reset to Defaults
          </button>
        </div>
      </form>
    </div>
  );
}

/* Reusable Fields */
function NumberField({ label, value, onChange, step = "1", disabled }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
      />
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}

function ToggleField({ label, checked, onChange, icon }) {
  return (
    <label className="flex items-center justify-between px-4 py-3 rounded-xl border hover:bg-gray-50 cursor-pointer">
      <span className="text-sm text-gray-700 inline-flex items-center gap-2">
        {icon} {label}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function MultiSelect({ label, options, selected, onToggle }) {
  return (
    <div>
      <div className="block text-sm text-gray-600 mb-1">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            type="button"
            key={o}
            onClick={() => onToggle(o)}
            className={`px-3 py-1 rounded-lg text-sm border ${
              selected.includes(o)
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}