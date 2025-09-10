// src/pages/admin/AdminDashboard.jsx
import React, { useMemo, useState } from "react";
import {
  Users,
  ShieldCheck,
  FileText,
  BarChart3,
  Activity,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Database,
  Cog,
  ArrowUpRight,
  ClipboardList,
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
import { Link } from "react-router-dom";

const MOCK_APPROVALS = [
  { id: "PRJ-1107", name: "Mangrove Revival – Bay East", owner: "Alice", submitted: "2 Sep 2025" },
  { id: "PRJ-1099", name: "Wetland Horizon – Estuary", owner: "David", submitted: "31 Aug 2025" },
  { id: "PRJ-1093", name: "Seagrass Bloom – West Coast", owner: "Meera", submitted: "29 Aug 2025" },
];

const MOCK_USERS_TREND = [
  { d: "Mon", u: 12 },
  { d: "Tue", u: 18 },
  { d: "Wed", u: 14 },
  { d: "Thu", u: 19 },
  { d: "Fri", u: 22 },
  { d: "Sat", u: 7 },
  { d: "Sun", u: 9 },
];

const MOCK_PROJECTS_TREND = [
  { m: "Jan", p: 18 },
  { m: "Feb", p: 22 },
  { m: "Mar", p: 25 },
  { m: "Apr", p: 21 },
  { m: "May", p: 30 },
  { m: "Jun", p: 36 },
  { m: "Jul", p: 41 },
  { m: "Aug", p: 44 },
  { m: "Sep", p: 47 },
];

export default function AdminDashboard() {
  const [sys] = useState({
    uptime: "14d 6h",
    apiLatencyMs: 142,
    queueDepth: 7,
    dbHealth: "Healthy",
  });

  
 const kpis = useMemo(
  () => [
    {
      title: "Total Users",
      value: "4,812",
      delta: "+3.2%",
      icon: <Users className="w-5 h-5" />,
      color: "bg-blue-600",
      textColor: "text-blue-400",
    },
    {
      title: "Projects Submitted",
      value: "1,274",
      delta: "+5.1%",
      icon: <FileText className="w-5 h-5" />,
      color: "bg-violet-600",
      textColor: "text-violet-400",
    },
    {
      title: "Approvals (30d)",
      value: "312",
      delta: "+2.4%",
      icon: <ShieldCheck className="w-5 h-5" />,
      color: "bg-emerald-600",
      textColor: "text-emerald-400",
    },
    {
      title: "On-Chain Anchors",
      value: "168",
      delta: "+4.0%",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "bg-amber-600",
      textColor: "text-amber-400",
    },
  ],
  []
);


  return (
    // <div className="space-y-8">
    //   {/* Header */}
    //   <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
    //     <div>
    //       <h1 className="text-3xl font-bold">Admin Dashboard</h1>
    //       <p className="text-gray-600 mt-1">
    //         System health, project approvals, and registry-wide analytics.
    //       </p>
    //     </div>
    //     <div className="flex items-center gap-3">
    //       <Link
    //         to="/admin/project-approval"
    //         className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110"
    //       >
    //         <ClipboardList className="w-4 h-4" /> Review Approvals
    //       </Link>
    //       <Link
    //         to="/admin/reports"
    //         className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90"
    //       >
    //         <BarChart3 className="w-4 h-4" /> View Reports
    //       </Link>
    //     </div>
    //   </header>

    //   {/* KPIs */}
    //   <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    //     {kpis.map((k) => (
    //       <div key={k.title} className="bg-white rounded-2xl shadow p-6">
    //         <div className="flex items-center justify-between">
    //           <div className="text-sm text-gray-500">{k.title}</div>
    //           <div className={`p-2 rounded-lg text-white ${k.color}`}>{k.icon}</div>
    //         </div>
    //         <div className="mt-2 text-3xl font-bold text-gray-900">{k.value}</div>
    //         <div className="mt-2 inline-flex items-center gap-1 text-sm text-emerald-600">
    //           <ArrowUpRight className="w-4 h-4" /> {k.delta}
    //         </div>
    //       </div>
    //     ))}
    //   </section>

    //   {/* Health + Trends */}
    //   <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    //     {/* System health card */}
    //     <div className="bg-white rounded-2xl shadow p-6">
    //       <div className="flex items-center justify-between mb-4">
    //         <h3 className="font-semibold text-gray-900 flex items-center gap-2">
    //           <Activity className="w-5 h-5 text-emerald-600" />
    //           System Health
    //         </h3>
    //         <div className="text-sm text-gray-500">Uptime: {sys.uptime}</div>
    //       </div>
    //       <ul className="space-y-3 text-sm text-gray-700">
    //         <li className="flex items-center justify-between">
    //           <span>API latency (p95)</span>
    //           <span className="font-semibold">{sys.apiLatencyMs} ms</span>
    //         </li>
    //         <li className="flex items-center justify-between">
    //           <span>Approval queue depth</span>
    //           <span className="font-semibold">{sys.queueDepth}</span>
    //         </li>
    //         <li className="flex items-center justify-between">
    //           <span className="inline-flex items-center gap-2">
    //             <Database className="w-4 h-4 text-blue-600" /> Database
    //           </span>
    //           <span className="font-semibold text-emerald-600">{sys.dbHealth}</span>
    //         </li>
    //       </ul>

    //       <div className="mt-5 flex items-center gap-3">
    //         <Link to="/admin/settings" className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90">
    //           <Cog className="inline w-4 h-4 mr-2" />
    //           Settings
    //         </Link>
    //         <Link to="/admin/user-management" className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100">
    //           Manage Users
    //         </Link>
    //       </div>
    //     </div>

    //     {/* New users line chart */}
    //     <div className="bg-white rounded-2xl shadow p-6">
    //       <div className="flex items-center justify-between mb-4">
    //         <h3 className="font-semibold text-gray-900">New Users (7d)</h3>
    //         <span className="text-sm text-gray-500">Daily signups</span>
    //       </div>
    //       <ResponsiveContainer width="100%" height={240}>
    //         <LineChart data={MOCK_USERS_TREND}>
    //           <CartesianGrid strokeDasharray="3 3" />
    //           <XAxis dataKey="d" />
    //           <YAxis />
    //           <Tooltip />
    //           <Line type="monotone" dataKey="u" stroke="#0ea5e9" strokeWidth={3} dot />
    //         </LineChart>
    //       </ResponsiveContainer>
    //     </div>

    //     {/* Projects submitted bar chart */}
    //     <div className="bg-white rounded-2xl shadow p-6">
    //       <div className="flex items-center justify-between mb-4">
    //         <h3 className="font-semibold text-gray-900">Projects Submitted (YTD)</h3>
    //         <span className="text-sm text-gray-500">Monthly</span>
    //       </div>
    //       <ResponsiveContainer width="100%" height={240}>
    //         <BarChart data={MOCK_PROJECTS_TREND}>
    //           <XAxis dataKey="m" />
    //           <YAxis />
    //           <Tooltip />
    //           <Bar dataKey="p" fill="#6366f1" />
    //         </BarChart>
    //       </ResponsiveContainer>
    //     </div>
    //   </section>

    //   {/* Approvals queue */}
    //   <section className="bg-white rounded-2xl shadow p-6">
    //     <div className="flex items-center justify-between mb-4">
    //       <h3 className="font-semibold text-gray-900 flex items-center gap-2">
    //         <ShieldCheck className="w-5 h-5 text-emerald-600" />
    //         Pending Project Approvals
    //       </h3>
    //       <Link to="/admin/project-approval" className="text-sm text-emerald-700 underline">
    //         See all
    //       </Link>
    //     </div>

    //     <div className="overflow-hidden rounded-xl border">
    //       <table className="w-full text-left">
    //         <thead className="bg-gray-50 text-gray-600 text-sm">
    //           <tr>
    //             <th className="py-3 px-4">Project</th>
    //             <th className="py-3 px-4">Owner</th>
    //             <th className="py-3 px-4">Submitted</th>
    //             <th className="py-3 px-4 text-right">Actions</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           {MOCK_APPROVALS.map((a) => (
    //             <tr key={a.id} className="border-t">
    //               <td className="py-3 px-4">
    //                 <div className="font-semibold text-gray-900">{a.name}</div>
    //                 <div className="text-xs text-gray-500">{a.id}</div>
    //               </td>
    //               <td className="py-3 px-4">{a.owner}</td>
    //               <td className="py-3 px-4">{a.submitted}</td>
    //               <td className="py-3 px-4">
    //                 <div className="flex items-center gap-2 justify-end">
    //                   <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:brightness-110">
    //                     <CheckCircle2 className="w-4 h-4" /> Approve
    //                   </button>
    //                   <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-sm hover:brightness-110">
    //                     <XCircle className="w-4 h-4" /> Reject
    //                   </button>
    //                   <Link
    //                     to={`/project/${a.id}`}
    //                     className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-100 text-sm"
    //                   >
    //                     <TrendingUp className="w-4 h-4" /> View
    //                   </Link>
    //                 </div>
    //               </td>
    //             </tr>
    //           ))}
    //           {MOCK_APPROVALS.length === 0 && (
    //             <tr>
    //               <td colSpan={4} className="py-10 text-center text-gray-500">
    //                 No pending approvals.
    //               </td>
    //             </tr>
    //           )}
    //         </tbody>
    //       </table>
    //     </div>
    //   </section>
    // </div>
     <div className="space-y-8 px-8 py-6 bg-[#111] min-h-screen text-gray-200">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">
            System health, project approvals, and registry-wide analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/project-approval"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-600 transition-all duration-300 hover:border-emerald-500 hover:shadow-[0_0_12px_#10b981] hover:text-emerald-400"
          >
            <ClipboardList className="w-4 h-4" /> Review Approvals
          </Link>
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-600 transition-all duration-300 hover:border-cyan-500 hover:shadow-[0_0_12px_#22d3ee] hover:text-cyan-400"
          >
            <BarChart3 className="w-4 h-4" /> View Reports
          </Link>
        </div>
      </header>

      {/* KPIs */}
    
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
  {kpis.map((k) => (
    <div
      key={k.title}
      className={`bg-[#1a1a1a] rounded-2xl shadow-md p-6 border border-transparent transition-all duration-300 hover:shadow-[0_0_15px_currentColor] ${k.textColor}`}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "currentColor";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">{k.title}</div>
        <div className={`p-2 rounded-full ${k.color}`}>{k.icon}</div>
      </div>
      <div className="mt-2 text-3xl font-bold text-gray-100">{k.value}</div>
      <div
        className={`mt-2 inline-flex items-center gap-1 text-sm ${
          k.delta.startsWith("+") ? "text-emerald-400" : "text-rose-400"
        }`}
      >
        <TrendingUp className="w-4 h-4" /> {k.delta}
      </div>
    </div>
  ))}
</section>



      {/* Health + Trends */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System health card */}
        <div className="bg-[#1a1a1a] rounded-2xl shadow-md p-6 border border-transparent transition-all duration-300 hover:border-emerald-500 hover:shadow-[0_0_15px_#10b981]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2 text-gray-100">
              <Activity className="w-5 h-5 text-emerald-400" />
              System Health
            </h3>
            <div className="text-sm text-gray-400">Uptime: {sys.uptime}</div>
          </div>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-center justify-between">
              <span>API latency (p95)</span>
              <span className="font-semibold">{sys.apiLatencyMs} ms</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Approval queue depth</span>
              <span className="font-semibold">{sys.queueDepth}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" /> Database
              </span>
              <span className="font-semibold text-emerald-400">{sys.dbHealth}</span>
            </li>
          </ul>

          <div className="mt-5 flex items-center gap-3">
            <Link
              to="/admin/settings"
              className="px-4 py-2 rounded-lg border border-gray-700 text-white transition-all duration-300 hover:border-emerald-500 hover:shadow-[0_0_12px_#10b981] hover:text-emerald-400"
            >
              <Cog className="inline w-4 h-4 mr-2" />
              Settings
            </Link>
            <Link
              to="/admin/user-management"
              className="px-4 py-2 rounded-lg border border-gray-700 text-white transition-all duration-300 hover:border-cyan-500 hover:shadow-[0_0_12px_#22d3ee] hover:text-cyan-400"
            >
              Manage Users
            </Link>
          </div>
        </div>

        {/* New users line chart */}
        <div className="bg-[#1a1a1a] rounded-2xl shadow-md p-6 border border-transparent hover:border-cyan-500 hover:shadow-[0_0_15px_#22d3ee] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-100">New Users (7d)</h3>
            <span className="text-sm text-gray-400">Daily signups</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={MOCK_USERS_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="d" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line type="monotone" dataKey="u" stroke="#22d3ee" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Projects submitted bar chart */}
        <div className="bg-[#1a1a1a] rounded-2xl shadow-md p-6 border border-transparent hover:border-purple-500 hover:shadow-[0_0_15px_#9333ea] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-100">Projects Submitted (YTD)</h3>
            <span className="text-sm text-gray-400">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MOCK_PROJECTS_TREND}>
              <XAxis dataKey="m" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="p" fill="#9333ea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Approvals queue */}
      <section className="bg-[#1a1a1a] rounded-2xl shadow-md p-6 border border-gray-800  ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2 text-gray-100">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Pending Project Approvals
          </h3>
          <Link to="/admin/project-approval" className="text-sm text-emerald-400 underline">
            See all
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-[#111] text-gray-400 text-sm">
              <tr>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_APPROVALS.map((a) => (
                <tr key={a.id} className="border-t border-gray-700 transition-all duration-300 hover:bg-[#222]  ">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-100">{a.name}</div>
                    <div className="text-xs text-gray-500">{a.id}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{a.owner}</td>
                  <td className="py-3 px-4 text-gray-300">{a.submitted}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full border border-gray-700 text-emerald-500 text-sm transition-all duration-300 hover:border-emerald-500 hover:shadow-[0_0_10px_#10b981] hover:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 emerald-500" /> Approve
                      </button>
                      <button className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full border border-gray-700 text-rose-500 text-sm transition-all duration-300 hover:border-rose-500 hover:shadow-[0_0_10px_#f43f5e] hover:text-rose-400">
                        <XCircle className="w-4 h-4 rose-500" /> Reject
                      </button>
                      <Link
                        to={`/project/${a.id}`}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full border border-gray-700 text-cyan-500 text-sm transition-all duration-300 hover:border-cyan-500 hover:shadow-[0_0_10px_#22d3ee] hover:text-cyan-400"
                      >
                        <TrendingUp className="w-4 h-4 cyan-500" /> View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {MOCK_APPROVALS.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-500">
                    No pending approvals.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>

  );
}