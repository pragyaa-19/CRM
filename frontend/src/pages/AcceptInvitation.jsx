import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AcceptInvitation() {

    // Get invitation token from URL
    const { token } = useParams();

    // We'll use this later to navigate to login
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        password: "",
        confirm_password: "",
    });

    // Message state
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/invitations/api/accept/${token}/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setMessageType("success");
                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            } else {
                setMessage(data.error || "Something went wrong.");
                setMessageType("error");
            }

        } catch (error) {
            setMessage("Unable to connect to the server.");
            setMessageType("error");
        }
    }
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-8">
                <h1 className="font-bold text-center text-2xl text-gray-900">
                    Accept Invitation
                </h1>
                <p className="text-gray-500 text-center mt-2 mb-8">
                    create your account to join the company
                </p>


                {message && (
                    <div
                        className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${messageType === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* First Name */}
                    <div className="mb-5">
                        <label htmlFor="first_name"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            First Name
                        </label>

                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="Enter your first name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                                    focus_outline-none foucus:ring-2 focus:ring-blue-500
                                    focus:border-blue-500"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="mb-5">
                        <label htmlFor="last_name"
                            className="text-sm text-gray-700 font-medium block mb-2"

                        >
                            Last Name
                        </label>

                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Enter your Last name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg
                        focus_outline-none foucus:ring-2 focus:ring-blue-500
                                    focus:border-blue-500"
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-5">
                        <label htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Put a strong password"
                            className="border w-full px-3 py-3 border-gray-300 rounded-lg
                                   focus_outline-none foucus:ring-2 focus:ring-blue-500
                                   focus:border-blue-500"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-5">
                        <label htmlFor="confirm_password"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            className="border border-gray-300 w-full py-3 px-3 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:border-blue-500"
                            placeholder="Confirm your password"
                        />
                    </div>

                    <button type="submit"
                        className=" w-full bg-blue-400 py-3 px-3 text-white font-semibold rounded-xl
                        hover:bg-blue-700 transition duration-200
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Accept Invitation
                    </button>

                </form>
            </div>
        </div>
    );
}

