import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../utils/api";
const authContext = createContext();

function AuthProvider({ children }) {
  // this children is the that <App/> because we have wrpped that app inside our <AuthProvider/>.
  const [authStatus, setAuthStatus] = useState("checking");
  const updateStatus = (status) => {
    setAuthStatus(status);
  };
  useEffect(() => {
    async function compulsion() {
      const token = localStorage.getItem("feedback_token");
      if (!token) {
        setAuthStatus("login");
        return;
      }
      try {
        const result = await fetch(`${API_URL}/api/feedback`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const fetchedData = await result.json();
        if (result.ok) {
          console.log(`I am working`);
          setAuthStatus("dashboard");
        } else if (fetchedData.message === "Redirect to setup form") {
          console.log(`I am also working`);
          setAuthStatus("setUpForm");
          return;
        } else {
          // this menas they have token but it is invalid
          setAuthStatus("loginInvalidToken");
          return;
        }
      } catch (error) {
        console.log(`Failed due to backend error.`);
      }
    }
    compulsion();
    window.addEventListener("storage", () => {
      const token = localStorage.getItem("feedback_token");
      if (!token) {
        setAuthStatus("login");
      }
    });
  }, []);
  return (
    <authContext.Provider value={{ authStatus, updateStatus }}>
      {children}
    </authContext.Provider>
  );
}

export { AuthProvider, authContext };
