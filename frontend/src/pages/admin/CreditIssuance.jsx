// src/pages/admin/CreditIssuance.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import {
  BadgeCheck,
  FileCheck2,
  Hash,
  CalendarDays,
  ClipboardCopy,
  Check,
  ArrowRightCircle,
  ShieldCheck,
  QrCode,
  RefreshCcw,
} from "lucide-react";

function randomTx() {
  const chars = "abcdef0123456789";
  let s = "0x";
  for (let i = 0; i < 64; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function short(s, left = 6, right = 4) {
  if (!s) return "";
  return s.length > left + right ? `${s.slice(0, left)}...${s.slice(-right)}` : s;
}

const DEFAULT_FORM = {
  projectId: "",
  issueTo: "",
  credits: "",
  memo: "",
};

export default function CreditIssuance() {
  const { addNotification } = useNotification();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("credit_issuance_history");
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const canSubmit = useMemo(() => {
    const credits = Number(form.credits);
    return (
      form.projectId.trim().length >= 4 &&
      form.issueTo.trim().length >= 4 &&
      !Number.isNaN(credits) &&
      credits > 0
    );
  }, [form]);

  const certificateId = useMemo(() => {
    if (!(form.projectId && form.issueTo && form.credits)) return "";
    const base = `${form.projectId}-${form.issueTo}-${form.credits}`;
    return `CERT-${Math.abs(hashCode(base)).toString(16).toUpperCase().padStart(6, "0")}`;
  }, [form]);

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1200);
    } catch {
      // noop
    }
  };

  const resetForm = () => setForm(DEFAULT_FORM);

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      addNotification("Please fill required fields with valid values.", "error");
      return;
    }
    setSubmitting(true);
    try {
      // Simulate backend + anchoring
      await new Promise((r) => setTimeout(r, 700));
      const txId = randomTx();
      const entry = {
        id: certificateId || `CERT-${Date.now()}`,
        projectId: form.projectId.trim(),
        issueTo: form.issueTo.trim(),
        credits: Number(form.credits),
        memo: form.memo.trim(),
        txId,
        when: new Date().toISOString(),
      };
      const next = [entry, ...history].slice(0, 20);
      setHistory(next);
      localStorage.setItem("credit_issuance_history", JSON.stringify(next));
      addNotification(`Issued ${entry.credits} tCO₂ to ${entry.issueTo} ✅`, "success");
      resetForm();
    } catch {
      addNotification("Issuance failed. Please retry.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Credit Issuance</h1>
          <p className="text-gray-600 mt-1">
            Issue verified blue carbon credits and anchor the certificate on-chain.
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("credit_issuance_history");
            setHistory([]);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
        >
          <RefreshCcw className="w-4 h-4" /> Clear History
        </button>
      </header>

      {/* Form + Preview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Issuance Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Project ID"
              placeholder="e.g., PRJ-1107"
              value={form.projectId}
              onChange={(v) => setForm((f) => ({ ...f, projectId: v }))}
              icon={<FileCheck2 className="w-4 h-4 text-gray-500" />}
            />
            <Field
              label="Issue To (Org/User)"
              placeholder="e.g., ACME Industries"
              value={form.issueTo}
              onChange={(v) => setForm((f) => ({ ...f, issueTo: v }))}
              icon={<BadgeCheck className="w-4 h-4 text-gray-500" />}
            />
            <Field
              label="Credits (tCO₂)"
              placeholder="e.g., 500"
              value={form.credits}
              onChange={(v) => setForm((f) => ({ ...f, credits: v }))}
              type="number"
              min="1"
            />
            <Field
              label="Memo (optional)"
              placeholder="Notes for registry"
              value={form.memo}
              onChange={(v) => setForm((f) => ({ ...f, memo: v }))}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110 disabled:opacity-60"
            >
              <ArrowRightCircle className="w-4 h-4" />
              {submitting ? "Issuing..." : "Issue Credits"}
            </button>
          </div>
        </form>

        {/* Live Preview */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
          <div className="rounded-2xl border p-5 space-y-4">
            <Row label="Certificate ID" value={certificateId || "—"} icon={<Hash className="w-4 h-4" />} />
            <Row label="Project ID" value={form.projectId || "—"} />
            <Row label="Issue To" value={form.issueTo || "—"} />
            <Row label="Credits (tCO₂)" value={form.credits || "—"} />
            <Row label="Memo" value={form.memo || "—"} />
            <div className="flex items-center gap-4 pt-2">
              <div className="text-xs text-gray-500 inline-flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                Will be dated at issuance time
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Certificate will be anchored on-chain with a unique TxID. You can copy/share the
            TxID or scan the QR from the history section after issuance.
          </div>
        </div>
      </section>

      {/* History */}
      <section className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Issuances</h3>
          <div className="text-sm text-gray-500">
            Total: <span className="font-semibold">{history.length}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="py-3 px-4">Certificate</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Issued To</th>
                <th className="py-3 px-4">Credits</th>
                <th className="py-3 px-4">TxID</th>
                <th className="py-3 px-4">When</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    No issuances yet.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="border-t">
                    <td className="py-3 px-4 font-semibold text-gray-900">{h.id}</td>
                    <td className="py-3 px-4">{h.projectId}</td>
                    <td className="py-3 px-4">{h.issueTo}</td>
                    <td className="py-3 px-4">{h.credits.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-xs">{short(h.txId)}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(h.when).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleCopy(h.txId, h.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-100 text-sm"
                        >
                          {copied === h.id ? (
                            <>
                              <Check className="w-4 h-4" /> Copied
                            </>
                          ) : (
                            <>
                              <ClipboardCopy className="w-4 h-4" /> Copy Tx
                            </>
                          )}
                        </button>
                        <a
                          href={`https://example.com/tx/${h.txId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-100 text-sm"
                        >
                          <QrCode className="w-4 h-4" /> View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* Reusable bits */
function Field({ label, value, onChange, placeholder, icon, type = "text", min }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <div className="relative">
        {icon ? <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div> : null}
        <input
          type={type}
          min={min}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? "pl-9" : "pl-3"} pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500`}
        />
      </div>
    </div>
  );
}

function Row({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between">
      <div className="inline-flex items-center gap-2 text-sm text-gray-600">
        {icon} {label}
      </div>
      <div className="text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function hashCode(str) {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}