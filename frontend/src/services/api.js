const API_BASE_URL = "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem("token");
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  // Get user role from localStorage
  getUserRole() {
    return localStorage.getItem("role");
  }

  // Set user role in localStorage
  setUserRole(role) {
    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }
  }

  // Get user data from localStorage
  getUserData() {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  }

  // Set user data in localStorage
  setUserData(userData) {
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
    } else {
      localStorage.removeItem("userData");
    }
  }

  // Clear all auth data
  clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userData");
  }

  // Make HTTP request with authentication
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
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

  // Authentication methods
  async register(userData) {
    const response = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success) {
      this.setAuthToken(response.data.token);
      this.setUserRole(response.data.user.role);
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
      this.setAuthToken(response.data.token);
      this.setUserRole(response.data.user.role);
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
    const response = await this.request("/auth/refresh", {
      method: "POST",
    });

    if (response.success) {
      this.setAuthToken(response.data.token);
    }

    return response;
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

  // Project methods (placeholder for future implementation)
  async getProjects() {
    return await this.request("/projects");
  }

  async getProjectById(projectId) {
    return await this.request(`/projects/${projectId}`);
  }

  // Health check
  async healthCheck() {
    return await this.request("/health");
  }

  // Check if user is authenticated
  // Checks if the JWT token exists and is not expired
  isAuthenticated() {
    const token = this.getAuthToken();
    if (!token) return false;
    try {
      // Decode JWT (header.payload.signature)
      const payload = JSON.parse(atob(token.split(".")[1]));
      // Check expiry (exp is in seconds)
      if (payload.exp && Date.now() / 1000 < payload.exp) {
        return true;
      } else {
        this.clearAuthData();
        return false;
      }
    } catch (e) {
      this.clearAuthData();
      return false;
    }
  }

  // Check if user has specific role
  hasRole(role) {
    const userRole = this.getUserRole();
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole("admin");
  }

  // Check if user is government or admin
  isGovernmentOrAdmin() {
    return this.hasRole(["government", "admin"]);
  }

  // Check if user is industry or admin
  isIndustryOrAdmin() {
    return this.hasRole(["industry", "admin"]);
  }
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService;
