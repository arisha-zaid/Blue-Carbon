# Carbon SIH Backend API

A comprehensive Node.js/Express backend for the Carbon SIH project with authentication, user management, and role-based access control.

## 🚀 Features

- **Authentication System**

  - Local authentication (email/password)
  - Google OAuth 2.0 integration
  - JWT token-based authentication
  - Session-based authentication with Passport.js
  - Password reset functionality
  - Email verification

- **User Management**

  - Role-based access control (Community, Industry, Government, Admin, NGO)
  - User profile management
  - Account verification system
  - User statistics and analytics

- **Security Features**

  - Password hashing with bcrypt
  - Rate limiting
  - Input validation and sanitization
  - CORS configuration
  - Helmet.js security headers
  - Account lockout after failed attempts

- **Email Services**
  - Welcome emails
  - Email verification
  - Password reset emails
  - Role change notifications

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd carbon-sih-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/carbon_sih

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

   # Session Secret
   SESSION_SECRET=your-session-secret

   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Google OAuth Setup**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`

5. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🗄️ Database Setup

The application uses MongoDB with Mongoose ODM. The database will be created automatically when you first run the application.

### Database Collections

- **users**: User accounts and profiles
- **sessions**: User sessions (if using session-based auth)

## 📚 API Endpoints

### Authentication Routes

#### POST `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "community",
  "organization": {
    "name": "Example Corp"
  },
  "phone": "+1234567890"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

#### POST `/api/auth/login`

Authenticate user with email and password.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/google`

Initiate Google OAuth authentication.

#### GET `/api/auth/google/callback`

Google OAuth callback endpoint.

#### POST `/api/auth/forgot-password`

Request password reset.

#### POST `/api/auth/reset-password`

Reset password with token.

#### POST `/api/auth/logout`

Logout user.

#### GET `/api/auth/me`

Get current user profile.

### User Management Routes

#### GET `/api/users`

Get all users (admin only).

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Users per page (default: 10)
- `role`: Filter by role
- `search`: Search by name, email, or organization
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order (asc/desc, default: desc)

#### GET `/api/users/:id`

Get user by ID.

#### PUT `/api/users/:id`

Update user profile.

#### PUT `/api/users/:id/role`

Update user role (admin only).

#### PUT `/api/users/:id/status`

Update user status (admin only).

#### PUT `/api/users/:id/verify`

Verify user email (admin only).

#### DELETE `/api/users/:id`

Delete user (admin only).

#### GET `/api/users/stats/overview`

Get user statistics (admin only).

## 🔐 Authentication & Authorization

### JWT Tokens

The API uses JWT tokens for stateless authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Role-Based Access Control

- **Community**: Basic user access
- **Industry**: Industry-specific features
- **Government/NGO**: Government features
- **Admin**: Full system access

### Protected Routes

Use middleware to protect routes:

```javascript
const { isAuthenticated, hasRole, isAdmin } = require('../middleware/auth');

// Require authentication
router.get('/profile', isAuthenticated, (req, res) => { ... });

// Require specific role
router.get('/admin', hasRole('admin'), (req, res) => { ... });

// Require admin role
router.delete('/users/:id', isAdmin, (req, res) => { ... });
```

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in your `.env` file

### Email Templates

The system includes professionally designed email templates for:

- Welcome emails
- Email verification
- Password reset
- Role change notifications

## 🚨 Security Features

### Rate Limiting

- Login attempts: 5 per 15 minutes
- Password reset requests: 3 per hour
- General API: 100 requests per 15 minutes

### Account Protection

- Account lockout after 5 failed login attempts
- Lockout duration: 2 hours
- Password requirements: minimum 6 characters
- Secure password hashing with bcrypt

### Input Validation

All inputs are validated using express-validator:

- Email format validation
- Password strength requirements
- Input sanitization
- SQL injection prevention

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📊 Monitoring & Health

### Health Check Endpoint

```
GET /api/health
```

Returns server status, uptime, and timestamp.

### Logging

The application logs:

- Authentication attempts
- User actions
- Errors and exceptions
- Database operations

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**

   - Set `NODE_ENV=production`
   - Use strong, unique secrets
   - Configure production database

2. **Security**

   - Enable HTTPS
   - Set secure cookie options
   - Configure CORS for production domain

3. **Performance**
   - Enable compression
   - Use PM2 or similar process manager
   - Set up monitoring and logging

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates & Maintenance

- Regular security updates
- Dependency updates
- Performance optimizations
- Feature additions

---

**Note**: This is a development version. For production use, ensure all security measures are properly configured and tested.


