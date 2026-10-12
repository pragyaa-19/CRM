import { useEffect, useState } from "react";
import { Search, Mail, Phone, Users } from "lucide-react";

import Sidebar from "../components/Sidebar";
import CurrentUser from "../components/CurrentUser";
import Header from "../components/Header";
import AddEmployee from "../pages/AddEmployee";

const Card = ({ children, className = "" }) => (
    <div
        className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
        {children}
    </div>
);

function Contacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    // Sidebar state
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // Logged-in user
    const [currentUser, setCurrentUser] = useState(null);

    // Add Employee modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const token = localStorage.getItem("access_token");

    // Fetch contacts from the backend
    useEffect(() => {
        const controller = new AbortController();

        const fetchContacts = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/leads/api/create-lead/",
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
                        data.detail || "Unable to load contacts."
                    );
                }

                // Support a plain list or a paginated response
                const contactList = Array.isArray(data)
                    ? data
                    : data.results ?? [];

                setContacts(contactList);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Fetch contacts error:", err);
                    setError(err.message || "Something went wrong.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchContacts();

        return () => controller.abort();
    }, [token]);

    // Filter contacts based on search input
    const filteredContacts = contacts.filter((contact) => {
        const searchText = search.toLowerCase().trim();

        return (
            contact.name?.toLowerCase().includes(searchText) ||
            contact.email?.toLowerCase().includes(searchText) ||
            String(contact.contact_num ?? "")
                .toLowerCase()
                .includes(searchText)
        );
    });

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

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">

            {/* Load the current user */}
            <CurrentUser onUserLoaded={setCurrentUser} />

            {/* Common Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                currentUser={currentUser}
                onAddEmployeeClick={() => setIsModalOpen(true)}
            />

            {/* Main page area */}
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

                {/* Header with sidebar toggle */}
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    currentUser={currentUser}
                />

                {/* Scrollable Contacts content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Page heading */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3">

                            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                                <Users size={24} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Contacts
                                </h1>

                                <p className="mt-1 text-sm text-gray-500">
                                    Manage your lead contacts
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Contacts card */}
                    <Card>

                        {/* Search */}
                        <div className="border-b border-gray-100 p-6">
                            <div className="relative max-w-md">

                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    placeholder="Search contacts..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                                />

                            </div>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="p-8 text-center text-gray-500">
                                Loading contacts...
                            </div>
                        )}

                        {/* Error */}
                        {error && !loading && (
                            <div className="p-8 text-center text-red-500">
                                {error}
                            </div>
                        )}

                        {/* Contacts table */}
                        {!loading && !error && (
                            <div className="overflow-x-auto">

                                <table className="w-full text-left">

                                    <thead>
                                        <tr className="border-b border-gray-200 text-sm text-gray-500">
                                            <th className="px-6 py-4 font-medium">
                                                Contact
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
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {filteredContacts.map((contact) => (
                                            <tr
                                                key={contact.id}
                                                className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50"
                                            >

                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {contact.name}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Mail size={15} />
                                                        {contact.email || "-"}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Phone size={15} />
                                                        {contact.contact_num || "-"}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(
                                                            contact.status
                                                        )}`}
                                                    >
                                                        {contact.status}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {contact.assigned_to_name || "-"}
                                                </td>

                                            </tr>
                                        ))}

                                        {filteredContacts.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-6 py-10 text-center text-gray-500"
                                                >
                                                    {search
                                                        ? "No contacts found."
                                                        : "No contacts available."}
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

            {/* Add Employee modal */}
            {isModalOpen && (
                <AddEmployee
                    onClose={() => setIsModalOpen(false)}
                />
            )}

        </div>
    );
}

export default Contacts;