import { useState, useEffect } from "react";

import Sidebar from "../components/Sidebar";
import CurrentUser from "../components/CurrentUser";
import Header from "../components/Header";
import AddEmployee from "../pages/AddEmployee";

const API_URL = "http://127.0.0.1:8000";

export default function Teams() {
    const [teams, setTeams] = useState([]);
    const [managers, setManagers] = useState([]);

    const [showCreateForm, setShowCreateForm] = useState(false);

    const [teamName, setTeamName] = useState("");
    const [managerId, setManagerId] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Sidebar state
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // Logged-in user
    const [currentUser, setCurrentUser] = useState(null);

    // Add Employee modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const token = localStorage.getItem("access_token");

    // Fetch teams
    const fetchTeams = async () => {
        try {
            const response = await fetch(
                `${API_URL}/teams/api/create-team/`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error("Failed to fetch teams");
            }

            setTeams(Array.isArray(data) ? data : data.results ?? []);
        } catch (err) {
            console.error("Fetch teams error:", err);
            setError("Unable to load teams.");
        }
    };

    // Fetch managers
    const fetchManagers = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/managers/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error("Failed to fetch managers");
            }

            setManagers(Array.isArray(data) ? data : data.results ?? []);
        } catch (err) {
            console.error("Fetch managers error:", err);
            setError("Unable to load managers.");
        }
    };

    // Load teams and managers when the page opens
    useEffect(() => {
        fetchTeams();
        fetchManagers();
    }, []);

    // Create team
    const handleCreateTeam = async (e) => {
        e.preventDefault();

        if (!teamName.trim() || !managerId) {
            setError("Team name and manager are required.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/teams/api/create-team/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: teamName.trim(),
                        manager: Number(managerId),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error("Create team error:", data);

                setError(
                    typeof data === "object"
                        ? JSON.stringify(data)
                        : "Unable to create team."
                );

                return;
            }

            // Add the newly created team to the list
            setTeams((previousTeams) => [
                ...previousTeams,
                data,
            ]);

            // Reset form
            setTeamName("");
            setManagerId("");
            setShowCreateForm(false);

        } catch (err) {
            console.error("Create team error:", err);
            setError("Something went wrong.");
        } finally {
            setLoading(false);
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

            {/* Main content area */}
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

                {/* Common Header with sidebar toggle */}
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    currentUser={currentUser}
                />

                {/* Scrollable Teams content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Page heading */}
                    <div className="mb-6 flex items-center justify-between">

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Teams
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage your company teams and managers.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setError("");
                                setShowCreateForm(true);
                            }}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            + Create Team
                        </button>

                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Create Team Form */}
                    {showCreateForm && (
                        <form
                            onSubmit={handleCreateTeam}
                            className="mb-6 max-w-lg rounded-xl border border-gray-200 bg-white p-5"
                        >

                            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                                Create Team
                            </h2>

                            {/* Team name */}
                            <div className="mb-4">

                                <label
                                    htmlFor="team-name"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Team Name
                                </label>

                                <input
                                    id="team-name"
                                    type="text"
                                    value={teamName}
                                    onChange={(e) =>
                                        setTeamName(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                                    placeholder="Enter team name"
                                />

                            </div>

                            {/* Manager */}
                            <div className="mb-4">

                                <label
                                    htmlFor="team-manager"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Manager
                                </label>

                                <select
                                    id="team-manager"
                                    value={managerId}
                                    onChange={(e) =>
                                        setManagerId(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                                >

                                    <option value="">
                                        Select Manager
                                    </option>

                                    {managers.map((manager) => (
                                        <option
                                            key={manager.id}
                                            value={manager.id}
                                        >
                                            {manager.first_name}{" "}
                                            {manager.last_name}
                                        </option>
                                    ))}

                                </select>

                            </div>

                            {/* Form buttons */}
                            <div className="flex gap-3">

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loading
                                        ? "Creating..."
                                        : "Create"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setError("");
                                    }}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>
                    )}

                    {/* Teams list */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                        {teams.map((team) => (
                            <div
                                key={team.id}
                                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                            >

                                <h2 className="text-lg font-semibold text-gray-900">
                                    {team.name}
                                </h2>

                                <p className="mt-2 text-sm text-gray-600">
                                    Manager: {team.manager_name || "-"}
                                </p>

                                <p className="text-sm text-gray-500">
                                    {team.manager_email || "-"}
                                </p>

                            </div>
                        ))}

                        {!loading && teams.length === 0 && !error && (
                            <div className="col-span-full rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                                No teams created yet.
                            </div>
                        )}

                    </div>

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