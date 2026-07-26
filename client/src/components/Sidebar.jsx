import "./Sidebar.css";
import DashboardIcon from "../assets/layout-dashboard.svg?react";
import FeedbackIcon from "../assets/messages-square.svg?react";
import SettingsIcon from "../assets/settings.svg?react";
import { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import API_URL from "../utils/api";
import { authContext } from "../context/AuthContext";

function Sidebar({ nameLogo }) {
  const [sidebarData, setSidebarData] = useState(null);
  useEffect(() => {
    async function compulsion() {
      const token = localStorage.getItem("feedback_token");
      const result = await fetch(`${API_URL}/api/feedback?data=sidebarData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const fetchedData = await result.json();
      setSidebarData(fetchedData);
    }
    compulsion();
  }, []);
  if (!nameLogo || !nameLogo.businessName || !nameLogo.logo_url)
    return (
      <div
        className="sidebar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          maxHeight: "100vh",
        }}
      >
        <p
          style={{
            color: "#FAFAFA",
            textAlign: "center",
            fontSize: "17px",
            fontWeight: "400",
          }}
        >
          Loading your sidebar...
        </p>
      </div>
    );
  return (
    <aside className="sidebar">
      <div className="brand">
        <img
          src={nameLogo.logo_url}
          alt="Logo"
          className="nav-logo logo-image-fit"
        />
        <h2>{nameLogo.businessName}</h2>
      </div>
      <nav className="nav-menu">
        <NavLink className="navItemWrapper" to="/dashboard">
          <DashboardIcon className="dashboardIcon navIcon" />
          <span className="nav-item">Dashboard</span>
        </NavLink>
        <NavLink className="navItemWrapper" to="/feedback">
          <FeedbackIcon className="feedbackIcon navIcon" />
          <span className="nav-item">Feedback</span>
        </NavLink>
        <NavLink className="navItemWrapper" to="/settings">
          <SettingsIcon className="settingIcon navIcon" />
          <span className="nav-item">Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
