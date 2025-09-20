import {Routes, Route, Navigate, useNavigate} from "react-router-dom";
import HouseControls from "./HouseControls";
import ProtectedRoute from "./ProtectedRoute";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import AboutPage from "./AboutPage";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./NavBar";
import SignupPage from "./SignupPage";
import {useEffect, useState} from "react";

function App() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Look for a saved session in localStorage
        const savedSession = localStorage.getItem("session");
        if (savedSession) {
            setSession(JSON.parse(savedSession));
        }else{
            navigate('/login')
        }
        setLoading(false);
    }, []);

    if (loading) {
        return <p>Loading...</p>; // show spinner if you want
    }

    return (
        <>
            <NavBar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <div className="container mt-5">
                            <HouseControls />
                            </div>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

export default App;
