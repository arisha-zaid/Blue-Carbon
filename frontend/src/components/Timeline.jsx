// src/components/Timeline.jsx
import { motion } from "framer-motion";

const STAGES = [
  "Submitted",
  "MRV Complete",
  "Approved",
  "Blockchain Anchored",
  "Certificate Issued",
];

export default function Timeline({ currentStatus }) {
  // map currentStatus to index
  const mapStatusToStage = (status) => {
    if (!status) return 0;
    if (status.includes("Pending") || status === "Submitted") return 0;
    if (status === "MRV Complete" || status === "Pending MRV") return 1;
    if (status === "Approved") return 2;
    if (status === "Blockchain Anchored") return 3;
    if (status === "Certificate Issued") return 4;
    return 0;
  };

  const currentIndex = mapStatusToStage(currentStatus);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STAGES.map((s, i) => {
          const done = i <= currentIndex;
          return (
            <div key={s} className="flex-1 flex flex-col items-center text-center relative">
              <div className="flex items-center w-full">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white z-10 ${
                    done ? "bg-gradient-to-r from-[#1D4ED8] to-[#16A34A]" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {i + 1}
                </div>
                {i < STAGES.length - 1 && (
                  <div
                    className={`flex-1 h-1 ${i < currentIndex ? "bg-gradient-to-r from-[#1D4ED8] to-[#16A34A]" : "bg-gray-200"}`}
                  />
                )}
              </div>
              <div className="mt-2 text-xs text-gray-600">{s}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
