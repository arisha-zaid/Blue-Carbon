import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { NotificationProvider, NotificationToaster } from "./context/NotificationContext.jsx";
import "./i18n/index.js"; // i18n initialization
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <UserProvider>
          <NotificationToaster />
          <App />
        </UserProvider>
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>
);
