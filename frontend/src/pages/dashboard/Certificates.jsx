// src/pages/dashboard/Certificates.jsx
import React, { useEffect, useState } from "react";

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    // ✅ Backend/API call placeholder
    // fetch("/api/certificates/my")
    //   .then(res => res.json())
    //   .then(data => setCertificates(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Certificates</h1>
      <ul className="space-y-2">
        {certificates.length === 0 ? (
          <p>No certificates found (backend placeholder)</p>
        ) : (
          certificates.map((cert) => (
            <li key={cert.id} className="p-2 border rounded">
              {cert.projectTitle} - Verified
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
