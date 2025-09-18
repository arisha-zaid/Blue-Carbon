// src/pages/government/Settings.jsx
import React, { useEffect, useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import LanguageSelector from "../../components/LanguageSelector";
import { Save, RotateCcw, TestTube2, Globe2 as Globe, Languages } from "lucide-react";

const DEFAULTS = {
  mrvThreshold: 80,            // % MRV completeness required
  anchorThreshold: 70,         // % minimum data completeness before anchoring
  autoApprove: false,          // auto-approve MRV complete
  emailAlerts: true,           // send email alerts on approvals/audits
  smsAlerts: false,            // send SMS alerts on critical issues
  dataSourceUrl: "https://api.example.com/mrv",
  apiKey: "",                  // kept client-side for demo only
};

export default function GovernmentSettings() {
  const { addNotification } = useNotification();
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Load from localStorage on mount (demo persistence)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gov_settings");
      if (stored) setForm(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.dataSourceUrl) {
      addNotification("Data Source URL is required.", "error");
      return;
    }
    if (form.mrvThreshold < 0 || form.mrvThreshold > 100) {
      addNotification("MRV Threshold must be between 0 and 100.", "error");
      return;
    }
    if (form.anchorThreshold < 0 || form.anchorThreshold > 100) {
      addNotification("Anchor Threshold must be between 0 and 100.", "error");
      return;
    }
    setSaving(true);
    try {
      // Replace with real API call
      localStorage.setItem("gov_settings", JSON.stringify(form));
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
      // Simulate ping (replace with fetch(form.dataSourceUrl, { headers: { 'x-api-key': form.apiKey } }) )
      await new Promise((r) => setTimeout(r, 700));
      addNotification("Data source reachable ✅", "success");
    } catch {
      addNotification("Failed to reach data source.", "error");
    } finally {
      setTesting(false);
    }
  };

  return (
    // <div className="space-y-6">
    //   <header>
    //     <h1 className="text-3xl font-bold">Government Settings</h1>
    //     <p className="text-gray-600 mt-1">
    //       Configure audit thresholds, notifications, and MRV data source.
    //     </p>
    //   </header>

    //   <form onSubmit={save} className="space-y-6">
    //     {/* Thresholds */}
    //     <section className="bg-white rounded-2xl shadow p-6">
    //       <h3 className="font-semibold text-gray-900 mb-4">Thresholds</h3>
    //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //         <div>
    //           <label className="block text-sm text-gray-600 mb-1">MRV Threshold (%)</label>
    //           <input
    //             type="number"
    //             min={0}
    //             max={100}
    //             value={form.mrvThreshold}
    //             onChange={(e) =>
    //               setForm((f) => ({ ...f, mrvThreshold: Number(e.target.value) }))
    //             }
    //             className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
    //           />
    //           <p className="text-xs text-gray-500 mt-1">
    //             Minimum MRV completeness required before review.
    //           </p>
    //         </div>
    //         <div>
    //           <label className="block text-sm text-gray-600 mb-1">Anchor Threshold (%)</label>
    //           <input
    //             type="number"
    //             min={0}
    //             max={100}
    //             value={form.anchorThreshold}
    //             onChange={(e) =>
    //               setForm((f) => ({ ...f, anchorThreshold: Number(e.target.value) }))
    //             }
    //             className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
    //           />
    //           <p className="text-xs text-gray-500 mt-1">
    //             Minimum data completeness before on-chain anchoring.
    //           </p>
    //         </div>
    //       </div>
    //       <div className="mt-4 flex items-center gap-3">
    //         <label className="inline-flex items-center gap-2">
    //           <input
    //             type="checkbox"
    //             checked={form.autoApprove}
    //             onChange={(e) => setForm((f) => ({ ...f, autoApprove: e.target.checked }))}
    //           />
    //           <span className="text-sm text-gray-700">Auto-approve MRV Complete</span>
    //         </label>
    //       </div>
    //     </section>

    //     {/* Notifications */}
    //     <section className="bg-white rounded-2xl shadow p-6">
    //       <h3 className="font-semibold text-gray-900 mb-4">Notifications</h3>
    //       <div className="flex items-center gap-4">
    //         <label className="inline-flex items-center gap-2">
    //           <input
    //             type="checkbox"
    //             checked={form.emailAlerts}
    //             onChange={(e) => setForm((f) => ({ ...f, emailAlerts: e.target.checked }))}
    //           />
    //           <span className="text-sm text-gray-700">Email Alerts</span>
    //         </label>
    //         <label className="inline-flex items-center gap-2">
    //           <input
    //             type="checkbox"
    //             checked={form.smsAlerts}
    //             onChange={(e) => setForm((f) => ({ ...f, smsAlerts: e.target.checked }))}
    //           />
    //           <span className="text-sm text-gray-700">SMS Alerts</span>
    //         </label>
    //       </div>
    //       <p className="text-xs text-gray-500 mt-2">
    //         Alerts are sent for approvals, audits, and non-compliance flags.
    //       </p>
    //     </section>

    //     {/* Data Source */}
    //     <section className="bg-white rounded-2xl shadow p-6">
    //       <h3 className="font-semibold text-gray-900 mb-4">MRV Data Source</h3>
    //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //         <div>
    //           <label className="block text-sm text-gray-600 mb-1">API Base URL</label>
    //           <input
    //             type="url"
    //             value={form.dataSourceUrl}
    //             onChange={(e) => setForm((f) => ({ ...f, dataSourceUrl: e.target.value }))}
    //             placeholder="https://api.example.com/mrv"
    //             className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
    //             required
    //           />
    //         </div>
    //         <div>
    //           <label className="block text-sm text-gray-600 mb-1">API Key</label>
    //           <input
    //             type="password"
    //             value={form.apiKey}
    //             onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
    //             placeholder="••••••••••••"
    //             className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
    //           />
    //           <p className="text-xs text-gray-500 mt-1">
    //             For demo only. Store secrets server-side in production.
    //           </p>
    //         </div>
    //       </div>

    //       <div className="mt-4">
    //         <button
    //           type="button"
    //           onClick={testConnection}
    //           disabled={testing}
    //           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 disabled:opacity-60"
    //         >
    //           <TestTube2 className="w-4 h-4" />
    //           {testing ? "Testing..." : "Test Connection"}
    //         </button>
    //       </div>
    //     </section>

    //     {/* Actions */}
    //     <div className="flex items-center gap-3">
    //       <button
    //         type="submit"
    //         disabled={saving}
    //         className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:brightness-110 disabled:opacity-60"
    //       >
    //         <Save className="w-4 h-4" />
    //         {saving ? "Saving..." : "Save Settings"}
    //       </button>
    //       <button
    //         type="button"
    //         onClick={resetDefaults}
    //         className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
    //       >
    //         <RotateCcw className="w-4 h-4" />
    //         Reset to Defaults
    //       </button>
    //     </div>
    //   </form>
    // </div>

    <div className="space-y-6">
  {/* Header */}
  <header>
    <h1 className="text-3xl font-bold text-white">Government Settings</h1>
    <p className="text-gray-400 mt-1">
      Configure audit thresholds, notifications, and MRV data source.
    </p>
  </header>

  <form onSubmit={save} className="space-y-6">
    {/* Thresholds */}
    <section className="bg-[#1a1a1a] rounded-2xl shadow p-6 border border-gray-700">
      <h3 className="font-semibold text-gray-200 mb-4">Thresholds</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            MRV Threshold (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={form.mrvThreshold}
            onChange={(e) =>
              setForm((f) => ({ ...f, mrvThreshold: Number(e.target.value) }))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#121212] text-gray-200
              focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0px_0px_10px_#14b8a6]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum MRV completeness required before review.
          </p>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Anchor Threshold (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={form.anchorThreshold}
            onChange={(e) =>
              setForm((f) => ({ ...f, anchorThreshold: Number(e.target.value) }))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#121212] text-gray-200
              focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0px_0px_10px_#14b8a6]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum data completeness before on-chain anchoring.
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-gray-400">
          <input
            type="checkbox"
            checked={form.autoApprove}
            onChange={(e) =>
              setForm((f) => ({ ...f, autoApprove: e.target.checked }))
            }
            className="rounded border-gray-700 bg-[#121212] text-teal-500 focus:ring-teal-500"
          />
          Auto-approve MRV Complete
        </label>
      </div>
    </section>

    {/* Appearance & Language */}
    <section className="bg-[#1a1a1a] rounded-2xl shadow p-6 border border-gray-700">
      <h3 className="font-semibold text-gray-200 mb-4 inline-flex items-center gap-2">
        <Globe className="w-5 h-5 text-teal-500" /> Appearance & Language
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1 inline-flex items-center gap-2">
            <Languages className="w-4 h-4" /> Language
          </label>
          <LanguageSelector
            value={form.language}
            onChange={(lng) => setForm((f) => ({ ...f, language: lng }))}
          />
        </div>
      </div>
    </section>

    {/* Notifications */}
    <section className="bg-[#1a1a1a] rounded-2xl shadow p-6 border border-gray-700">
      <h3 className="font-semibold text-gray-200 mb-4">Notifications</h3>
      <div className="flex items-center gap-6">
        <label className="inline-flex items-center gap-2 text-sm text-gray-400">
          <input
            type="checkbox"
            checked={form.emailAlerts}
            onChange={(e) =>
              setForm((f) => ({ ...f, emailAlerts: e.target.checked }))
            }
            className="rounded border-gray-700 bg-[#121212] text-teal-500 focus:ring-teal-500"
          />
          Email Alerts
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-gray-400">
          <input
            type="checkbox"
            checked={form.smsAlerts}
            onChange={(e) =>
              setForm((f) => ({ ...f, smsAlerts: e.target.checked }))
            }
            className="rounded border-gray-700 bg-[#121212] text-teal-500 focus:ring-teal-500"
          />
          SMS Alerts
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Alerts are sent for approvals, audits, and non-compliance flags.
      </p>
    </section>

    {/* Data Source */}
    <section className="bg-[#1a1a1a] rounded-2xl shadow p-6 border border-gray-700">
      <h3 className="font-semibold text-gray-200 mb-4">MRV Data Source</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">API Base URL</label>
          <input
            type="url"
            value={form.dataSourceUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, dataSourceUrl: e.target.value }))
            }
            placeholder="https://api.example.com/mrv"
            className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#121212] text-gray-200
              focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0px_0px_10px_#14b8a6]"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">API Key</label>
          <input
            type="password"
            value={form.apiKey}
            onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
            placeholder="••••••••••••"
            className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#121212] text-gray-200
              focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0px_0px_10px_#14b8a6]"
          />
          <p className="text-xs text-gray-500 mt-1">
            For demo only. Store secrets server-side in production.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={testConnection}
          disabled={testing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-200 bg-[#121212]
            hover:border-teal-500 hover:shadow-[0px_0px_10px_#14b8a6] disabled:opacity-60"
        >
          <TestTube2 className="w-4 h-4" />
          {testing ? "Testing..." : "Test Connection"}
        </button>
      </div>
    </section>

    {/* Actions */}
    <div className="flex items-center gap-3">
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white
          hover:shadow-[0px_0px_12px_#14b8a6] hover:brightness-110 disabled:opacity-60"
      >
        <Save className="w-4 h-4" />
        {saving ? "Saving..." : "Save Settings"}
      </button>
      <button
        type="button"
        onClick={resetDefaults}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-200 bg-[#121212]
          hover:border-teal-500 hover:shadow-[0px_0px_10px_#14b8a6]"
      >
        <RotateCcw className="w-4 h-4" />
        Reset to Defaults
      </button>
    </div>
  </form>
</div>

  );
}