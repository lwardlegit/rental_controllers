import { Routes, Route } from "react-router-dom";
import HouseControls from "./HouseControls";
import ProtectedRoute from "./ProtectedRoute";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import AboutPage from "./AboutPage";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./NavBar";
import SignupPage from "./SignupPage";

function App() {
    return (
        <>
            <NavBar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                    path="/housecontrols"
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
