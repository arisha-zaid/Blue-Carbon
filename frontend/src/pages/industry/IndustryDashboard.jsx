// src/pages/industry/IndustryDashboard.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
} from "lucide-react";
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
} from "recharts";

const creditPriceData = [
  { m: "Jan", p: 21.4 },
  { m: "Feb", p: 22.1 },
  { m: "Mar", p: 23.9 },
  { m: "Apr", p: 24.3 },
  { m: "May", p: 25.1 },
  { m: "Jun", p: 26.7 },
  { m: "Jul", p: 27.2 },
  { m: "Aug", p: 28.4 },
  { m: "Sep", p: 27.9 },
  { m: "Oct", p: 29.6 },
  { m: "Nov", p: 30.2 },
  { m: "Dec", p: 31.7 },
];

const purchasesData = [
  { m: "Mon", t: 120 },
  { m: "Tue", t: 90 },
  { m: "Wed", t: 180 },
  { m: "Thu", t: 160 },
  { m: "Fri", t: 210 },
  { m: "Sat", t: 130 },
  { m: "Sun", t: 80 },
];

const recentTx = [
  { id: "TX-88421", type: "Buy", amount: 450, unit: "t", price: 27.3, date: "2025-09-01" },
  { id: "TX-88402", type: "Buy", amount: 250, unit: "t", price: 26.8, date: "2025-08-28" },
  { id: "TX-88377", type: "Sell", amount: 120, unit: "t", price: 26.4, date: "2025-08-22" },
  { id: "TX-88321", type: "Buy", amount: 300, unit: "t", price: 25.9, date: "2025-08-14" },
];

export default function IndustryDashboard() {
  const [wallet] = useState({
    balanceTons: 1420,
    estValue: 1420 * 31.7,
    change7d: +4.6,
  });

  const kpis = useMemo(
    () => [
      {
        title: "Wallet Balance (tCO₂)",
        value: wallet.balanceTons.toLocaleString(),
        delta: `${wallet.change7d >= 0 ? "+" : ""}${wallet.change7d}%`,
        icon: <Wallet className="w-5 h-5" />,
        color: "bg-emerald-600",
      },
      {
        title: "Market Price ($/t)",
        value: creditPriceData[creditPriceData.length - 1].p.toFixed(2),
        delta: "+5.1% MoM",
        icon: <TrendingUp className="w-5 h-5" />,
        color: "bg-blue-600",
      },
      {
        title: "This Week Purchases",
        value: purchasesData.reduce((s, d) => s + d.t, 0).toLocaleString() + " t",
        delta: "+12% WoW",
        icon: <ShoppingCart className="w-5 h-5" />,
        color: "bg-violet-600",
      },
      {
        title: "Vendors Onboarded",
        value: "54",
        delta: "+6 new",
        icon: <Building2 className="w-5 h-5" />,
        color: "bg-amber-600",
      },
    ],
    [wallet]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Industry Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Buy, manage, and monitor your carbon credits portfolio in real time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/industry/marketplace"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110"
          >
            <ShoppingCart className="w-4 h-4" /> Go to Marketplace
          </Link>
          <Link
            to="/industry/wallet"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90"
          >
            <Wallet className="w-4 h-4" /> Open Wallet
          </Link>
        </div>
      </header>

      {/* KPI cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((k) => (
          <div key={k.title} className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">{k.title}</div>
              <div className={`p-2 rounded-lg text-white ${k.color}`}>{k.icon}</div>
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{k.value}</div>
            <div className="mt-2 inline-flex items-center gap-1 text-sm text-emerald-600">
              <ArrowUpRight className="w-4 h-4" /> {k.delta}
            </div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Market Price – Blue Carbon Credits ($/t)
            </h3>
            <div className="text-sm text-gray-500">Last 12 months</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={creditPriceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="m" />
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip />
              <Line type="monotone" dataKey="p" stroke="#10b981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Weekly Purchases (tCO₂)</h3>
            <div className="text-sm text-gray-500">This week</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={purchasesData}>
              <XAxis dataKey="m" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="t" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Wallet + Recent Transactions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Wallet Snapshot</h3>
          <div className="space-y-3">
            <Row label="Balance" value={`${wallet.balanceTons.toLocaleString()} tCO₂`} />
            <Row
              label="Est. Value"
              value={`$${wallet.estValue.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}`}
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">7-day Change</div>
              <div className="inline-flex items-center gap-1 text-emerald-600">
                <ArrowUpRight className="w-4 h-4" />
                {wallet.change7d}%
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Link
              to="/industry/transactions"
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90"
            >
              View Transactions
            </Link>
            <Link
              to="/industry/marketplace"
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
            >
              Buy Credits
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
            <Link to="/industry/transactions" className="text-sm text-emerald-700 underline">
              See all
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="py-3 px-4">Tx ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Price ($/t)</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="py-3 px-4 text-gray-900 font-medium">{t.id}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          t.type === "Buy"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {t.type} {t.type === "Buy" ? <ArrowUpRight className="inline w-3 h-3" /> : <ArrowDownRight className="inline w-3 h-3" />}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {t.amount.toLocaleString()} {t.unit}
                    </td>
                    <td className="py-3 px-4">${t.price.toFixed(2)}</td>
                    <td className="py-3 px-4">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}