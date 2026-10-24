import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (!data.access || !data.refresh) {
          setError("Login response did not contain the expected tokens.");
          return;
        }

        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        navigate("/dashboard");
      } else {
        setError(data.detail || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg ring-1 ring-gray-200">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="you@example.com"
              />
            </div>

            <div>
              {/* Flex container keeps the label and link on the same line */}
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900"
                >
                  Password
                </label>
                <Link 
                  to="/password-reset" 
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 p-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Sign up link added at the very bottom of the card */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link 
              to="/signup" 
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}