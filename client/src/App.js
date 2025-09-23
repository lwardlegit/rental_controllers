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
import { useLocation } from "react-router-dom";
import ProfilePage from "./ProfilePage";

function App() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const savedSession = localStorage.getItem("session");
        if (savedSession) {
            setSession(JSON.parse(savedSession));
            if (location.pathname === "/login" || location.pathname === "/") {
                navigate("/dashboard");
            }
        } else {
            if (location.pathname !== "/login" && location.pathname !== "/signup") {
                navigate("/login");
            }
        }
        setLoading(false);
    }, [location.pathname, navigate]);

    if (loading) {
        return <p>Loading...</p>; // show spinner if you want
    }

    return (
        <>
            <NavBar session={session} />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute session={session} >
                            <div className="container mt-5">
                            <HouseControls session={session}/>
                            </div>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute session={session} >
                            <div className="container mt-5">
                                <ProfilePage session={session} />
                            </div>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

export default App;
