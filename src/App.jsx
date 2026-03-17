// import './App.css'
import {LoginModal } from "./pages/LoginModal";
import { SignupModal } from "./pages/SignupModal";
import { CustomerUpload } from "./pages/CustomerUpload";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/upload/:uniqueCode" element={<CustomerUpload />} />

      {/* Protected Dashboard (only visible after login) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* default route if u put wrong path */}
      <Route path="*" element={<LandingPage />} />

    </Routes>
  );
}

export default App;
