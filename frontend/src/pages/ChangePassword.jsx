import { useState } from "react";
import { 
    LockKeyhole, 
    ShieldCheck, 
    Eye, 
    EyeOff, 
    AlertCircle, 
    CheckCircle2, 
    KeyRound
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import CurrentUser from "../components/CurrentUser";
import Header from "../components/Header";
import AddEmployee from "./AddEmployee";

export default function ChangePassword() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Visibility toggles
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Status messages instead of alert()
    const [status, setStatus] = useState({ type: "", message: "" });
    const [isLoading, setIsLoading] = useState(false);

    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: "", message: "" });

        if (newPassword !== confirmPassword) {
            setStatus({ type: "error", message: "New passwords do not match." });
            return;
        }

        if (newPassword.length < 8) {
            setStatus({ type: "error", message: "Password must be at least 8 characters long." });
            return;
        }

        setIsLoading(true);

        try {
            const accessToken = localStorage.getItem("access_token");

            const response = await fetch(
                "http://localhost:8000/api/change-password/",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        old_password: oldPassword,
                        new_password: newPassword,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: "success", message: "Password updated successfully!" });
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                
                // Reset visibility
                setShowOld(false);
                setShowNew(false);
                setShowConfirm(false);
            } else {
                setStatus({
                    type: "error",
                    message:
                        data.message ||
                        data.old_password?.[0] ||
                        data.new_password?.[0] ||
                        "Password change failed. Please check your credentials.",
                });
            }
        } catch (error) {
            console.error(error);
            setStatus({ type: "error", message: "Something went wrong. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const inputWrapperClass = "relative group flex items-center";
    const inputClass =
        "w-full rounded-xl border border-gray-200 bg-gray-50/50 px-11 py-3.5 text-sm text-gray-800 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 group-hover:border-gray-300";
    const iconClass = "absolute left-4 text-gray-400 transition-colors group-focus-within:text-blue-500";
    const toggleClass = "absolute right-3 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100";

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
            <CurrentUser onUserLoaded={setCurrentUser} />

            <Sidebar
                isSidebarOpen={isSidebarOpen}
                currentUser={currentUser}
                onAddEmployeeClick={() => setIsModalOpen(true)}
            />

            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    currentUser={currentUser}
                />

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-2xl">
                        
                        {/* Page Header */}
                        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
                                <KeyRound className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                    Change Password
                                </h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Ensure your account is using a long, random password to stay secure.
                                </p>
                            </div>
                        </div>

                        {/* Status Message Alert */}
                        {status.message && (
                            <div className={`mb-6 flex animate-in fade-in slide-in-from-top-2 items-start gap-3 rounded-xl border p-4 ${
                                status.type === "error" 
                                    ? "border-red-200 bg-red-50 text-red-800" 
                                    : "border-green-200 bg-green-50 text-green-800"
                            }`}>
                                {status.type === "error" ? (
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                                ) : (
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                                )}
                                <p className="text-sm font-medium">{status.message}</p>
                            </div>
                        )}

                        {/* Main Card */}
                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/40">
                            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                                <div className="space-y-6">
                                    
                                    {/* Old Password */}
                                    <div className="space-y-2">
                                        <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                                            Current Password
                                        </label>
                                        <div className={inputWrapperClass}>
                                            <LockKeyhole size={18} className={iconClass} />
                                            <input
                                                id="oldPassword"
                                                type={showOld ? "text" : "password"}
                                                placeholder="Enter current password"
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                className={inputClass}
                                                autoComplete="current-password"
                                                required
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowOld(!showOld)} 
                                                className={toggleClass}
                                                title={showOld ? "Hide password" : "Show password"}
                                            >
                                                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                            New Password
                                        </label>
                                        <div className={inputWrapperClass}>
                                            <LockKeyhole size={18} className={iconClass} />
                                            <input
                                                id="newPassword"
                                                type={showNew ? "text" : "password"}
                                                placeholder="Create a new password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className={inputClass}
                                                autoComplete="new-password"
                                                required
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowNew(!showNew)} 
                                                className={toggleClass}
                                            >
                                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                            Confirm New Password
                                        </label>
                                        <div className={inputWrapperClass}>
                                            <LockKeyhole size={18} className={iconClass} />
                                            <input
                                                id="confirmPassword"
                                                type={showConfirm ? "text" : "password"}
                                                placeholder="Confirm your new password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={inputClass}
                                                autoComplete="new-password"
                                                required
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowConfirm(!showConfirm)} 
                                                className={toggleClass}
                                            >
                                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="mt-8 flex items-center justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOldPassword("");
                                            setNewPassword("");
                                            setConfirmPassword("");
                                            setStatus({ type: "", message: "" });
                                        }}
                                        className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 active:scale-95"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] disabled:opacity-70"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </span>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={18} />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                            
                            {/* Security Footer */}
                            <div className="bg-slate-50/80 px-6 py-5 sm:px-8 border-t border-gray-100">
                                <div className="flex gap-3">
                                    <ShieldCheck size={20} className="mt-0.5 shrink-0 text-indigo-500" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-800">
                                            Security Best Practices
                                        </h3>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                            Make sure your password is at least 8 characters long and includes a combination of uppercase letters, lowercase letters, numbers, and symbols. 
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {isModalOpen && (
                <AddEmployee onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
}