import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

const NavBar = () => {
    const { user, signOut } = useAuth();

    return (
        <header style={styles.header}>
            <nav style={styles.nav}>
                <Link to="/" style={styles.link}>Home</Link>
                <Link to="/about" style={styles.link}>About</Link>

                {!user && (
                    <Link to="/login" style={styles.link}>Login</Link>
                )}

                {user && (
                    <>
                        <Link to="/housecontrols" style={styles.link}>House Controls</Link>
                        <button onClick={signOut} style={styles.button}>Logout</button>
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
