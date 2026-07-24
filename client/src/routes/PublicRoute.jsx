import { useContext, useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authContext } from "../context/AuthContext";

function PublicRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authStatus } = useContext(authContext);
  if (authStatus === "checking") {
    return (
      <h2 style={{ color: "#FAFAFA", textAlign: "center", marginTop: "50px" }}>
        Verifying Security Clearance...
      </h2>
    );
  }
  if (authStatus === "setUpForm") {
    return <Navigate to="/setUpForm" replace />;
  }
  if (authStatus === "dashboard") {
    return <Navigate to="/dashboard" replace />;
  }
  if (authStatus === "loginInvalidToken") {
    localStorage.removeItem("feedback_token");
    return <Outlet />; // this outlet means all the components which are wrapped in this ProtectedRoute render it.
  }
  return <Outlet />; // this outlet means all the components which are wrapped in this ProtectedRoute render it.
}

export default PublicRoute;
