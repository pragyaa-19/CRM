import { useState } from "react";
// Trash2 aur Plus icon add kiye hain list items ko manage karne ke liye
import { Mail, UserPlus, X, Plus, Trash2 } from 'lucide-react';

export default function AddEmployee({ onClose }) {

    const [invites, setInvites] = useState([
        { email: "", role: "employee" }
    ]);
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);


    const handleChange = (index, field, value) => {
        const newInvites = [...invites];
        newInvites[index][field] = value;
        setInvites(newInvites);
    };

    const handleAddMore = () => {
        setInvites([...invites, { email: "", role: "Employee" }]);
    };

    const handleRemove = (indexToRemove) => {
        const newInvites = invites.filter((_, index) => index !== indexToRemove);
        setInvites(newInvites);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        if (invites[0].email === "") return;

        setIsLoading(true);
        const token = localStorage.getItem("access");
        try {

            const response = await fetch('http://127.0.0.1:8000/invitations/api/invite/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ users: invites })
            });

            if (!response.ok) {
                setMessage({
                    type: "error",
                    text: data.deatil || "Failed to send message"
                });
                return;
                onClose();
            }
            setMessage({
                type: "success",
                text: "Message sent successfully!"
            });


        } catch (error) {
            setMessage({
                type: "error",
                text: "Something went wrong. Please try again."
            });
        } finally {
            // API pass ho ya fail, loading ko rokna zaroori hai
            setIsLoading(false);
        }
    }

    return (

        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">

            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xl relative max-h-[90vh] flex flex-col">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <UserPlus size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Invite Employees</h2>
                </div>

                {/* Scrollable area banaya hai taaki zyada add karne par form screen ke bahar na jaye */}
                <div className="overflow-y-auto pr-2 space-y-4">
                    {/* 👉 2. Array ko map karke dabbe bana rahe hain */}
                    {invites.map((invite, index) => (
                        <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-100">

                            {/* Email Input */}
                            {message && (
                                <div
                                    className={
                                        message.type === "success"
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }
                                >
                                    {message.text}
                                </div>
                            )}
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="email"
                                        value={invite.email}
                                        onChange={(e) => handleChange(index, 'email', e.target.value)}
                                        placeholder="employee@company.com"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Role Dropdown */}
                            <div className="w-1/3">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    value={invite.role}
                                    onChange={(e) => handleChange(index, 'role', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                >
                                    <option value="employee">Employee</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>

                            {/* Remove Button (Sirf tab dikhega jab 1 se zyada dabbe hon) */}
                            {invites.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* 👉 3. "Add More" Button */}
                <button
                    type="button"
                    onClick={handleAddMore}
                    className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 w-fit"
                >
                    <Plus size={16} /> Add another employee
                </button>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit} // Button type "button" hatakar seedha onClick laga diya
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        Send Invitations ({invites.length})
                    </button>
                </div>
            </div>
        </div>
    );
}
