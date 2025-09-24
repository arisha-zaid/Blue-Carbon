// src/pages/admin/Reports.jsx
import React, { useMemo, useState } from "react";
import { Download, Filter, Users, FileText, ShieldCheck, Rocket } from "lucide-react";
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
const PERIODS = ["Last 3M", "Last 6M", "Last 12M", "YTD"];

// Mocked admin-wide stats (replace with API)
const MONTHLY = [
  { m: "Jan", newUsers: 412, projects: 18, approvals: 11, anchors: 7 },
  { m: "Feb", newUsers: 540, projects: 22, approvals: 13, anchors: 8 },
  { m: "Mar", newUsers: 630, projects: 25, approvals: 15, anchors: 10 },
  { m: "Apr", newUsers: 498, projects: 21, approvals: 14, anchors: 9 },
  { m: "May", newUsers: 732, projects: 30, approvals: 18, anchors: 13 },
  { m: "Jun", newUsers: 810, projects: 36, approvals: 19, anchors: 14 },
  { m: "Jul", newUsers: 904, projects: 41, approvals: 22, anchors: 16 },
  { m: "Aug", newUsers: 960, projects: 44, approvals: 24, anchors: 18 },
  { m: "Sep", newUsers: 1012, projects: 47, approvals: 25, anchors: 19 },
  { m: "Oct", newUsers: 1090, projects: 52, approvals: 27, anchors: 21 },
  { m: "Nov", newUsers: 1154, projects: 55, approvals: 29, anchors: 22 },
  { m: "Dec", newUsers: 1230, projects: 58, approvals: 31, anchors: 24 },
];

const CHANNEL_MIX = [
  { name: "Community", value: 43 },
  { name: "Industry", value: 27 },
  { name: "Government", value: 18 },
  { name: "Admin Ops", value: 12 },
];


const KPI_COLORS = {
  users:     { bg: "bg-sky-600",     hex: "#0284c7" },
  projects:  { bg: "bg-violet-600",  hex: "#4f46e5" },
  approvals: { bg: "bg-emerald-600", hex: "#059669" },
  anchors:   { bg: "bg-amber-600",   hex: "#d97706" },
};

export default function AdminReports() {
  const [period, setPeriod] = useState("Last 12M");

  const filtered = useMemo(() => {
    switch (period) {
      case "Last 3M":
        return MONTHLY.slice(-3);
      case "Last 6M":
        return MONTHLY.slice(-6);
      case "YTD":
        return MONTHLY.slice(0, 12); // adjust based on current month in real use
      default:
        return MONTHLY;
    }
  }, [period]);

  const kpis = useMemo(() => {
    const totals = filtered.reduce(
      (acc, d) => {
        acc.users += d.newUsers;
        acc.projects += d.projects;
        acc.approvals += d.approvals;
        acc.anchors += d.anchors;
        return acc;
      },
      { users: 0, projects: 0, approvals: 0, anchors: 0 }
    );
    const avgUsers = Math.round(totals.users / (filtered.length || 1));
    const avgProjects = Math.round(totals.projects / (filtered.length || 1));
    const avgApprovals = Math.round(totals.approvals / (filtered.length || 1));
    const avgAnchors = Math.round(totals.anchors / (filtered.length || 1));
    return { totals, avgUsers, avgProjects, avgApprovals, avgAnchors };
  }, [filtered]);

  const exportCSV = () => {
    const headers = ["month", "newUsers", "projects", "approvals", "anchors"];
    const rows = filtered.map((d) => [d.m, d.newUsers, d.projects, d.approvals, d.anchors].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin-reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    // <div className="space-y-8">
    //   {/* Header */}
    //   <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
    //     <div>
    //       <h1 className="text-3xl font-bold">Admin Reports & Analytics</h1>
    //       <p className="text-gray-600 mt-1">
    //         Platform-wide insights: users, projects, approvals, and anchors.
    //       </p>
    //     </div>
    //     <div className="flex items-center gap-3">
    //       <div className="flex items-center gap-2">
    //         <Filter className="w-4 h-4 text-gray-600" />
    //         <select
    //           value={period}
    //           onChange={(e) => setPeriod(e.target.value)}
    //           className="py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
    //         >
    //           {PERIODS.map((p) => (
    //             <option key={p} value={p}>
    //               {p}
    //             </option>
    //           ))}
    //         </select>
    //       </div>
    //       <button
    //         onClick={exportCSV}
    //         className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90"
    //       >
    //         <Download className="w-4 h-4" /> Export CSV
    //       </button>
    //     </div>
    //   </header>

    //   {/* KPIs */}
    //   <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    //     <KPI title="New Users (total)" value={kpis.totals.users.toLocaleString()} icon={<Users className="w-5 h-5" />} color="bg-sky-600" />
    //     <KPI title="Projects Submitted (total)" value={kpis.totals.projects.toLocaleString()} icon={<FileText className="w-5 h-5" />} color="bg-violet-600" />
    //     <KPI title="Approvals (total)" value={kpis.totals.approvals.toLocaleString()} icon={<ShieldCheck className="w-5 h-5" />} color="bg-emerald-600" />
    //     <KPI title="Anchors (total)" value={kpis.totals.anchors.toLocaleString()} icon={<Rocket className="w-5 h-5" />} color="bg-amber-600" />
    //   </section>

    //   {/* Charts */}
    //   <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    //     {/* Users trend */}
    //     <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
    //       <div className="flex items-center justify-between mb-4">
    //         <h3 className="font-semibold text-gray-900">New Users Trend</h3>
    //         <span className="text-sm text-gray-500">{period}</span>
    //       </div>
    //       <ResponsiveContainer width="100%" height={280}>
    //         <LineChart data={filtered}>
    //           <CartesianGrid strokeDasharray="3 3" />
    //           <XAxis dataKey="m" />
    //           <YAxis />
    //           <Tooltip />
    //           <Line type="monotone" dataKey="newUsers" stroke="#0ea5e9" strokeWidth={3} dot />
    //         </LineChart>
    //       </ResponsiveContainer>
    //     </div>

    //     {/* Channel mix */}
    //     <div className="bg-white rounded-2xl shadow p-6">
    //       <h3 className="font-semibold text-gray-900 mb-4">Activity Channel Mix</h3>
    //       <ResponsiveContainer width="100%" height={280}>
    //         <PieChart>
    //           <Pie data={CHANNEL_MIX} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
    //             {CHANNEL_MIX.map((_, i) => (
    //               <Cell key={i} fill={COLORS[i % COLORS.length]} />
    //             ))}
    //           </Pie>
    //           <Tooltip />
    //         </PieChart>
    //       </ResponsiveContainer>
    //     </div>
    //   </section>

    //   {/* Projects & Anchors */}
    //   <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    //     <div className="bg-white rounded-2xl shadow p-6">
    //       <div className="flex items-center justify-between mb-4">
    //         <h3 className="font-semibold text-gray-900">Projects Submitted</h3>
    //         <span className="text-sm text-gray-500">{period}</span>
    //       </div>
    //       <ResponsiveContainer width="100%" height={280}>
    //         <BarChart data={filtered}>
    //           <XAxis dataKey="m" />
    //           <YAxis />
    //           <Tooltip />
    //           <Bar dataKey="projects" fill="#6366f1" />
    //         </BarChart>
    //       </ResponsiveContainer>
    //     </div>

    //     <div className="bg-white rounded-2xl shadow p-6">
    //       <div className="flex items-center justify-between mb-4">
    //         <h3 className="font-semibold text-gray-900">On-Chain Anchors</h3>
    //         <span className="text-sm text-gray-500">{period}</span>
    //       </div>
    //       <ResponsiveContainer width="100%" height={280}>
    //         <LineChart data={filtered}>
    //           <CartesianGrid strokeDasharray="3 3" />
    //           <XAxis dataKey="m" />
    //           <YAxis />
    //           <Tooltip />
    //           <Line type="monotone" dataKey="anchors" stroke="#f59e0b" strokeWidth={3} dot />
    //         </LineChart>
    //       </ResponsiveContainer>
    //     </div>
    //   </section>

    //   {/* Data Table */}
    //   <section className="bg-white rounded-2xl shadow overflow-hidden">
    //     <table className="w-full text-left">
    //       <thead className="bg-gray-50 text-gray-600 text-sm">
    //         <tr>
    //           <th className="py-3 px-4">Month</th>
    //           <th className="py-3 px-4">New Users</th>
    //           <th className="py-3 px-4">Projects</th>
    //           <th className="py-3 px-4">Approvals</th>
    //           <th className="py-3 px-4">Anchors</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {filtered.map((d) => (
    //           <tr key={d.m} className="border-t">
    //             <td className="py-3 px-4">{d.m}</td>
    //             <td className="py-3 px-4">{d.newUsers.toLocaleString()}</td>
    //             <td className="py-3 px-4">{d.projects.toLocaleString()}</td>
    //             <td className="py-3 px-4">{d.approvals.toLocaleString()}</td>
    //             <td className="py-3 px-4">{d.anchors.toLocaleString()}</td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   </section>
    // </div>
    <div className="space-y-8">
  {/* Header */}
  <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold text-white">Admin Reports & Analytics</h1>
      <p className="text-gray-400 mt-1">
        Platform-wide insights: users, projects, approvals, and anchors.
      </p>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="py-2 px-3 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-300 
                     focus:ring-2 focus:ring-emerald-500"
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
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg 
                   bg-emerald-600 text-white hover:bg-emerald-500 transition"
      >
        <Download className="w-4 h-4" /> Export CSV
      </button>
    </div>
  </header>

  {/* KPIs */}
  <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
  <KPI
    title="New Users (total)"
    value={kpis.totals.users.toLocaleString()}
    icon={<Users className="w-5 h-5" />}
    bgColor={KPI_COLORS.users.bg}
    borderColor={KPI_COLORS.users.hex}
  />
  <KPI
    title="Projects Submitted (total)"
    value={kpis.totals.projects.toLocaleString()}
    icon={<FileText className="w-5 h-5" />}
    bgColor={KPI_COLORS.projects.bg}
    borderColor={KPI_COLORS.projects.hex}
  />
  <KPI
    title="Approvals (total)"
    value={kpis.totals.approvals.toLocaleString()}
    icon={<ShieldCheck className="w-5 h-5" />}
    bgColor={KPI_COLORS.approvals.bg}
    borderColor={KPI_COLORS.approvals.hex}
  />
  <KPI
    title="Anchors (total)"
    value={kpis.totals.anchors.toLocaleString()}
    icon={<Rocket className="w-5 h-5" />}
    bgColor={KPI_COLORS.anchors.bg}
    borderColor={KPI_COLORS.anchors.hex}
  />
</section>


  {/* Charts */}
  <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Users trend */}
    <div className="bg-[#1a1a1a] rounded-2xl shadow-lg p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">New Users Trend</h3>
        <span className="text-sm text-gray-400">{period}</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={filtered}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
          <XAxis dataKey="m" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip />
          <Line type="monotone" dataKey="newUsers" stroke="#0ea5e9" strokeWidth={3} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* Channel mix */}
    <div className="bg-[#1a1a1a] rounded-2xl shadow-lg p-6">
      <h3 className="font-semibold text-white mb-4">Activity Channel Mix</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={CHANNEL_MIX} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
            {CHANNEL_MIX.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </section>

  {/* Projects & Anchors */}
  <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-[#1a1a1a] rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Projects Submitted</h3>
        <span className="text-sm text-gray-400">{period}</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={filtered}>
          <XAxis dataKey="m" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip />
          <Bar dataKey="projects" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="bg-[#1a1a1a] rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">On-Chain Anchors</h3>
        <span className="text-sm text-gray-400">{period}</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={filtered}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
          <XAxis dataKey="m" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip />
          <Line type="monotone" dataKey="anchors" stroke="#f59e0b" strokeWidth={3} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </section>

  {/* Data Table */}
  <section className="bg-[#1a1a1a] rounded-2xl shadow-lg overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-[#2a2a2a] text-gray-400 text-sm">
        <tr>
          <th className="py-3 px-4">Month</th>
          <th className="py-3 px-4">New Users</th>
          <th className="py-3 px-4">Projects</th>
          <th className="py-3 px-4">Approvals</th>
          <th className="py-3 px-4">Anchors</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((d) => (
          <tr
            key={d.m}
            className="border-t border-gray-700 hover:bg-[#222] transition"
          >
            <td className="py-3 px-4 text-gray-300">{d.m}</td>
            <td className="py-3 px-4 text-gray-300">{d.newUsers.toLocaleString()}</td>
            <td className="py-3 px-4 text-gray-300">{d.projects.toLocaleString()}</td>
            <td className="py-3 px-4 text-gray-300">{d.approvals.toLocaleString()}</td>
            <td className="py-3 px-4 text-gray-300">{d.anchors.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
</div>

  );
}

// function KPI({ title, value, icon, color }) {

//   return (
//     // <div className="bg-white rounded-2xl shadow p-6">
//     //   <div className="flex items-center justify-between">
//     //     <div className="text-sm text-gray-500">{title}</div>
//     //     <div className={`p-2 rounded-lg text-white ${color}`}>{icon}</div>
//     //   </div>
//     //   <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
//     // </div>
//   );
// }

function KPI({ title, value, icon, bgColor, borderColor }) {
  return (
    <div
      className={`bg-[#1a1a1a] rounded-2xl shadow-lg p-6 border border-transparent transition`}
      style={{
        borderColor: "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = borderColor;
        e.currentTarget.style.boxShadow = `0 0 12px ${borderColor}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">{title}</div>
        <div className={`p-2 rounded-full text-white ${bgColor}`}>{icon}</div>
      </div>
      <div className="mt-2 text-3xl font-bold text-gray-100">{value}</div>
    </div>
  );
}
