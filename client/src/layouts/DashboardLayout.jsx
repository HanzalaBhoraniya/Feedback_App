import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import API_URL from "../utils/api";

function DashboardLayout() {
  const [nameLogo, setNameLogo] = useState({});
  useEffect(() => {
    async function fetchBusinessData() {
      try {
        const token = localStorage.getItem("feedback_token");
        // this request will be cought my that controller which provided all the data for the dashboard.
        const result = await fetch(`${API_URL}/api/feedback`, {
          headers: {
            Authorization: `Bearer ${token ? token : ""}`,
          },
        });

        let data = await result.json();
        // If the fetch succeeds AND the backend found the business name
        if (result.ok && data.businessName) {
          const newData = {
            businessName: data.businessName,
            logo_url: data.logo_url,
          };
          setNameLogo(newData);
        } else {
          // If the ID is wrong, the backend sends a message. We catch it here!
          console.log(
            data.message || "Business profile not found in database.",
          );
        }
      } catch (err) {
        // If the backend is off or blocked, we catch the fatal network crash here!
        console.error("Network Error:", err);
        setError("Failed to connect to the Express backend.");
      }
    }
    fetchBusinessData();
  }, []);
  function formatTime(garbageTimeStamp, year) {
    const timeStamp = new Date(garbageTimeStamp);
    let shortDate;
    if (year) {
      shortDate = timeStamp.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } else {
      shortDate = timeStamp.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    ` at `;
    const time = timeStamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${shortDate} at ${time}`;
  }
  function renderStars(ratingNum, className) {
    return (
      <div className={className}>
        {[...Array(5)].map((_, index) => {
          let isFilled = index < ratingNum;
          return (
            <svg
              key={index}
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isFilled ? "#863bff" : "transparent"}
              stroke={isFilled ? "#863bff" : "#27272a"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          );
        })}
      </div>
    );
  }
  return (
    <div className="main">
      <Sidebar />
      <Outlet context={{ formatTime, renderStars, nameLogo }} />
    </div>
  );
}

export default DashboardLayout;
