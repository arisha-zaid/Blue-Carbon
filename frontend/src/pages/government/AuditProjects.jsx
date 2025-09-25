// src/pages/government/AuditProjects.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import { useUser } from "../../context/UserContext";
import apiService from "../../services/api";
import { getProjects, updateProject } from "../../store/projects";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldCheck,
  Link as LinkIcon,
  Download,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_OPTIONS = [
  "All",
  "Pending MRV",
  "MRV Complete",
  "Approved",
  "Blockchain Anchored",
  "Certificate Issued",
];

export default function AuditProjects() {
  const { addNotification } = useNotification();
  const { role } = useUser();
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending MRV");
  const [query, setQuery] = useState("");

  // Load projects from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getProjects();
        const projectList = Array.isArray(data) ? data : [];
        if (mounted) setProjects(projectList);
      } catch (err) {
        if (mounted) setProjects([]);
      }
    })();
    return () => {
      mounted = false;
    };
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

  const markMRVComplete = async (id) => {
    try {
      const updated = await updateProject(id, { status: "MRV Complete" });
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      addNotification("Marked MRV Complete ✅", "success");
    } catch (e) {
      addNotification("Failed to mark MRV Complete", "error");
    }
  };

  const markPendingMRV = async (id) => {
    try {
      const updated = await updateProject(id, { status: "Pending MRV" });
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      addNotification("Project moved to Pending MRV 📋", "success");
    } catch (e) {
      addNotification("Failed to mark Pending MRV", "error");
    }
  };

  const approveProject = async (id) => {
    try {
      const updated = await updateProject(id, { status: "Approved" });
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      addNotification("Project Approved ✅", "success");
    } catch (e) {
      addNotification("Failed to approve project", "error");
    }
  };

  const requestChanges = async (id) => {
    try {
      const updated = await updateProject(id, { status: "Pending MRV" });
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      addNotification("Requested Changes ↩️ (back to Pending MRV)", "info");
    } catch (e) {
      addNotification("Failed to request changes", "error");
    }
  };

  const anchorToBlockchain = async (id) => {
    try {
      const updated = await updateProject(id, {
        status: "Blockchain Anchored",
        blockchainHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock blockchain hash
        anchoredAt: new Date().toISOString(),
      });
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      addNotification("Project anchored to blockchain 🔗", "success");
    } catch (e) {
      addNotification("Failed to anchor to blockchain", "error");
    }
  };

  const issueCertificate = async (id) => {
    try {
      const updated = await updateProject(id, {
        status: "Certificate Issued",
        certificateId: `CERT-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 8)}`,
        certificateIssuedAt: new Date().toISOString(),
      });
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      addNotification("Certificate issued successfully 🏆", "success");
    } catch (e) {
      addNotification("Failed to issue certificate", "error");
    }
  };

  const downloadCertificate = async (project) => {
    try {
      // Create a mock certificate content
      const certificateContent = {
        projectId: project.id,
        projectName: project.name,
        projectType: project.type,
        location: project.location,
        predictedCO2: project.predictedCO2,
        certificateId: project.certificateId || `CERT-${project.id}`,
        issuedAt: project.certificateIssuedAt || new Date().toISOString(),
        blockchainHash: project.blockchainHash,
        issuer: "Government Carbon Authority",
        status: "Certified Blue Carbon Project",
      };

      // Create and download the certificate as JSON (in a real app, this would be a PDF)
      const blob = new Blob([JSON.stringify(certificateContent, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${project.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addNotification("Certificate downloaded successfully 📄", "success");
    } catch (e) {
      addNotification("Failed to download certificate", "error");
    }
  };

  return (
    // <div className="space-y-6">
    //   <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    //     <div>
    //       <h1 className="text-3xl font-bold">Audit Projects</h1>
    //       <p className="text-gray-600 mt-1">
    //         Review MRV, approve projects, or request changes.
    //       </p>
    //     </div>
    //     <div className="flex items-center gap-3">
    //       <div className="relative">
    //         <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
    //         <input
    //           value={query}
    //           onChange={(e) => setQuery(e.target.value)}
    //           placeholder="Search by name, type, location"
    //           className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
    //         />
    //       </div>
    //       <div className="flex items-center gap-2">
    //         <Filter className="w-4 h-4 text-gray-600" />
    //         <select
    //           value={statusFilter}
    //           onChange={(e) => setStatusFilter(e.target.value)}
    //           className="py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
    //         >
    //           {STATUS_OPTIONS.map((s) => (
    //             <option key={s} value={s}>
    //               {s}
    //             </option>
    //           ))}
    //         </select>
    //       </div>
    //     </div>
    //   </header>

    //   <div className="bg-white rounded-2xl shadow overflow-hidden">
    //     <table className="w-full text-left">
    //       <thead className="bg-gray-50 text-gray-600 text-sm">
    //         <tr>
    //           <th className="py-3 px-4">Project</th>
    //           <th className="py-3 px-4">Type</th>
    //           <th className="py-3 px-4">Location</th>
    //           <th className="py-3 px-4">Pred. CO₂ (t/yr)</th>
    //           <th className="py-3 px-4">Status</th>
    //           <th className="py-3 px-4 text-right">Actions</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {filtered.length === 0 ? (
    //           <tr>
    //             <td colSpan={6} className="py-10 text-center text-gray-500">
    //               No projects match your filter.
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
    //               <td className="py-3 px-4">
    //                 <div className="flex items-center gap-2 justify-end">
    //                   <Link
    //                     to={`/project/${p.id}`}
    //                     className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-100 text-sm"
    //                     title="View Details"
    //                   >
    //                     <Eye className="w-4 h-4" /> View
    //                   </Link>

    //                   {p.status === "Pending MRV" && (
    //                     <button
    //                       onClick={() => markMRVComplete(p.id)}
    //                       className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:brightness-110 text-sm"
    //                       title="Mark MRV Complete"
    //                     >
    //                       <CheckCircle2 className="w-4 h-4" /> MRV
    //                     </button>
    //                   )}

    //                   {p.status === "MRV Complete" && (
    //                     <>
    //                       <button
    //                         onClick={() => approveProject(p.id)}
    //                         className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 text-white hover:brightness-110 text-sm"
    //                         title="Approve Project"
    //                       >
    //                         <CheckCircle2 className="w-4 h-4" /> Approve
    //                       </button>
    //                       <button
    //                         onClick={() => requestChanges(p.id)}
    //                         className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 text-white hover:brightness-110 text-sm"
    //                         title="Request Changes"
    //                       >
    //                         <XCircle className="w-4 h-4" /> Changes
    //                       </button>
    //                     </>
    //                   )}
    //                 </div>
    //               </td>
    //             </tr>
    //           ))
    //         )}
    //       </tbody>
    //     </table>
    //   </div>
    // </div>

    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Projects</h1>
          <p className="text-gray-400 mt-1">
            Review MRV, approve projects, or request changes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, type, location"
              className="pl-9 pr-3 py-2 rounded-lg border border-gray-700 bg-[#121212] text-gray-200 
            placeholder-gray-500 focus:outline-none 
            hover:border-teal-500 hover:shadow-[0px_0px_10px_#14b8a6]
            focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0px_0px_10px_#14b8a6]
            transition duration-300 w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 rounded-lg border border-gray-700 bg-[#121212] text-gray-200 
            focus:outline-none hover:border-teal-500 hover:shadow-[0px_0px_10px_#14b8a6]
            focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0px_0px_10px_#14b8a6]
            transition duration-300"
            >
              {STATUS_OPTIONS.map((s) => (
                <option
                  key={s}
                  value={s}
                  className="bg-[#121212] text-gray-200"
                >
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-700 shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#181818] text-gray-400 text-sm">
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
                <tr
                  key={p.id}
                  className="border-t border-gray-700 hover:bg-[#222222] transition"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.id}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{p.type}</td>
                  <td className="py-3 px-4 text-gray-300">{p.location}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {p.predictedCO2 ?? "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full bg-teal-900/40 text-teal-400 text-xs border border-teal-500">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        to={`/project/${p.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-600 text-gray-300 hover:border-teal-500 hover:shadow-[0px_0px_10px_#14b8a6] text-sm transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" /> View
                      </Link>

                      {p.status === "draft" && (
                        <button
                          onClick={() => markPendingMRV(p.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:brightness-110 text-sm transition"
                          title="Move to Pending MRV"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Start MRV
                        </button>
                      )}

                      {p.status === "Pending MRV" && (
                        <button
                          onClick={() => markMRVComplete(p.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:brightness-110 text-sm transition"
                          title="Mark MRV Complete"
                        >
                          <CheckCircle2 className="w-4 h-4" /> MRV Complete
                        </button>
                      )}

                      {p.status === "MRV Complete" && (
                        <>
                          <button
                            onClick={() => approveProject(p.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 text-white hover:brightness-110 text-sm transition"
                            title="Approve Project"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => requestChanges(p.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 text-white hover:brightness-110 text-sm transition"
                            title="Request Changes"
                          >
                            <XCircle className="w-4 h-4" /> Changes
                          </button>
                        </>
                      )}

                      {p.status === "Approved" && (
                        <>
                          <button
                            onClick={() => anchorToBlockchain(p.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 text-white hover:brightness-110 text-sm transition"
                            title="Anchor to Blockchain"
                          >
                            <LinkIcon className="w-4 h-4" /> Blockchain
                          </button>
                          <button
                            onClick={() => requestChanges(p.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 text-white hover:brightness-110 text-sm transition"
                            title="Request Changes"
                          >
                            <XCircle className="w-4 h-4" /> Changes
                          </button>
                        </>
                      )}

                      {p.status === "Blockchain Anchored" && (
                        <>
                          <button
                            onClick={() => issueCertificate(p.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:brightness-110 text-sm transition"
                            title="Issue Certificate"
                          >
                            <Award className="w-4 h-4" /> Issue Certificate
                          </button>
                          <button
                            onClick={() => requestChanges(p.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 text-white hover:brightness-110 text-sm transition"
                            title="Request Changes"
                          >
                            <XCircle className="w-4 h-4" /> Changes
                          </button>
                        </>
                      )}

                      {p.status === "Certificate Issued" && (
                        <button
                          onClick={() => downloadCertificate(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-600 text-white hover:brightness-110 text-sm transition"
                          title="Download Certificate"
                        >
                          <Download className="w-4 h-4" /> Download Certificate
                        </button>
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
