import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProject } from "../store/projects";
import apiService from "../services/api";
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

  // Location detection and suggestions
  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  });
  const [detectedLocation, setDetectedLocation] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Step 2: Files
  const [files, setFiles] = useState([]);
  const [thumbnail, setThumbnail] = useState(null); // base64 preview for My Projects

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

  // Helper: create base64 data URL for images
  const toDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // drag & drop handlers
  const onDrop = async (e) => {
    e.preventDefault();
    const incoming = Array.from(e.dataTransfer.files || []);
    if (incoming.length) {
      setFiles((prev) => [...prev, ...incoming]);
      // Upload first image to backend for persistent URL
      const firstImage = incoming.find((f) => f.type.startsWith("image/"));
      if (firstImage && !thumbnail) {
        try {
          const res = await apiService.uploadFile(firstImage, 'image');
          if (res.success) {
            setThumbnail(res.data?.url || null);
          } else {
            const dataUrl = await toDataUrl(firstImage);
            setThumbnail(dataUrl);
          }
        } catch {
          try {
            const dataUrl = await toDataUrl(firstImage);
            setThumbnail(dataUrl);
          } catch {}
        }
      }
    }
  };
  const onBrowse = async (e) => {
    const incoming = Array.from(e.target.files || []);
    if (incoming.length) {
      setFiles((prev) => [...prev, ...incoming]);
      const firstImage = incoming.find((f) => f.type.startsWith("image/"));
      if (firstImage && !thumbnail) {
        try {
          const res = await apiService.uploadFile(firstImage, 'image');
          if (res.success) {
            setThumbnail(res.data?.url || null);
          } else {
            const dataUrl = await toDataUrl(firstImage);
            setThumbnail(dataUrl);
          }
        } catch {
          try {
            const dataUrl = await toDataUrl(firstImage);
            setThumbnail(dataUrl);
          } catch {}
        }
      }

      // Safety: if no thumbnail yet and at least one image exists, set base64 from first
      if (!thumbnail) {
        const anyImg = incoming.find((f) => f.type.startsWith("image/"));
        if (anyImg) {
          try {
            const dataUrl = await toDataUrl(anyImg);
            setThumbnail(dataUrl);
          } catch {}
        }
      }
    }
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Location detection using browser's geolocation API
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      addNotification("Geolocation is not supported by this browser.", "error");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });

        // Reverse geocoding to get address (using a mock implementation)
        reverseGeocode(latitude, longitude)
          .then((address) => {
            setDetectedLocation(address);
            setLocation(address);
            addNotification("Location detected successfully!", "success");
          })
          .catch(() => {
            addNotification("Failed to get address from coordinates.", "error");
          })
          .finally(() => {
            setIsDetectingLocation(false);
          });
      },
      (error) => {
        setIsDetectingLocation(false);
        let message = "Failed to detect location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }
        addNotification(message, "error");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Reverse geocoding using backend API
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/locations/reverse-geocode?latitude=${lat}&longitude=${lng}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reverse geocode");
      }

      const data = await response.json();
      return data.data.address;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      // Fallback to simple coordinate display
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Generate location suggestions based on project type using backend API
  const getLocationSuggestions = async (projectType, searchQuery = "") => {
    try {
      const typeMap = {
        Mangroves: "mangroves",
        Seagrass: "seagrass",
        Wetlands: "wetlands",
        Agroforestry: "agroforestry",
      };

      const apiType = typeMap[projectType] || "wetlands";
      const url = new URL("http://localhost:5000/api/locations/suggestions");
      url.searchParams.append("type", apiType);
      if (searchQuery) {
        url.searchParams.append("search", searchQuery);
      }
      url.searchParams.append("limit", "10");

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      return data.data.map((location) => location.fullName);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      // Fallback to hardcoded suggestions
      const fallbackSuggestions = {
        Mangroves: [
          "Sundarbans National Park, West Bengal",
          "Bhitarkanika Wildlife Sanctuary, Odisha",
          "Pichavaram Mangrove Forest, Tamil Nadu",
        ],
        Seagrass: [
          "Gulf of Mannar, Tamil Nadu",
          "Palk Bay, Tamil Nadu",
          "Chilika Lake, Odisha",
        ],
        Wetlands: [
          "Chilika Lake, Odisha",
          "Pulicat Lake, Tamil Nadu",
          "Vembanad Lake, Kerala",
        ],
        Agroforestry: [
          "Western Ghats region, Karnataka",
          "Nilgiri Hills, Tamil Nadu",
          "Satpura Range, Madhya Pradesh",
        ],
      };

      return fallbackSuggestions[projectType] || [];
    }
  };

  // Handle location input change and show suggestions
  const handleLocationChange = async (value) => {
    setLocation(value);
    if (value.length > 2) {
      try {
        const suggestions = await getLocationSuggestions(type, value);
        setLocationSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch (error) {
        console.error("Error getting suggestions:", error);
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Select a suggestion
  const selectSuggestion = (suggestion) => {
    setLocation(suggestion);
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  // progress bar width
  const progress = useMemo(() => (step - 1) * 50, [step]); // 0, 50, 100

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const canNextFrom1 =
    name.trim().length > 2 && location.trim() && parseFloat(sizeHa) > 0;

  const { addNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const projectData = {
      name,
      location,
      coordinates:
        coordinates.latitude && coordinates.longitude
          ? {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            }
          : null,
      type,
      sizeHa: parseFloat(sizeHa),
      description,
      files: files,
      predictedCO2: predicted,
      riskLevel,
      status: "Pending MRV",
      area: parseFloat(sizeHa), // Backend expects 'area'
      fundingGoal: 10000, // Default funding goal
      thumb: thumbnail || null,
    };

    try {
      const created = await addProject(projectData); // backend create
      addNotification("Project submitted successfully to database!", "success");
      navigate("/my-projects");
    } catch (error) {
      console.error("Failed to save to backend:", error);
      addNotification(error.message || "Failed to save project.", "error");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".location-input-container")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Update suggestions when project type changes
  useEffect(() => {
    const updateSuggestions = async () => {
      if (location.length > 2) {
        try {
          const suggestions = await getLocationSuggestions(type, location);
          setLocationSuggestions(suggestions);
          setShowSuggestions(suggestions.length > 0);
        } catch (error) {
          console.error("Error updating suggestions:", error);
          setShowSuggestions(false);
        }
      }
    };

    updateSuggestions();
  }, [type]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200">
      {/* header */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <h1 className="text-3xl md:text-4xl font-bold text-teal-400">
          Add New Project
        </h1>
        <p className="text-gray-400 mt-2">
          Provide your project details, upload evidence, and preview AI
          estimates.
        </p>
      </div>

      {/* progress bar */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-2 bg-gradient-to-r from-teal-400 to-green-500"
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
        <div className="bg-[#1A1A1A] rounded-2xl shadow-md p-6 md:p-8 border border-gray-800">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-200">
                1) Project Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Project Name
                  </label>
                  <input
                    className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2 text-gray-200
                           focus:outline-none focus:ring-2 focus:ring-teal-400 
                           transition duration-300"
                    placeholder="e.g., Mangrove Restoration – Kerala"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="relative location-input-container">
                  <label className="block text-sm text-gray-400 mb-1">
                    Location
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-[#111] border border-gray-700 rounded-xl px-4 py-2 text-gray-200
                               focus:outline-none focus:ring-2 focus:ring-teal-400 
                               transition duration-300"
                      placeholder="e.g., Alappuzha, Kerala"
                      value={location}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      onFocus={async () => {
                        if (location.length > 2) {
                          try {
                            const suggestions = await getLocationSuggestions(
                              type,
                              location
                            );
                            setLocationSuggestions(suggestions);
                            setShowSuggestions(true);
                          } catch (error) {
                            console.error(
                              "Error getting suggestions on focus:",
                              error
                            );
                          }
                        } else {
                          // Show all suggestions for the project type when no search query
                          try {
                            const suggestions = await getLocationSuggestions(
                              type
                            );
                            setLocationSuggestions(suggestions);
                            setShowSuggestions(true);
                          } catch (error) {
                            console.error(
                              "Error getting all suggestions:",
                              error
                            );
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={detectCurrentLocation}
                      disabled={isDetectingLocation}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-500 disabled:bg-gray-600 transition-colors flex items-center gap-2"
                      title="Detect current location"
                    >
                      {isDetectingLocation ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                      {isDetectingLocation ? "Detecting..." : "Detect"}
                    </button>
                  </div>

                  {/* Location Suggestions Dropdown - FIXED FOR DARK MODE */}
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-gray-700 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                      <div className="p-2">
                        <div className="text-xs text-gray-400 mb-2">
                          Suggested locations for {type} projects:
                        </div>
                        {locationSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectSuggestion(suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show detected coordinates */}
                  {coordinates.latitude && coordinates.longitude && (
                    <div className="mt-2 text-xs text-gray-400">
                      📍 Coordinates: {coordinates.latitude.toFixed(6)},{" "}
                      {coordinates.longitude.toFixed(6)}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Project Type
                  </label>
                  <select
                    className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2 text-gray-200
                           focus:outline-none focus:ring-2 focus:ring-teal-400 
                           transition duration-300"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {TYPES.map((t) => (
                      <option
                        key={t}
                        value={t}
                        className="bg-[#1A1A1A] text-gray-200"
                      >
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Size (hectares)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2 text-gray-200
                           focus:outline-none focus:ring-2 focus:ring-teal-400 
                           transition duration-300"
                    placeholder="e.g., 12.5"
                    value={sizeHa}
                    onChange={(e) => setSizeHa(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2 text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-teal-400 
                         transition duration-300"
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
                  className={`px-5 py-2 rounded-xl text-white shadow transition duration-300
                ${
                  canNextFrom1
                    ? "bg-teal-500 hover:bg-teal-400 hover:shadow-[0_0_10px_#14b8a6]"
                    : "bg-gray-600 cursor-not-allowed"
                }`}
                >
                  Next: Files
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: File Upload */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-200">
                2) Upload Project Files
              </h2>
              <p className="text-sm text-gray-400">
                Upload images, documents, or evidence related to your project
                (optional).
              </p>

              {/* Drag & Drop Area */}
              <div
                className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center
                       hover:border-teal-400 transition-colors duration-300 cursor-pointer"
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-teal-400/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-teal-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-medium text-gray-200">
                      Drop files here or click to browse
                    </div>
                    <div className="text-sm text-gray-400">
                      Supports images, PDFs, and documents
                    </div>
                  </div>
                </div>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={onBrowse}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-200">
                    Uploaded Files ({files.length})
                  </h3>
                  <div className="space-y-2">
                    {files.map((file, idx) => (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center justify-between p-3 bg-[#111] rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-teal-400/20 rounded flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-teal-400"
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
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-200">
                              {file.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {(file.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-red-400 hover:text-red-300 p-1"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-between">
                <button
                  type="button"
                  onClick={back}
                  className="px-5 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="px-5 py-2 rounded-xl text-white bg-teal-500 hover:bg-teal-400 hover:shadow-[0_0_10px_#14b8a6] shadow transition duration-300"
                >
                  Next: AI Estimator
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: AI Estimator */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-xl font-semibold text-gray-200">
                3) AI Carbon Estimator
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Gauge */}
                <div className="bg-[#111] rounded-2xl p-6 relative border border-gray-700">
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
                            fill: "#14b8a6",
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
                      <div className="text-sm text-gray-400">Predicted CO₂</div>
                      <div className="text-3xl font-bold text-teal-400">
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
                  <div className="p-4 rounded-2xl border border-gray-700 bg-[#111]">
                    <div className="text-sm text-gray-400">Project Type</div>
                    <div className="font-semibold text-gray-200">{type}</div>
                  </div>
                  <div className="p-4 rounded-2xl border border-gray-700 bg-[#111]">
                    <div className="text-sm text-gray-400">Size</div>
                    <div className="font-semibold text-gray-200">
                      {sizeHa || 0} ha
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl border border-gray-700 bg-[#111]">
                    <div className="text-sm text-gray-400">Risk Level (AI)</div>
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        riskLevel === "Low"
                          ? "bg-green-500"
                          : riskLevel === "Medium"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    >
                      {riskLevel}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl border border-gray-700 bg-[#111]">
                    <div className="text-sm text-gray-400">Files Uploaded</div>
                    <div className="font-semibold text-gray-200">
                      {files.length} files
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    *Estimator is a mock for prototyping. Actual MRV/ML can be
                    integrated later.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-between">
                <button
                  type="button"
                  onClick={back}
                  className="px-5 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-gradient-to-r from-teal-500 to-green-500 shadow hover:shadow-[0_0_15px_#14b8a6] transition duration-300"
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