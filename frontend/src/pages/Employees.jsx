import { useEffect, useState } from "react";
import { Users, Search } from "lucide-react";

import Sidebar from "../components/Sidebar";
import CurrentUser from "../components/CurrentUser";
import Header from "../components/Header";
import AddEmployee from "./AddEmployee";

const API_URL = "http://127.0.0.1:8000";

// Get a person's display name
function getPersonName(person) {
    const fullName = [
        person.first_name,
        person.last_name,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        fullName ||
        person.name ||
        person.username ||
        person.email ||
        "Unnamed user"
    );
}

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [managers, setManagers] = useState([]);

    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [loadingManagers, setLoadingManagers] = useState(true);

    const [employeeError, setEmployeeError] = useState("");
    const [managerError, setManagerError] = useState("");

    const [search, setSearch] = useState("");

    // Sidebar state
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // Logged-in user
    const [currentUser, setCurrentUser] = useState(null);

    // Add Employee modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const token = localStorage.getItem("access_token");

    // Fetch employees
    useEffect(() => {
        const controller = new AbortController();

        async function fetchEmployees() {
            try {
                setLoadingEmployees(true);
                setEmployeeError("");

                const response = await fetch(
                    `${API_URL}/api/employees/`,
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
                        data.detail || "Unable to load employees."
                    );
                }

                const employeeList = Array.isArray(data)
                    ? data
                    : data.results ?? [];

                setEmployees(employeeList);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Employees API error:", err);
                    setEmployeeError(
                        err.message || "Unable to load employees."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoadingEmployees(false);
                }
            }
        }

        fetchEmployees();

        return () => controller.abort();
    }, [token]);

    // Fetch managers
    useEffect(() => {
        const controller = new AbortController();

        async function fetchManagers() {
            try {
                setLoadingManagers(true);
                setManagerError("");

                const response = await fetch(
                    `${API_URL}/api/managers/`,
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
                        data.detail || "Unable to load managers."
                    );
                }

                const managerList = Array.isArray(data)
                    ? data
                    : data.results ?? [];

                setManagers(managerList);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Managers API error:", err);
                    setManagerError(
                        err.message || "Unable to load managers."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoadingManagers(false);
                }
            }
        }

        fetchManagers();

        return () => controller.abort();
    }, [token]);

    // Combine both lists
    const allPeople = [
        ...managers.map((manager) => ({
            ...manager,
            displayRole: "Manager",
        })),

        ...employees.map((employee) => ({
            ...employee,
            displayRole: "Employee",
        })),
    ];

    // Search by name, email, username, or role
    const filteredPeople = allPeople.filter((person) => {
        const query = search.toLowerCase().trim();

        return (
            getPersonName(person).toLowerCase().includes(query) ||
            person.email?.toLowerCase().includes(query) ||
            person.username?.toLowerCase().includes(query) ||
            person.displayRole.toLowerCase().includes(query)
        );
    });

    const loading = loadingEmployees || loadingManagers;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">

            {/* Load logged-in user */}
            <CurrentUser onUserLoaded={setCurrentUser} />

            {/* Common sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                currentUser={currentUser}
                onAddEmployeeClick={() => setIsModalOpen(true)}
            />

            {/* Main page */}
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

                {/* Common header and sidebar toggle */}
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    currentUser={currentUser}
                />

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Page heading */}
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <Users size={24} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Employees
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage your company's managers and employees.
                            </p>
                        </div>
                    </div>

                    {/* People table */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                        {/* Search and totals */}
                        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">

                            <div className="relative w-full max-w-md">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name, email, or role..."
                                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="text-sm text-gray-500">
                                Managers: {managers.length} · Employees: {employees.length}
                            </div>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="p-8 text-center text-gray-500">
                                Loading team members...
                            </div>
                        )}

                        {/* API errors */}
                        {!loading && (managerError || employeeError) && (
                            <div className="space-y-2 p-5">
                                {managerError && (
                                    <p className="text-sm text-red-600">
                                        Managers: {managerError}
                                    </p>
                                )}

                                {employeeError && (
                                    <p className="text-sm text-red-600">
                                        Employees: {employeeError}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Table */}
                        {!loading && (
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
                                                Role
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredPeople.map((person) => (
                                            <tr
                                                key={`${person.displayRole}-${person.id}`}
                                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {getPersonName(person)}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {person.email || "-"}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                            person.displayRole === "Manager"
                                                                ? "bg-purple-50 text-purple-700"
                                                                : "bg-blue-50 text-blue-700"
                                                        }`}
                                                    >
                                                        {person.displayRole}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}

                                        {filteredPeople.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="px-6 py-10 text-center text-gray-500"
                                                >
                                                    {search
                                                        ? "No matching team members found."
                                                        : "No team members found."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>

                                </table>
                            </div>
                        )}
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