// src/pages/dashboard/DashboardHome.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Leaf,
  BarChart3,
  Trophy,
  Rocket,
  PlusCircle,
  LineChart as LineIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const KPI = ({ title, value, sub, icon, color }) => (
  <div className="bg-white rounded-2xl shadow p-6">
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`p-2 rounded-lg text-white ${color}`}>{icon}</div>
    </div>
    <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
    <div className="mt-2 text-sm text-emerald-600">{sub}</div>
  </div>
);

const Bar = ({ pct, label, color = "bg-emerald-600" }) => (
  <div>
    <div className="flex items-center justify-between text-sm text-gray-600 mb-1 ">
      <span>{label}</span>
      <span className="font-medium text-gray-900">{pct}%</span>
    </div>
    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
      <div
        className={`h-full ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  </div>
);

const carbonTrend = [
  { m: "Jan", t: 220 },
  { m: "Feb", t: 260 },
  { m: "Mar", t: 310 },
  { m: "Apr", t: 340 },
  { m: "May", t: 390 },
  { m: "Jun", t: 420 },
  { m: "Jul", t: 470 },
  { m: "Aug", t: 520 },
  { m: "Sep", t: 580 },
  { m: "Oct", t: 640 },
  { m: "Nov", t: 710 },
  { m: "Dec", t: 790 },
];

const revenueTrend = [
  { m: "Jan", v: 3800 },
  { m: "Feb", v: 5200 },
  { m: "Mar", v: 6100 },
  { m: "Apr", v: 6900 },
  { m: "May", v: 7600 },
  { m: "Jun", v: 9100 },
  { m: "Jul", v: 9900 },
  { m: "Aug", v: 11200 },
  { m: "Sep", v: 12100 },
  { m: "Oct", v: 13700 },
  { m: "Nov", v: 14900 },
  { m: "Dec", v: 16200 },
];

const recentProjects = [
  {
    id: "PRJ-127",
    name: "Mangrove Revival – Delta",
    type: "Mangroves",
    size: 210,
    co2: 650,
    status: "Blockchain Anchored",
  },
  {
    id: "PRJ-131",
    name: "Seagrass Bloom – West",
    type: "Seagrass",
    size: 120,
    co2: 310,
    status: "Approved",
  },
  {
    id: "PRJ-140",
    name: "Wetland Horizon – Estuary",
    type: "Wetlands",
    size: 330,
    co2: 720,
    status: "MRV Complete",
  },
];

export default function DashboardHome() {
  const kpis = useMemo(
    () => [
      {
        title: "Total Projects",
        value: "24",
        sub: "+3 this month",
        icon: <Leaf className="w-5 h-5" />,
        color: "bg-emerald-600",
      },
      {
        title: "CO₂ Credits Earned",
        value: "12,470 t",
        sub: "+1,560 this month",
        icon: <Flame className="w-5 h-5" />,
        color: "bg-amber-600",
      },
      {
        title: "Anchored On-Chain",
        value: "16",
        sub: "+4 this month",
        icon: <Rocket className="w-5 h-5" />,
        color: "bg-indigo-600",
      },
      {
        title: "Leaderboard Rank",
        value: "#3",
        sub: "Top 5% this quarter",
        icon: <Trophy className="w-5 h-5" />,
        color: "bg-violet-600",
      },
    ],
    []
  );

  return (
    // <div className="space-y-8">
    //   {/* Hero */}
    //   <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border">
    //     <div className="p-6 md:p-8">
    //       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
    //         <div>
    //           <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
    //             Welcome back! Grow your Blue Carbon impact.
    //           </h1>
    //           <p className="mt-2 text-gray-600 max-w-2xl">
    //             Track carbon gains, approve MRV milestones, and anchor credits transparently.
    //           </p>
    //           <div className="mt-5 flex flex-wrap items-center gap-3">
    //             <Link
    //               to="/add-project"
    //               className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90"
    //             >
    //               <PlusCircle className="w-4 h-4" /> Add Project
    //             </Link>
    //             <Link
    //               to="/leaderboard"
    //               className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700 hover:bg-white/60"
    //             >
    //               <BarChart3 className="w-4 h-4" /> View Leaderboard
    //             </Link>
    //           </div>
    //         </div>

    //         {/* Progress mini panel */}
    //         <div className="bg-white/70 backdrop-blur rounded-2xl border p-5 w-full max-w-md">
    //           <div className="font-semibold text-gray-900 mb-3">Quarter Progress</div>
    //           <div className="space-y-3">
    //             <Bar label="Project Pipeline" pct={72} />
    //             <Bar label="MRV Completion" pct={58} color="bg-indigo-600" />
    //             <Bar label="Anchoring Target" pct={64} color="bg-amber-600" />
    //           </div>
    //           <div className="mt-4 text-xs text-gray-500">
    //             Keep pushing! Greater MRV throughput drives faster issuance.
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </section>

    //   {/* KPIs */}
    //   <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    //     {kpis.map((k) => (
    //       <KPI key={k.title} {...k} />
    //     ))}
    //   </section>

    //   {/* Charts */}
    //   <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    //     <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
    //       <div className="flex items-center justify-between mb-4">
    //         <h3 className="font-semibold text-gray-900 flex items-center gap-2">
    //           <LineIcon className="w-5 h-5 text-emerald-600" />
    //           Annual CO₂ Gains (t)
    //         </h3>
    //         <div className="text-sm text-gray-500">Last 12 months</div>
    //       </div>
    //       <ResponsiveContainer width="100%" height={280}>
    //         <AreaChart data={carbonTrend}>
    //           <defs>
    //             <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
    //               <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
    //               <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
    //             </linearGradient>
    //           </defs>
    //           <CartesianGrid strokeDasharray="3 3" />
    //           <XAxis dataKey="m" />
    //           <YAxis />
    //           <Tooltip />
    //           <Area type="monotone" dataKey="t" stroke="#10b981" fill="url(#g1)" />
    //         </AreaChart>
    //       </ResponsiveContainer>
    //     </div>

    //     <div className="bg-white rounded-2xl shadow p-6">
    //       <div className="flex items-center justify-between mb-4">
    //         <h3 className="font-semibold text-gray-900">Estimated Revenue ($)</h3>
    //         <div className="text-sm text-gray-500">Trend</div>
    //       </div>
    //       <ResponsiveContainer width="100%" height={280}>
    //         <LineChart data={revenueTrend}>
    //           <CartesianGrid strokeDasharray="3 3" />
    //           <XAxis dataKey="m" />
    //           <YAxis />
    //           <Tooltip />
    //           <Line type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={3} dot />
    //         </LineChart>
    //       </ResponsiveContainer>
    //     </div>
    //   </section>

    //   {/* Quick actions + Recent projects */}
    //   <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    //     {/* Quick actions */}
    //     <div className="bg-white rounded-2xl shadow p-6">
    //       <div className="font-semibold text-gray-900 mb-4">Quick Actions</div>
    //       <div className="grid grid-cols-2 gap-3">
    //         <Link
    //           to="/add-project"
    //           className="rounded-xl p-4 border hover:bg-gray-50 flex flex-col items-start gap-2"
    //         >
    //           <PlusCircle className="w-5 h-5 text-emerald-600" />
    //           <div className="text-sm font-medium text-gray-900">Add Project</div>
    //           <div className="text-xs text-gray-500">Create a new registry entry</div>
    //         </Link>
    //         <Link
    //           to="/certificates"
    //           className="rounded-xl p-4 border hover:bg-gray-50 flex flex-col items-start gap-2"
    //         >
    //           <Trophy className="w-5 h-5 text-amber-600" />
    //           <div className="text-sm font-medium text-gray-900">Certificates</div>
    //           <div className="text-xs text-gray-500">Issue or download</div>
    //         </Link>
    //         <Link
    //           to="/leaderboard"
    //           className="rounded-xl p-4 border hover:bg-gray-50 flex flex-col items-start gap-2"
    //         >
    //           <BarChart3 className="w-5 h-5 text-indigo-600" />
    //           <div className="text-sm font-medium text-gray-900">Leaderboard</div>
    //           <div className="text-xs text-gray-500">See top performers</div>
    //         </Link>
    //         <Link
    //           to="/settings"
    //           className="rounded-xl p-4 border hover:bg-gray-50 flex flex-col items-start gap-2"
    //         >
    //           <Rocket className="w-5 h-5 text-violet-600" />
    //           <div className="text-sm font-medium text-gray-900">Optimize</div>
    //           <div className="text-xs text-gray-500">Tune preferences</div>
    //         </Link>
    //       </div>
    //     </div>

    //     {/* Recent projects */}
    //     <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
    //       <div className="flex items-center justify-between mb-4">
    //         <div className="font-semibold text-gray-900">Recent Projects</div>
    //         <Link to="/my-projects" className="text-sm text-emerald-700 underline">
    //           See all
    //         </Link>
    //       </div>
    //       <div className="overflow-hidden rounded-xl border">
    //         <table className="w-full text-left">
    //           <thead className="bg-gray-50 text-gray-600 text-sm">
    //             <tr>
    //               <th className="py-3 px-4">Project</th>
    //               <th className="py-3 px-4">Type</th>
    //               <th className="py-3 px-4">Size (ha)</th>
    //               <th className="py-3 px-4">Pred. CO₂ (t/yr)</th>
    //               <th className="py-3 px-4">Status</th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {recentProjects.map((p) => (
    //               <tr key={p.id} className="border-t">
    //                 <td className="py-3 px-4">
    //                   <Link to={`/project/${p.id}`} className="text-emerald-700 underline">
    //                     {p.name}
    //                   </Link>
    //                   <div className="text-xs text-gray-500">{p.id}</div>
    //                 </td>
    //                 <td className="py-3 px-4">{p.type}</td>
    //                 <td className="py-3 px-4">{p.size}</td>
    //                 <td className="py-3 px-4">{p.co2}</td>
    //                 <td className="py-3 px-4">
    //                   <span
    //                     className={`px-2 py-1 rounded-full text-xs ${
    //                       p.status === "Blockchain Anchored"
    //                         ? "bg-emerald-50 text-emerald-700"
    //                         : p.status === "Approved"
    //                         ? "bg-blue-50 text-blue-700"
    //                         : "bg-amber-50 text-amber-700"
    //                     }`}
    //                   >
    //                     {p.status}
    //                   </span>
    //                 </td>
    //               </tr>
    //             ))}
    //             {recentProjects.length === 0 && (
    //               <tr>
    //                 <td colSpan={5} className="py-8 text-center text-gray-500">
    //                   No recent activity. Add your first project!
    //                 </td>
    //               </tr>
    //             )}
    //           </tbody>
    //         </table>
    //       </div>
    //     </div>
    //   </section>
    // </div>

    <div className="space-y-8 bg-[#121110] min-h-screen text-gray-200 p-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-[#1a1a1a] border border-gray-700 hover:shadow-[0_0_10px_#2DD4BF] transition duration-300">
        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-teal-400">
                Welcome back! Grow your Blue Carbon impact.
              </h1>
              <p className="mt-2 text-gray-400 max-w-2xl">
                Track carbon gains, approve MRV milestones, and anchor credits
                transparently.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  to="/add-project"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#121110] border border-gray-700 text-teal-400 hover:shadow-[0_0_8px_#2DD4BF] transition"
                >
                  <PlusCircle className="w-4 h-4" /> Add Project
                </Link>
                <Link
                  to="/leaderboard"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-[#1a1a1a] hover:shadow-[0_0_8px_#22D3EE] transition"
                >
                  <BarChart3 className="w-4 h-4" /> View Leaderboard
                </Link>
              </div>
            </div>

            {/* Progress mini panel */}
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-5 w-full max-w-md shadow-[0_0_8px_#2DD4BF]">
              <div className="font-semibold text-teal-400 mb-3">
                Quarter Progress
              </div>
              <div className="space-y-3">
                <Bar label="Project Pipeline" pct={72} color="bg-teal-400" />
                <Bar label="MRV Completion" pct={58} color="bg-cyan-400" />
                <Bar label="Anchoring Target" pct={64} color="bg-violet-400" />
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Keep pushing! Greater MRV throughput drives faster issuance.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((k) => (
          <div
            key={k.title}
            className="flex items-center gap-4 p-6 rounded-2xl border border-gray-700 bg-[#1a1a1a] text-gray-200 transition-all duration-300"
            style={{
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 12px ${k.color}`;
              e.currentTarget.style.borderColor = k.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 0px transparent";
              e.currentTarget.style.borderColor = "#374151"; // fallback gray-700
            }}
          >
            {/* Icon */}
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full ${k.color} bg-opacity-20`}
            >
              {k.icon}
            </div>

            {/* Text */}
            <div className="flex flex-col">
              <div className="text-sm text-gray-400">{k.title}</div>
              <div className="text-xl font-bold">{k.value}</div>
              {k.sub && (
                <div className="text-xs text-gray-500 mt-1">{k.sub}</div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annual CO₂ Gains */}
        <div className="bg-[#1a1a1a] rounded-2xl shadow-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-teal-400 flex items-center gap-2">
              <LineIcon className="w-5 h-5 text-cyan-400" /> Annual CO₂ Gains
              (t)
            </h3>
            <div className="text-sm text-gray-400">Last 12 months</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={carbonTrend}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#222" strokeDasharray="3 3" />
              <XAxis dataKey="m" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2DD4BF",
                }}
              />
              <Area
                type="monotone"
                dataKey="t"
                stroke="#10b981"
                fill="url(#g1)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Estimated Revenue */}
        <div className="bg-[#1a1a1a] rounded-2xl shadow-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-teal-400">
              Estimated Revenue ($)
            </h3>
            <div className="text-sm text-gray-400">Trend</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrend}>
              <CartesianGrid stroke="#222" strokeDasharray="3 3" />
              <XAxis dataKey="m" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2DD4BF",
                }}
              />
              <Line
                type="monotone"
                dataKey="v"
                stroke="#6366f1"
                strokeWidth={3}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Quick actions + Recent projects */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="bg-[#1a1a1a] rounded-2xl shadow-lg p-6 border border-gray-700">
          <div className="font-semibold text-teal-400 mb-4">Quick Actions</div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/add-project"
              className="rounded-xl p-4 border border-gray-700 hover:shadow-[0_0_8px_#2DD4BF] flex flex-col items-start gap-2"
            >
              <PlusCircle className="w-5 h-5 text-teal-400" />
              <div className="text-sm font-medium text-gray-200">
                Add Project
              </div>
              <div className="text-xs text-gray-400">
                Create a new registry entry
              </div>
            </Link>
            <Link
              to="/certificates"
              className="rounded-xl p-4 border border-gray-700 hover:shadow-[0_0_8px_#22D3EE] flex flex-col items-start gap-2"
            >
              <Trophy className="w-5 h-5 text-amber-400" />
              <div className="text-sm font-medium text-gray-200">
                Certificates
              </div>
              <div className="text-xs text-gray-400">Issue or download</div>
            </Link>
            <Link
              to="/leaderboard"
              className="rounded-xl p-4 border border-gray-700 hover:shadow-[0_0_8px_#6366f1] flex flex-col items-start gap-2"
            >
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <div className="text-sm font-medium text-gray-200">
                Leaderboard
              </div>
              <div className="text-xs text-gray-400">See top performers</div>
            </Link>
            <Link
              to="/settings"
              className="rounded-xl p-4 border border-gray-700 hover:shadow-[0_0_8px_#8B5CF6] flex flex-col items-start gap-2"
            >
              <Rocket className="w-5 h-5 text-violet-400" />
              <div className="text-sm font-medium text-gray-200">Optimize</div>
              <div className="text-xs text-gray-400">Tune preferences</div>
            </Link>
          </div>
        </div>

        {/* Recent projects */}
        <div className="bg-[#1a1a1a] rounded-2xl shadow-lg p-6 border border-gray-700 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-teal-400">Recent Projects</div>
            <Link to="/my-projects" className="text-teal-400 text-sm underline">
              See all
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-700">
            <table className="w-full text-left">
              <thead className="bg-[#111] text-gray-400 text-sm">
                <tr>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Size (ha)</th>
                  <th className="py-3 px-4">Pred. CO₂ (t/yr)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.length > 0 ? (
                  recentProjects.map((p) => (
                    <tr
                      key={p.id}
                      className="relative border-t border-gray-700 hover:bg-[#222] group transition duration-200"
                    >
                      <td colSpan={5}>
                        <div className="absolute inset-0 border border-teal-400 opacity-0 group-hover:opacity-100 rounded-lg shadow-[0_0_10px_#2dd4bf] pointer-events-none transition duration-300"></div>
                        <div className="relative grid grid-cols-5 gap-4 py-3 px-4">
                          <div>
                            <Link
                              to={`/project/${p.id}`}
                              className="text-teal-400 underline"
                            >
                              {p.name}
                            </Link>
                            <div className="text-xs text-gray-500">{p.id}</div>
                          </div>
                          <div>{p.type}</div>
                          <div>{p.size}</div>
                          <div>{p.co2}</div>
                          <div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                p.status === "Blockchain Anchored"
                                  ? "bg-teal-400/20 text-teal-400"
                                  : p.status === "Approved"
                                  ? "bg-cyan-400/20 text-cyan-400"
                                  : "bg-amber-400/20 text-amber-400"
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No recent activity. Add your first project!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
