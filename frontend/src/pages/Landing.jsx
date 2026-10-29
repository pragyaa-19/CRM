
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Features from "../components/Features";



const API_URL = "http://127.0.0.1:8000/subscriptions/checkout/";

export default function Landing() {
    const navigate = useNavigate();
    const location = useLocation();

    const selectedPlan = location.state?.selectedPlan;
    const [joinedWaitlist, setJoinedWaitlist] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState("");
    const [error, setError] = useState("");



    const handleSubscribe = async (plan) => {
        setError("");

        const accessToken = localStorage.getItem("access_token");

        // User must log in before purchasing a subscription.
        if (!accessToken) {
            navigate("/login", {
                state: {
                    selectedPlan: plan,
                    from: "/",
                },
            });
            return;
        }

        setLoadingPlan(plan);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ plan }),
            });

            const data = await response.json();

            if (response.status === 401) {
                navigate("/login", {
                    state: selectedPlan ? { selectedPlan } : null,
                    replace: true,
                });
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to start checkout. Please try again."
                );
            }

            if (!data.checkout_url) {
                throw new Error("Stripe checkout URL was not returned.");
            }

            // Redirect the user to Stripe's hosted checkout page.
            window.location.href = data.checkout_url;
        } catch (err) {
            setError(err.message || "Something went wrong.");
            setLoadingPlan("");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
            <Navbar />

            {/* HERO SECTION */}
            <main className="max-w-4xl mx-auto mt-20 px-6 text-center">
                <h1 className="text-5xl font-extrabold mb-6">
                    Build things faster with MySaaS
                </h1>

                <p className="text-xl text-gray-600 mb-10">
                    The easiest way to manage your tasks, team, and time.
                    No coding required.
                </p>

                <button
                    onClick={() => navigate("/signup")}
                    className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors"
                >
                    Join the CRM for free
                </button>
            </main>

            {/* FEATURES SECTION */}
            <Features />

            {/* PRICING SECTION */}
            <section
                id="pricing"
                className="max-w-5xl mx-auto mt-32 px-6 text-center"
            >
                <h2 className="text-4xl font-extrabold mb-4">
                    Simple, transparent pricing
                </h2>

                <p className="text-lg text-gray-600 mb-12">
                    Choose the plan that works best for you.
                </p>

                {error && (
                    <div
                        role="alert"
                        className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
                    >
                        {error}
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-8 text-left">
                    {/* FREE PLAN */}
                    <div className="group bg-white p-8 rounded-2xl shadow-md border border-gray-200 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                        <h3 className="text-xl font-bold mb-4">
                            Free Plan
                        </h3>

                        <p className="text-4xl font-extrabold mb-6">
                            ₹0
                            <span className="text-lg text-gray-500 font-medium">
                                /forever
                            </span>
                        </p>

                        <ul className="space-y-3 mb-8 text-gray-600 flex-grow">
                            <li>✔️ 2 total accounts</li>
                            <li>✔️ Up to 50 active leads</li>
                            <li>✔️ Basic CRM features</li>
                            <li>✖️ Internal team chat</li>
                            <li>✖️ Advanced reports</li>
                        </ul>

                        <button
                            onClick={() => {
                                const accessToken =
                                    localStorage.getItem("access_token");

                                if (!accessToken) {
                                    navigate("/signup");
                                } else {
                                    navigate("/dashboard");
                                }
                            }}
                            className="w-full bg-gray-100 text-gray-900 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Start for Free
                        </button>
                    </div>

                    {/* PRO MONTHLY */}
                    <div className="group relative bg-white p-8 rounded-2xl shadow-md border-2 border-blue-500 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                            Most Popular
                        </div>

                        <h3 className="text-xl font-bold mb-4">
                            Pro Monthly
                        </h3>

                        <p className="text-4xl font-extrabold mb-6">
                            ₹639
                            <span className="text-lg text-gray-500 font-medium">
                                /month
                            </span>
                        </p>

                        <ul className="space-y-3 mb-8 text-gray-600 flex-grow">
                            <li>✔️ Unlimited team accounts</li>
                            <li>✔️ Unlimited leads</li>
                            <li>✔️ Internal team chat</li>
                            <li>✔️ Advanced reports</li>
                            <li>✔️ Monthly billing</li>
                        </ul>

                        <button
                            onClick={() => handleSubscribe("PRO_MONTHLY")}
                            disabled={Boolean(loadingPlan)}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                            {loadingPlan === "PRO_MONTHLY"
                                ? "Redirecting..."
                                : "Subscribe Monthly"}
                        </button>
                    </div>

                    {/* PRO YEARLY */}
                    <div className="group bg-white p-8 rounded-2xl shadow-md border border-gray-200 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                        <h3 className="text-xl font-bold mb-4">
                            Pro Yearly
                        </h3>

                        <p className="text-4xl font-extrabold mb-2">
                            ₹9,999
                        </p>

                        <p className="text-sm text-gray-500 mb-6">
                            Per year · Save compared with monthly billing
                        </p>

                        <ul className="space-y-3 mb-8 text-gray-600 flex-grow">
                            <li>✔️ Unlimited team accounts</li>
                            <li>✔️ Unlimited leads</li>
                            <li>✔️ Internal team chat</li>
                            <li>✔️ Advanced reports</li>
                            <li>✔️ Yearly billing</li>
                        </ul>

                        <button
                            onClick={() => handleSubscribe("PRO_YEARLY")}
                            disabled={Boolean(loadingPlan)}
                            className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                            {loadingPlan === "PRO_YEARLY"
                                ? "Redirecting..."
                                : "Subscribe Yearly"}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
