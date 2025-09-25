import React, { useEffect, useState } from "react";
import { getProjects } from "../store/projects";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import { CheckCircle } from "lucide-react";
import api from "../services/api";

export default function Certificates() {
  const [projects, setProjects] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        // Fetch projects and filter to those with issued certificates
        const all = await getProjects();
        if (isMounted) {
          setProjects(
            (all || []).filter(
              (p) => p.status === "Certificate Issued" || p.certificateIssued
            )
          );
        }
      } catch (e) {
        console.error("Failed to load projects for certificates:", e);
        if (isMounted) setProjects([]);
      }

      // Get signed-in user's name
      const userData = api.getUserData?.() || null;
      if (userData?.fullName || (userData?.firstName && userData?.lastName)) {
        if (isMounted) {
          setUserName(
            userData.fullName || `${userData.firstName} ${userData.lastName}`
          );
        }
      } else {
        try {
          const res = await api.getCurrentUser?.();
          if (res?.success && res.data) {
            const u = res.data;
            if (isMounted) {
              setUserName(
                u.fullName || `${u.firstName || ""} ${u.lastName || ""}`.trim()
              );
            }
          }
        } catch (err) {
          // ignore; optional enhancement
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const generatePDF = async (project) => {
    try {
      const el = document.getElementById(`cert-${project.id}`);
      if (!el) {
        console.error("Certificate preview not found.");
        return;
      }

      // Ensure element is visible during render for accurate capture
      const prevDisplay = el.style.display;
      el.style.display = "block";

      const canvas = await html2canvas(el, {
        scale: 2, // improve quality
        useCORS: true, // allow cross-origin images
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (doc) => {
          // Force white background in cloned doc
          const cloned = doc.getElementById(`cert-${project.id}`);
          if (cloned) cloned.style.background = "#ffffff";
        },
      });

      // Restore original display
      el.style.display = prevDisplay;

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1000, 707],
        compress: true,
      });
      pdf.addImage(imgData, "PNG", 0, 0, 1000, 707);
      // Use a safe filename (remove special chars)
      const safeName = (project.name || "project").replace(
        /[^a-z0-9_\-]+/gi,
        "_"
      );
      pdf.save(`certificate-${safeName}.pdf`);
    } catch (err) {
      console.error("Failed to generate certificate PDF:", err);
      alert("Failed to generate certificate. Please try again.");
    }
  };

  if (!projects.length) {
    return (
      <main className="flex-1 p-8 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Certificates</h2>
        <div className="mt-6 text-center text-gray-600 p-8 bg-white rounded-xl shadow-lg">
          <p>No issued certificates yet.</p>
        </div>
      </main>
    );
  }

  return (
    // <main className="flex-1 p-8 bg-gray-50 min-h-screen">
    //   <h2 className="text-3xl font-bold text-gray-800 mb-2">
    //     Carbon Certificates
    //   </h2>
    //   <p className="text-gray-600 mb-8">
    //     Your blockchain-verified carbon credit certificates
    //   </p>

    //   <div className="mt-6 grid md:grid-cols-2 gap-6">
    //     {projects.map((p) => (
    //       <div
    //         key={p.id}
    //         className="relative p-6 rounded-2xl shadow-xl overflow-hidden
    //             bg-gradient-to-br from-blue-500 to-green-500 transition-transform hover:scale-[1.01] duration-300"
    //       >
    //         {/* Verified Badge */}
    //         <div className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 bg-white/30 rounded-full backdrop-blur-sm">
    //           <CheckCircle size={16} className="text-white" />
    //           <span className="text-sm font-semibold text-white">Verified</span>
    //         </div>

    //         {/* Certificate Header */}
    //         <div className="relative z-10 text-white">
    //           <h3 className="text-2xl font-bold">{p.name}</h3>
    //           <div className="text-sm font-light mt-1">
    //             Certificate ID: {p.certificateId || p.id}
    //           </div>
    //         </div>

    //         {/* White area for details */}
    //         <div className="relative z-10 bg-white rounded-2xl p-6 mt-6 shadow-inner">
    //           <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-gray-700">
    //             <div>
    //               <div className="text-sm font-semibold text-gray-500">
    //                 CO₂ Credits
    //               </div>
    //               <div className="text-xl font-bold text-green-600">
    //                 {p.predictedCO2}
    //               </div>
    //             </div>
    //             <div>
    //               <div className="text-sm font-semibold text-gray-500">
    //                 Issue Date
    //               </div>
    //               <div className="text-xl font-bold">
    //                 {p.certificateAt
    //                   ? new Date(p.certificateAt).toLocaleDateString()
    //                   : "N/A"}
    //               </div>
    //             </div>
    //             <div className="col-span-2">
    //               <div className="text-sm font-semibold text-gray-500">
    //                 Blockchain Transaction
    //               </div>
    //               <a
    //                 href={`https://example.com/tx/${p.txId}`}
    //                 target="_blank"
    //                 rel="noopener noreferrer"
    //                 className="flex items-center space-x-2 text-sm text-blue-600 hover:underline"
    //               >
    //                 <span>{p.txId?.substring(0, 20)}...</span>
    //                 <i className="fas fa-external-link-alt"></i>
    //               </a>
    //             </div>
    //           </div>
    //         </div>

    //         {/* Certificate Actions */}
    //         <div className="relative z-10 flex flex-col sm:flex-row gap-4 mt-6">
    //           <button
    //             onClick={() => generatePDF(p)}
    //             className="flex items-center justify-center space-x-2 px-6 py-3 rounded-full bg-green-600 text-white font-bold transition-all hover:scale-105 hover:bg-green-700 shadow-md"
    //           >
    //             <i className="fas fa-download"></i>
    //             <span>Download PDF</span>
    //           </button>
    //         </div>

    //         {/* Hidden certificate layout for PDF generation */}
    //         <div
    //           id={`cert-${p.id}`}
    //           style={{
    //             width: 1000,
    //             height: 707,
    //             padding: 50,
    //             display: "none",
    //             background: "#f8f9fa",
    //             border: "5px solid #1D4ED8",
    //             boxSizing: "border-box",
    //             fontFamily: "sans-serif",
    //             position: "relative",
    //           }}
    //         >
    //           <div
    //             style={{
    //               position: "absolute",
    //               top: 0,
    //               left: 0,
    //               width: "100%",
    //               height: "100%",
    //               opacity: 0.1,
    //               backgroundImage: `url('https://i.imgur.com/uXj9F5e.png')`,
    //               backgroundRepeat: "no-repeat",
    //               backgroundPosition: "center",
    //               backgroundSize: "400px",
    //             }}
    //           ></div>
    //           <div
    //             style={{
    //               textAlign: "center",
    //               padding: "20px 0",
    //               borderBottom: "2px solid #e2e8f0",
    //             }}
    //           >
    //             <h1
    //               style={{
    //                 fontSize: 48,
    //                 color: "#1D4ED8",
    //                 fontWeight: 700,
    //                 letterSpacing: "-1px",
    //               }}
    //             >
    //               Certificate of Blue Carbon
    //             </h1>
    //             <p
    //               style={{
    //                 fontSize: 18,
    //                 color: "#374151",
    //                 marginTop: "10px",
    //               }}
    //             >
    //               This certifies that the below project has been recorded &
    //               anchored on-chain.
    //             </p>
    //           </div>
    //           <div style={{ marginTop: 40, textAlign: "center" }}>
    //             <p style={{ fontSize: 24, color: "#4b5563" }}>
    //               This certificate is proudly awarded to
    //             </p>
    //             <h2
    //               style={{
    //                 fontSize: 40,
    //                 color: "#1D4ED8",
    //                 fontWeight: 700,
    //                 margin: "10px 0",
    //               }}
    //             >
    //               {p.name}
    //             </h2>
    //             <div style={{ fontSize: 18, color: "#4b5563" }}>
    //               {p.location} • {p.type}
    //             </div>
    //             <div
    //               style={{ marginTop: 24, fontSize: 28, fontWeight: 600 }}
    //             >
    //               For a total of{" "}
    //               <b style={{ color: "#16A34A" }}>{p.predictedCO2} tCO₂</b> of
    //               carbon credits
    //             </div>
    //           </div>
    //           <div
    //             style={{
    //               display: "flex",
    //               justifyContent: "space-between",
    //               alignItems: "flex-end",
    //               marginTop: 60,
    //             }}
    //           >
    //             <div style={{ textAlign: "center" }}>
    //               <div style={{ width: 150, height: 150, margin: "0 auto" }}>
    //                 <QRCodeCanvas
    //                   value={`https://example.com/tx/${p.txId}`}
    //                   size={150}
    //                 />
    //               </div>
    //               <p
    //                 style={{
    //                   fontSize: 14,
    //                   color: "#4b5563",
    //                   marginTop: "10px",
    //                 }}
    //               >
    //                 Scan to verify on the blockchain
    //               </p>
    //             </div>
    //             <div style={{ textAlign: "right" }}>
    //               <p style={{ fontSize: 16, color: "#4b5563" }}>
    //                 Issued on:{" "}
    //                 {p.certificateAt
    //                   ? new Date(p.certificateAt).toLocaleDateString()
    //                   : new Date().toLocaleDateString()}
    //               </p>
    //               <p style={{ fontSize: 16, color: "#4b5563" }}>
    //                 Transaction ID: {p.txId?.substring(0, 10)}...
    //               </p>
    //               <img
    //                 src="https://i.imgur.com/f8WnJqK.png"
    //                 alt="Signature"
    //                 style={{ width: 150, marginTop: 10 }}
    //               />
    //               <p
    //                 style={{
    //                   fontSize: 16,
    //                   color: "#4b5563",
    //                   marginTop: 5,
    //                   borderTop: "1px solid #9ca3af",
    //                   paddingTop: 5,
    //                 }}
    //               >
    //                 The Carbon Registry Team
    //               </p>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // </main>
    <main className="flex-1 p-8 bg-[#121110] min-h-screen">
      <h2 className="text-3xl font-bold text-gray-100 mb-2">
        Carbon Certificates
      </h2>
      <p className="text-gray-400 mb-8">
        Your blockchain-verified carbon credit certificates
      </p>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {projects.map((p) => (
          <div
            key={p.id}
            className="relative p-6 rounded-2xl border border-gray-700 bg-[#1a1a1a] shadow-md 
          transition-all hover:border-teal-500 hover:shadow-[0_0_10px_#14b8a6]"
          >
            {/* Verified Badge */}
            <div
              className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 
          bg-teal-500/20 text-teal-400 rounded-full border border-teal-500 text-sm font-semibold"
            >
              <CheckCircle size={16} />
              <span>Verified</span>
            </div>

            {/* Certificate Header */}
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-gray-100">{p.name}</h3>
              <div className="text-sm text-gray-400 mt-1">
                Certificate ID: {p.certificateId || p.id}
              </div>
            </div>

            {/* Details */}
            <div className="relative z-10 bg-[#121110] rounded-xl p-6 mt-6 border border-gray-700 shadow-inner">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-gray-300">
                <div>
                  <div className="text-sm font-semibold text-gray-400">
                    CO₂ Credits
                  </div>
                  <div className="text-xl font-bold text-emerald-500">
                    {p.predictedCO2}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-400">
                    Issue Date
                  </div>
                  <div className="text-xl font-bold">
                    {p.certificateAt
                      ? new Date(p.certificateAt).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm font-semibold text-gray-400">
                    Blockchain Transaction
                  </div>
                  <a
                    href={`https://example.com/tx/${p.txId || "not-available"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-teal-400 hover:text-teal-300 transition"
                  >
                    <span>
                      {p.txId
                        ? `${p.txId.substring(0, 20)}...`
                        : "Not available"}
                    </span>
                    <i className="fas fa-external-link-alt"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Invisible certificate layout for PDF generation */}
            <div
              id={`cert-${p.id}`}
              style={{
                width: 1000,
                height: 707,
                padding: 50,
                display: "none",
                background: "#ffffff",
                border: "5px solid #1D4ED8",
                boxSizing: "border-box",
                fontFamily: "sans-serif",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0.08,
                  backgroundImage: `url('https://i.imgur.com/uXj9F5e.png')`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "400px",
                }}
              />

              <div
                style={{
                  textAlign: "center",
                  padding: "20px 0",
                  borderBottom: "2px solid #e2e8f0",
                }}
              >
                <h1
                  style={{
                    fontSize: 48,
                    color: "#1D4ED8",
                    fontWeight: 700,
                    letterSpacing: "-1px",
                  }}
                >
                  Certificate of Blue Carbon
                </h1>
                <p style={{ fontSize: 18, color: "#374151", marginTop: 10 }}>
                  This certifies that the below project has been recorded &
                  anchored on-chain.
                </p>
              </div>

              <div style={{ marginTop: 40, textAlign: "center" }}>
                <p style={{ fontSize: 24, color: "#4b5563" }}>
                  This certificate is proudly awarded to
                </p>
                <h2
                  style={{
                    fontSize: 40,
                    color: "#1D4ED8",
                    fontWeight: 700,
                    margin: "10px 0",
                  }}
                >
                  {p.name}
                </h2>
                <div style={{ fontSize: 18, color: "#4b5563" }}>
                  Awarded to: <b>{userName || "Signed-in User"}</b>
                </div>
                <div style={{ fontSize: 18, color: "#4b5563", marginTop: 6 }}>
                  {p.location} • {p.type}
                </div>
                <div style={{ marginTop: 24, fontSize: 28, fontWeight: 600 }}>
                  For a total of{" "}
                  <b style={{ color: "#16A34A" }}>{p.predictedCO2} tCO₂</b> of
                  carbon credits
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginTop: 60,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 150, height: 150, margin: "0 auto" }}>
                    <QRCodeCanvas
                      value={`https://example.com/tx/${
                        p.txId || "not-available"
                      }`}
                      size={150}
                    />
                  </div>
                  <p style={{ fontSize: 14, color: "#4b5563", marginTop: 10 }}>
                    Scan to verify on the blockchain
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 16, color: "#4b5563" }}>
                    Issued on:{" "}
                    {p.certificateAt
                      ? new Date(p.certificateAt).toLocaleDateString()
                      : new Date().toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: 16, color: "#4b5563" }}>
                    Transaction ID:{" "}
                    {p.txId ? `${p.txId.substring(0, 10)}...` : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Actions */}
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={() => generatePDF(p)}
                aria-label={`Download certificate for ${p.name}`}
                className="flex items-center justify-center space-x-2 px-6 py-3 rounded-full 
              bg-emerald-600 text-white font-bold shadow-md transition-all 
              hover:scale-105 hover:shadow-[0_0_10px_#10b981]"
              >
                <i className="fas fa-download"></i>
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
