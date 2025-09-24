# Blue Carbon API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data (if applicable)
  "error": "Error message" // Only present if success is false
}
```

## Endpoints

### Authentication (`/api/auth`)

#### Register User
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // optional, defaults to "user"
}
```

#### Login User
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`

#### Logout
- **POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`

#### Google OAuth
- **GET** `/api/auth/google` - Redirect to Google OAuth
- **GET** `/api/auth/google/callback` - Google OAuth callback

### Users (`/api/users`)

#### Get User Profile
- **GET** `/api/users/profile`
- **Headers:** `Authorization: Bearer <token>`

#### Update User Profile
- **PUT** `/api/users/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "name": "Updated Name",
  "bio": "User bio",
  "location": "City, Country"
}
```

#### Get All Users (Admin only)
- **GET** `/api/users`
- **Headers:** `Authorization: Bearer <token>`

### Projects (`/api/projects`)

#### Create Project
- **POST** `/api/projects`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "title": "Project Title",
  "description": "Project description",
  "category": "reforestation", // or "ocean-conservation", "renewable-energy", "waste-management"
  "location": {
    "country": "India",
    "state": "Maharashtra",
    "city": "Mumbai",
    "coordinates": {
      "latitude": 19.0760,
      "longitude": 72.8777
    }
  },
  "targetAmount": 100000,
  "duration": 12, // months
  "carbonCreditsExpected": 500,
  "organization": {
    "name": "Green Earth NGO",
    "type": "ngo", // or "government", "private", "community"
    "registrationNumber": "REG123456"
  }
}
```

#### Get All Projects
- **GET** `/api/projects`
- **Query Parameters:**
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `category` (optional): Filter by category
  - `status` (optional): Filter by status

#### Get Project by ID
- **GET** `/api/projects/:id`

#### Update Project
- **PUT** `/api/projects/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Same as create project

#### Delete Project
- **DELETE** `/api/projects/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Fund Project
- **POST** `/api/projects/:id/fund`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "amount": 1000,
  "paymentMethod": "stripe" // or "paypal", "crypto"
}
```

### Transactions (`/api/transactions`)

#### Get User Transactions
- **GET** `/api/transactions`
- **Headers:** `Authorization: Bearer <token>`

#### Get Transaction by ID
- **GET** `/api/transactions/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Create Transaction
- **POST** `/api/transactions`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "projectId": "project_id",
  "amount": 1000,
  "type": "funding", // or "withdrawal", "carbon_credit_purchase"
  "paymentMethod": "stripe"
}
```

### Payments (`/api/payments`)

#### Create Stripe Payment Intent
- **POST** `/api/payments/stripe/create-intent`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "amount": 1000,
  "currency": "usd",
  "projectId": "project_id"
}
```

#### Confirm Stripe Payment
- **POST** `/api/payments/stripe/confirm`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "projectId": "project_id"
}
```

#### Create PayPal Order
- **POST** `/api/payments/paypal/create-order`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "amount": 1000,
  "currency": "USD",
  "projectId": "project_id"
}
```

#### Capture PayPal Payment
- **POST** `/api/payments/paypal/capture`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "orderId": "paypal_order_id",
  "projectId": "project_id"
}
```

### Blockchain (`/api/blockchain`)

#### Get Carbon Credits
- **GET** `/api/blockchain/carbon-credits/:address`

#### Transfer Carbon Credits
- **POST** `/api/blockchain/transfer-credits`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "to": "recipient_address",
  "amount": 100
}
```

### Community (`/api/community`)

#### Get Community Posts
- **GET** `/api/community/posts`

#### Create Community Post
- **POST** `/api/community/posts`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "title": "Post Title",
  "content": "Post content",
  "category": "discussion" // or "announcement", "question"
}
```

### File Uploads (`/api/uploads`)

#### Upload File
- **POST** `/api/uploads`
- **Headers:** `Authorization: Bearer <token>`
- **Content-Type:** `multipart/form-data`
- **Body:** Form data with file field

### Admin (`/api/admin`)

#### Get Dashboard Stats
- **GET** `/api/admin/dashboard`
- **Headers:** `Authorization: Bearer <token>` (Admin role required)

#### Get All Users
- **GET** `/api/admin/users`
- **Headers:** `Authorization: Bearer <token>` (Admin role required)

#### Update User Role
- **PUT** `/api/admin/users/:id/role`
- **Headers:** `Authorization: Bearer <token>` (Admin role required)
- **Body:**
```json
{
  "role": "admin" // or "user", "moderator"
}
```

## Health Check

#### Server Health
- **GET** `/api/health`

#### Database Health
- **GET** `/api/health/db`

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per IP address

## CORS Configuration

Allowed origins:
- `http://localhost:5173` (default frontend)
- `http://localhost:5174`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`

## WebSocket Events

Connect to: `http://localhost:5000`

### Events:
- `join-user-room` - Join user-specific room for real-time updates
- `project-update` - Real-time project updates
- `transaction-complete` - Transaction completion notifications

## Environment Variables

Required environment variables for client integration:
- `FRONTEND_URL` - Your frontend URL for CORS
- `JWT_SECRET` - JWT signing secret
- `MONGODB_URI` - MongoDB connection string

## Example Client Usage (JavaScript)

```javascript
// Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// Get projects
const projectsResponse = await fetch('http://localhost:5000/api/projects', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const projects = await projectsResponse.json();

// Create project
const createProjectResponse = await fetch('http://localhost:5000/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My Green Project',
    description: 'A project to save the environment',
    category: 'reforestation',
    targetAmount: 50000
  })
});
```

## WebSocket Client Example

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join user room for real-time updates
socket.emit('join-user-room', userId);

// Listen for project updates
socket.on('project-update', (data) => {
  console.log('Project updated:', data);
});
```