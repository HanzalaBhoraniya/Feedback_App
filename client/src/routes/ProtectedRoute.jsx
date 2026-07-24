import { useContext, useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authContext } from "../context/AuthContext";

function ProtectedRoute() {
    const location = useLocation();
    const navigate = useNavigate();
    const { authStatus } = useContext(authContext) // due to this we are accessing that data which our authcontext is broadcasting to his childrens.
    const pathname = location.pathname
    const token = localStorage.getItem("feedback_token");
    if (!token || authStatus === "login" || authStatus === "loginInvalidToken") {
        return <Navigate to="/login" replace/>
    }
    if (authStatus === "checking") {
        return <h2 style={{ color: "#FAFAFA", textAlign: "center", marginTop: "50px" }}>Verifying Security Clearance...</h2>;
    }
    if (authStatus === "setUpForm") {
        if (pathname !== "/setUpForm") {
            return <Navigate to="/setUpForm" replace/>
        }
    }
    if (authStatus === "dashboard") {
        if (pathname !== "/dashboard" && pathname !== "/feedback" && pathname !== "/settings") {
            return <Navigate to="/dashboard" replace/>
        }
    }
    // if they pass all the filters then let them go where they wants to.
  return <Outlet />; // this outlet means all the components which are wrapped in this ProtectedRoute render it.
}

export default ProtectedRoute;
