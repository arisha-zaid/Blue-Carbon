// Test script to simulate frontend project submission
import fetch from 'node-fetch';

// Mock fetch for node environment
global.fetch = fetch;

// Simulate the API service
class ApiService {
  constructor() {
    this.baseURL = "http://localhost:5000/api";
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        const err = new Error(errorData.message || "Authentication required");
        err.status = 401;
        err.data = errorData;
        throw err;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const err = new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
        err.status = response.status;
        err.data = errorData;
        throw err;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  _mapFrontendTypeToBackend(frontendType) {
    if (!frontendType) return "other";
    const t = String(frontendType).toLowerCase();
    
    if (t.includes("mangrove") || t.includes("seagrass") || t.includes("wetland")) {
      return "biodiversity_conservation";
    }
    if (t.includes("agroforestry") || t.includes("agri") || t.includes("farm")) {
      return "sustainable_agriculture";
    }
    if (t.includes("reforest") || t.includes("forest")) {
      return "reforestation";
    }
    
    const validTypes = [
      "reforestation", "renewable_energy", "waste_management", "carbon_capture",
      "biodiversity_conservation", "sustainable_agriculture", "clean_water",
      "green_technology", "other",
    ];
    
    return validTypes.includes(t) ? t : "other";
  }

  _normalizeProjectPayload(data) {
    const payload = { ...(data || {}) };

    // Description: backend requires 50-5000 chars when not draft
    let description = String(payload.description || payload.shortDescription || "").trim();
    if (description.length < 50) {
      const pad = " More details will be provided in subsequent updates.";
      while (description.length < 50) description += pad;
      description = description.slice(0, 5000);
    }
    payload.description = description;

    // Type mapping to backend enum
    payload.type = this._mapFrontendTypeToBackend(payload.type || payload.projectType);

    // Location normalization
    if (typeof payload.location === "string") {
      payload.location = { address: payload.location };
    }
    payload.location = payload.location || {};
    if (!payload.location.address || String(payload.location.address).trim() === "") {
      payload.location.address = "Unknown";
    }
    if (!payload.location.country || String(payload.location.country).trim() === "") {
      payload.location.country = "Unknown";
    }

    // Funding goal (>= 100 when not draft)
    payload.funding = payload.funding || {};
    if (typeof payload.funding.goal !== "number" || payload.funding.goal < 100) {
      payload.funding.goal = 100;
    }
    if (!payload.funding.currency) payload.funding.currency = "USD";

    // Carbon impact
    payload.carbonImpact = payload.carbonImpact || {};
    const est = Number(payload.carbonImpact.estimatedReduction || 0);
    payload.carbonImpact.estimatedReduction = Number.isFinite(est) && est >= 0 ? Math.floor(est) : 0;

    // Area (optional, non-negative)
    if (payload.area !== undefined) {
      const area = Number(payload.area);
      payload.area = Number.isFinite(area) && area >= 0 ? area : 0;
    }

    // End date ISO (required when not draft)
    if (!payload.endDate) {
      const oneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      payload.endDate = oneYear.toISOString();
    }

    // Phase/status defaults (optional)
    if (!payload.phase) payload.phase = "planning";
    if (!payload.status) payload.status = "draft";

    return payload;
  }

  async createProject(projectData) {
    console.log("🔍 Raw project data from frontend:", projectData);
    const normalized = this._normalizeProjectPayload(projectData);
    console.log("✅ Normalized project data for backend:", normalized);
    try {
      const response = await this.request("/projects", {
        method: "POST",
        body: JSON.stringify(normalized),
      });
      console.log("✅ Backend response:", response);
      return response;
    } catch (error) {
      console.error("❌ API request failed:", error);
      console.error("❌ Error status:", error.status);
      console.error("❌ Error data:", error.data);
      throw error;
    }
  }
}

// Test the submission flow
async function testProjectSubmission() {
  const apiService = new ApiService();
  
  // Simulate the exact data that AddProject.jsx would send
  const project = {
    name: "Test Mangroves Project Frontend",
    location: {
      address: "Test Mangrove Location, Kerala",
      coordinates: {
        latitude: 10.123,
        longitude: 76.456,
      }
    },
    type: "mangroves", // Frontend sends lowercase
    area: 5.5,
    description: "Test description",
    carbonImpact: {
      estimatedReduction: 150,
    },
    frontendData: {
      files: [],
      thumb: null,
      riskLevel: "Low",
    },
    status: "Pending MRV",
  };

  try {
    const result = await apiService.createProject(project);
    console.log("🎉 SUCCESS! Project created:", result.data?.project?.name);
  } catch (error) {
    console.error("💥 FAILED!", error.message);
  }
}

// Run the test
testProjectSubmission();