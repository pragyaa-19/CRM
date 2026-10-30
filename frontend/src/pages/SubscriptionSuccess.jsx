
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/subscriptions/status/";

export default function SubscriptionSuccess() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");

    const [status, setStatus] = useState("checking");
    const [message, setMessage] = useState(
        "We're confirming your subscription. Please wait..."
    );

    useEffect(() => {
        let cancelled = false;
        let timer;
        let attempts = 0;

        const verifySubscription = async () => {
            const accessToken = localStorage.getItem("access_token");

            if (!sessionId) {
                setStatus("error");
                setMessage("Checkout session ID is missing.");
                return;
            }

            if (!accessToken) {
                setStatus("error");
                setMessage(
                    "Please log in to verify your subscription."
                );
                return;
            }

            try {
                const response = await fetch(
                    `${API_URL}?session_id=${encodeURIComponent(sessionId)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                const data = await response.json();

                if (cancelled) return;

                if (!response.ok) {
                    setStatus("error");
                    setMessage(
                        data.error || "Unable to verify your subscription."
                    );
                    return;
                }

                if (data.status === "ACTIVE") {
                    setStatus("success");
                    setMessage("Your subscription is active!");
                    return;
                }

                attempts += 1;

                if (attempts < 6) {
                    setStatus("checking");
                    setMessage(
                        "Your payment is being confirmed. Checking again shortly..."
                    );

                    timer = setTimeout(verifySubscription, 3000);
                } else {
                    setStatus("pending");
                    setMessage(
                        "Your payment confirmation is taking longer than expected. Please check your subscription status from your account shortly."
                    );
                }
            } catch (error) {
                if (cancelled) return;

                setStatus("error");
                setMessage(
                    "We couldn't contact the server. Please check your subscription status from your account."
                );
            }
        };

        verifySubscription();

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-lg p-10 text-center">
                <div className="text-5xl mb-5">
                    {status === "success"
                        ? "✅"
                        : status === "checking"
                        ? "⏳"
                        : status === "error"
                        ? "⚠️"
                        : "🔄"}
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                    {status === "success"
                        ? "Subscription Confirmed!"
                        : status === "checking"
                        ? "Confirming Subscription"
                        : status === "error"
                        ? "Unable to Confirm"
                        : "Confirmation Pending"}
                </h1>

                <p className="text-gray-600 mb-8">{message}</p>

                <Link
                    to="/dashboard"
                    className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
}
