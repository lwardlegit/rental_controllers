// App.js
import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Header from "./Header";
import HouseControls from "./HouseControls";
import "bootstrap/dist/css/bootstrap.min.css";


function App() {
    const [user, setUser] = useState(() => localStorage.getItem("user"));

    const login = (username) => {
        setUser(username);
        localStorage.setItem("user", username);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <div>
            <Header user={user} logout={logout} />

            <main className="main">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/dashboard"
                        element={
                            user ? <Dashboard user={user} /> : <Navigate to="/login" replace />
                        }
                    />
                    <Route path="/login" element={<Login login={login} />} />
                </Routes>
            </main>
        </div>
    );
}

function Home() {
    return <h2>Welcome! Please sign in.</h2>;
}

function Dashboard({ user }) {
    return (
        <div className="container mt-5">

            {/* Show HouseControls when signed in */}
            <HouseControls />
        </div>
    );
}

function Login({ login }) {
    const handleLogin = () => {
        login("testuser"); // replace with real credentials later
    };

    return (
        <div>
            <h2>Login</h2>
            <button onClick={handleLogin}>Sign In as TestUser</button>
        </div>
    );
}

export default App;
