
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000/subscriptions/";

export default function SubscriptionManagement() {
    const [subscription, setSubscription] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchSubscription = useCallback(async () => {
        setError("");

        const accessToken = localStorage.getItem("access_token");

        if (!accessToken) {
            setSubscription(null);
            setError("Please log in to view your subscription.");
            setIsLoading(false);
            return false;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}my-subscription/`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                setError("Your session has expired. Please log in again.");
                return false;
            }

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to load subscription details."
                );
            }

            setSubscription(data);
            return true;
        } catch (err) {
            setError(err.message || "Unable to load subscription details.");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    const handleCancelSubscription = async () => {
        const accessToken = localStorage.getItem("access_token");

        if (!accessToken) {
            setError("Please log in to manage your subscription.");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to cancel your Pro subscription? " +
                "Your Pro access should continue until the end of your paid billing period."
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setMessage("");
        setIsCancelling(true);

        try {
            const response = await fetch(`${API_BASE_URL}cancel/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to cancel your subscription."
                );
            }

            // Cancellation request succeeded.
            setMessage(
                data.message ||
                    "Your subscription cancellation has been scheduled."
            );

            // Refresh subscription details separately.
            const refreshed = await fetchSubscription();

            if (!refreshed) {
                setError(
                    "Cancellation was requested, but subscription details could not be refreshed. Please reload the page."
                );
            }
        } catch (err) {
            setError(err.message || "Unable to cancel your subscription.");
        } finally {
            setIsCancelling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600">Loading subscription...</p>
            </div>
        );
    }

    const plan = subscription?.plan || "FREE";
    const subscriptionStatus = subscription?.status || "ACTIVE";
    const isFree = plan === "FREE";

    const hasStripeSubscription =
        subscription?.has_stripe_subscription === true;

    const cancelAtPeriodEnd =
        subscription?.cancel_at_period_end === true;

    const formattedDate = subscription?.current_period_end
        ? new Date(subscription.current_period_end).toLocaleDateString(
              "en-IN",
              {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
              }
          )
        : null;

    const canCancel =
        hasStripeSubscription &&
        !isFree &&
        subscriptionStatus !== "CANCELLED" &&
        subscriptionStatus !== "INACTIVE" &&
        !cancelAtPeriodEnd;

    const statusStyles = {
        ACTIVE: "bg-green-100 text-green-700",
        PENDING: "bg-yellow-100 text-yellow-800",
        PAST_DUE: "bg-red-100 text-red-700",
        CANCELLED: "bg-gray-100 text-gray-700",
        INACTIVE: "bg-gray-100 text-gray-700",
    };

    const statusClass =
        statusStyles[subscriptionStatus] || "bg-gray-100 text-gray-700";

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-12">
            <div className="mx-auto max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Subscription Management
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Manage your company's subscription and billing.
                    </p>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
                    >
                        {error}

                        {error.toLowerCase().includes("log in") && (
                            <Link
                                to="/login"
                                className="ml-2 font-semibold underline"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                )}

                {message && (
                    <div
                        role="status"
                        className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700"
                    >
                        {message}
                    </div>
                )}

                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                CURRENT PLAN
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-gray-900">
                                {plan === "PRO_MONTHLY"
                                    ? "Pro Monthly"
                                    : plan === "PRO_YEARLY"
                                      ? "Pro Yearly"
                                      : "Free Plan"}
                            </h2>
                        </div>

                        <span
                            className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${statusClass}`}
                        >
                            {subscriptionStatus.replaceAll("_", " ")}
                        </span>
                    </div>

                    <hr className="my-6" />

                    <div className="space-y-4">
                        <div className="flex justify-between gap-4">
                            <span className="text-gray-600">
                                Billing cycle
                            </span>

                            <span className="font-medium text-gray-900">
                                {plan === "PRO_MONTHLY"
                                    ? "Monthly"
                                    : plan === "PRO_YEARLY"
                                      ? "Yearly"
                                      : "No billing"}
                            </span>
                        </div>

                        <div className="flex justify-between gap-4">
                            <span className="text-gray-600">
                                Current period ends
                            </span>

                            <span className="text-right font-medium text-gray-900">
                                {formattedDate || "Not available"}
                            </span>
                        </div>
                    </div>

                    {cancelAtPeriodEnd && (
                        <div
                            role="status"
                            className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800"
                        >
                            Your subscription is scheduled to cancel at the
                            end of your current billing period.

                            {formattedDate && (
                                <span>
                                    {" "}
                                    Your Pro access is expected to continue
                                    until {formattedDate}.
                                </span>
                            )}
                        </div>
                    )}

                    {subscriptionStatus === "PAST_DUE" && (
                        <div
                            role="alert"
                            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
                        >
                            Your subscription payment is overdue. Please check
                            your billing details to avoid interruption.
                        </div>
                    )}

                    {canCancel && (
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <button
                                type="button"
                                onClick={handleCancelSubscription}
                                disabled={isCancelling}
                                className="rounded-lg border border-red-300 px-5 py-3 font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isCancelling
                                    ? "Processing..."
                                    : "Cancel Subscription"}
                            </button>

                            <p className="mt-3 text-sm text-gray-500">
                                Cancellation is scheduled for the end of your
                                current billing period.
                            </p>
                        </div>
                    )}

                    {isFree && (
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <p className="mb-4 text-gray-600">
                                Upgrade to unlock unlimited accounts, leads,
                                internal chat, and advanced reports.
                            </p>

                            <Link
                                to="/#pricing"
                                className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                            >
                                View Pro Plans
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <Link
                        to="/dashboard"
                        className="font-medium text-blue-600 hover:underline"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
