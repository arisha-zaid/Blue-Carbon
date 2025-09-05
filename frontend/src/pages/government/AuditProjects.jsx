// src/pages/government/AuditProjects.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import { getProjects, updateProjectStatus } from "../../store/projects";
import { Search, Filter, CheckCircle2, XCircle, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_OPTIONS = [
  "All",
  "Pending MRV",
  "MRV Complete",
  "Approved",
  "Blockchain Anchored",
];

export default function AuditProjects() {
  const { addNotification } = useNotification();
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending MRV");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesStatus =
        statusFilter === "All" ? true : (p.status || "").includes(statusFilter);
      const matchesQuery =
        !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.type || "").toLowerCase().includes(q) ||
        (p.location || "").toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [projects, statusFilter, query]);

  const markMRVComplete = (id) => {
    const updated = updateProjectStatus(id, "MRV Complete");
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    addNotification("Marked MRV Complete ✅", "success");
  };

  const approveProject = (id) => {
    const updated = updateProjectStatus(id, "Approved");
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    addNotification("Project Approved ✅", "success");
  };

  const requestChanges = (id) => {
    const updated = updateProjectStatus(id, "Pending MRV");
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    addNotification("Requested Changes ↩️ (back to Pending MRV)", "info");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Audit Projects</h1>
          <p className="text-gray-600 mt-1">
            Review MRV, approve projects, or request changes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, type, location"
              className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Pred. CO₂ (t/yr)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-500">
                  No projects match your filter.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.id}</div>
                  </td>
                  <td className="py-3 px-4">{p.type}</td>
                  <td className="py-3 px-4">{p.location}</td>
                  <td className="py-3 px-4">{p.predictedCO2 ?? "-"}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        to={`/project/${p.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-100 text-sm"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" /> View
                      </Link>

                      {p.status === "Pending MRV" && (
                        <button
                          onClick={() => markMRVComplete(p.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:brightness-110 text-sm"
                          title="Mark MRV Complete"
                        >
                          <CheckCircle2 className="w-4 h-4" /> MRV
                        </button>
                      )}

                      {p.status === "MRV Complete" && (
                        <>
                          <button
                            onClick={() => approveProject(p.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 text-white hover:brightness-110 text-sm"
                            title="Approve Project"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => requestChanges(p.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 text-white hover:brightness-110 text-sm"
                            title="Request Changes"
                          >
                            <XCircle className="w-4 h-4" /> Changes
                          </button>
                        </>
                      )}
                    </div>
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