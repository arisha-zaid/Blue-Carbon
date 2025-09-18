// src/pages/ProjectDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Timeline from "../components/Timeline";
import {
  getProjectById,
  updateProjectStatus,
  anchorProject,
  issueCertificate,
  updateProject,
} from "../store/projects";
import { QRCodeCanvas } from "qrcode.react";
import { useNotification } from "../context/NotificationContext";
import { useUser } from "../context/UserContext";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const { addNotification } = useNotification();
  const { role } = useUser();

  useEffect(() => {
    const p = getProjectById(id);
    if (!p) {
      // go back if not found
      navigate("/dashboard");
      return;
    }
    setProject(p);
  }, [id, navigate]);

  if (!project) return null;

  const handleMarkMRV = () => {
    const updated = updateProjectStatus(project.id, "MRV Complete");
    setProject({ ...updated });
  };

  const handleApprove = () => {
    const updated = updateProjectStatus(project.id, "Approved");
    setProject({ ...updated });
  };

  const handleAnchor = () => {
    const updated = anchorProject(project.id);
    setProject({ ...updated });
    addNotification(`Mock-anchored. TxID: ${updated.txId}`, "success");
  };

  const handleIssueCertificate = () => {
    const updated = issueCertificate(project.id);
    setProject({ ...updated });
    addNotification(
      "Certificate status set. Visit Certificates page to download.",
      "success"
    );
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1D4ED8]">
                {project.name}
              </h1>
              <div className="text-sm text-gray-600">
                {project.location} • {project.type}
              </div>
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1D4ED8] text-sm">
                {project.status}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <Timeline currentStatus={project.status} />

            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700">Details</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {project.description}
                </p>

                <div className="mt-4">
                  <div className="text-xs text-gray-500">Predicted CO₂</div>
                  <div className="text-xl font-bold text-[#16A34A]">
                    {project.predictedCO2} t/yr
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-gray-500">Risk Level</div>
                  <div
                    className="inline-block px-3 py-1 rounded-full mt-1 text-white text-sm"
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
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Uploaded Files</h3>
                <div className="mt-3 border rounded p-3 bg-[#F8FAFC]">
                  {project.files?.length ? (
                    <ul className="space-y-2">
                      {project.files.map((f, i) => (
                        <li key={i} className="text-sm text-gray-700">
                          {f.name}{" "}
                          <span className="text-xs text-gray-500">
                            ({(f.size / 1024).toFixed(1)} KB)
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No files uploaded
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-xs text-gray-500">Blockchain Proof</div>
                  {!project.txId ? (
                    <div className="text-sm text-gray-600 mt-2">
                      Not anchored yet
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-4">
                      <div className="text-sm text-gray-700 break-all">
                        {project.txId}
                      </div>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`https://example.com/tx/${project.txId}`}
                        className="text-sm text-[#1D4ED8] underline"
                      >
                        View Tx
                      </a>
                      <div className="ml-auto">
                        <QRCodeCanvas
                          value={`https://example.com/tx/${project.txId}`}
                          size={70}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              {/* Only government can perform verification workflow */}
              {project.status === "Pending MRV" && role === "government" && (
                <button
                  onClick={handleMarkMRV}
                  className="px-4 py-2 rounded-xl bg-[#1D4ED8] text-white"
                >
                  Mark MRV Complete
                </button>
              )}
              {project.status === "MRV Complete" && role === "government" && (
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 rounded-xl bg-[#16A34A] text-white"
                >
                  Approve Project
                </button>
              )}
              {project.status === "Approved" && role === "government" && (
                <button
                  onClick={handleAnchor}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white"
                >
                  Anchor to Blockchain
                </button>
              )}
              {project.status === "Blockchain Anchored" &&
                role === "government" && (
                  <button
                    onClick={handleIssueCertificate}
                    className="px-4 py-2 rounded-xl bg-purple-700 text-white"
                  >
                    Issue Certificate
                  </button>
                )}

              {/* Community role can only view certificate on Certificates page */}

              <Link
                to="/dashboard"
                className="ml-auto text-sm text-gray-600 underline"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
