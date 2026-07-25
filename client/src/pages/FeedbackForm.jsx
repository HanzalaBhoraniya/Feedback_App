import "./FeedbackForm.css";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import API_URL from "../utils/api";

function FeedbackForm() {
  const { id } = useParams();
  const [starRating, setStarRating] = useState(0);
  const [feedbackPrompt, setFeedbackPrompt] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submissionLockedRef = useRef(false);

  // Data States
  const [logoUrl, setLogoUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [promptMessage, setPromptMessage] = useState("");

  // NEW: Error and Loading Armor
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    async function fetchBusinessData() {
      try {
        const token = localStorage.getItem("feedback_token");
        const result = await fetch(`${API_URL}/api/feedback/${id}`, {
          headers: {
            Authorization: `Bearer ${token ? token : ""}`,
          },
        });

        let data = await result.json();
        // If the fetch succeeds AND the backend found the business name
        if (result.ok && data.businessName) {
          setLogoUrl(data.logo_url);
          setBusinessName(data.businessName);
          setPromptMessage(data.prompt);
        } else {
          // If the ID is wrong, the backend sends a message. We catch it here!
          setError(data.message || "Business profile not found in database.");
        }
      } catch (err) {
        // If the backend is off or blocked, we catch the fatal network crash here!
        console.error("Network Error:", err);
        setError("Failed to connect to the Express backend.");
      } finally {
        setIsLoading(false); // Stop the loading screen whether it succeeded or failed
      }
    }
    fetchBusinessData();
  }, [id]);

  function onChange(e) {
    if (e.target.id === "userNameInput") {
      setUserName(e.target.value);
    } else if (e.target.id === "userEmailInput") {
      setUserEmail(e.target.value);
    } else if (e.target.className === "starInput") {
      setStarRating(parseInt(e.target.value, 10));
    }
  }

  function handleTextChange(e) {
    setFeedbackPrompt(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  async function submitFeedback() {
    if (
      feedbackSubmitted ||
      submissionLockedRef.current ||
      isSubmittingFeedback
    ) {
      return;
    }

    submissionLockedRef.current = true;
    setIsSubmittingFeedback(true);
    setSubmitError("");

    try {
      const data =
        userName && userEmail
          ? {
              business_id: id,
              starRating,
              feedbackPrompt,
              isAnonymous: false,
              userName,
              userEmail,
            }
          : { business_id: id, starRating, feedbackPrompt, isAnonymous: true };

      const result = await fetch(`${API_URL}/api/feedback/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (result.ok) {
        setFeedbackSubmitted(true);
      } else {
        setSubmitError(
          "Unable to submit feedback right now. Please try again.",
        );
        submissionLockedRef.current = false;
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setSubmitError("Unable to submit feedback right now. Please try again.");
      submissionLockedRef.current = false;
    } finally {
      setIsSubmittingFeedback(false);
    }
  }
  // validating rating.
  const isRatingValid = starRating > 0;
  // validating message.
  let isMessageValid = true;
  if (feedbackPrompt.trim().length > 0) {
    const wordsArr = feedbackPrompt.trim().split(/\s+/);
    // Rule A: Kills "asdfghjklqwertyuiopzxcvbnm"
    const hasGiantWords = wordsArr.some((word) => word.length > 25);

    // Rule B: Kills "56723048569347856237845693675378456"
    const isOnlyNumbers =
      /^[\d\s\W]+$/.test(feedbackPrompt) && feedbackPrompt.trim().length > 5;

    // Rule C: Kills "fffffffffffff" or "!!!!!!!!!!!"
    const hasSpamRepetition = /(.)\1{9,}/.test(feedbackPrompt);
    if (hasGiantWords || isOnlyNumbers || hasSpamRepetition) {
      isMessageValid = false;
    }
  }
  // validating name.
  const isNameValid =
    userName.trim() === "" || /^[\p{L}\s'-]+$/u.test(userName);
  // validating email.
  const isEmailValid =
    userEmail.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail);
  const isFormValid =
    isRatingValid && isMessageValid && isNameValid && isEmailValid;
  // --- NEW: Protective UI Renders ---

  if (isLoading) {
    return (
      <div id="feedbackFormWrapper">
        <h2 style={{ color: "#fafafa" }}>Loading form...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div id="feedbackFormWrapper">
        <div
          className="form-container"
          style={{ textAlign: "center", color: "#fafafa" }}
        >
          <h2 style={{ color: "#ff4444" }}>Oops! Connection Failed.</h2>
          <p>{error}</p>
          <p style={{ color: "#a1a1aa", fontSize: "14px" }}>
            Check your Express server terminal and verify this URL ID exists in
            your database.
          </p>
        </div>
      </div>
    );
  }

  // --- Normal UI Render ---
  return (
    <div id="feedbackFormWrapper">
      <div
        className={`form-container ${feedbackSubmitted ? "form-container--centered" : ""}`}
      >
        {feedbackSubmitted ? (
          <div className="submission-success-wrapper">
            <div className="submission-success">
              <div className="success-icon">✓</div>
              <h2>Thanks for your feedback!</h2>
              <p>
                Your response has been received. We appreciate you helping us
                improve.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div id="heroSection">
              <div id="businessLogo">
                {logoUrl && <img src={logoUrl} alt="Business Logo" />}
              </div>
              <h1>{businessName}</h1>
            </div>

            {/* Form Section */}
            <div id="feedbackForm">
              <div className="subForm" id="requiredForm">
                <h3 id="customerFeedback">CUSTOMER FEEDBACK</h3>

                <div id="experienceWrapper" className="wrapperBox">
                  <h3 id="experienceHeading" className="subHeading">
                    {promptMessage}
                  </h3>
                  <fieldset id="stars">
                    {[5, 4, 3, 2, 1].map((num) => (
                      <React.Fragment key={num}>
                        <input
                          type="radio"
                          id={`star${num}`}
                          className="starInput"
                          name="review[rating]"
                          value={num}
                          onChange={onChange}
                          checked={starRating === num}
                        />
                        <label
                          htmlFor={`star${num}`}
                          className="starLable"
                          title={`${num} stars`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="star-svg"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        </label>
                      </React.Fragment>
                    ))}
                  </fieldset>
                </div>

                <div id="improveWrapper" className="wrapperBox">
                  <label className="subHeading">How Can We Improve?</label>
                  <textarea
                    id="feedbackPrompt"
                    value={feedbackPrompt}
                    placeholder="Give your suggestions or tell us more about your visit..."
                    onChange={handleTextChange}
                  ></textarea>
                </div>
              </div>
              <div className="subForm" id="optionalForm">
                <h3 className="subHeading">Optional: Name and Email</h3>
                <div className="optionalInputsWrapper">
                  <input
                    type="text"
                    value={userName}
                    id="userNameInput"
                    className="optionalInput"
                    placeholder="Full Name"
                    onChange={onChange}
                    autoComplete="off"
                  />
                  <input
                    type="email"
                    value={userEmail}
                    id="userEmailInput"
                    className="optionalInput"
                    placeholder="Email Address"
                    onChange={onChange}
                    autoComplete="off"
                  />
                </div>
              </div>

              {submitError && <p className="submit-error">{submitError}</p>}

              <button
                id="submitBtn"
                onClick={submitFeedback}
                style={{
                  opacity: isFormValid && !isSubmittingFeedback ? 1 : 0.5,
                  cursor:
                    isFormValid && !isSubmittingFeedback
                      ? "pointer"
                      : "not-allowed",
                }}
                disabled={
                  !isFormValid || isSubmittingFeedback || feedbackSubmitted
                }
              >
                {isSubmittingFeedback
                  ? "Submitting Feedback..."
                  : "SUBMIT FEEDBACK"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FeedbackForm;
