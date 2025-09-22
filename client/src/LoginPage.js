import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [session, setSession] = useState(null);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) throw new Error("Login failed");

            const userData = await response.json();

            // fetch controllers for this user
            const ctrlRes = await fetch("http://localhost:5000/api/controllers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const ctrlData = await ctrlRes.json();

            // merge controllers into session
            const sessionData = { ...userData, controllers: ctrlData.controllers };

            localStorage.setItem("session", JSON.stringify(sessionData));

            navigate("/dashboard", { state: { controllers: sessionData.controllers } });
        } catch (err) {
            setError(err.message || "Login failed");
        }
    };



    return (
        <div className="page">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
};

export default LoginPage;
