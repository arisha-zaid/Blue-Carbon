# Client Integration Guide

## Quick Start

### 1. Start the Server
```bash
cd backend
npm start
```

The server will start on `http://localhost:5000`

### 2. Environment Setup
Ensure your `.env` file has the correct `FRONTEND_URL`:
```env
FRONTEND_URL=http://localhost:5173
```

### 3. Test Connection
```bash
curl http://localhost:5000/api/health
```

## Client-Side Integration

### React/Vue/Angular Example

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Helper Class
class BlueCarbon API {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Remove authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return response;
  }

  // Project methods
  async getProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/projects${queryString ? `?${queryString}` : ''}`);
  }

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async fundProject(id, amount, paymentMethod) {
    return this.request(`/projects/${id}/fund`, {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod }),
    });
  }

  // Transaction methods
  async getTransactions() {
    return this.request('/transactions');
  }

  async createTransaction(transactionData) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Payment methods
  async createStripePaymentIntent(amount, currency, projectId) {
    return this.request('/payments/stripe/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, projectId }),
    });
  }

  async confirmStripePayment(paymentIntentId, projectId) {
    return this.request('/payments/stripe/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, projectId }),
    });
  }

  // File upload
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/uploads', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }
}

// Usage Example
const api = new BlueCarbonAPI();

// Login
try {
  const loginResult = await api.login('user@example.com', 'password123');
  console.log('Login successful:', loginResult);
} catch (error) {
  console.error('Login failed:', error.message);
}

// Get projects
try {
  const projects = await api.getProjects({ page: 1, limit: 10 });
  console.log('Projects:', projects.data);
} catch (error) {
  console.error('Failed to fetch projects:', error.message);
}

// Create project
try {
  const newProject = await api.createProject({
    title: 'Ocean Cleanup Initiative',
    description: 'Cleaning plastic waste from oceans',
    category: 'ocean-conservation',
    targetAmount: 75000,
    location: {
      country: 'India',
      state: 'Goa',
      city: 'Panaji'
    }
  });
  console.log('Project created:', newProject);
} catch (error) {
  console.error('Failed to create project:', error.message);
}
```

### WebSocket Integration

```javascript
import io from 'socket.io-client';

class BlueCarbonSocket {
  constructor(userId) {
    this.socket = io('http://localhost:5000');
    this.userId = userId;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      if (this.userId) {
        this.socket.emit('join-user-room', this.userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('project-update', (data) => {
      console.log('Project updated:', data);
      // Handle project updates in your UI
    });

    this.socket.on('transaction-complete', (data) => {
      console.log('Transaction completed:', data);
      // Handle transaction completion in your UI
    });
  }

  joinUserRoom(userId) {
    this.userId = userId;
    this.socket.emit('join-user-room', userId);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Usage
const socket = new BlueCarbonSocket();

// After user login
socket.joinUserRoom(user.id);
```

## Error Handling

```javascript
// Global error handler for API responses
function handleAPIError(error) {
  if (error.message.includes('401')) {
    // Unauthorized - redirect to login
    window.location.href = '/login';
  } else if (error.message.includes('429')) {
    // Rate limited
    alert('Too many requests. Please try again later.');
  } else {
    // Generic error
    console.error('API Error:', error);
    alert('An error occurred. Please try again.');
  }
}

// Usage in async functions
try {
  const result = await api.getProjects();
} catch (error) {
  handleAPIError(error);
}
```

## State Management Integration

### Redux Example

```javascript
// actions/api.js
import { BlueCarbonAPI } from '../utils/api';

const api = new BlueCarbonAPI();

export const loginUser = (email, password) => async (dispatch) => {
  dispatch({ type: 'LOGIN_START' });
  
  try {
    const response = await api.login(email, password);
    dispatch({ 
      type: 'LOGIN_SUCCESS', 
      payload: response.data 
    });
  } catch (error) {
    dispatch({ 
      type: 'LOGIN_FAILURE', 
      payload: error.message 
    });
  }
};

export const fetchProjects = (params) => async (dispatch) => {
  dispatch({ type: 'FETCH_PROJECTS_START' });
  
  try {
    const response = await api.getProjects(params);
    dispatch({ 
      type: 'FETCH_PROJECTS_SUCCESS', 
      payload: response.data 
    });
  } catch (error) {
    dispatch({ 
      type: 'FETCH_PROJECTS_FAILURE', 
      payload: error.message 
    });
  }
};
```

### Vuex Example

```javascript
// store/modules/auth.js
import { BlueCarbonAPI } from '@/utils/api';

const api = new BlueCarbonAPI();

export default {
  namespaced: true,
  
  state: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TOKEN(state, token) {
      state.token = token;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  
  actions: {
    async login({ commit }, { email, password }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await api.login(email, password);
        commit('SET_USER', response.data.user);
        commit('SET_TOKEN', response.data.token);
      } catch (error) {
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },
  },
};
```

## Testing Your Integration

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 3. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 4. Test Protected Endpoint
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Common Issues and Solutions

### CORS Issues
- Ensure your frontend URL is added to `allowedOrigins` in server.js
- Check that `FRONTEND_URL` in `.env` matches your client URL

### Authentication Issues
- Verify JWT token is being sent in Authorization header
- Check token expiration (default: 7 days)
- Ensure user exists and is active

### Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Adjust `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS` in `.env`

### Database Connection
- Verify MongoDB Atlas connection string
- Check network access and IP whitelist
- Ensure database user has proper permissions

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Security Considerations
- Use HTTPS in production
- Set secure session cookies
- Implement proper rate limiting
- Use strong JWT secrets
- Validate all input data
- Implement proper error handling

## Support

For issues or questions:
1. Check the API documentation
2. Verify your environment configuration
3. Test endpoints with curl or Postman
4. Check server logs for errors