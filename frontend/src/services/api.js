const API_BASE_URL = "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    // Cache user data in memory for performance (not persistent)
    this._userCache = {
      userData: null,
      role: null,
      isAuthenticated: false,
      lastFetch: null
    };
    this._cacheTimeout = 5 * 60 * 1000; // 5 minutes cache timeout
  }

  // Get auth token from localStorage if backend uses JWTs
  getAuthToken() {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  }

  // Optionally set auth token (for JWT-based backends)
  setAuthToken(token) {
    try {
      if (token) localStorage.setItem("token", token);
      else localStorage.removeItem("token");
    } catch {}
  }

  // Get user role from memory cache or fetch from server
  async getUserRole() {
    const userData = await this.getUserData();
    return userData?.role || null;
  }

  // Set user role in memory cache
  setUserRole(role) {
    if (this._userCache.userData) {
      this._userCache.userData.role = role;
      this._userCache.role = role;
    }
  }

  // Get user data from memory cache or fetch from server
  async getUserData() {
    // Check if cache is valid and not expired
    const now = Date.now();
    if (this._userCache.userData && 
        this._userCache.lastFetch && 
        (now - this._userCache.lastFetch) < this._cacheTimeout) {
      return this._userCache.userData;
    }

    // Fetch fresh data from server
    try {
      const response = await this.getCurrentUser();
      if (response.success && response.data?.user) {
        this._userCache.userData = response.data.user;
        this._userCache.role = response.data.user.role;
        this._userCache.isAuthenticated = true;
        this._userCache.lastFetch = now;
        return response.data.user;
      }
    } catch (error) {
      // If fetch fails, user is likely not authenticated
      this.clearAuthData();
    }
    
    return null;
  }

  // Set user data in memory cache
  setUserData(userData) {
    if (userData) {
      this._userCache.userData = userData;
      this._userCache.role = userData.role;
      this._userCache.isAuthenticated = true;
      this._userCache.lastFetch = Date.now();
    } else {
      this.clearAuthData();
    }
  }

  // Clear all auth data from memory cache
  clearAuthData() {
    this._userCache = {
      userData: null,
      role: null,
      isAuthenticated: false,
      lastFetch: null
    };
  }

  // Make HTTP request with session-based authentication
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const token = this.getAuthToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      credentials: 'include', // Include session cookies for authentication
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle different response statuses
      if (response.status === 401) {
        // Unauthorized - do not force redirect during login/register flows
        const errorData = await response.json().catch(() => ({}));
        const err = new Error(errorData.message || "Authentication required");
        err.status = 401;
        err.data = errorData;
        throw err;
      }

      if (response.status === 403) {
        throw new Error("Access denied. Insufficient permissions.");
      }

      if (response.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const err = new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
        // Attach status and error data for caller to handle (e.g., 404)
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

  // Internal: map frontend taxonomy to backend allowed enum
  _mapFrontendTypeToBackend(frontendType) {
    console.log("🔄 Mapping frontend type:", frontendType);
    if (!frontendType) return "other";
    const t = String(frontendType).toLowerCase();
    console.log("🔄 Lowercase type:", t);
    
    // Map common UI categories to backend enums
    if (t.includes("mangrove") || t.includes("seagrass") || t.includes("wetland")) {
      console.log("✅ Mapped to biodiversity_conservation");
      return "biodiversity_conservation";
    }
    if (t.includes("agroforestry") || t.includes("agri") || t.includes("farm")) {
      console.log("✅ Mapped to sustainable_agriculture");
      return "sustainable_agriculture";
    }
    if (t.includes("reforest") || t.includes("forest")) {
      console.log("✅ Mapped to reforestation");
      return "reforestation";
    }
    
    // Add more mappings here as your UI grows
    const validTypes = [
      "reforestation",
      "renewable_energy",
      "waste_management",
      "carbon_capture",
      "biodiversity_conservation",
      "sustainable_agriculture",
      "clean_water",
      "green_technology",
      "other",
    ];
    
    const result = validTypes.includes(t) ? t : "other";
    console.log("✅ Final mapped type:", result);
    return result;
  }

  // Internal: ensure payload satisfies backend validators
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
      // Fallback to a generic address if missing
      payload.location.address = "Unknown";
    }
    if (!payload.location.country || String(payload.location.country).trim() === "") {
      payload.location.country = "Unknown";
    }

    // Coordinates validation coercion (optional fields)
    if (payload.location.coordinates) {
      const { latitude, longitude } = payload.location.coordinates;
      if (latitude === undefined || longitude === undefined) {
        delete payload.location.coordinates;
      }
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
    if (!payload.status) payload.status = "pending_review";

    return payload;
  }

  // Authentication methods
  async register(userData) {
    const response = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success) {
      if (response.data?.token) this.setAuthToken(response.data.token);
      // Store user data in memory cache (server handles session)
      this.setUserData(response.data.user);
    }

    return response;
  }

  async login(credentials) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.success) {
      if (response.data?.token) this.setAuthToken(response.data.token);
      // Store user data in memory cache (server handles session)
      this.setUserData(response.data.user);
    }

    return response;
  }

  async logout() {
    try {
      await this.request("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear memory cache and token (server destroys session)
      this.setAuthToken(null);
      this.clearAuthData();
    }
  }

  async forgotPassword(email) {
    return await this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password) {
    return await this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }

  async refreshToken() {
    // With session-based auth, we don't need to refresh tokens
    // Just verify the current session is still valid
    try {
      const response = await this.getCurrentUser();
      if (response.success) {
        this.setUserData(response.data.user);
        return { success: true, message: "Session refreshed" };
      }
    } catch (error) {
      this.clearAuthData();
      throw error;
    }
  }

  async getCurrentUser() {
    return await this.request("/auth/me");
  }

  // User management methods
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ""}`;
    return await this.request(endpoint);
  }

  async getUserById(userId) {
    return await this.request(`/users/${userId}`);
  }

  async updateUser(userId, userData) {
    return await this.request(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async updateUserRole(userId, role) {
    return await this.request(`/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  }

  async updateUserStatus(userId, isActive) {
    return await this.request(`/users/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify({ isActive }),
    });
  }

  async verifyUser(userId) {
    return await this.request(`/users/${userId}/verify`, {
      method: "PUT",
    });
  }

  async deleteUser(userId) {
    return await this.request(`/users/${userId}`, {
      method: "DELETE",
    });
  }

  async getUserStats() {
    return await this.request("/users/stats/overview");
  }

  // Community profile methods
  async getMyCommunityProfile() {
    return await this.request("/community/my-profile");
  }

  async getCommunityProfileById(id) {
    return await this.request(`/community/profile/${id}`);
  }

  async listCommunityProfiles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/community/profiles${
      queryString ? `?${queryString}` : ""
    }`;
    return await this.request(endpoint);
  }

  async createCommunityProfile(payload) {
    return await this.request("/community/profile", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateCommunityProfile(payload) {
    return await this.request("/community/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async submitCommunityProfile() {
    return await this.request("/community/profile/submit", {
      method: "POST",
    });
  }

  // Project methods
  async getProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/projects?${queryString}` : "/projects";
    return await this.request(url);
  }

  async getProjectById(projectId) {
    return await this.request(`/projects/${projectId}`);
  }

  async createProject(projectData) {
    console.log("🔍 Raw project data from frontend:", projectData);
    const normalized = this._normalizeProjectPayload(projectData);
    console.log("✅ Normalized project data for backend:", normalized);
    return await this.request("/projects", {
      method: "POST",
      body: JSON.stringify(normalized),
    });
  }

  async updateProject(projectId, projectData) {
    // Normalize selectively for updates (don’t override explicit fields)
    const base = this._normalizeProjectPayload(projectData);
    // Preserve explicit fields from caller over normalization defaults
    const merged = { ...base, ...projectData };
    return await this.request(`/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(merged),
    });
  }

  async deleteProject(projectId) {
    return await this.request(`/projects/${projectId}`, {
      method: "DELETE",
    });
  }

  async fundProject(projectId, fundingData) {
    return await this.request(`/projects/${projectId}/fund`, {
      method: "POST",
      body: JSON.stringify(fundingData),
    });
  }

  async verifyProject(projectId, verificationData) {
    return await this.request(`/projects/${projectId}/verify`, {
      method: "POST",
      body: JSON.stringify(verificationData),
    });
  }

  // Health check
  async healthCheck() {
    return await this.request("/health");
  }

  // Check if user is authenticated
  // Checks session validity by verifying cached data or making server request
  async isAuthenticated() {
    // Check memory cache first
    if (this._userCache.isAuthenticated && 
        this._userCache.lastFetch && 
        (Date.now() - this._userCache.lastFetch) < this._cacheTimeout) {
      return true;
    }

    // Verify with server
    try {
      const userData = await this.getUserData();
      return userData !== null;
    } catch (error) {
      return false;
    }
  }

  // Synchronous version for immediate checks (uses cache only)
  isAuthenticatedSync() {
    return this._userCache.isAuthenticated && 
           this._userCache.userData !== null;
  }

  // Check if user has specific role
  async hasRole(role) {
    const userRole = await this.getUserRole();
    if (!userRole) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  }

  // Synchronous version using cache
  hasRoleSync(role) {
    const userRole = this._userCache.role;
    if (!userRole) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  }

  // Check if user is admin
  async isAdmin() {
    return await this.hasRole("admin");
  }

  // Check if user is government or admin
  async isGovernmentOrAdmin() {
    return await this.hasRole(["government", "admin"]);
  }

  // Check if user is industry or admin
  async isIndustryOrAdmin() {
    return await this.hasRole(["industry", "admin"]);
  }

  // Synchronous versions for immediate checks
  isAdminSync() {
    return this.hasRoleSync("admin");
  }

  isGovernmentOrAdminSync() {
    return this.hasRoleSync(["government", "admin"]);
  }

  isIndustryOrAdminSync() {
    return this.hasRoleSync(["industry", "admin"]);
  }
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService;
