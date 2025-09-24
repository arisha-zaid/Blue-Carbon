# 🌊 Blue Carbon API - Client Integration

## Quick Start

### 1. Start the Server
```bash
# Windows
start-server.bat

# Or manually
cd backend
npm install
npm start
```

### 2. Test the API
Open `CLIENT_EXAMPLE.html` in your browser to test all API endpoints interactively.

### 3. Server URLs
- **API Base:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`
- **WebSocket:** `http://localhost:5000`

## API Features ✨

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Google OAuth integration
- Session management

### 🌱 Project Management
- Create, read, update, delete projects
- Project categories: reforestation, ocean-conservation, renewable-energy, waste-management
- Location-based project filtering
- Project funding and tracking

### 💳 Payment Processing
- Stripe integration for credit cards
- PayPal integration
- Cryptocurrency payments via Coinbase
- Transaction history and tracking

### 🔗 Blockchain Integration
- Carbon credit tokenization
- Smart contract interactions
- Ethereum/Sepolia testnet support

### 📊 Real-time Features
- WebSocket connections for live updates
- Real-time project funding updates
- Transaction notifications

## Response Format

All API responses follow this consistent format:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Authentication Flow

1. **Register/Login** to get JWT token
2. **Store token** in localStorage or secure storage
3. **Include token** in Authorization header: `Bearer <token>`
4. **Handle token expiration** (7 days default)

## Key Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `POST /api/projects/:id/fund` - Fund a project

### Payments
- `POST /api/payments/stripe/create-intent` - Create Stripe payment
- `POST /api/payments/paypal/create-order` - Create PayPal order
- `POST /api/payments/stripe/confirm` - Confirm payment

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create transaction

## Error Handling

The API handles common errors gracefully:

- **401 Unauthorized** - Invalid or expired token
- **400 Bad Request** - Validation errors, invalid data
- **404 Not Found** - Resource not found
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server errors

## Rate Limiting

- **100 requests per 15 minutes** per IP address
- Configurable via environment variables
- Returns 429 status when exceeded

## CORS Configuration

Allowed origins:
- `http://localhost:5173` (Vite default)
- `http://localhost:5174`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`

## Environment Configuration

Key environment variables for client integration:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Client Libraries

### JavaScript/TypeScript
```javascript
// Fetch API
const response = await fetch('http://localhost:5000/api/projects', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Axios
import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### React Example
```jsx
import { useState, useEffect } from 'react';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/projects');
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {projects.map(project => (
        <div key={project._id}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <p>Target: ${project.targetAmount}</p>
        </div>
      ))}
    </div>
  );
}
```

### Vue Example
```vue
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-for="project in projects" :key="project._id">
        <h3>{{ project.title }}</h3>
        <p>{{ project.description }}</p>
        <p>Target: ${{ project.targetAmount }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      projects: [],
      loading: true
    };
  },
  
  async mounted() {
    await this.fetchProjects();
  },
  
  methods: {
    async fetchProjects() {
      try {
        const response = await fetch('http://localhost:5000/api/projects');
        const data = await response.json();
        
        if (data.success) {
          this.projects = data.data;
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

## WebSocket Integration

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join user room for personalized updates
socket.emit('join-user-room', userId);

// Listen for real-time updates
socket.on('project-update', (data) => {
  console.log('Project updated:', data);
  // Update UI accordingly
});

socket.on('transaction-complete', (data) => {
  console.log('Transaction completed:', data);
  // Show success notification
});
```

## Testing

### Manual Testing
1. Open `CLIENT_EXAMPLE.html` in browser
2. Test all endpoints interactively
3. Check browser console for detailed logs

### API Testing Tools
- **Postman**: Import endpoints from documentation
- **curl**: Command-line testing
- **Insomnia**: REST client alternative

### Example curl Commands
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get projects (with auth)
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your frontend URL is in `allowedOrigins`
   - Check `FRONTEND_URL` in `.env`

2. **Authentication Errors**
   - Verify JWT token format: `Bearer <token>`
   - Check token expiration
   - Ensure user exists and is active

3. **Connection Errors**
   - Verify server is running on correct port
   - Check MongoDB connection
   - Ensure no firewall blocking

4. **Rate Limiting**
   - Wait for rate limit window to reset
   - Adjust limits in environment variables

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and stack traces.

## Production Deployment

### Security Checklist
- [ ] Use HTTPS in production
- [ ] Set strong JWT secrets
- [ ] Configure proper CORS origins
- [ ] Enable rate limiting
- [ ] Use secure session cookies
- [ ] Validate all input data
- [ ] Set up proper logging
- [ ] Use environment variables for secrets

### Performance Tips
- Enable MongoDB connection pooling
- Use Redis for session storage
- Implement caching for frequently accessed data
- Monitor API response times
- Set up proper error tracking

## Support

For issues or questions:
1. Check the API documentation (`API_DOCUMENTATION.md`)
2. Test with the client example (`CLIENT_EXAMPLE.html`)
3. Verify server logs for errors
4. Check environment configuration

---

**Happy coding! 🚀**