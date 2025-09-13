import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
    return (
        <div className="homepage">
            {/* Hero Section */}
            <section className="hero">
                <h1>Smart Trash Controller System</h1>
                <p>
                    Take control of your waste management with our intelligent Trash
                    Controller and Dashboard. Get real-time monitoring, alerts, and full
                    automation for your home or office.
                </p>
                <p>
                    With just a few taps, reset controllers, track usage, and ensure your
                    bins are always optimized. Eco-friendly living has never been this
                    easy.
                </p>
            </section>

            {/* Video Section */}
            <section className="video-section">
                <h2>See It In Action</h2>
                <div className="video-placeholder">
                    {/* Replace with <iframe> YouTube or <video> when you have the demo */}
                    <p>🎥 Demo Video Placeholder</p>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="cta">
                <h2>Get Started Today</h2>
                <p>
                    Sign up for free and connect your trash controller to the dashboard.
                    Already have an account? Log in and start managing your waste smarter.
                </p>
                <div className="cta-buttons">
                    <Link to="/login" className="btn login-btn">Login</Link>
                    <Link to="/signup" className="btn signup-btn">Sign Up</Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
