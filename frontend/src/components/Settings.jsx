import { useEffect, useState } from "react";
import {
    Settings as SettingsIcon,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    ExternalLink,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000/subscriptions/my-subscription/";

export default function Settings({ isOpen, onClose }) {
    const navigate = useNavigate();

    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;

        const fetchSubscription = async () => {
            setLoading(true);
            setError("");

            try {
                const token = localStorage.getItem("access_token");

                if (!token) {
                    setError("Please log in to view your subscription.");
                    return;
                }

                const response = await fetch(API_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.error || "Unable to load subscription details."
                    );
                    return;
                }

                setSubscription(data);
            } catch (err) {
                console.error("Subscription fetch error:", err);
                setError("Unable to connect to the server.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [isOpen]);

    if (!isOpen) return null;

    const planName = (plan) => {
        const plans = {
            FREE: "Free Plan",
            PRO_MONTHLY: "Pro Monthly",
            PRO_YEARLY: "Pro Yearly",
        };

        return plans[plan] || plan || "Free Plan";
    };

    const formatDate = (date) => {
        if (!date) return "Not available";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const status = subscription?.status;
    const isActive = status === "ACTIVE";
    const isCancelled = subscription?.cancel_at_period_end;

    return (
        <div className="fixed bottom-4 left-4 z-[100] w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <div className="flex items-center gap-2">
                    <SettingsIcon size={19} className="text-blue-600" />

                    <h3 className="font-semibold text-gray-900">
                        Settings
                    </h3>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close settings"
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Subscription Status */}
            <div className="p-4">
                <div className="mb-3 flex items-center gap-2">
                    <CreditCard size={18} className="text-gray-600" />

                    <h4 className="font-semibold text-gray-900">
                        Subscription
                    </h4>
                </div>

                {loading && (
                    <p className="py-4 text-sm text-gray-500">
                        Loading subscription...
                    </p>
                )}

                {error && (
                    <div
                        role="alert"
                        className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {!loading && !error && subscription && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        {/* Plan */}
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div>
                                <p className="text-xs text-gray-500">
                                    Current Plan
                                </p>

                                <p className="mt-1 font-semibold text-gray-900">
                                    {planName(subscription.plan)}
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                {subscription.plan === "FREE"
                                    ? "FREE"
                                    : "PAID PLAN"}
                            </span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between border-t border-gray-200 py-3">
                            <span className="text-sm text-gray-600">
                                Status
                            </span>

                            <span className="flex items-center gap-1.5 text-sm font-medium">
                                {isCancelled ? (
                                    <>
                                        <Clock
                                            size={15}
                                            className="text-amber-500"
                                        />
                                        <span className="text-amber-700">
                                            Cancels at period end
                                        </span>
                                    </>
                                ) : isActive ? (
                                    <>
                                        <CheckCircle
                                            size={15}
                                            className="text-green-600"
                                        />
                                        <span className="text-green-700">
                                            Active
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle
                                            size={15}
                                            className="text-red-500"
                                        />
                                        <span className="text-red-700">
                                            {status || "Unknown"}
                                        </span>
                                    </>
                                )}
                            </span>
                        </div>

                        {/* Renewal / Period End */}
                        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                            <span className="text-sm text-gray-600">
                                {isCancelled ? "Access until" : "Period ends"}
                            </span>

                            <span className="text-sm font-medium text-gray-900">
                                {formatDate(subscription.current_period_end)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Manage Subscription */}
                <button
                    type="button"
                    onClick={() => {
                        onClose();
                        navigate("/subscription");
                    }}
                    className="mt-3 flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                    Manage Subscription

                    <ExternalLink size={16} />
                </button>

                {/* Upgrade Plan */}
                {subscription?.plan === "FREE" && (
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            navigate("/#pricing");
                        }}
                        className="mt-2 w-full rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                        Upgrade Plan
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-400">
                    Manage your plan and billing information.
                </p>
            </div>
        </div>
    );
}
