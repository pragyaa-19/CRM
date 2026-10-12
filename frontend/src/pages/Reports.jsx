import { useState } from "react";
import { BarChart3 } from "lucide-react";

import Sidebar from "../components/Sidebar";
import CurrentUser from "../components/CurrentUser";
import Header from "../components/Header";
import AddEmployee from "./AddEmployee";

export default function Reports() {
    // Sidebar toggle
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // Logged-in user
    const [currentUser, setCurrentUser] = useState(null);

    // Add Employee modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">

            {/* Load logged-in user */}
            <CurrentUser onUserLoaded={setCurrentUser} />

            {/* Common CRM Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                currentUser={currentUser}
                onAddEmployeeClick={() => setIsModalOpen(true)}
            />

            {/* Main content */}
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

                {/* Common Header */}
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    currentUser={currentUser}
                />

                {/* Scrollable Reports content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Page heading */}
                    <div className="mb-8 flex items-center gap-3">

                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <BarChart3 size={24} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Reports & Analytics
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Track your CRM performance and team activity.
                            </p>
                        </div>

                    </div>

                    {/* Report placeholders */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

                        {/* Lead Performance */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="font-semibold text-gray-900">
                                Lead Performance
                            </h2>

                            <div className="flex h-48 items-center justify-center text-sm text-gray-400">
                                Chart coming soon
                            </div>
                        </div>

                        {/* Team Activity */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="font-semibold text-gray-900">
                                Team Activity
                            </h2>

                            <div className="flex h-48 items-center justify-center text-sm text-gray-400">
                                Chart coming soon
                            </div>
                        </div>

                        {/* Conversion Overview */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="font-semibold text-gray-900">
                                Conversion Overview
                            </h2>

                            <div className="flex h-48 items-center justify-center text-sm text-gray-400">
                                Chart coming soon
                            </div>
                        </div>

                    </div>

                </div>
            </main>

            {/* Add Employee modal */}
            {isModalOpen && (
                <AddEmployee
                    onClose={() => setIsModalOpen(false)}
                />
            )}

        </div>
    );
}