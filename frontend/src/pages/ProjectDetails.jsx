// src/pages/ProjectDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Timeline from "../components/Timeline";
import {
  getProjectById,
  updateProject,
  anchorProject,
  issueCertificate,
} from "../store/projects";
import { QRCodeCanvas } from "qrcode.react";
import { useNotification } from "../context/NotificationContext";
import { useUser } from "../context/UserContext";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();
  const { role } = useUser();

  useEffect(() => {
    const loadProject = async () => {
      try {
        const p = await getProjectById(id);
        if (!p) {
          navigate("/dashboard");
          return;
        }
        setProject(p);
      } catch (error) {
        addNotification("Failed to load project", "error");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [id, navigate, addNotification]);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 bg-[#0F0F0F] min-h-screen">
          <div className="max-w-5xl mx-auto">
            <div className="text-white text-center">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!project) return null;

  const markMRVComplete = async () => {
    try {
      const updated = await updateProject(project.id, {
        status: "MRV Complete",
      });
      setProject(updated);
      addNotification("Marked MRV Complete ✅", "success");
    } catch (e) {
      addNotification("Failed to mark MRV Complete", "error");
    }
  };

  const approveProject = async () => {
    try {
      const updated = await updateProject(project.id, { status: "Approved" });
      setProject(updated);
      addNotification("Project Approved ✅", "success");
    } catch (e) {
      addNotification("Failed to approve project", "error");
    }
  };

  const requestChanges = async () => {
    try {
      const updated = await updateProject(project.id, {
        status: "Pending MRV",
      });
      setProject(updated);
      addNotification("Requested Changes ↩️ (back to Pending MRV)", "info");
    } catch (e) {
      addNotification("Failed to request changes", "error");
    }
  };

  const handleAnchor = async () => {
    try {
      const updated = await anchorProject(project.id);
      setProject(updated);
      addNotification(`Mock-anchored. TxID: ${updated.txId}`, "success");
    } catch (e) {
      addNotification("Failed to anchor project", "error");
    }
  };

  const handleIssueCertificate = async () => {
    try {
      const updated = await issueCertificate(project.id);
      setProject(updated);
      addNotification(
        "Certificate status set. Visit Certificates page to download.",
        "success"
      );
    } catch (e) {
      addNotification("Failed to issue certificate", "error");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-[#0F0F0F] min-h-screen">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              <div className="text-sm text-gray-400 mt-1">
                {project.location} • {project.type}
              </div>
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-teal-900/40 text-teal-400 text-sm border border-teal-500">
                {project.status}
              </span>
            </div>
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-700 shadow">
            <Timeline currentStatus={project.status} />

            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-3">
                  Project Details
                </h3>
                <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                  {project.description || "No description available"}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-[#222222] p-4 rounded-lg border border-gray-700">
                    <div className="text-xs text-gray-500">Predicted CO₂</div>
                    <div className="text-xl font-bold text-teal-400 mt-1">
                      {project.predictedCO2} t/yr
                    </div>
                  </div>
                  <div className="bg-[#222222] p-4 rounded-lg border border-gray-700">
                    <div className="text-xs text-gray-500">Area</div>
                    <div className="text-xl font-bold text-teal-400 mt-1">
                      {project.sizeHa || 0} ha
                    </div>
                  </div>
                </div>

                {project.riskLevel && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-2">Risk Level</div>
                    <div
                      className="inline-block px-3 py-1 rounded-full text-white text-sm"
                      style={{
                        background:
                          project.riskLevel === "Low"
                            ? "#16A34A"
                            : project.riskLevel === "Medium"
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    >
                      {project.riskLevel}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-white mb-3">
                  Documents & Verification
                </h3>
                <div className="mt-3 border border-gray-700 rounded-lg p-3 bg-[#222222]">
                  {project.files?.length ? (
                    <ul className="space-y-2">
                      {project.files.map((f, i) => (
                        <li key={i} className="text-sm text-gray-300">
                          {f.name}{" "}
                          <span className="text-xs text-gray-500">
                            ({(f.size / 1024).toFixed(1)} KB)
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No documents uploaded
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <div className="text-xs text-gray-500 mb-2">
                    Blockchain Verification
                  </div>
                  {!project.txId ? (
                    <div className="text-sm text-gray-400 bg-[#222222] p-3 rounded-lg border border-gray-700">
                      Not anchored to blockchain yet
                    </div>
                  ) : (
                    <div className="bg-[#222222] p-3 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-300 break-all mb-2">
                        Tx ID: {project.txId}
                      </div>
                      <div className="flex items-center justify-between">
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={`https://example.com/tx/${project.txId}`}
                          className="text-sm text-teal-400 hover:text-teal-300 underline"
                        >
                          View on Blockchain
                        </a>
                        <QRCodeCanvas
                          value={`https://example.com/tx/${project.txId}`}
                          size={60}
                          bgColor="#222222"
                          fgColor="#ffffff"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Government Verification Actions */}
            {role === "government" && (
              <div className="mt-8 p-4 bg-[#111111] rounded-lg border border-gray-700">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-teal-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Government Verification Panel
                </h4>
                <div className="flex gap-3 flex-wrap">
                  {project.status === "Pending MRV" && (
                    <button
                      onClick={markMRVComplete}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                      title="Mark MRV Complete"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4"
                        />
                      </svg>
                      Mark MRV Complete
                    </button>
                  )}

                  {project.status === "MRV Complete" && (
                    <>
                      <button
                        onClick={approveProject}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                        title="Approve Project"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4"
                          />
                        </svg>
                        Approve Project
                      </button>
                      <button
                        onClick={requestChanges}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition"
                        title="Request Changes"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Request Changes
                      </button>
                    </>
                  )}

                  {project.status === "Approved" && (
                    <button
                      onClick={handleAnchor}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
                      title="Anchor to Blockchain"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                      Anchor to Blockchain
                    </button>
                  )}

                  {project.status === "Blockchain Anchored" && (
                    <button
                      onClick={handleIssueCertificate}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                      title="Issue Certificate"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Issue Certificate
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Project ID: {project.id} | Created:{" "}
                {new Date(project.createdAt).toLocaleDateString()}
              </div>
              <Link
                to="/dashboard"
                className="text-sm text-teal-400 hover:text-teal-300 underline"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
