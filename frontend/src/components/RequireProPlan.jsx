import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isProPlan } from "../utils/subscription";

export default function RequireProPlan({ children }) {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchSubscription = async () => {
            try {
                const accessToken = localStorage.getItem("access_token");

                if (!accessToken) {
                    if (!cancelled) {
                        setError(true);
                        setLoading(false);
                    }
                    return;
                }

                const response = await fetch(
                    "http://127.0.0.1:8000/subscriptions/my-subscription/",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Could not verify subscription.");
                }

                const data = await response.json();

                if (!cancelled) {
                    setSubscription(data);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Subscription verification failed:", err);

                if (!cancelled) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        fetchSubscription();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return <div className="p-6">Verifying subscription...</div>;
    }

    // If subscription verification fails, deny access.
    if (error || !isProPlan(subscription)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}