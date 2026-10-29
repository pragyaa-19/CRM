
import { useState } from "react";
import axios from "axios";

export default function PasswordResetRequest() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setIsLoading(true);

        try {
            await axios.post(
                "http://localhost:8000/api/password_reset/",
                { email }
            );

            setMessage(
                "If your email exists in our system, a reset link has been sent."
            );
        } catch (error) {
            setMessage(
                "Unable to process your request. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto mt-12 max-w-md rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-bold">
                Reset Your Password
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>

            {message && (
                <p
                    role="status"
                    className="mt-4 text-sm text-gray-700"
                >
                    {message}
                </p>
            )}
        </div>
    );
}
