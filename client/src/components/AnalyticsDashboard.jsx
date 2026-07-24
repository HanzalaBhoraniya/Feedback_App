import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import "./AnalyticsDashboard.css";
import QRIcon from "../assets/qr-code.svg?react";
import LinkIcon from "../assets/link.svg?react";
import DownloadIcon from "../assets/download.svg?react";
import CloseIcon from "../assets/x.svg?react";
import TrendData from "./SentimentChart";
import { QRCodeCanvas } from "qrcode.react";
import { Navigate, useNavigate, useOutletContext } from "react-router-dom";
import API_URL from "../utils/api";

function AnalyticsDashboard() {
  const [businessData, setBusinessData] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [qrPopUp, setQrPopUp] = useState(false);
  const qrCode = useRef(null);
  const navigate = useNavigate();
  const { formatTime, renderStars } = useOutletContext();
  function openQrPopUp() {
    setQrPopUp(true);
  }
  function closeQrPopUp(e) {
    if (e.target.className === "qrCodeBoxWrapper") {
      setQrPopUp(false);
    } else if (e.currentTarget.className === "closeQr") {
      setQrPopUp(false);
    }
  }
  function downloadQr(e) {
    let current = qrCode.current;
    if (current) {
      console.log(current);
      const pngUrl = current.toDataURL("image/png");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${businessData.businessName.replace("/\s+/g", "_")}_QR.png`;
      document.body.appendChild(downloadLinik);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }
  useEffect(() => {
    async function compulsion() {
      const token = localStorage.getItem("feedback_token");
      const result = await fetch(`${API_URL}/api/feedback`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const fetchedData = await result.json();
      if (result.ok) {
        setBusinessData(fetchedData);
      } else if (fetchedData.message === "Redirect to setup form") {
        return navigate("/setUpForm");
      }
    }
    compulsion();
  }, []);

  if (!businessData)
    return (
      <div className="loadingScreen">
        <h2
          style={{ color: "#FAFAFA", textAlign: "center", marginTop: "50px" }}
        >
          Loading your dashboard...
        </h2>
      </div>
    );
  async function copyFormLink() {
    await navigator.clipboard.writeText(businessData.feedbackUrl);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }
  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div>
          <p className="subtitle">BUSINESS PERFORMANCE DASHBOARD</p>
          <h1>Welcome Back, Owner!</h1>
        </div>
      </header>

      {/* TOP STAT CARDS */}
      <section className="stats-grid">
        <div className="stat-card">
          <h3>Total Resposes</h3>
          <div className="stat-value">{businessData.totalResponses}</div>
        </div>
        <div className="stat-card">
          <h3>Average Rating</h3>
          <div className="stat-value">{businessData.averageRating}</div>
        </div>
        <div className="stat-card">
          <h3>Net Promoter Score (NPS)</h3>
          <div className="stat-value">{businessData.npsScore}</div>
        </div>
        <div className="stat-card">
          <h3>Sharing Console</h3>
          <div className="sharingBtnWrapper">
            <a onClick={openQrPopUp} className="sharingBtn getQrBtn">
              Get QR
            </a>
            <div
              style={qrPopUp ? { display: "flex" } : { display: "none" }}
              onClick={closeQrPopUp}
              className="qrCodeBoxWrapper"
            >
              <div className="qrCodeBox active">
                <h1 className="getQR">GET QR CODE</h1>
                <div className="qrCodeWrapper">
                  <QRCodeCanvas
                    ref={qrCode}
                    id="qrCode"
                    value={businessData.feedbackUrl}
                    size={220}
                    bgColor="#141417"
                    fgColor="#FAFAFA"
                    level={"H"}
                  />
                </div>
                <button onClick={downloadQr} className="downloadQrBtn">
                  <DownloadIcon className="downloadIconQR" />
                  Download QR Code
                </button>
                <div onClick={closeQrPopUp} className="closeQr">
                  <CloseIcon />
                </div>
              </div>
            </div>
            <a className="sharingBtn copyLink" onClick={copyFormLink}>
              {isCopied ? "Copied" : "Copy Link"}
            </a>
          </div>
        </div>
      </section>

      {/* CHARTS PLACEHOLDER */}
      <section className="charts-grid">
        <div className="chart-card line-chart">
          <h3>SENTIMENT TREND OVER TIME</h3>
          <div className="placeholder-chart">
            <TrendData data={businessData.trendLineData} />
          </div>
        </div>
      </section>

      {/* RECENT FEEDBACK TABLE */}
      <section className="table-section">
        <h3>RECENT FEEDBACK FEED</h3>
        <table className="feedback-table">
          <thead>
            <tr>
              <th className="nameColumn">USER</th>
              <th className="ratingColumn">RATING</th>
              <th className="messageColumn">COMMENT</th>
              <th className="timeStamp">TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {businessData.latestFeedback.map((e, i) => {
              const timeStamp = new Date(e.created_at);
              return (
                <tr key={i}>
                  {/* Added .nameCell to protect against long names */}
                  <td
                    className="nameCell"
                    title={e.customer_name || "Anonymous"}
                  >
                    {e.customer_name || "Anonymous"}
                  </td>

                  <td>{renderStars(e.rating, "ratingStarsWrapper")}</td>

                  {/* Wrapped the message in a div so the clamp works perfectly */}
                  <td>
                    <div className="messageTable" title={e.message}>
                      {e.message}
                    </div>
                  </td>

                  <td>{formatTime(timeStamp)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default AnalyticsDashboard;
