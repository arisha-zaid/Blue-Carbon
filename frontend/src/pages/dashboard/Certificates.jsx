// src/pages/dashboard/Certificates.jsx
import React, { useEffect, useState } from "react";
import { getProjects } from "../../store/projects";
import { useNotification } from "../../context/NotificationContext";
import {
  Award,
  Download,
  Calendar,
  MapPin,
  Leaf,
  Eye,
  CheckCircle,
} from "lucide-react";
import Certificate from "../../components/Certificate";

export default function Certificates() {
  const [projects, setProjects] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getProjects();
        // Filter only projects that have certificates issued
        const certifiedProjects = Array.isArray(data)
          ? data.filter((p) => p.status === "Certificate Issued")
          : [];
        setProjects(certifiedProjects);
      } catch (error) {
        console.error("Failed to load certificates:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const downloadCertificate = async (project) => {
    try {
      const certificateData = {
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

      // Create and download the certificate as JSON
      const blob = new Blob([JSON.stringify(certificateData, null, 2)], {
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
    } catch (error) {
      addNotification("Failed to download certificate", "error");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (selectedCertificate) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => setSelectedCertificate(null)}
            className="text-teal-600 hover:text-teal-800 font-medium"
          >
            ← Back to Certificates
          </button>
        </div>
        <Certificate
          project={selectedCertificate}
          onDownload={downloadCertificate}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">My Certificates</h1>
        <p className="text-gray-400">
          View and download your verified blue carbon project certificates
        </p>
      </header>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading certificates...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">
            No Certificates Yet
          </h3>
          <p className="text-gray-500">
            Your certificates will appear here once your projects are verified
            and approved by the government.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-6 hover:border-teal-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-teal-900/40 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Certificate ID:{" "}
                        {project.certificateId || `CERT-${project.id}`}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-300">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-500" />
                      <span className="text-gray-300">{project.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-300">
                        {formatDate(
                          project.certificateIssuedAt ||
                            new Date().toISOString()
                        )}
                      </span>
                    </div>
                  </div>

                  {project.predictedCO2 && (
                    <div className="bg-gradient-to-r from-teal-900/20 to-green-900/20 border border-teal-500/30 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-400 mb-1">
                        Estimated Annual CO₂ Absorption
                      </p>
                      <p className="text-2xl font-bold text-teal-400">
                        {project.predictedCO2} tons
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Verified & Blockchain Anchored
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setSelectedCertificate(project)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    title="View Certificate"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => downloadCertificate(project)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    title="Download Certificate"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
