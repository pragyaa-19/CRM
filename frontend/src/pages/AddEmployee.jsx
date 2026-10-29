
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, UserPlus, X, Plus, Trash2, AlertCircle } from "lucide-react";

export default function AddEmployee({ onClose }) {
    const navigate = useNavigate();

    const [invites, setInvites] = useState([
        { email: "", role: "employee" },
    ]);
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (index, field, value) => {
        setInvites((prev) =>
            prev.map((invite, i) =>
                i === index ? { ...invite, [field]: value } : invite
            )
        );
    };

    const handleAddMore = () => {
        setInvites((prev) => [
            ...prev,
            { email: "", role: "employee" },
        ]);
    };

    const handleRemove = (indexToRemove) => {
        setInvites((prev) =>
            prev.filter((_, index) => index !== indexToRemove)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        const validInvites = invites.filter(
            (invite) => invite.email.trim() !== ""
        );

        if (validInvites.length === 0) {
            setMessage({
                type: "error",
                text: "Please enter at least one email address.",
            });
            return;
        }

        setIsLoading(true);

        const token =
            localStorage.getItem("access_token") ||
            localStorage.getItem("access");

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/invitations/api/invite/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ users: validInvites }),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errorText =
                    data.error ||
                    data.detail ||
                    data.message ||
                    "Failed to send invitations.";

                const isPlanLimit =
                    /free plan|plan limit|upgrade to pro|maximum \d+ accounts|only \d+ accounts/i.test(
                        errorText
                    );

                setMessage({
                    type: isPlanLimit ? "limit" : "error",
                    text: isPlanLimit
                        ? "Your plan limit has been reached. Upgrade your plan to add more employees."
                        : errorText,
                });

                return;
            }

            const created = data.created || [];
            const skipped = data.skipped || [];

            if (skipped.length > 0) {
                const limitReached = skipped.some((item) =>
                    /free plan|plan limit|upgrade to pro|maximum \d+ accounts|only \d+ accounts/i.test(
                        item.reason || ""
                    )
                );

                if (limitReached) {
                    setMessage({
                        type: "limit",
                        text: created.length > 0
                            ? `${created.length} invitation(s) sent. Your plan limit has been reached. Upgrade your plan to add more employees.`
                            : "Your plan limit has been reached. Upgrade your plan to add more employees.",
                    });
                } else {
                    setMessage({
                        type: "warning",
                        text: `Sent ${created.length} invitation(s). ${skipped.length} invitation(s) could not be sent: ${skipped
                            .map((item) => `${item.email}: ${item.reason}`)
                            .join(" | ")}`,
                    });
                }

                return;
            }

            if (created.length === 0) {
                setMessage({
                    type: "error",
                    text: "No invitations were sent. Please check the email addresses.",
                });
                return;
            }

            setMessage({
                type: "success",
                text: `${created.length} invitation(s) sent successfully!`,
            });

            setInvites([{ email: "", role: "employee" }]);
        } catch (error) {
            console.error("Invitation error:", error);

            setMessage({
                type: "error",
                text: "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const messageStyles = {
        success: "bg-green-50 text-green-700 border-green-200",
        error: "bg-red-50 text-red-700 border-red-200",
        warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
        limit: "bg-orange-50 text-orange-800 border-orange-200",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
            <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl bg-white p-6 shadow-xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-700"
                >
                    <X size={20} />
                </button>

                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                        <UserPlus size={24} />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900">
                        Invite Employees
                    </h2>
                </div>

                {message && (
                    <div
                        role="status"
                        className={`mb-4 rounded-lg border p-3 text-sm ${messageStyles[message.type]}`}
                    >
                        <div className="flex items-start gap-2">
                            {message.type === "limit" && (
                                <AlertCircle
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                />
                            )}

                            <div className="flex-1">
                                <p>{message.text}</p>

                                {message.type === "limit" && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose?.();
                                            navigate("/subscription/manage");
                                        }}
                                        className="mt-3 rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700"
                                    >
                                        Upgrade Plan
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="space-y-4 overflow-y-auto pr-2">
                        {invites.map((invite, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                            >
                                <div className="flex-1">
                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                        Email Address
                                    </label>

                                    <div className="relative">
                                        <Mail
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            size={16}
                                        />

                                        <input
                                            type="email"
                                            value={invite.email}
                                            onChange={(e) =>
                                                handleChange(
                                                    index,
                                                    "email",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="employee@company.com"
                                            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="w-1/3">
                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                        Role
                                    </label>

                                    <select
                                        value={invite.role}
                                        onChange={(e) =>
                                            handleChange(
                                                index,
                                                "role",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="employee">
                                            Employee
                                        </option>
                                        <option value="manager">
                                            Manager
                                        </option>
                                    </select>
                                </div>

                                {invites.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(index)}
                                        className="mt-6 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                                        aria-label="Remove invitation"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleAddMore}
                        className="mt-4 flex w-fit items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        <Plus size={16} />
                        Add another employee
                    </button>

                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading
                                ? "Sending..."
                                : `Send Invitations (${invites.length})`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
