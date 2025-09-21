import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ session, children }) => {
    if (!session) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default ProtectedRoute;
