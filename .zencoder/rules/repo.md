# Blue-Carbon Repository Overview

- **Root**: c:\Users\HP\Blue-Carbon
- **Apps**:
  - **frontend**: React + Vite app (React 19, React Router 7, Tailwind 4). Entry: src/main.jsx, root component: src/App.jsx. Contexts: AuthContext, UserContext, NotificationContext. Notifications rendered by components/NotificationToaster.jsx.
  - **backend**: Node.js Express API with MongoDB, Passport (local + Google OAuth), sessions, and email service.

## Frontend

- **Start**: npm run dev (Vite on port 5173)
- **Build**: npm run build
- **Key deps**: react, react-dom, react-router-dom, axios, tailwindcss, framer-motion, recharts, leaflet/react-leaflet.
- **Routing**: Defined in src/App.jsx with role-based redirects via components/RoleBasedRedirect.
- **Notifications**: Provided by src/context/NotificationContext.jsx and shown by src/components/NotificationToaster.jsx.

## Backend

- **Start**: npm run dev (nodemon) or npm start
- **Key deps**: express, mongoose, passport, passport-google-oauth20, express-session, connect-mongo, jsonwebtoken, bcryptjs, nodemailer.
- **Entry**: backend/server.js; setup util: backend/start.js; test server: backend/test-server.js.
- **Routes**: backend/routes/auth.js, users.js, projects.js. Middleware: backend/middleware/auth.js.

## Environment

- **Backend env file**: backend/.env (see backend/env.example)
- **Frontend env**: Vite-style .env files if needed (not present).

## Testing Framework

- **Backend**: Jest (location: backend/tests/, configuration: backend/jest.config.js, pattern: \*.test.js)
- **Frontend**: Playwright (location: frontend/tests/, configuration: frontend/playwright.config.js, pattern: \*.spec.js)
- **Target Framework**: Playwright
- **E2E Tests**: Full application testing with Playwright across Chrome, Firefox, Safari

## Notes

- Error boundaries recommended for robustness in React (see React docs).
- Notification API supports both string and object calls after fix on 2025-09-05.
- Sidebar toggle functionality fixed on 2025-01-09 to prevent text overlap
