// src/pages/government/ReportsAnalytics.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getProjects } from "../../store/projects";
import { Download, Filter } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#16a34a",
  "#22c55e",
  "#15803d",
  "#65a30d",
  "#0ea5e9",
  "#f97316",
];

const STATUS_ORDER = [
  "Pending",
  "Pending MRV",
  "MRV Complete",
  "Approved",
  "Blockchain Anchored",
  "Monitoring",
];

export default function ReportsAnalytics() {
  const [projects, setProjects] = useState([]);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Load projects asynchronously to avoid setting a Promise into state
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getProjects();
        if (mounted) setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        if (mounted) setProjects([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const allTypes = useMemo(() => {
    const s = new Set(projects.map((p) => p.type).filter(Boolean));
    return ["All", ...Array.from(s)];
  }, [projects]);

  const allStatuses = useMemo(() => {
    const s = new Set(projects.map((p) => p.status).filter(Boolean));
    // Keep a consistent order
    const ordered = STATUS_ORDER.filter((st) => s.has(st));
    const rest = Array.from(s).filter((st) => !ordered.includes(st));
    return ["All", ...ordered, ...rest];
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchType = typeFilter === "All" ? true : p.type === typeFilter;
      const matchStatus =
        statusFilter === "All" ? true : (p.status || "") === statusFilter;
      return matchType && matchStatus;
    });
  }, [projects, typeFilter, statusFilter]);

  // Aggregations
  const totals = useMemo(() => {
    const total = filtered.length;
    const approved = filtered.filter((p) => p.status === "Approved").length;
    const anchored = filtered.filter((p) =>
      (p.status || "").includes("Blockchain")
    ).length;
    const totalCO2 = filtered.reduce(
      (acc, p) => acc + (p.predictedCO2 || 0),
      0
    );
    return { total, approved, anchored, totalCO2 };
  }, [filtered]);

  const typeDistribution = useMemo(() => {
    const map = new Map();
    filtered.forEach((p) => {
      const key = p.type || "Unknown";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const statusDistribution = useMemo(() => {
    const map = new Map();
    filtered.forEach((p) => {
      const key = p.status || "Unknown";
      map.set(key, (map.get(key) || 0) + 1);
    });
    // keep a stable order
    const ordered = STATUS_ORDER.filter((st) => map.has(st)).map((st) => ({
      name: st,
      value: map.get(st),
    }));
    const rest = Array.from(map.entries())
      .filter(([name]) => !STATUS_ORDER.includes(name))
      .map(([name, value]) => ({ name, value }));
    return [...ordered, ...rest];
  }, [filtered]);

  const exportCSV = () => {
    const headers = [
      "id",
      "name",
      "type",
      "location",
      "predictedCO2",
      "riskLevel",
      "status",
      "createdAt",
      "txId",
    ];
    const rows = filtered.map((p) =>
      [
        p.id,
        safe(p.name),
        safe(p.type),
        safe(p.location),
        p.predictedCO2 ?? "",
        safe(p.riskLevel),
        safe(p.status),
        p.createdAt ?? "",
        safe(p.txId),
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "government-reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    // <div className="space-y-6">
    //   {/* Header */}
    //   <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    //     <div>
    //       <h1 className="text-3xl font-bold">Reports & Analytics</h1>
    //       <p className="text-gray-600 mt-1">
    //         Project insights, distributions, and registry performance.
    //       </p>
    //     </div>
    //     <div className="flex items-center gap-3">
    //       <button
    //         onClick={exportCSV}
    //         className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90"
    //       >
    //         <Download className="w-4 h-4" /> Export CSV
    //       </button>
    //     </div>
    //   </header>

    //   {/* Filters */}
    //   <div className="flex flex-col md:flex-row md:items-center gap-3">
    //     <div className="flex items-center gap-2">
    //       <Filter className="w-4 h-4 text-gray-600" />
    //       <select
    //         value={typeFilter}
    //         onChange={(e) => setTypeFilter(e.target.value)}
    //         className="py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
    //       >
    //         {allTypes.map((t) => (
    //           <option key={t} value={t}>
    //             {t}
    //           </option>
    //         ))}
    //       </select>
    //     </div>
    //     <div className="flex items-center gap-2">
    //       <Filter className="w-4 h-4 text-gray-600" />
    //       <select
    //         value={statusFilter}
    //         onChange={(e) => setStatusFilter(e.target.value)}
    //         className="py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
    //       >
    //         {allStatuses.map((s) => (
    //           <option key={s} value={s}>
    //             {s}
    //           </option>
    //         ))}
    //       </select>
    //     </div>
    //   </div>

    //   {/* KPIs */}
    //   <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
    //     <KPI title="Total Projects" value={totals.total} />
    //     <KPI title="Total Pred. CO₂ (t/yr)" value={totals.totalCO2} />
    //     <KPI title="Approved" value={totals.approved} />
    //     <KPI title="Anchored On-Chain" value={totals.anchored} />
    //   </section>

    //   {/* Charts */}
    //   <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    //     <div className="bg-white rounded-2xl shadow p-6">
    //       <h3 className="font-semibold text-gray-800 mb-4">Project Types</h3>
    //       <ResponsiveContainer width="100%" height={280}>
    //         <PieChart>
    //           <Pie data={typeDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
    //             {typeDistribution.map((_, i) => (
    //               <Cell key={i} fill={COLORS[i % COLORS.length]} />
    //             ))}
    //           </Pie>
    //           <Tooltip />
    //         </PieChart>
    //       </ResponsiveContainer>
    //     </div>

    //     <div className="bg-white rounded-2xl shadow p-6">
    //       <h3 className="font-semibold text-gray-800 mb-4">Project Status</h3>
    //       <ResponsiveContainer width="100%" height={280}>
    //         <BarChart data={statusDistribution}>
    //           <XAxis dataKey="name" />
    //           <YAxis allowDecimals={false} />
    //           <Tooltip />
    //           <Bar dataKey="value" fill="#16a34a" />
    //         </BarChart>
    //       </ResponsiveContainer>
    //     </div>
    //   </section>

    //   {/* Table */}
    //   <div className="bg-white rounded-2xl shadow overflow-hidden">
    //     <table className="w-full text-left">
    //       <thead className="bg-gray-50 text-gray-600 text-sm">
    //         <tr>
    //           <th className="py-3 px-4">Project</th>
    //           <th className="py-3 px-4">Type</th>
    //           <th className="py-3 px-4">Location</th>
    //           <th className="py-3 px-4">Pred. CO₂ (t/yr)</th>
    //           <th className="py-3 px-4">Status</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {filtered.length === 0 ? (
    //           <tr>
    //             <td colSpan={5} className="py-10 text-center text-gray-500">
    //               No data for selected filters.
    //             </td>
    //           </tr>
    //         ) : (
    //           filtered.map((p) => (
    //             <tr key={p.id} className="border-t">
    //               <td className="py-3 px-4">
    //                 <div className="font-semibold text-gray-900">{p.name}</div>
    //                 <div className="text-xs text-gray-500">{p.id}</div>
    //               </td>
    //               <td className="py-3 px-4">{p.type}</td>
    //               <td className="py-3 px-4">{p.location}</td>
    //               <td className="py-3 px-4">{p.predictedCO2 ?? "-"}</td>
    //               <td className="py-3 px-4">
    //                 <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
    //                   {p.status}
    //                 </span>
    //               </td>
    //             </tr>
    //           ))
    //         )}
    //       </tbody>
    //     </table>
    //   </div>
    // </div>

    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-gray-400 mt-1">
            Project insights, distributions, and registry performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#121212] text-gray-200 border border-gray-700
          hover:border-teal-500 hover:shadow-[0px_0px_10px_#14b8a6]"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-2 px-3 rounded-lg border border-gray-700 bg-[#121212] text-gray-200
          focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0px_0px_10px_#14b8a6]"
          >
            {allTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-lg border border-gray-700 bg-[#121212] text-gray-200
          focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0px_0px_10px_#14b8a6]"
          >
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPI title="Total Projects" value={totals.total} />
        <KPI title="Total Pred. CO₂ (t/yr)" value={totals.totalCO2} />
        <KPI title="Approved" value={totals.approved} />
        <KPI title="Anchored On-Chain" value={totals.anchored} />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-700 p-6 hover:border-teal-500 hover:shadow-[0px_0px_12px_#14b8a6] transition">
          <h3 className="font-semibold text-gray-200 mb-4">Project Types</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label
              >
                {typeDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#121212",
                  border: "1px solid #14b8a6",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-700 p-6 hover:border-teal-500 hover:shadow-[0px_0px_12px_#14b8a6] transition">
          <h3 className="font-semibold text-gray-200 mb-4">Project Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusDistribution}>
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis allowDecimals={false} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#121212",
                  border: "1px solid #14b8a6",
                  color: "#fff",
                }}
              />
              <Bar dataKey="value" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Table */}
      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-gray-200">
          <thead className="bg-[#121212] text-gray-400 text-sm">
            <tr>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Pred. CO₂ (t/yr)</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500">
                  No data for selected filters.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-gray-700 hover:bg-[#222222] transition"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.id}</div>
                  </td>
                  <td className="py-3 px-4">{p.type}</td>
                  <td className="py-3 px-4">{p.location}</td>
                  <td className="py-3 px-4">{p.predictedCO2 ?? "-"}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full bg-[#093b37] text-teal-400 text-xs border border-teal-500">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <div
      className="bg-[#1a1a1a] rounded-2xl border border-gray-700 shadow p-6 
     hover:border-teal-500 hover:shadow-[0px_0px_12px_#14b8a6] transition"
    >
      <div className="text-sm text-gray-400">{title}</div>
      <div className="mt-1 text-3xl font-bold text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

// Helpers
function safe(v) {
  if (v === null || v === undefined) return "";
  const s = String(v).replaceAll('"', '""');
  return `"${s}"`;
}
