import React, { useEffect, useState } from "react";
import "./Setting.css";
import { useOutletContext } from "react-router-dom";
import API_URL from "../utils/api";

function Settings() {
  const MAX_BUSINESS_NAME_LENGTH = 50;
  const [updatedName, setUpdatedName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploaded, setImageUploaded] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [originalLogoUrl, setOriginalLogoUrl] = useState("");
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const { nameLogo, setNameLogo } = useOutletContext();
  useEffect(() => {
    if (nameLogo && nameLogo.businessName && nameLogo.logo_url) {
      setUpdatedName(nameLogo.businessName);
      setImageUrl(nameLogo.logo_url);
      setOriginalName(nameLogo.businessName);
      setOriginalLogoUrl(nameLogo.logo_url);
      setImageUploaded(false);
      setLogoFile(null);
    }
  }, [nameLogo]);

  const cleanedUpdatedName = updatedName.trim();
  const nameWords = cleanedUpdatedName ? cleanedUpdatedName.split(/\s+/) : [];
  const hasGiantWords = nameWords.some((word) => word.length >= 20);
  const isOnlyNumbers =
    /^[\d\s\W]+$/.test(cleanedUpdatedName) && cleanedUpdatedName.length > 0;
  const hasDigits = /\d/.test(cleanedUpdatedName);
  const hasSpamRepetition = /(.)\1{9,}/.test(cleanedUpdatedName);
  const isLengthValid = cleanedUpdatedName.length <= MAX_BUSINESS_NAME_LENGTH;
  const isBusinessNameValid =
    cleanedUpdatedName.length > 0 &&
    !hasGiantWords &&
    !isOnlyNumbers &&
    !hasDigits &&
    !hasSpamRepetition &&
    isLengthValid &&
    /^[\p{L}\s'-]+$/u.test(cleanedUpdatedName);
  const isLogoValid = !logoError;
  const hasChanges =
    cleanedUpdatedName !== originalName.trim() ||
    imageUploaded ||
    imageUrl !== originalLogoUrl;
  const isFormValid = isBusinessNameValid && isLogoValid && hasChanges;

  function updatedNameFnx(e) {
    setUpdatedName(e.currentTarget.value);
    if (error) setError("");
  }
  function imageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setLogoError("Please upload an image smaller than 5MB.");
      setLogoFile(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setLogoError("Please upload a valid JPG or PNG image.");
      setLogoFile(null);
      return;
    }
    setLogoError("");
    setLogoFile(file);
    const tempUrl = URL.createObjectURL(file);
    setImageUrl(tempUrl);
    setImageUploaded(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isBusinessNameValid) {
      setError(
        "Enter a valid business name using only letters, spaces, apostrophes, or hyphens. Avoid digits and long unbroken words.",
      );
      return;
    }
    if (logoError) {
      setError(logoError);
      return;
    }

    setError("");

    if (hasChanges) {
      const formData = new FormData(e.currentTarget);
      const token = localStorage.getItem("feedback_token");
      setIsSavingChanges(true);
      try {
        const result = await fetch(`${API_URL}/api/businesses`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        if (result.ok) {
          console.log(`Data updated succesfully.`);
          setOriginalName(cleanedUpdatedName);
          setOriginalLogoUrl(imageUploaded ? imageUrl : originalLogoUrl);
          setImageUploaded(false);
            setLogoFile(null);
            // updating states so he re-renders the screen.
            setNameLogo({
                ...nameLogo,
                businessName: cleanedUpdatedName,
                logo_url: imageUploaded ? imageUrl : originalLogoUrl
            })
        } else {
          const errorData = await result.json();
          setError(errorData.message || "Failed to update the data.");
          console.log(`Failed to update the data.`);
        }
      } catch (error) {
        setError("Error while submitting the form.");
        console.log(`Error while submitting the form: ${error}`);
      } finally {
        setIsSavingChanges(false);
      }
    }
  }
  return (
    <main className="main-content">
      {/* 1. Standardized Top-Left Header */}
      <header className="settings-header">
        <h1>Business Settings</h1>
        <p>Update your public profile details.</p>
      </header>

      {/* 2. Centered Form Container */}
      <div className="settingFormContainer">
        <div className="settings-wrapper">
          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="businessName">Business Name</label>
              <input
                type="text"
                name="updatedName"
                id="businessName"
                className="input"
                placeholder="e.g., The Cozy Cafe"
                autoComplete="off"
                value={updatedName}
                maxLength={MAX_BUSINESS_NAME_LENGTH}
                onChange={updatedNameFnx}
              />
            </div>

            <div className="input-group" style={{ marginTop: "15px" }}>
              <label>Current Logo</label>

              {/* The Custom Dotted Upload Box */}
              <label
                htmlFor="settingsLogoInput"
                className="settings-logo-label"
              >
                <div className="settings-logo-content">
                  {/* Image Preview */}
                  {imageUrl && (
                    <img
                      src="https://via.placeholder.com/150"
                      alt="Business Logo"
                      className="settings-logo-preview"
                      src={imageUrl}
                    />
                  )}

                  <div className="settings-upload-text">
                    <h4 style={{ margin: "0 0 5px 0", color: "#FAFAFA" }}>
                      Click to change logo
                    </h4>
                    <p
                      style={{ margin: 0, fontSize: "12px", color: "#a1a1aa" }}
                    >
                      JPG or PNG (Max 5MB)
                    </p>
                  </div>
                </div>
              </label>

              <input
                type="file"
                name="newLogo"
                id="settingsLogoInput"
                className="settings-file-input"
                accept="image/jpeg, image/png, image/jpg"
                onChange={imageUpload}
              />
            </div>

            {error ? <p className="settings-error">{error}</p> : null}
            {logoError ? <p className="settings-error">{logoError}</p> : null}

            <button
              type="submit"
              className="save-btn"
              disabled={!isFormValid || isSavingChanges}
              style={{
                cursor:
                  isFormValid && !isSavingChanges ? "pointer" : "not-allowed",
                opacity: isFormValid && !isSavingChanges ? 1 : 0.5,
              }}
            >
              {isSavingChanges ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Settings;
