// Header.js
import { Link } from "react-router-dom";
import "./Header.css"; // styles

function Header({ user, logout }) {
    return (
        <header className="header">
            <div className="logo">
                <img src="/icon.png" alt="App Icon" className="icon" />
                <h1>My App</h1>
            </div>
            <nav className="nav">
                <Link to="/">Home</Link>
                {user ? (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
                        <button onClick={logout} className="logout-btn">
                            Sign Out
                        </button>
                    </>
                ) : (
                    <Link to="/login">Sign In</Link>
                )}
            </nav>
        </header>
    );
}

export default Header;
