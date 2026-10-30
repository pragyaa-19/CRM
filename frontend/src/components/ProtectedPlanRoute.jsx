import { Navigate } from "react-router-dom";

export default function ProtectedPlanRoute({ isPro, children }) {
    if (isPro === null) {
        return <div>Loading subscription...</div>;
    }

    if (!isPro) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}