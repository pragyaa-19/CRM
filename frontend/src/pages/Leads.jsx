import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import CurrentUser from "../components/CurrentUser";
import Header from "../components/Header";
import AddEmployee from "./AddEmployee";
import { fetchEmployees } from "../api/employees";

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

    // Employees for the edit modal
    const [employees, setEmployees] = useState([]);

    // Edit lead
    const [editingLead, setEditingLead] = useState(null);
    const [saving, setSaving] = useState(false);

    // Common sidebar
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Add Employee modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [totalLeads, setTotalLeads] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const token = localStorage.getItem("access_token");

    // Fetch leads
    useEffect(() => {
        const controller = new AbortController();

        const fetchLeads = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("access_token");

                const response = await fetch(
                    `${API_URL}/leads/api/create-lead/?page=${currentPage}&page_size=10`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || "Unable to load leads.");
                }

                const leadsList = Array.isArray(data) ? data : data.results ?? [];

                setLeads(leadsList);
                setNextPage(Array.isArray(data) ? null : data.next);
                setPreviousPage(Array.isArray(data) ? null : data.previous);
                setTotalLeads(Array.isArray(data) ? data.length : data.count ?? 0);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Something went wrong.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchLeads();

        return () => controller.abort();
    }, [refresh, currentPage]);

    // Fetch employees using the reusable API function
    useEffect(() => {
        const controller = new AbortController();

        const loadEmployees = async () => {
            try {
                const data = await fetchEmployees({
                    signal: controller.signal,
                });

                setEmployees(data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    //console.error(
                    //    "Error fetching employees:",
                    //    err
                    //);
                }
            }
        };

        loadEmployees();

        return () => controller.abort();
    }, []);

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

    // Open edit modal with the selected lead
    const handleEditClick = (lead) => {
        setEditingLead({
            ...lead,
            assigned_to:
                lead.assigned_to == null
                    ? ""
                    : String(lead.assigned_to),
        });
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
                        assigned_to:
                            editingLead.assigned_to === ""
                                ? null
                                : editingLead.assigned_to,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                //console.error("Update failed:", data);

                alert(
                    data && typeof data === "object"
                        ? JSON.stringify(data)
                        : "Failed to update lead."
                );

                return;
            }

            // Update the lead in local state
            setLeads((prevLeads) =>
                prevLeads.map((lead) => {
                    if (
                        String(lead.id) !==
                        String(editingLead.id)
                    ) {
                        return lead;
                    }

                    const selectedEmployee = employees.find(
                        (employee) =>
                            String(employee.id) ===
                            String(editingLead.assigned_to)
                    );

                    return {
                        ...lead,
                        ...editingLead,
                        assigned_to:
                            editingLead.assigned_to === ""
                                ? null
                                : editingLead.assigned_to,
                        assigned_to_name: selectedEmployee
                            ? `${selectedEmployee.first_name || ""} ${selectedEmployee.last_name || ""
                                }`.trim()
                            : editingLead.assigned_to === ""
                                ? null
                                : lead.assigned_to_name,
                    };
                })
            );

            setEditingLead(null);
        } catch (err) {
            //console.error("Update lead error:", err);
            alert(
                "Something went wrong while updating the lead."
            );
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
                const data = await response
                    .json()
                    .catch(() => null);

                //console.error("Delete failed:", data);
                alert("Failed to delete lead.");

                return;
            }

            // Remove the deleted lead from the current UI
            setLeads((prevLeads) =>
                prevLeads.filter(
                    (lead) =>
                        String(lead.id) !== String(leadId)
                )
            );
        } catch (err) {
            //console.error("Delete lead error:", err);
            alert(
                "Something went wrong while deleting the lead."
            );
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
                                                                handleEditClick(lead)
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
                    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-600">
                            Total leads: <span className="font-semibold">{totalLeads}</span>
                            {" · "}
                            Page <span className="font-semibold">{currentPage}</span>
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                disabled={!previousPage || loading}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <button
                                type="button"
                                onClick={() => setCurrentPage((page) => page + 1)}
                                disabled={!nextPage || loading}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Lead modal */}
            {editingLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
                    <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-xl">
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
                                    <option value="interested">
                                        Interested
                                    </option>
                                    <option value="won">Won</option>
                                    <option value="lost">Lost</option>
                                </select>
                            </div>

                            {/* Assigned To */}
                            <div>
                                <label
                                    htmlFor="edit-assigned-to"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Assigned To
                                </label>

                                <select
                                    id="edit-assigned-to"
                                    name="assigned_to"
                                    value={editingLead.assigned_to ?? ""}
                                    onChange={handleEditChange}
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">
                                        Unassigned
                                    </option>

                                    {employees.map((employee) => (
                                        <option
                                            key={employee.id}
                                            value={String(employee.id)}
                                        >
                                            {employee.first_name}{" "}
                                            {employee.last_name}
                                        </option>
                                    ))}
                                </select>

                                {employees.length === 0 && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        No employees available.
                                    </p>
                                )}
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