import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import CurrentUser from "../components/CurrentUser";
import Header from "../components/Header";
import AddEmployee from "./AddEmployee";

const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Card = ({ children, className = "" }) => (
    <div
        className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
        {children}
    </div>
);

export default function Leads({ refresh }) {
    // Leads data
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Edit lead
    const [editingLead, setEditingLead] = useState(null);
    const [saving, setSaving] = useState(false);

    // Common sidebar
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Add Employee modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const token = localStorage.getItem("access_token");

    // Fetch leads
    useEffect(() => {
        const controller = new AbortController();

        const fetchLeads = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/leads/api/create-lead/`,
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
                        data.detail || "Unable to load leads."
                    );
                }

                setLeads(
                    Array.isArray(data)
                        ? data
                        : data.results ?? []
                );
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Fetch leads error:", err);
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

        fetchLeads();

        return () => controller.abort();
    }, [refresh, token]);

    // Status badge styling
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "new":
                return "bg-blue-50 text-blue-700 border-blue-100";

            case "called":
                return "bg-yellow-50 text-yellow-700 border-yellow-100";

            case "interested":
                return "bg-purple-50 text-purple-700 border-purple-100";

            case "won":
                return "bg-green-50 text-green-700 border-green-100";

            case "lost":
                return "bg-red-50 text-red-700 border-red-100";

            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    // Update the edit form state
    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditingLead((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Save edited lead
    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!editingLead) return;

        try {
            setSaving(true);

            const response = await fetch(
                `${API_URL}/leads/api/leads/${editingLead.id}/`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: editingLead.name,
                        email: editingLead.email,
                        contact_num: editingLead.contact_num,
                        status: editingLead.status,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error("Update failed:", data);

                alert(
                    typeof data === "object"
                        ? JSON.stringify(data)
                        : "Failed to update lead."
                );

                return;
            }

            // Update the lead in local state
            setLeads((prevLeads) =>
                prevLeads.map((lead) =>
                    String(lead.id) === String(editingLead.id)
                        ? { ...lead, ...editingLead }
                        : lead
                )
            );

            setEditingLead(null);
        } catch (err) {
            console.error("Update lead error:", err);
            alert("Something went wrong while updating the lead.");
        } finally {
            setSaving(false);
        }
    };

    // Delete lead
    const handleDelete = async (leadId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this lead?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `${API_URL}/leads/api/leads/${leadId}/`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                console.error("Delete failed:", data);
                alert("Failed to delete lead.");

                return;
            }

            // Remove the deleted lead from the current UI
            setLeads((prevLeads) =>
                prevLeads.filter(
                    (lead) => String(lead.id) !== String(leadId)
                )
            );
        } catch (err) {
            console.error("Delete lead error:", err);
            alert("Something went wrong while deleting the lead.");
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">

            {/* Load logged-in user */}
            <CurrentUser onUserLoaded={setCurrentUser} />

            {/* Common CRM sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                currentUser={currentUser}
                onAddEmployeeClick={() => setIsModalOpen(true)}
            />

            {/* Main page area */}
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

                {/* Common header and sidebar toggle */}
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    currentUser={currentUser}
                />

                {/* Scrollable Leads content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Page heading */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Leads
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            All leads added to your CRM
                        </p>
                    </div>

                    {/* Leads card */}
                    <Card className="overflow-hidden">

                        {/* Loading */}
                        {loading && (
                            <div className="p-8 text-center text-gray-500">
                                Loading leads...
                            </div>
                        )}

                        {/* Error */}
                        {error && !loading && (
                            <div className="p-8 text-center text-red-500">
                                {error}
                            </div>
                        )}

                        {/* Leads table */}
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
                                                Assigned To
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

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(
                                                            lead.status
                                                        )}`}
                                                    >
                                                        {lead.status}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {lead.assigned_to_name || "-"}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setEditingLead({
                                                                    ...lead,
                                                                })
                                                            }
                                                            className="font-medium text-blue-600 hover:text-blue-800"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(lead.id)
                                                            }
                                                            className="font-medium text-red-600 hover:text-red-800"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {leads.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-6 py-10 text-center text-gray-500"
                                                >
                                                    No leads found.
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

            {/* Edit Lead modal */}
            {editingLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                            <h2 className="text-lg font-bold text-gray-900">
                                Edit Lead
                            </h2>

                            <button
                                type="button"
                                onClick={() => setEditingLead(null)}
                                className="text-xl text-gray-400 hover:text-gray-700"
                                aria-label="Close edit form"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={handleUpdate}
                            className="space-y-5 p-6"
                        >

                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="lead-name"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Name
                                </label>

                                <input
                                    id="lead-name"
                                    type="text"
                                    name="name"
                                    value={editingLead.name || ""}
                                    onChange={handleEditChange}
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="lead-email"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Email
                                </label>

                                <input
                                    id="lead-email"
                                    type="email"
                                    name="email"
                                    value={editingLead.email || ""}
                                    onChange={handleEditChange}
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    htmlFor="lead-phone"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Phone
                                </label>

                                <input
                                    id="lead-phone"
                                    type="text"
                                    name="contact_num"
                                    value={editingLead.contact_num || ""}
                                    onChange={handleEditChange}
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label
                                    htmlFor="lead-status"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Status
                                </label>

                                <select
                                    id="lead-status"
                                    name="status"
                                    value={editingLead.status || "new"}
                                    onChange={handleEditChange}
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="new">New</option>
                                    <option value="called">Called</option>
                                    <option value="interested">Interested</option>
                                    <option value="won">Won</option>
                                    <option value="lost">Lost</option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingLead(null)}
                                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* Add Employee modal */}
            {isModalOpen && (
                <AddEmployee
                    onClose={() => setIsModalOpen(false)}
                />
            )}

        </div>
    );
}