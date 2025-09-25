// src/store/projects.js
import apiService from "../services/api";

// Fetch projects from backend
export async function getProjects(params = {}) {
  const res = await apiService.getProjects(params);
  if (res && res.success) {
    const items = Array.isArray(res.data) ? res.data : res.data?.projects || [];
    return (items || []).map((p) => normalizeProjectFromBackend(p));
  }
  return [];
}

// Create a new project via backend
export async function addProject(projectData) {
  const res = await apiService.createProject(projectData);
  if (res && res.success) {
    return normalizeProjectFromBackend(res.data);
  }
  throw new Error(res?.message || "Failed to create project");
}

// Get single project by id via backend
export async function getProjectById(id) {
  const res = await apiService.getProjectById(id);
  if (res && res.success) {
    return normalizeProjectFromBackend(res.data);
  }
  return null;
}

// Update project via backend
export async function updateProject(projectId, data) {
  const res = await apiService.updateProject(projectId, data);
  if (res && res.success) {
    return normalizeProjectFromBackend(res.data);
  }
  throw new Error(res?.message || "Failed to update project");
}

// Anchor project (if backend supports). Kept for compatibility; no-op otherwise
export async function anchorProject(projectId) {
  const res = await apiService.request(`/projects/${projectId}/anchor`, { method: "POST" });
  if (res && res.success) {
    return normalizeProjectFromBackend(res.data);
  }
  throw new Error(res?.message || "Failed to anchor project");
}

// Issue certificate (if backend supports)
export async function issueCertificate(projectId) {
  const res = await apiService.request(`/projects/${projectId}/certificate`, { method: "POST" });
  if (res && res.success) {
    return normalizeProjectFromBackend(res.data);
  }
  throw new Error(res?.message || "Failed to issue certificate");
}

// Legacy localStorage helpers retained only if referenced elsewhere
export function saveProjects() {}
export function updateProjectStatus() { return null; }

// Helper: normalize backend project to frontend shape used by UI
function normalizeProjectFromBackend(p) {
  const id = p._id || p.id;
  const createdAt = p.createdAt || new Date().toISOString();
  // Derive thumbnail
  let thumb = p.thumb || p.imageUrl || p.image || (p.documents && p.documents[0]?.url) || "";
  if (typeof thumb === "string") {
    let t = thumb.replace(/\\/g, "/");
    if (t && !t.startsWith("http") && !t.startsWith("data:")) {
      if (t.startsWith("uploads/")) t = "/" + t;
      if (t.startsWith("/uploads/")) {
        thumb = `${window.location.protocol}//${window.location.hostname}:5000${t}`;
      } else {
        thumb = t;
      }
    } else {
      thumb = t;
    }
  }

  return {
    id,
    backendId: id,
    name: p.name || p.title || "Untitled",
    type: p.type || p.projectType || "Other",
    location: p.location?.address || p.location || "Unknown",
    sizeHa: p.area || p.sizeHa || 0,
    predictedCO2: p.carbonImpact?.estimatedReduction || p.predictedCO2 || 0,
    status: p.status || "Pending MRV",
    createdAt,
    thumb:
      thumb ||
      "https://images.unsplash.com/photo-1529112431328-88da9f2e2ea8?q=80&w=1600&auto=format&fit=crop",

    // Surface blockchain-related fields for UI components
    txId: (p.blockchain && p.blockchain.txHash) || p.txId || "",
    isOnChain: !!(p.blockchain && p.blockchain.isOnChain),
    blockchainHash: (p.blockchain && p.blockchain.txHash) || "",
    certificateTokenId:
      (p.blockchain && p.blockchain.certificateTokenId) ||
      p.certificateTokenId ||
      "",
  };
}
