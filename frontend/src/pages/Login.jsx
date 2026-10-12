import { useState } from 'react';
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  // 1. State to hold the user's input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. The function that runs when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the browser from refreshing the page

    // Package the state into a JavaScript object
    const loginPayload = {
      email: email,
      password: password
    };

    console.log("Sending this payload to the server:", loginPayload);

    // From here, you would use fetch() to POST this payload to your backend.
    // This structure matches exactly what a REST API endpoint 
    // (like a DRF token authentication view) expects to receive.

    const response = await fetch('http://localhost:8000/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginPayload)
    })

    const data = await response.json();

    console.log(data);
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    console.log(response.status);
    console.log(response.ok);
    console.log(data);



    if (response.ok) {

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      navigate("/dashboard");
    }

  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">

      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg ring-1 ring-gray-200">

        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">Please enter your details to sign in.</p>
        </div>

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Email address
            </label>
            <input
              type="email"
              required
              value={email} // Binds the input to our state variable
              onChange={(e) => setEmail(e.target.value)} // Updates state as you type
              className="block w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="you@example.com"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 p-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Login
          </button>

        </form>
      </div>
    </div>
  );
}