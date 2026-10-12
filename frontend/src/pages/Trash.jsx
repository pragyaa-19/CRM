import { useEffect, useState } from "react";
import { Trash2, RotateCcw } from "lucide-react";

import Sidebar from "../components/Sidebar";
import CurrentUser from "../components/CurrentUser";
import Header from "../components/Header";
import AddEmployee from "../pages/AddEmployee";

const API_URL = "http://127.0.0.1:8000";

const Card = ({ children, className = "" }) => (
    <div
        className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
        {children}
    </div>
);

function Trash() {
    // Trash data
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [restoring, setRestoring] = useState(null);

    // Sidebar state
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // Logged-in user
    const [currentUser, setCurrentUser] = useState(null);

    // Add Employee modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const token = localStorage.getItem("access_token");

    // Fetch deleted leads
    useEffect(() => {
        const controller = new AbortController();

        const fetchDeletedLeads = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/leads/api/trash/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Unable to load trash."
                    );
                }

                // Supports both a regular list and paginated response
                const deletedLeads = Array.isArray(data)
                    ? data
                    : data.results ?? [];

                setLeads(deletedLeads);

            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Fetch trash error:", err);
                    setError(
                        err.message || "Something went wrong."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchDeletedLeads();

        return () => controller.abort();
    }, [token]);

    // Restore deleted lead
    const handleRestore = async (leadId) => {
        try {
            setRestoring(leadId);

            const response = await fetch(
                `${API_URL}/leads/api/trash/${leadId}/restore/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Unable to restore lead."
                );
            }

            // Remove restored lead from Trash immediately
            setLeads((prevLeads) =>
                prevLeads.filter(
                    (lead) => String(lead.id) !== String(leadId)
                )
            );

        } catch (err) {
            console.error("Restore lead error:", err);
            setError(err.message || "Could not restore lead.");
        } finally {
            setRestoring(null);
        }
    };

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

            {/* Main Page Area */}
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

                {/* Common Header with Sidebar Toggle */}
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    currentUser={currentUser}
                />

                {/* Scrollable Trash Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Page Heading */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3">

                            <div className="rounded-xl bg-red-50 p-3 text-red-600">
                                <Trash2 size={24} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Trash
                                </h1>

                                <p className="mt-1 text-sm text-gray-500">
                                    Deleted leads can be restored from here.
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Trash Card */}
                    <Card>

                        {/* Loading */}
                        {loading && (
                            <div className="p-8 text-center text-gray-500">
                                Loading trash...
                            </div>
                        )}

                        {/* Error */}
                        {error && !loading && (
                            <div className="p-8 text-center text-red-500">
                                {error}
                            </div>
                        )}

                        {/* Deleted Leads Table */}
                        {!loading && !error && (
                            <div className="overflow-x-auto">

                                <table className="w-full text-left">

                                    <thead>
                                        <tr className="border-b border-gray-200 text-sm text-gray-500">

                                            <th className="px-6 py-4 font-medium">
                                                Name
                                            </th>

                                            <th className="px-6 py-4 font-medium">
                                                Email
                                            </th>

                                            <th className="px-6 py-4 font-medium">
                                                Phone
                                            </th>

                                            <th className="px-6 py-4 font-medium">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 font-medium">
                                                Action
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {leads.map((lead) => (
                                            <tr
                                                key={lead.id}
                                                className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50"
                                            >

                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {lead.name}
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {lead.email || "-"}
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {lead.contact_num || "-"}
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {lead.status}
                                                </td>

                                                <td className="px-6 py-4">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRestore(lead.id)
                                                        }
                                                        disabled={
                                                            restoring === lead.id
                                                        }
                                                        className="flex items-center gap-2 font-medium text-green-600 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <RotateCcw size={16} />

                                                        {restoring === lead.id
                                                            ? "Restoring..."
                                                            : "Restore"}
                                                    </button>

                                                </td>

                                            </tr>
                                        ))}

                                        {/* Empty State */}
                                        {leads.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-6 py-10 text-center text-gray-500"
                                                >
                                                    Trash is empty.
                                                </td>
                                            </tr>
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                    </Card>

                </div>
            </main>

            {/* Add Employee Modal */}
            {isModalOpen && (
                <AddEmployee
                    onClose={() => setIsModalOpen(false)}
                />
            )}

        </div>
    );
}

export default Trash;