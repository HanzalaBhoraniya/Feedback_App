import "./App.css";
import Login from "./pages/Login";
import { Routes, Route } from "react-router-dom";
import FeedbackForm from "./pages/FeedbackForm";
import FeedbackFeed from "./components/FeedbackFeed";
import ProfileSetup from "./components/ProfileSetup";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Settings from "./components/Settings";

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<AnalyticsDashboard />} />
          <Route path="/feedback" element={<FeedbackFeed />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/setUpForm" element={<ProfileSetup />} />
      </Route>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route path="/" element={<ProtectedRoute />} />
      <Route path="/feedbackForm/:id" element={<FeedbackForm />} />;
      <Route
        path="*"
        element={
          <div
            style={{
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#FAFAFA",
            }}
          >
            <h1
              style={{
                fontSize: "48px",
                color: "#863BFF",
                marginBottom: "10px",
              }}
            >
              404
            </h1>
            <h2 style={{ marginBottom: "20px" }}>Page Not Found</h2>
            <p style={{ color: "#a1a1aa", marginBottom: "30px" }}>
              The page you are looking for doesn't exist or has been moved.
            </p>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              style={{ width: "auto" }}
            >
              Return to Dashboard
            </button>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
