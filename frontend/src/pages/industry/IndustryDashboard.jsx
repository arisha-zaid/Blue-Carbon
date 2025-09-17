// src/pages/industry/IndustryDashboard.jsx
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [wallet] = useState({
    balanceTons: 1420,
    estValue: 1420 * 31.7,
    change7d: +4.6,
  });

  const kpis = useMemo(
    () => [
      {
        title: t("dashboard.kpis.walletBalance"),
        value: wallet.balanceTons.toLocaleString(),
        delta: `${wallet.change7d >= 0 ? "+" : ""}${wallet.change7d}%`,
        icon: <Wallet className="w-5 h-5" />,
        color: "bg-emerald-600",
      },
      {
        title: t("dashboard.kpis.marketPrice"),
        value: creditPriceData[creditPriceData.length - 1].p.toFixed(2),
        delta: t("dashboard.kpis.delta.mom"),
        icon: <TrendingUp className="w-5 h-5" />,
        color: "bg-blue-600",
      },
      {
        title: t("dashboard.kpis.thisWeekPurchases"),
        value: purchasesData.reduce((s, d) => s + d.t, 0).toLocaleString() + " t",
        delta: t("dashboard.kpis.delta.wow"),
        icon: <ShoppingCart className="w-5 h-5" />,
        color: "bg-violet-600",
      },
      {
        title: t("dashboard.kpis.vendorsOnboarded"),
        value: "54",
        delta: t("dashboard.kpis.delta.new"),
        icon: <Building2 className="w-5 h-5" />,
        color: "bg-amber-600",
      },
    ],
    [wallet, t]
  );

  return (
  <div className="space-y-8 px-8 py-6 bg-[#111] min-h-screen text-gray-200">
  {/* Sidebar already exists at w-64, static on the left */}

  {/* Main content shifted to the right */}
  
    {/* Header */}
    <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
         
        <h1 className="text-3xl font-bold text-gray-100">{t("dashboard.title")}</h1>
        <p className="text-gray-400 mt-1">{t("dashboard.description")}</p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          to="/industry/marketplace"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg  hover:brightness-110
          border border-gray-600 text-gray-300 hover:border-emerald-400 hover:text-emerald-400 transition
            hover:shadow-[0_0_9px_#50C878]"
        >
          <ShoppingCart className="w-4 h-4" /> {t("dashboard.goToMarketplace")}
        </Link>
        <Link
          to="/industry/wallet"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:border-cyan-400 hover:text-cyan-400 hover:shadow-[0_0_9px_#2DD4BF] transition"
        >
          <Wallet className="w-4 h-4" /> {t("dashboard.openWallet")}
        </Link>
      </div>
    </header>

    {/* KPI Cards */}
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {kpis.map((k, idx) => (
        <div
          key={k.title}
          className="rounded-2xl p-6 border border-gray-700 bg-[#1a1a1a] transition-all duration-300"
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              idx % 2 === 0 ? "0 0 12px #2DD4BF" : "0 0 12px #FACC15";
            e.currentTarget.style.borderColor =
              idx % 2 === 0 ? "#2DD4BF" : "#FACC15";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderColor = "#374151";
          }}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">{k.title}</div>
            <div className={`p-2 rounded-lg ${k.color} bg-opacity-20 text-white`}>
              {k.icon}
            </div>
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-100">{k.value}</div>
          <div className="mt-2 inline-flex items-center gap-1 text-sm text-emerald-400">
            <ArrowUpRight className="w-4 h-4" /> {k.delta}
          </div>
        </div>
      ))}
    </section>

    {/* Charts */}
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Line Chart */}
      <div className="rounded-2xl p-6 lg:col-span-2 border border-gray-700 bg-[#1a1a1a] transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_12px_#2DD4BF]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            {t("dashboard.marketPrice")}
          </h3>
          <div className="text-sm text-gray-400">{t("dashboard.marketPricePeriod")}</div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={creditPriceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="m" stroke="#9ca3af" />
            <YAxis domain={["dataMin - 2", "dataMax + 2"]} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2DD4BF", color: "#e5e7eb" }}
            />
            <Line type="monotone" dataKey="p" stroke="#2DD4BF" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="rounded-2xl p-6 border border-gray-700 bg-[#1a1a1a] transition-all duration-300 hover:border-yellow-400 hover:shadow-[0_0_12px_#FACC15]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-100">{t("dashboard.weeklyPurchases")}</h3>
          <div className="text-sm text-gray-400">{t("dashboard.weeklyPurchasesPeriod")}</div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={purchasesData}>
            <XAxis dataKey="m" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #FACC15", color: "#e5e7eb" }}
            />
            <Bar dataKey="t" fill="#FACC15" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>

    {/* Wallet + Transactions */}
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Wallet */}
      <div className="rounded-2xl p-6 border border-gray-700 bg-[#1a1a1a] transition-all duration-300 ">
        <h3 className="font-semibold text-gray-100 mb-4">{t("dashboard.walletSnapshot")}</h3>
        <div className="space-y-3">
          <Row label={t("dashboard.balance")} value={`${wallet.balanceTons.toLocaleString()} tCO₂`} />
          <Row label={t("dashboard.estimatedValue")} value={`$${wallet.estValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">{t("dashboard.sevenDayChange")}</div>
            <div className="inline-flex items-center gap-1 text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
              {wallet.change7d}%
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Link
            to="/industry/transactions"
            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300  hover:text-cyan-400 transition
            hover:border-cyan-400 hover:shadow-[0_0_9px_#2DD4BF]"
          >
            {t("dashboard.viewTransactions")}
          </Link>
          <Link
            to="/industry/marketplace"
            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:border-emerald-400 hover:text-emerald-400 transition
            hover:shadow-[0_0_9px_#50C878]"
          >
            {t("dashboard.buyCredits")}
          </Link>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl p-6 lg:col-span-2 border border-gray-700 bg-[#1a1a1a] transition-all duration-300 ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-100">{t("dashboard.recentTransactions")}</h3>
          <Link to="/industry/transactions" className="text-sm text-emerald-400 hover:underline">{t("dashboard.seeAll")}</Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-700">
          <table className="w-full text-left">
  <thead className="bg-[#111] text-gray-400 text-sm">
    <tr>
      <th className="py-3 px-4">{t("dashboard.txID")}</th>
      <th className="py-3 px-4">{t("dashboard.type")}</th>
      <th className="py-3 px-4">{t("dashboard.amount")}</th>
      <th className="py-3 px-4">{t("dashboard.pricePerTon")}</th>
      <th className="py-3 px-4">{t("dashboard.date")}</th>
    </tr>
  </thead>
  <tbody>
    {recentTx.map((t) => (
      <tr
        key={t.id}
        className="border-t border-gray-700 transition 
                   hover:bg-[#222] 
                   hover:border-emerald-400 hover:shadow-[0_0_10px_#50C878]"
      >
        <td className="py-3 px-4 text-gray-100 font-medium">{t.id}</td>
        <td className="py-3 px-4">
          <span
            className={`px-2 py-1 rounded-full text-xs inline-flex items-center gap-1 ${
              t.type === "Buy"
                ? "bg-emerald-900/40 text-emerald-400 border border-emerald-600/30"
                : "bg-rose-900/40 text-rose-400 border border-rose-600/30"
            }`}
          >
            {t.type}
            {t.type === "Buy" ? (
              <ArrowUpRight className="inline w-3 h-3" />
            ) : (
              <ArrowDownRight className="inline w-3 h-3" />
            )}
          </span>
        </td>
        <td className="py-3 px-4">{t.amount.toLocaleString()} {t.unit}</td>
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