import "./Sidebar.css";
import DashboardIcon from "../assets/layout-dashboard.svg?react";
import FeedbackIcon from "../assets/messages-square.svg?react";
import SettingsIcon from "../assets/settings.svg?react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../utils/api";

function Sidebar({ logo_url, businessName }) {
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
  if (!sidebarData)
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
        <img src={sidebarData.logo_url} alt="Logo" className="nav-logo" />
        <h2>{sidebarData.businessName}</h2>
      </div>
      <nav className="nav-menu">
        <Link className="navItemWrapper" to="/dashboard">
          <DashboardIcon className="dashboardIcon navIcon" />
          <span className="nav-item">Dashboard</span>
        </Link>
        <Link className="navItemWrapper" to="/feedback">
          <FeedbackIcon className="feedbackIcon navIcon" />
          <span className="nav-item">Feedback</span>
        </Link>
        <Link className="navItemWrapper" to="/settings">
          <SettingsIcon className="settingIcon navIcon" />
          <span className="nav-item">Settings</span>
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;
