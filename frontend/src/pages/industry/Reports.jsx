// src/pages/industry/Reports.jsx
import React, { useMemo, useState } from "react";
import { Download, Filter, Factory, TrendingUp, ShoppingCart, Wallet } from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#10b981", "#22c55e", "#0ea5e9", "#a855f7", "#f59e0b", "#ef4444"];

const MOCK_PURCHASES_MONTHLY = [
  { m: "Jan", tons: 420, avgPrice: 21.4 },
  { m: "Feb", tons: 520, avgPrice: 22.1 },
  { m: "Mar", tons: 610, avgPrice: 23.9 },
  { m: "Apr", tons: 480, avgPrice: 24.3 },
  { m: "May", tons: 690, avgPrice: 25.1 },
  { m: "Jun", tons: 740, avgPrice: 26.7 },
  { m: "Jul", tons: 820, avgPrice: 27.2 },
  { m: "Aug", tons: 910, avgPrice: 28.4 },
  { m: "Sep", tons: 770, avgPrice: 27.9 },
  { m: "Oct", tons: 960, avgPrice: 29.6 },
  { m: "Nov", tons: 1010, avgPrice: 30.2 },
  { m: "Dec", tons: 1140, avgPrice: 31.7 },
];

const MOCK_VENDOR_MIX = [
  { name: "Mangrove Guild", value: 32 },
  { name: "Seagrass Co.", value: 21 },
  { name: "Wetland Labs", value: 18 },
  { name: "Delta Blue", value: 14 },
  { name: "Green Estuary", value: 10 },
  { name: "Others", value: 5 },
];

const PERIODS = ["Last 3M", "Last 6M", "Last 12M", "YTD"];

export default function IndustryReports() {
  const [period, setPeriod] = useState("Last 12M");
  const [type, setType] = useState("All");

  const filteredMonthly = useMemo(() => {
    const last3 = MOCK_PURCHASES_MONTHLY.slice(-3);
    const last6 = MOCK_PURCHASES_MONTHLY.slice(-6);
    const last12 = MOCK_PURCHASES_MONTHLY;
    switch (period) {
      case "Last 3M":
        return last3;
      case "Last 6M":
        return last6;
      case "YTD":
        // simple YTD: up to current month index (assume Dec for demo)
        return MOCK_PURCHASES_MONTHLY.slice(0, 12);
      default:
        return last12;
    }
  }, [period]);

  const kpis = useMemo(() => {
    const totalTons = filteredMonthly.reduce((s, d) => s + d.tons, 0);
    const avgPrice =
      filteredMonthly.reduce((s, d) => s + d.avgPrice, 0) / (filteredMonthly.length || 1);
    const estValue = totalTons * avgPrice;
    return {
      totalTons,
      avgPrice,
      estValue,
      vendors: MOCK_VENDOR_MIX.length,
    };
  }, [filteredMonthly]);

  const exportCSV = () => {
    const headers = ["month", "tons", "avgPrice"];
    const rows = filteredMonthly.map((d) => [d.m, d.tons, d.avgPrice].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "industry-reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Industry Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track purchases, prices, vendor diversity, and portfolio value.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPI
          title="Total Purchased (tCO₂)"
          value={kpis.totalTons.toLocaleString()}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="bg-violet-600"
        />
        <KPI
          title="Average Price ($/t)"
          value={kpis.avgPrice.toFixed(2)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-emerald-600"
        />
        <KPI
          title="Est. Portfolio Value ($)"
          value={Math.round(kpis.estValue).toLocaleString()}
          icon={<Wallet className="w-5 h-5" />}
          color="bg-blue-600"
        />
        <KPI
          title="Vendors Used"
          value={kpis.vendors}
          icon={<Factory className="w-5 h-5" />}
          color="bg-amber-600"
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Monthly Purchases (tCO₂)</h3>
            <span className="text-sm text-gray-500">{period}</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={filteredMonthly}>
              <XAxis dataKey="m" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tons" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Average Price Trend ($/t)</h3>
            <span className="text-sm text-gray-500">{period}</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={filteredMonthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="m" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avgPrice" stroke="#10b981" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Vendor Mix + Filters */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Vendor Mix</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={MOCK_VENDOR_MIX} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                {MOCK_VENDOR_MIX.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters (Demo)</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
              >
                {["All", "Mangroves", "Seagrass", "Wetlands"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Use filters to slice data by project type. In a real integration, this would
            re-query your analytics backend and refresh all charts and KPIs.
          </p>
        </div>
      </section>
    </div>
  );
}

function KPI({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{title}</div>
        <div className={`p-2 rounded-lg text-white ${color}`}>{icon}</div>
      </div>
      <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}