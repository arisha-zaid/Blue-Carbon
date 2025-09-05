// src/pages/dashboard/MyProjects.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  MapPin,
  Leaf,
  Flame,
  CalendarDays,
  Eye,
  ArrowUpRight,
} from "lucide-react";

const TYPES = ["All", "Mangroves", "Seagrass", "Wetlands"];
const STATUSES = ["All", "Pending MRV", "MRV Complete", "Approved", "Blockchain Anchored"];

const MOCK_PROJECTS = [
  {
    id: "PRJ-127",
    name: "Mangrove Revival – Delta",
    type: "Mangroves",
    location: "Odisha, IN",
    sizeHa: 210,
    predictedCO2: 650,
    status: "Blockchain Anchored",
    createdAt: "2025-08-10",
    thumb:
      "https://images.unsplash.com/photo-1544551763-7ef420f2d07d?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "PRJ-131",
    name: "Seagrass Bloom – West",
    type: "Seagrass",
    location: "Goa, IN",
    sizeHa: 120,
    predictedCO2: 310,
    status: "Approved",
    createdAt: "2025-08-05",
    thumb:
      "https://images.unsplash.com/photo-1526666923127-b2970f64b422?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "PRJ-140",
    name: "Wetland Horizon – Estuary",
    type: "Wetlands",
    location: "Kerala, IN",
    sizeHa: 330,
    predictedCO2: 720,
    status: "MRV Complete",
    createdAt: "2025-07-29",
    thumb:
      "https://images.unsplash.com/photo-1529112431328-88da9f2e2ea8?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "PRJ-144",
    name: "Mangrove Shield – Delta North",
    type: "Mangroves",
    location: "Gujarat, IN",
    sizeHa: 180,
    predictedCO2: 560,
    status: "Pending MRV",
    createdAt: "2025-07-21",
    thumb:
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1600&auto=format&fit=crop",
  },
];

export default function MyProjects() {
  const [query, setQuery] = useState("");
  const [ptype, setPtype] = useState("All");
  const [pstatus, setPstatus] = useState("All");
  const [sortId, setSortId] = useState("date_desc"); // date_desc | co2_desc | size_desc

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = MOCK_PROJECTS.filter((p) => {
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);
      const matchT = ptype === "All" ? true : p.type === ptype;
      const matchS = pstatus === "All" ? true : p.status === pstatus;
      return matchQ && matchT && matchS;
    });
    if (sortId === "date_desc") list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sortId === "co2_desc") list.sort((a, b) => b.predictedCO2 - a.predictedCO2);
    if (sortId === "size_desc") list.sort((a, b) => b.sizeHa - a.sizeHa);
    return list;
  }, [query, ptype, pstatus, sortId]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage your registered projects with beautiful previews and quick actions.
          </p>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, id, or location"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <select
            value={ptype}
            onChange={(e) => setPtype(e.target.value)}
            className="py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <select
            value={pstatus}
            onChange={(e) => setPstatus(e.target.value)}
            className="py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <select
            value={sortId}
            onChange={(e) => setSortId(e.target.value)}
            className="py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="date_desc">Newest</option>
            <option value="co2_desc">CO₂ (desc)</option>
            <option value="size_desc">Size (desc)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-16">No projects found.</div>
        ) : (
          filtered.map((p, idx) => <ProjectCard key={p.id} p={p} idx={idx} />)
        )}
      </section>
    </div>
  );
}

function ProjectCard({ p, idx }) {
  return (
    <div className="group bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden border">
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={p.thumb}
          alt={p.name}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
        />
        <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/60 text-white text-xs inline-flex items-center gap-1">
          <Leaf className="w-3 h-3" /> {p.type}
        </span>
        <span
          className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs ${
            p.status === "Blockchain Anchored"
              ? "bg-emerald-600 text-white"
              : p.status === "Approved"
              ? "bg-blue-600 text-white"
              : p.status === "MRV Complete"
              ? "bg-indigo-600 text-white"
              : "bg-amber-500 text-white"
          }`}
        >
          {p.status}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <div className="text-xs text-gray-500">{p.id}</div>
        <div className="font-semibold text-gray-900">{p.name}</div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <Meta label="Location" value={p.location} icon={<MapPin className="w-4 h-4" />} />
          <Meta label="Size (ha)" value={p.sizeHa} icon={<Leaf className="w-4 h-4" />} />
          <Meta label="Pred. CO₂" value={`${p.predictedCO2} t/yr`} icon={<Flame className="w-4 h-4" />} />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="inline-flex items-center gap-1">
            <CalendarDays className="w-4 h-4" /> {new Date(p.createdAt).toLocaleDateString()}
          </div>
          <Link
            to={`/project/${p.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-100"
          >
            <Eye className="w-4 h-4" /> View
          </Link>
        </div>
      </div>

      {/* Footer accent */}
      <div className="px-5 pb-4">
        <div className="w-full h-1 rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-1 ${
              idx % 4 === 0
                ? "bg-emerald-500"
                : idx % 4 === 1
                ? "bg-indigo-500"
                : idx % 4 === 2
                ? "bg-amber-500"
                : "bg-violet-500"
            }`}
            style={{ width: `${Math.min(100, Math.round((p.predictedCO2 / 800) * 100))}%` }}
          />
        </div>
        <div className="mt-2 text-[11px] text-gray-500 inline-flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" />
          Estimated progress towards annual CO₂ target
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value, icon }) {
  return (
    <div>
      <div className="text-xs text-gray-500 inline-flex items-center gap-1">{icon} {label}</div>
      <div className="text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}