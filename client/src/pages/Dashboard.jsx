import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSetup from "../components/ProfileSetup";
import AnalyticsDashboard from "../components/AnalyticsDashboard";


function Dashboard() {
    const [ hasProfile, setHasProfile ] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        async function compelled()  {
            const token = localStorage.getItem("feedback_token") // accessing token,
            if (!token) { // checking does token exsist if not send them to login.
                navigate("/login")
            } else { // else let them in and fetch their profile data from the backend.
                
            }
        }
        compelled()
    }, [navigate])
    return (
        hasProfile? <AnalyticsDashboard /> : <ProfileSetup />
    )
}

export default Dashboard;

