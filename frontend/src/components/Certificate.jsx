// src/components/Certificate.jsx
import React from "react";
import { Award, Calendar, MapPin, Leaf, Shield, Download } from "lucide-react";

const Certificate = ({ project, onDownload }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-200 rounded-2xl p-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-4">
          <Award className="w-32 h-32 text-teal-600" />
        </div>
        <div className="absolute bottom-4 right-4">
          <Leaf className="w-24 h-24 text-green-600" />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center gap-3 mb-4">
          <Shield className="w-12 h-12 text-teal-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Blue Carbon Certificate
            </h1>
            <p className="text-lg text-gray-600">Government Carbon Authority</p>
          </div>
        </div>

        <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-blue-500 mx-auto rounded-full"></div>
      </div>

      {/* Certificate Body */}
      <div className="relative">
        <div className="text-center mb-6">
          <p className="text-lg text-gray-700 mb-2">This is to certify that</p>
          <h2 className="text-2xl font-bold text-teal-700 mb-1">
            {certificateData.projectName}
          </h2>
          <p className="text-gray-600">
            has been verified and approved as a legitimate Blue Carbon Project
          </p>
        </div>

        {/* Project Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Project Location</p>
                <p className="font-semibold text-gray-800">
                  {certificateData.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Project Type</p>
                <p className="font-semibold text-gray-800">
                  {certificateData.projectType}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Certificate ID</p>
                <p className="font-semibold text-gray-800 font-mono text-sm">
                  {certificateData.certificateId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Issue Date</p>
                <p className="font-semibold text-gray-800">{currentDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CO2 Impact */}
        {certificateData.predictedCO2 && (
          <div className="bg-gradient-to-r from-teal-100 to-green-100 rounded-lg p-6 mb-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Estimated Annual CO₂ Absorption
            </p>
            <p className="text-3xl font-bold text-teal-700">
              {certificateData.predictedCO2} tons
            </p>
            <p className="text-sm text-gray-600">
              Contributing to global climate action
            </p>
          </div>
        )}

        {/* Blockchain Verification */}
        {certificateData.blockchainHash && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">
              Blockchain Verification
            </p>
            <p className="text-xs font-mono text-gray-800 break-all">
              {certificateData.blockchainHash}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This certificate is permanently recorded on the blockchain
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-200">
          <div className="flex justify-center items-center gap-8 mb-4">
            <div className="text-center">
              <div className="w-20 h-1 bg-gray-400 mb-2 mx-auto"></div>
              <p className="text-sm text-gray-600">Authorized Signature</p>
              <p className="text-xs text-gray-500">Carbon Authority</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-1 bg-gray-400 mb-2 mx-auto"></div>
              <p className="text-sm text-gray-600">Digital Seal</p>
              <p className="text-xs text-gray-500">{currentDate}</p>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            This certificate is digitally signed and blockchain-verified. Visit
            our verification portal to authenticate this document.
          </p>
        </div>

        {/* Download Button */}
        {onDownload && (
          <div className="text-center mt-6">
            <button
              onClick={() => onDownload(certificateData)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificate;
