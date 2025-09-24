// src/pages/dashboard/Leaderboard.jsx
import React, { useMemo, useState } from "react";
import { Trophy, Search, Filter, Crown, ArrowUpRight, Medal } from "lucide-react";

const MOCK = [
  { id: "T-001", name: "Mangrove Guardians", type: "Community", co2: 2470, projects: 12, rank: 1, change: +2 },
  { id: "T-002", name: "Seagrass Protectors", type: "NGO", co2: 1920, projects: 9, rank: 2, change: 0 },
  { id: "T-003", name: "Coastal Green Warriors", type: "NGO", co2: 1780, projects: 8, rank: 3, change: -1 },
  { id: "T-004", name: "Delta Blue Youth", type: "Community", co2: 1540, projects: 7, rank: 4, change: +3 },
  { id: "T-005", name: "Urban Estuary Labs", type: "NGO", co2: 1330, projects: 6, rank: 5, change: +1 },
  { id: "T-006", name: "Harbor Mangrove Co", type: "Industry", co2: 1210, projects: 5, rank: 6, change: -2 },
  { id: "T-007", name: "Blue Coast Rangers", type: "Community", co2: 980, projects: 4, rank: 7, change: 0 },
  { id: "T-008", name: "Seaside Youth Circle", type: "Community", co2: 860, projects: 3, rank: 8, change: +1 },
  { id: "T-009", name: "Wetland Labs East", type: "NGO", co2: 830, projects: 3, rank: 9, change: 0 },
  { id: "T-010", name: "Green Delta Trust", type: "NGO", co2: 790, projects: 3, rank: 10, change: -1 },
];

const TYPES = ["All", "Community", "NGO", "Industry"];
const PERIODS = ["This Month", "Last 3M", "YTD", "All Time"];

export default function Leaderboard() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [period, setPeriod] = useState("This Month");
  const [sortBy, setSortBy] = useState("co2_desc"); // co2_desc | projects_desc | rank_asc

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = MOCK.filter(
      (r) =>
        (type === "All" ? true : r.type === type) &&
        (!q || r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
    );
    if (sortBy === "co2_desc") list.sort((a, b) => b.co2 - a.co2);
    if (sortBy === "projects_desc") list.sort((a, b) => b.projects - a.projects);
    if (sortBy === "rank_asc") list.sort((a, b) => a.rank - b.rank);
    return list;
  }, [query, type, sortBy]);

  const leader = filtered[0];
  const maxCO2 = Math.max(...filtered.map((r) => r.co2), 1);

  return (

<div className="space-y-8 px-8 py-6 bg-[#111] min-h-screen text-gray-200">
  {/* Header */}
  <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold text-teal-400">Leaderboard</h1>
      <p className="text-gray-400 mt-1">
        Celebrate top contributors by CO₂ credits earned and project impact.
      </p>
    </div>
  </header>

  {/* Podium */}
  <section className="relative rounded-2xl bg-[#1a1a1a] border border-gray-700  overflow-hidden">
    <div className="p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="hidden md:block">
          <Crown className="w-12 h-12 text-teal-400 " />
        </div>
        <div className="flex-1">
          <div className="text-sm text-teal-400 font-semibold">Top Team</div>
          <div className="mt-1 text-2xl font-extrabold text-white">
            {leader?.name || "—"}
          </div>
          <div className="text-sm text-gray-400">
            Rank #{leader?.rank} • {leader?.type} • {leader?.projects} projects
          </div>

          <div className="mt-4 w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-2 bg-teal-400"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((leader?.co2 / maxCO2) * 100)
                )}%`,
              }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-300">
            CO₂ Earned:{" "}
            <span className="font-semibold">{leader?.co2?.toLocaleString()} t</span>
            {leader?.change !== undefined && (
              <span
                className={`inline-flex items-center gap-1 ml-2 ${
                  leader.change >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                {leader.change >= 0 ? `+${leader.change}` : leader.change} ranks
              </span>
            )}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Trophy className="w-8 h-8 text-teal-400" />
          <div className="text-teal-300 font-semibold">Champion</div>
        </div>
      </div>
    </div>
  </section>

  {/* Toolbar */}
  <div className="bg-[#1a1a1a] rounded-2xl border border-gray-700  transition p-4 flex flex-col md:flex-row md:items-center gap-3">
    <div className="relative flex-1">
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search team or id"
        className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0f0f0f] border border-gray-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-gray-500 transition"
      />
    </div>

    {[
      ["Type", type, TYPES, setType],
      ["Period", period, PERIODS, setPeriod],
      ["Sort", sortBy, ["co2_desc", "projects_desc", "rank_asc"], setSortBy],
    ].map(([label, value, options, setter], i) => (
      <div key={i} className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={value}
          onChange={(e) => setter(e.target.value)}
          className="py-2 px-3 rounded-lg bg-[#0f0f0f] border border-gray-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-gray-200 transition"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    ))}
  </div>

  {/* List */}
  <section className="bg-[#1a1a1a] rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-[#111] text-gray-400 text-sm">
        <tr>
          <th className="py-3 px-4">Rank</th>
          <th className="py-3 px-4">Team</th>
          <th className="py-3 px-4">Type</th>
          <th className="py-3 px-4">Projects</th>
          <th className="py-3 px-4">CO₂ Credits (t)</th>
          <th className="py-3 px-4">Progress</th>
        </tr>
      </thead>
      <tbody>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan={6} className="py-10 text-center text-gray-500">
              No teams found.
            </td>
          </tr>
        ) : (
          filtered.map((r, idx) => (
            <tr
              key={r.id}
              className="border border-gray-700 hover:border-teal-600 hover:shadow-[0_0_10px_teal-700] transition duration-300 hover:bg-[#222] "
            >
              <td className="py-3 px-4 font-semibold text-white">#{r.rank}</td>
              <td className="py-3 px-4">
                <div className="font-semibold text-white">{r.name}</div>
                <div className="text-xs text-gray-500">{r.id}</div>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    r.type === "Community"
                      ? "bg-teal-900/40 text-teal-300"
                      : r.type === "NGO"
                      ? "bg-cyan-900/40 text-cyan-300"
                      : "bg-violet-900/40 text-violet-300"
                  }`}
                >
                  {r.type}
                </span>
              </td>
              <td className="py-3 px-4">{r.projects}</td>
              <td className="py-3 px-4">{r.co2.toLocaleString()}</td>
              <td className="py-3 px-4">
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-2 ${
                      idx === 0
                        ? "bg-teal-400"
                        : idx <= 2
                        ? "bg-teal-300"
                        : "bg-teal-200"
                    }`}
                    style={{
                      width: `${Math.round((r.co2 / maxCO2) * 100)}%`,
                    }}
                  />
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </section>

  {/* Badges */}

 <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {[
    { title: "Gold Badge", desc: "Top 1% contributors this period.", color: "oklch(76.9% 0.188 70.08)" },
    { title: "Silver Badge", desc: "Top 5% by verified CO₂.", color: "oklch(55.2% 0.016 285.938)" },
    { title: "Community Star", desc: "Outstanding community impact.", color: "oklch(28.6% 0.066 53.813)" },
  ].map((b, i) => (
    <div
      key={i}
      className="rounded-2xl bg-[#1a1a1a] border transition p-4 flex items-center gap-3"
      style={{
        borderColor: b.color,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 10px 3px ${b.color}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <Medal className="w-6 h-6" style={{ color: b.color }} />
      <div>
        <div className="font-semibold text-white">{b.title}</div>
        <div className="text-sm text-gray-400">{b.desc}</div>
      </div>
    </div>
  ))}
</section>
</div>

  );
}