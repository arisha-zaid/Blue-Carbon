import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProject } from "../store/projects";
import { motion } from "framer-motion";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { useNotification } from "../context/NotificationContext";

const COEFS = {
  Mangroves: 15, // tCO₂/ha/year (mock)
  Seagrass: 7,
  Wetlands: 5,
  Agroforestry: 10,
};

const TYPES = Object.keys(COEFS);
const MAX_TON = 1000; // for gauge normalization (mock cap)

export default function AddProject() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1: Project info
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Mangroves");
  const [sizeHa, setSizeHa] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Files
  const [files, setFiles] = useState([]);

  // Step 3: AI Estimator (mock)
  const predicted = useMemo(() => {
    const size = parseFloat(sizeHa) || 0;
    return Math.max(0, Math.round(size * (COEFS[type] || 0)));
  }, [sizeHa, type]);

  const gaugePct = useMemo(
    () => Math.min(100, Math.round((predicted / MAX_TON) * 100)),
    [predicted]
  );

  const riskLevel = useMemo(() => {
    if (!files.length) return "High";
    if (predicted > 300) return "Medium";
    if (predicted > 120) return "Medium";
    return "Low";
  }, [predicted, files.length]);

  // drag & drop handlers
  const onDrop = (e) => {
    e.preventDefault();
    const incoming = Array.from(e.dataTransfer.files || []);
    if (incoming.length) setFiles((prev) => [...prev, ...incoming]);
  };
  const onBrowse = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (incoming.length) setFiles((prev) => [...prev, ...incoming]);
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // progress bar width
  const progress = useMemo(() => (step - 1) * 50, [step]); // 0, 50, 100

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const canNextFrom1 =
    name.trim().length > 2 && location.trim() && parseFloat(sizeHa) > 0;

  const { addNotification } = useNotification();

  const handleSubmit = (e) => {
    e.preventDefault();
    const project = {
      id: Date.now(),
      name,
      location,
      type,
      sizeHa: parseFloat(sizeHa),
      description,
      files: files.map((f) => ({ name: f.name, size: f.size })),
      predictedCO2: predicted, // tCO2/year (mock)
      riskLevel,
      status: "Pending MRV",
      createdAt: new Date().toISOString(),
      txId: null,
    };
    addProject(project);
    addNotification("Project submitted! Status set to Pending MRV.", "success");
    navigate("/dashboard");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-white">
      {/* header */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1D4ED8]">
          Add New Project
        </h1>
        <p className="text-gray-600 mt-2">
          Provide your project details, upload evidence, and preview AI
          estimates.
        </p>
      </div>

      {/* progress bar */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-2 bg-gradient-to-r from-[#1D4ED8] to-[#16A34A]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 12 }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Project Info</span>
          <span>Files</span>
          <span>AI Estimator</span>
        </div>
      </div>

      {/* card */}
      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto px-4 mt-6 pb-12"
      >
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                1) Project Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Project Name
                  </label>
                  <input
                    className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    placeholder="e.g., Mangrove Restoration – Kerala"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Location
                  </label>
                  <input
                    className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    placeholder="e.g., Alappuzha, Kerala"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Project Type
                  </label>
                  <select
                    className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Size (hectares)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    placeholder="e.g., 12.5"
                    value={sizeHa}
                    onChange={(e) => setSizeHa(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  placeholder="Briefly describe the project goals, methods, and expected outcomes."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={next}
                  disabled={!canNextFrom1}
                  className={`px-5 py-2 rounded-xl text-white shadow transition
                    ${
                      canNextFrom1
                        ? "bg-[#1D4ED8] hover:brightness-110"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                  Next: Files
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                2) Upload Files (images, PDFs)
              </h2>

              <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed rounded-2xl p-8 text-center bg-[#F3F4F6] hover:bg-gray-100 transition"
              >
                <p className="text-gray-700">
                  Drag & drop files here or{" "}
                  <label className="text-[#1D4ED8] underline cursor-pointer">
                    browse
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={onBrowse}
                      accept=".png,.jpg,.jpeg,.pdf"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: site photos, maps, approvals, MRV evidence.
                </p>
              </div>

              {!!files.length && (
                <ul className="divide-y rounded-xl border">
                  {files.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="truncate">
                        <span className="font-medium">{f.name}</span>
                        <span className="text-gray-500 text-xs ml-2">
                          {(f.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex gap-3 justify-between">
                <button
                  type="button"
                  onClick={back}
                  className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="px-5 py-2 rounded-xl text-white bg-[#1D4ED8] hover:brightness-110 shadow"
                >
                  Next: AI Estimator
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                3) AI Carbon Estimator (mock)
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Gauge */}
                <div className="bg-[#F3F4F6] rounded-2xl p-6 relative">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        innerRadius="70%"
                        outerRadius="100%"
                        startAngle={180}
                        endAngle={0}
                        data={[
                          {
                            name: "Predicted",
                            value: gaugePct,
                            fill: "#16A34A",
                          },
                        ]}
                      >
                        <PolarAngleAxis
                          type="number"
                          domain={[0, 100]}
                          angleAxisId={0}
                          tick={false}
                        />
                        <RadialBar
                          dataKey="value"
                          cornerRadius={20}
                          background
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Predicted CO₂</div>
                      <div className="text-3xl font-bold text-[#1D4ED8]">
                        {predicted} t/yr
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Normalized: {gaugePct}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border">
                    <div className="text-sm text-gray-500">Project Type</div>
                    <div className="font-semibold">{type}</div>
                  </div>
                  <div className="p-4 rounded-2xl border">
                    <div className="text-sm text-gray-500">Size</div>
                    <div className="font-semibold">{sizeHa || 0} ha</div>
                  </div>
                  <div className="p-4 rounded-2xl border">
                    <div className="text-sm text-gray-500">Risk Level (AI)</div>
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        riskLevel === "Low"
                          ? "bg-[#16A34A]"
                          : riskLevel === "Medium"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    >
                      {riskLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    *Estimator is a mock for prototyping. Actual MRV/ML can be
                    integrated later.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-between">
                <button
                  type="button"
                  onClick={back}
                  className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-gradient-to-r from-[#1D4ED8] to-[#16A34A] shadow hover:brightness-110"
                >
                  Submit Project
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </form>
    </div>
  );
}
