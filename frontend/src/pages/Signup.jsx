import { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Signup() {
  const navigate = useNavigate();
  
  // 1. State to hold the user's input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [username, setUsername] = useState('');

  // 2. The function that runs when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault();

    const signupPayload = {
      company_name: company,
      manager_name: username,
      email,
      password,
    };

    console.log("Sending this payload to the server:", signupPayload);

    try {
      const response = await fetch("http://localhost:8000/api/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupPayload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully!");
        navigate("/login");
      } else {
        console.log(data);
        alert(data.message || "Signup failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    // Changed outer div to flex-col so the Navbar and content stack properly
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Added flex-grow so this container centers the card in the remaining space */}
      <div className="flex-grow flex items-center justify-center p-4">
        {/* The Signup Card */}
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg ring-1 ring-gray-200">
          
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Create an account</h2>
            <p className="mt-2 text-sm text-gray-600">Please enter your details to sign up.</p>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="you@example.com"
              />
            </div>

            {/* Username Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="e.g. johndoe99"
              />
            </div>

            {/* Company Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Company
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="e.g. XYZ Technologies"
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
              Sign up
            </button>

          </form>

          {/* Added Already Have an Account section */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              Log in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Signup;