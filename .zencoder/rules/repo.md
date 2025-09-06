# Repository Testing Framework

## Backend Testing
- **Framework**: Jest
- **Location**: backend/tests/
- **Configuration**: backend/jest.config.js
- **Test Pattern**: *.test.js
- **Environment**: Node.js
- **Coverage**: API endpoints, authentication, data validation, error handling

## Frontend Testing  
- **Framework**: Playwright
- **Location**: frontend/tests/
- **Configuration**: frontend/playwright.config.js
- **Test Pattern**: *.spec.js
- **Target Framework**: Playwright
- **Coverage**: E2E user flows, authentication, project management, dashboards

## E2E Testing
- **Framework**: Playwright 
- **Target**: Full application (frontend + backend)
- **Browser**: Chrome, Firefox, Safari
- **Base URL**: http://localhost:5174 (frontend dev server)
- **Test Files**: 6 comprehensive test suites with 177 total tests

## Key Application Components
- Backend API server (Express.js on port 5000)
- Frontend React app (Vite on port 5174) 
- MongoDB database
- Blockchain services (optional)
- Socket.IO for real-time features

## Test Execution Status
- **Last Updated**: 2025-01-09
- **Frontend Tests**: 177 tests across 6 files
- **Backend Tests**: 26 API integration tests  
- **Overall Health**: GOOD (minor issues documented)
- **Coverage Areas**: Authentication, Navigation, Project Management, Dashboards, API Integration