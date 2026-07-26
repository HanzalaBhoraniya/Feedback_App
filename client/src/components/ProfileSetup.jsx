import { useContext, useEffect, useState } from "react";
import rightArrowIcon from "../assets/rightArrow.svg";
import "./ProfileSetup.css";
import { useNavigate } from "react-router-dom";
import API_URL from "../utils/api";
import { authContext } from "../context/AuthContext";

function ProfileSetup() {
  const MAX_BUSINESS_NAME_LENGTH = 50;
  const [imageUploaded, setImageUploaded] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const navigate = useNavigate();
  const { updateStatus } = useContext(authContext);
  useEffect(() => {
    async function compulsion() {
      const token = localStorage.getItem("feedback_token");
      if (!token) {
        navigate("/login");
        return;
      }
      const result = await fetch(`${API_URL}/api/feedback`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const fetchedData = await result.json();
      if (result.ok) {
        navigate("/dashboard");
        return;
      } else if (fetchedData.message === "Redirect to setup form") {
        navigate("/setUpForm");
        return;
      } else {
        navigate("/login");
        return;
      }
    }
    compulsion();
  }, [navigate]);

  const cleanedBusinessName = businessName.trim();
  const businessNameWords = cleanedBusinessName
    ? cleanedBusinessName.split(/\s+/)
    : [];
  const hasGiantWords = businessNameWords.some((word) => word.length >= 20);
  const isOnlyNumbers =
    /^[\d\s\W]+$/.test(cleanedBusinessName) && cleanedBusinessName.length > 0;
  const hasDigits = /\d/.test(cleanedBusinessName);
  const hasSpamRepetition = /(.)\1{9,}/.test(cleanedBusinessName);
  const isLengthValid = cleanedBusinessName.length <= MAX_BUSINESS_NAME_LENGTH;
  const isBusinessNameValid =
    cleanedBusinessName.length > 0 &&
    !hasGiantWords &&
    !isOnlyNumbers &&
    !hasDigits &&
    !hasSpamRepetition &&
    isLengthValid &&
    /^[\p{L}\s'-]+$/u.test(cleanedBusinessName);
  const isLogoValid =
    !!logoFile &&
    ["image/jpeg", "image/png", "image/jpg"].includes(logoFile.type);
  const isFormValid = isBusinessNameValid && isLogoValid;

  function validateBusinessName(value) {
    const trimmedValue = value.trim();
    const words = trimmedValue ? trimmedValue.split(/\s+/) : [];
    const giantWord = words.some((word) => word.length >= 20);
    const onlyNumbers =
      /^[\d\s\W]+$/.test(trimmedValue) && trimmedValue.length > 0;
    const hasDigits = /\d/.test(trimmedValue);
    const spamRepetition = /(.)\1{9,}/.test(trimmedValue);
    const isLengthValid = trimmedValue.length <= MAX_BUSINESS_NAME_LENGTH;
    return (
      trimmedValue.length > 0 &&
      !giantWord &&
      !onlyNumbers &&
      !hasDigits &&
      !spamRepetition &&
      isLengthValid &&
      /^[\p{L}\s'-]+$/u.test(trimmedValue)
    );
  }

  function imageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Please upload an image smaller than 5MB.");
        setLogoFile(null);
        setImageUploaded(false);
        setImageUrl("");
        return;
      }
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setError("Please upload a valid JPG or PNG image.");
        setLogoFile(null);
        setImageUploaded(false);
        setImageUrl("");
        return;
      }
      setError("");
      setLogoFile(file);
      setImageUploaded(true);
      const tempUrl = URL.createObjectURL(file);
      setImageUrl(tempUrl);
    }
  }
  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateBusinessName(businessName)) {
      setError(
        "Enter a valid business name using only letters, spaces, apostrophes, or hyphens. Avoid digits and long unbroken words.",
      );
      return;
    }
    if (!logoFile) {
      setError("Please upload a logo image.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/jpg"].includes(logoFile.type)) {
      setError("Please upload a valid JPG or PNG logo.");
      return;
    }
    const formData = new FormData(event.target);
    const token = localStorage.getItem("feedback_token");
    setIsSavingProfile(true);
    try {
      const result = await fetch(`${API_URL}/api/businesses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (result.ok) {
        console.log(`Data saved succesfully.`);
        updateStatus("dashboard");
      } else {
        const errorData = await result.json();
        setError(errorData.message || "Failed to save data.");
        console.log(`Failed to save data.`);
      }
    } catch (error) {
      setError("Error while submitting the form.");
      console.log(`Error while submitting the form: ${error}`);
    } finally {
      setIsSavingProfile(false);
    }
  }
  return (
    <div id="setupFormWrapper">
      <div id="setupForm">
        <div id="formHero">
          <h1 id="firstThing">First things, first</h1>
          <p id="businessProfile">Let's Complete Your Business Profile</p>
        </div>
        <form id="form" encType="multipart/form-data" onSubmit={handleSubmit}>
          <div id="businessNameWrapper" className="wrapper">
            <label htmlFor="businessNameInput">Business Name</label>
            <input
              autoComplete="off"
              type="text"
              className="input"
              placeholder="e.g., The Cozy Cafe"
              id="businessNameInput"
              name="name"
              maxLength={MAX_BUSINESS_NAME_LENGTH}
              value={businessName}
              onChange={(event) => {
                setBusinessName(event.target.value);
                if (error) setError("");
              }}
            />
            <p id="charCount">
              {businessName.length}/{MAX_BUSINESS_NAME_LENGTH}
            </p>
          </div>
          <div id="companyLogoWrapper" className="wrapper">
            <p>
              Upload your company logo{" "}
              <span id="ratio">(1:1 ratio is recommended)</span>
            </p>
            <label
              htmlFor="companyLogoInput"
              className="input dotted-border"
              id="companyLogoLabel"
            >
              <div
                id="logoUpload"
                className="logoImg"
                style={{ display: imageUploaded ? "none" : "" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="55"
                  height="55"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Click to upload or drag and drop image</span>
              </div>
              <div
                id="logoUploaded"
                className="logoImg"
                style={{ display: imageUploaded ? "" : "none" }}
              >
                <div id="logoImgWrapper">
                  {imageUrl && (
                    <img
                      alt="Uploaded logo preview"
                      src={imageUrl}
                      className="logo-image-fit"
                    />
                  )}
                </div>
                <h2 id="logoInfo">
                  Click to change <br /> the logo.
                </h2>
              </div>
            </label>
            <input
              type="file"
              onChange={imageUpload}
              id="companyLogoInput"
              accept="image/jpeg, image/png, image/jpg"
              name="logo"
              autoComplete="off"
            />
          </div>
          {error ? (
            <p style={{ color: "#ff4444", margin: "0 0 10px 0" }}>{error}</p>
          ) : null}
          <button
            id="saveBtn"
            disabled={!isFormValid || isSavingProfile}
            style={{
              cursor:
                isFormValid && !isSavingProfile ? "pointer" : "not-allowed",
              opacity: isFormValid && !isSavingProfile ? 1 : 0.5,
            }}
          >
            <span>
              {isSavingProfile ? "Saving Profile..." : "Save Profile"}
            </span>
            <img id="rightArrowIcon" src={rightArrowIcon} alt="rightArrow" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetup;
