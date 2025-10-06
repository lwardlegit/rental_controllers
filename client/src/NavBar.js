import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

const NavBar = ({session}) => {
    const { user, signOut } = useAuth();

    const logoutUser = () => {
        localStorage.removeItem("session");
    }

    return (
        <header style={styles.header}>
            <nav style={styles.nav}>
                <Link to="/" style={styles.link}>Home</Link>
                <Link to="/about" style={styles.link}>About</Link>

                {!session && (
                    <Link to="/login" style={styles.link}>Login</Link>
                )}
                {!session && (
                    <Link to="/signup" style={styles.link}>Sign up</Link>
                )}

                {session && (
                    <>
                        <Link to={"/login"} onClick={logoutUser} style={styles.link}>Logout</Link>
                    </>
                )}

                {session && (
                    <>
                        <Link to="/profile" style={styles.link}>profile</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

const styles = {
    header: {
        background: "#222",
        padding: "10px 20px",
    },
    nav: {
        display: "flex",
        gap: "15px",
        alignItems: "center",
    },
    link: {
        color: "#fff",
        textDecoration: "none",
        fontWeight: "bold",
    },
    button: {
        background: "#f44336",
        color: "white",
        border: "none",
        padding: "5px 10px",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

export default NavBar;
