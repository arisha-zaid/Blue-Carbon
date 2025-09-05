# Blue Carbon API Documentation

## Overview

The Blue Carbon API is a comprehensive backend system for managing environmental complaints, carbon credit projects, and blockchain integration. It provides endpoints for complaint management, project tracking, carbon credit trading, and decentralized data storage.

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "pagination": {
    // Present only for paginated responses
    "current": 1,
    "total": 10,
    "hasNext": true,
    "hasPrev": false,
    "count": 20,
    "totalRecords": 200
  }
}
```

## Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "errors": [
    // Validation errors array (if applicable)
  ]
}
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "community",
  "organization": {
    "name": "Green Earth Foundation",
    "type": "ngo"
  }
}
```

### POST /auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### GET /auth/profile
Get current user profile (requires authentication).

### PUT /auth/profile
Update user profile (requires authentication).

## Complaints API

### POST /complaints
Submit a new environmental complaint.

**Headers:**
- `Content-Type: multipart/form-data` (for file uploads)

**Request Body:**
```json
{
  "title": "Illegal Dumping in River",
  "description": "Industrial waste being dumped into the local river...",
  "category": "water_pollution",
  "priority": "high",
  "urgency": "high",
  "location": {
    "address": "123 River Street, City, State",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "city": "New York",
    "state": "NY",
    "country": "USA"
  },
  "contactInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "isAnonymous": false,
  "isPublic": true,
  "tags": ["industrial", "water", "urgent"],
  "impactArea": "local",
  "affectedPopulation": 5000,
  "environmentalImpact": {
    "severity": "severe",
    "duration": "long_term",
    "reversibility": "partially_reversible"
  }
}
```

**Files:**
- `evidence[]`: Array of evidence files (images, videos, documents)

### GET /complaints
Get list of complaints with filtering and pagination.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20, max: 100)
- `category`: Filter by category
- `status`: Filter by status
- `priority`: Filter by priority
- `city`: Filter by city
- `state`: Filter by state
- `search`: Text search in title/description
- `sortBy`: Sort by field (createdAt, priority, upvotes)
- `sortOrder`: Sort order (asc, desc)

### GET /complaints/:id
Get specific complaint details.

### PUT /complaints/:id
Update complaint (requires authentication and ownership).

### POST /complaints/:id/evidence
Add evidence to existing complaint.

### POST /complaints/:id/vote
Vote on complaint (upvote/downvote).

**Request Body:**
```json
{
  "vote": "up"  // or "down"
}
```

### PUT /complaints/:id/status
Update complaint status (admin/assigned user only).

**Request Body:**
```json
{
  "status": "investigating",
  "message": "Investigation started by environmental team",
  "isPublic": true
}
```

### GET /complaints/statistics
Get complaint statistics and analytics.

## Projects API

### POST /projects
Create a new environmental project.

**Request Body:**
```json
{
  "name": "Coastal Mangrove Restoration",
  "description": "Restore 100 hectares of mangrove forest...",
  "shortDescription": "Mangrove restoration project in coastal area",
  "type": "reforestation",
  "category": "restoration",
  "tags": ["mangrove", "coastal", "biodiversity"],
  "location": {
    "address": "Coastal Area, State, Country",
    "coordinates": {
      "latitude": 25.7617,
      "longitude": -80.1918
    },
    "city": "Miami",
    "state": "FL",
    "country": "USA",
    "area": 100
  },
  "endDate": "2025-12-31T00:00:00Z",
  "duration": 24,
  "phase": "planning",
  "funding": {
    "goal": 500000,
    "currency": "USD",
    "breakdown": {
      "equipment": 100000,
      "personnel": 200000,
      "materials": 150000,
      "monitoring": 50000
    }
  },
  "carbonImpact": {
    "estimatedReduction": 1000,
    "projections": [{
      "year": 2025,
      "estimatedReduction": 1000,
      "confidence": "high"
    }]
  },
  "socialImpact": {
    "beneficiaries": 10000,
    "communities": ["Coastal Community A", "Fishing Village B"],
    "jobs": {
      "created": 50,
      "type": ["environmental technician", "field worker"]
    }
  }
}
```

### GET /projects
Get list of projects with filtering.

**Query Parameters:**
- `page`, `limit`: Pagination
- `type`: Project type filter
- `status`: Project status filter
- `category`: Project category filter
- `country`, `city`: Location filters
- `minFunding`, `maxFunding`: Funding range filter
- `isVerified`: Filter verified projects
- `search`: Text search
- `nearLatitude`, `nearLongitude`, `maxDistance`: Geographic search

### GET /projects/:id
Get specific project details.

### POST /projects/:id/fund
Fund a project.

**Request Body:**
```json
{
  "amount": 1000,
  "currency": "USD",
  "fundingType": "donation",
  "message": "Great project for the environment!",
  "isAnonymous": false
}
```

### POST /projects/:id/milestones
Add milestone to project.

**Request Body:**
```json
{
  "title": "Site Assessment Complete",
  "description": "Complete environmental assessment of the project site",
  "targetDate": "2024-03-31T00:00:00Z",
  "budget": {
    "allocated": 25000
  }
}
```

### POST /projects/:id/progress
Update project progress.

**Request Body:**
```json
{
  "message": "Site preparation completed, starting planting phase",
  "progress": 25
}
```

### GET /projects/search/nearby
Find projects near a location.

**Query Parameters:**
- `latitude` (required): Latitude coordinate
- `longitude` (required): Longitude coordinate
- `maxDistance`: Maximum distance in km (default: 50)
- `type`: Project type filter
- `limit`: Results limit (default: 20)

## Blockchain API

### GET /blockchain/status
Get blockchain service status and wallet information.

### POST /blockchain/credits/issue
Issue carbon credits (admin only).

**Request Body:**
```json
{
  "to": "0x742d35Cc7D28fb0A7EdAE0b3F7e1E9D52b0B6D12",
  "amount": 100,
  "projectId": "PROJ-2024-001",
  "location": "Amazon Rainforest, Brazil",
  "expiryDate": "2025-12-31T00:00:00Z",
  "methodology": "REDD+",
  "additionalData": {
    "verifier": "International Verification Body",
    "certificationStandard": "VCS"
  }
}
```

### GET /blockchain/credits/balance/:address
Get carbon credit balance for an address.

### GET /blockchain/credits/:creditId
Get carbon credit details from blockchain.

### POST /blockchain/credits/retire
Retire carbon credits.

**Request Body:**
```json
{
  "creditId": 1,
  "amount": 10,
  "reason": "Corporate carbon offset for Q4 2024"
}
```

### POST /blockchain/complaints
Submit complaint to blockchain.

**Request Body:**
```json
{
  "title": "Air Pollution from Factory",
  "description": "Excessive smoke emission from nearby factory",
  "category": 0,  // Numeric category (0=air_pollution, 1=water_pollution, etc.)
  "priority": 2, // 0=low, 1=medium, 2=high, 3=critical
  "location": "Factory District, City",
  "evidenceFiles": [
    {
      "filename": "smoke_photo.jpg",
      "data": "base64_encoded_data",
      "type": "image",
      "size": 1024576
    }
  ],
  "isAnonymous": false
}
```

### GET /blockchain/complaints/:complaintId
Get complaint from blockchain.

### PUT /blockchain/complaints/:complaintId/status
Update complaint status on blockchain (admin only).

### POST /blockchain/projects
Register project on blockchain.

### GET /blockchain/projects/:projectId
Get project from blockchain.

### POST /blockchain/projects/:projectId/fund
Fund project on blockchain.

### GET /blockchain/transaction/:txHash
Get transaction receipt and status.

## File Upload Guidelines

### Supported File Types

**Evidence/Documents:**
- Images: JPEG, PNG, GIF
- Videos: MP4, MPEG, QuickTime
- Audio: MP3, WAV
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX

### Size Limits
- Individual file: 25MB (projects), 10MB (complaints)
- Total upload per request: 100MB
- Maximum files per upload: 20 (projects), 10 (complaints)

### IPFS Integration
All uploaded files are automatically stored on IPFS for decentralized access and blockchain integration.

## WebSocket Events

Connect to WebSocket for real-time updates:
```javascript
const socket = io('http://localhost:5000');

// Join complaint updates
socket.emit('join_complaint', complaintId);

// Join project updates  
socket.emit('join_project', projectId);

// Listen for updates
socket.on('complaint_updated', (data) => {
  // Handle complaint update
});

socket.on('project_funded', (data) => {
  // Handle project funding update
});
```

## Rate Limiting

API requests are limited to prevent abuse:
- Window: 15 minutes
- Limit: 100 requests per IP
- Applies to: All `/api/*` endpoints

## Pagination

Paginated endpoints return:
```json
{
  "pagination": {
    "current": 1,
    "total": 10,
    "hasNext": true,
    "hasPrev": false,
    "count": 20,
    "totalRecords": 200
  }
}
```

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `403`: Forbidden / Insufficient Permissions
- `404`: Resource Not Found
- `429`: Too Many Requests (Rate Limited)
- `500`: Internal Server Error
- `503`: Service Unavailable (Blockchain/IPFS offline)

## Environment Variables

Required configuration:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/blue_carbon

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Blockchain
ETHEREUM_NETWORK=sepolia
INFURA_PROJECT_ID=your_infura_id
PRIVATE_KEY=your_private_key
GAS_PRICE=20
GAS_LIMIT=6000000

# IPFS
IPFS_ENDPOINT=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=your_ipfs_id
IPFS_PROJECT_SECRET=your_ipfs_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Redis (Job Queue)
REDIS_URL=redis://localhost:6379

# Frontend
FRONTEND_URL=http://localhost:5173
```

## Testing

Use the provided Postman collection or test files:

```bash
# Run tests
npm test

# Run specific test suite
npm test -- --grep "Complaints"

# Generate test coverage
npm run test:coverage
```

## Error Handling

The API includes comprehensive error handling:

1. **Validation Errors**: Input validation with detailed field-level errors
2. **Authentication Errors**: JWT validation and authorization
3. **Database Errors**: MongoDB connection and operation errors
4. **Blockchain Errors**: Network issues, gas estimation, transaction failures
5. **IPFS Errors**: Upload failures, network timeouts
6. **File Upload Errors**: Size limits, type validation, storage failures

All errors are logged and can be monitored through the logging system.

## Monitoring and Logs

Logs are structured and stored in:
- `logs/combined.log`: All application logs
- `logs/error.log`: Error logs only  
- `logs/blockchain.log`: Blockchain operations
- `logs/exceptions.log`: Uncaught exceptions

Use log levels: `error`, `warn`, `info`, `http`, `debug`

## Security Features

1. **Helmet**: Security headers
2. **CORS**: Cross-origin request handling
3. **Rate Limiting**: Request throttling
4. **Input Validation**: Express-validator
5. **Password Hashing**: bcrypt with salt
6. **JWT Authentication**: Secure token-based auth
7. **File Upload Security**: Type and size validation
8. **SQL Injection Protection**: MongoDB parameter binding
9. **XSS Protection**: Input sanitization

## Support

For API support and documentation issues:
- Email: support@bluecarbon.org
- Documentation: [API Docs](https://docs.bluecarbon.org)
- GitHub: [Issues](https://github.com/bluecarbon/api/issues)