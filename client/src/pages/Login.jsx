import { useState, useRef, useEffect, useContext } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { authContext } from "../context/AuthContext";
import API_URL from "../utils/api";

function Login() {
  const [email, setEmail] = useState("");
  const [OTP, setOTP] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  // selecting elements replacement of document.querySelector
  const emailInputRef = useRef(null);
  const codeInputRef = useRef(null);
  const getOtpRef = useRef(null);
  const verifyBtnRef = useRef(null);
  const navigate = useNavigate();
  // using useEffect to autofocus input boxes
  useEffect(() => {
    // this was for email
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);
  // now for OTP code
  useEffect(() => {
    if (isCodeSent && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [isCodeSent]);
  // validation for email.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email);
  // validation for OTP.
  const otpRegex = /^\d{6}$/;
  const isOTPvalid = otpRegex.test(OTP);
  // functions...
  function onChange(event) {
    const value = event.target.value;
    if (event.target.id === "emailInput") {
      setEmail(value);
    } else if (event.target.id === "codeInput") {
      const numbersOnlyRegex = /^\d*$/;
      if (numbersOnlyRegex.test(value) && value.length <= 6) {
        setOTP(value);
      }
    }
  }
  // adding keyboard shortcut that when a user hits the enter key automatically the that send otp/verify button get trigged
  function enterFnx(e) {
    if (isCodeSent) {
      if (e.key === "Enter") {
        verifyBtnRef.current.click();
      }
    } else {
      if (e.key === "Enter") {
        getOtpRef.current.click();
      }
    }
  }
  async function getOTP(event) {
    let result = await fetch(`${API_URL}/api/otp/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    });
    if (result.ok) {
      setIsCodeSent(true);
    } else {
      console.log(`Failed to send email.`);
    }
  }
  const { updateStatus } = useContext(authContext);
  async function verify(event) {
    let result = await fetch(`${API_URL}/api/otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        code: OTP,
      }),
    });
    if (result.ok) {
      const data = await result.json();
      localStorage.setItem("feedback_token", data.token);

      // Check if this user already has a business profile
      const profileCheck = await fetch(`${API_URL}/api/businesses`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });

      if (profileCheck.ok) {
        // Returning User -> Send to Dashboard
        updateStatus("dashboard");
        navigate("/dashboard");
      } else {
        // Brand New User -> Send to Setup Form
        updateStatus("setUpForm");
        navigate("/setUpForm");
      }
      return;
    } else {
      const errorData = await result.json();
      console.log(`Login Failed: ${errorData.message}`);
    }
  }
  return (
    <div id="loginPage">
      <div id="loginWrapper">
        <h1>Login to Dashboard</h1>
        <div
          id="email"
          className="same"
          style={isCodeSent ? { display: "none" } : {}}
        >
          <div id="emailInputWrapper" className="sameWrapper">
            <label htmlFor="emailInput">Enter your email</label>
            <input
              ref={emailInputRef} // accesing email input with the help of useRef
              onChange={onChange}
              value={email}
              type="text"
              id="emailInput"
              placeholder="example@gmail.com"
              onKeyDown={enterFnx}
            />
          </div>
          <button
            id="getOTPBtn"
            onClick={getOTP}
            className="sameBtn"
            disabled={!isValidEmail}
            style={{
              cursor: isValidEmail ? "pointer" : "not-allowed",
              opacity: isValidEmail ? 1 : 0.5,
            }}
            ref={getOtpRef}
          >
            Send OTP
          </button>
        </div>
        <div
          id="code"
          className="same"
          style={isCodeSent ? { display: "block" } : { display: "none" }}
        >
          <div id="codeInputWrapper" className="sameWrapper">
            <label htmlFor="codeInput">Enter your OTP</label>
            <input
              ref={codeInputRef} // same like we did with email.
              type="text"
              autoComplete="off"
              onChange={onChange}
              value={OTP}
              id="codeInput"
              placeholder="XXXXXX"
              onKeyDown={enterFnx}
            />
          </div>
          <button
            id="verifyBtn"
            className="sameBtn"
            onClick={verify}
            disabled={!isOTPvalid}
            style={{
              cursor: isOTPvalid ? "pointer" : "not-allowed",
              opacity: isOTPvalid ? 1 : 0.5,
            }}
            ref={verifyBtnRef}
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
