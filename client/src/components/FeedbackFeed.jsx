import React from "react";
import Sidebar from "./Sidebar";
import "./FeedbackFeed.css";
import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import API_URL from "../utils/api";

function FeedbackFeed() {
  const [feedbacks, setFeedbacks] = useState(null);
  const { formatTime, renderStars } = useOutletContext();
  const [filterRatingNum, setFilterRatingNum] = useState("all");
  const [filterTime, setFilterTime] = useState("24-hours");
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("feedback_token");
    async function compulsion() {
      const result = await fetch(
        `${API_URL}/api/feedback/feed?range=${filterTime}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (result.ok) {
        let data = await result.json();
        setFeedbacks(data.feedbacks);
      }
    }
    compulsion();
  }, [filterTime]);
  function filterRatingFnx(e) {
    const filterRatingValue = e.currentTarget.value;
    if (filterRatingValue !== "all") {
      setFilterRatingNum(parseInt(filterRatingValue, 10));
    } else {
      setFilterRatingNum("all");
    }
  }
  function filterTimeFnx(e) {
    const filterTimeValue = e.currentTarget.value;
    if (filterTimeValue !== "24-hours") {
      setFilterTime(filterTimeValue);
    } else {
      setFilterTime(filterTimeValue);
    }
  }
  function feedbackFnx(feedbackData) {
    return (
      <div className="feedback-card">
        <div className="card-header">
          <div className="customer-info">
            <div className="customer-avatar">
              {feedbackData.customer_name
                ? feedbackData.customer_name.slice(0, 1).toUpperCase()
                : "?"}
            </div>
            <div className="customer-details">
              <h4>
                {feedbackData.customer_name
                  ? feedbackData.customer_name
                  : "Anonymous"}
              </h4>
              <p>{`${feedbackData.customer_email ? `${feedbackData.customer_email} •` : ""} ${formatTime(feedbackData.created_at, "year")}`}</p>
            </div>
          </div>
          {renderStars(feedbackData.rating, "feedbackFeedStars")}
        </div>
        <p className="feedback-message">{feedbackData.message}</p>
      </div>
    );
  }
  function searchQueryFnx(e) {
    setSearchQuery(e.currentTarget.value);
  }
  if (!feedbacks) {
    return (
      <div className="loadingScreen">
        <h2
          style={{ color: "#FAFAFA", textAlign: "center", marginTop: "50px" }}
          i
        >
          Loading your feedbacks...
        </h2>
      </div>
    );
    ;
  }
  const filteredArr = feedbacks
    .filter((e) => {
      // this is for that rating filter.
      if (filterRatingNum !== "all") {
        return e.rating === filterRatingNum;
      }
      return true;
    })
    .filter((e, i) => {
      let name = e.customer_name?.toLowerCase() || "";
      let email = e.customer_email?.toLowerCase() || "";
      let message = e.message?.toLowerCase() || "";
      let searchQueryLowerCase = searchQuery.toLowerCase();
      if (searchQuery === "") return true;
      return (
        name.includes(searchQueryLowerCase) ||
        email.includes(searchQueryLowerCase) ||
        message.includes(searchQueryLowerCase)
      );
    });
  return (
    <main className="main-content feedback-feed-container">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Customer Feedback</h1>
          <p className="page-subtitle">
            View and manage all responses from your customers.
          </p>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="filters-bar">
        <input
          type="text"
          onChange={searchQueryFnx}
          value={searchQuery}
          className="filter-input"
          placeholder="Search by name, email, or keyword..."
        />
        <select className="filter-select" onChange={filterRatingFnx}>
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
        <select className="filter-select" onChange={filterTimeFnx}>
          <option value="24-hours">Last 24 Hours</option>
          <option value="7-days">Last 7 Days</option>
          <option value="30-days">Last 30 Days</option>
          <option value="all-time">All Time</option>
        </select>
      </div>

      {/* Feedback Cards List */}
      <div className="feedback-list">
        {filteredArr.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#a1a1aa",
              gridColumn: "1 / -1",
              marginTop: "40px",
            }}
          >
            <h3>No feedbacks found.</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          feedbacks.map((e, i) => feedbackFnx(e)) // this is the actual feedback rendering engine.
        )}
      </div>
    </main>
  );
}

export default FeedbackFeed;
