import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TeamDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [team, setTeam] = useState(null);
    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState(true);
    const [addingMember, setAddingMember] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState("");

    const [error, setError] = useState("");

    const token = localStorage.getItem("access_token");

    // =========================
    // FETCH TEAM
    // =========================
    const fetchTeam = async () => {
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/teams/api/team/${id}/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error("Team error:", data);
                setError("Unable to load team.");
                return;
            }

            console.log("TEAM DATA:", data);
            console.log("TEAM MEMBERS:", data.members);

            setTeam(data);

        } catch (error) {
            console.error("Fetch team error:", error);
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // FETCH AVAILABLE EMPLOYEES
    // =========================
    const fetchEmployees = async () => {
        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/available-employees/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error("Employees error:", data);
                setError("Unable to load employees.");
                return;
            }

            console.log("AVAILABLE EMPLOYEES:", data);

            setEmployees(data);

        } catch (error) {
            console.error("Fetch employees error:", error);
            setError("Something went wrong.");
        }
    };

    // =========================
    // INITIAL LOAD
    // =========================
    useEffect(() => {
        fetchTeam();
    }, [id]);

    // =========================
    // OPEN ADD MEMBER MODAL
    // =========================
    const handleOpenAddMember = async () => {
        setError("");
        setSelectedEmployee("");

        await fetchEmployees();

        setAddingMember(true);
    };

    // =========================
    // ADD MEMBER
    // =========================
    const handleAddMember = async () => {
        if (!selectedEmployee) {
            setError("Please select an employee.");
            return;
        }

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/teams/api/team/${id}/members/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        user_id: Number(selectedEmployee),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error("Add member error:", data);
                setError(
                    typeof data === "object"
                        ? JSON.stringify(data)
                        : data
                );
                return;
            }

            console.log("ADD MEMBER RESPONSE:", data);

            // Close modal
            setAddingMember(false);
            setSelectedEmployee("");
            setError("");

            // Fetch updated team
            await fetchTeam();

            // Fetch updated available employees
            await fetchEmployees();

        } catch (error) {
            console.error("Add member error:", error);
            setError("Something went wrong.");
        }
    };

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div className="p-6">
                Loading team...
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================
    if (error && !team) {
        return (
            <div className="p-6">
                <p className="text-red-600">
                    {error}
                </p>
            </div>
        );
    }

    // =========================
    // TEAM NOT FOUND
    // =========================
    if (!team) {
        return (
            <div className="p-6">
                Team not found.
            </div>
        );
    }

    return (
        <div className="p-6">

            {/* =========================
                BACK BUTTON
            ========================= */}
            <button
                onClick={() => navigate("/teams")}
                className="mb-5 text-blue-600 hover:underline"
            >
                ← Back to Teams
            </button>


            {/* =========================
                ERROR MESSAGE
            ========================= */}
            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                    {error}
                </div>
            )}


            {/* =========================
                TEAM INFORMATION
            ========================= */}
            <div className="bg-white border rounded-xl p-6 shadow-sm mb-6">

                <h1 className="text-2xl font-bold text-gray-900">
                    {team.name}
                </h1>

                <div className="mt-4">

                    <p className="text-sm text-gray-500">
                        Manager
                    </p>

                    <p className="font-semibold text-gray-900">
                        {team.manager_name}
                    </p>

                    <p className="text-sm text-gray-500">
                        {team.manager_email}
                    </p>

                </div>

            </div>


            {/* =========================
                MEMBERS
            ========================= */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">

                <div className="flex justify-between items-center mb-5">

                    <div>

                        <h2 className="text-xl font-semibold">
                            Members
                        </h2>

                        <p className="text-sm text-gray-500">
                            {team.members?.length || 0} member
                            {(team.members?.length || 0) !== 1
                                ? "s"
                                : ""}
                        </p>

                    </div>

                    <button
                        onClick={handleOpenAddMember}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        + Add Member
                    </button>

                </div>


                {/* =========================
                    NO MEMBERS
                ========================= */}
                {!team.members || team.members.length === 0 ? (

                    <p className="text-gray-500">
                        No members in this team yet.
                    </p>

                ) : (

                    /* =========================
                       MEMBER LIST
                    ========================= */
                    <div className="space-y-3">

                        {team.members.map((member, index) => (

                            <div
                                key={member.id ?? `member-${index}`}
                                className="flex justify-between items-center border rounded-lg p-4"
                            >

                                <div>

                                    <p className="font-medium text-gray-900">
                                        {member.first_name}{" "}
                                        {member.last_name}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {member.email}
                                    </p>

                                </div>

                                <button
                                    className="text-red-600 text-sm hover:underline"
                                >
                                    Remove
                                </button>

                            </div>

                        ))}

                    </div>

                )}

            </div>


            {/* =========================
                ADD MEMBER MODAL
            ========================= */}
            {addingMember && (

                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">

                        <h2 className="text-xl font-semibold mb-5">
                            Add Team Member
                        </h2>


                        {/* AVAILABLE EMPLOYEES */}
                        {employees.length === 0 ? (

                            <p className="text-gray-500 mb-5">
                                No employees are currently available.
                            </p>

                        ) : (

                            <select
                                value={selectedEmployee}
                                onChange={(e) =>
                                    setSelectedEmployee(e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2 mb-5"
                            >

                                <option value="">
                                    Select Employee
                                </option>

                                {employees.map((employee, index) => (

                                    <option
                                        key={
                                            employee.id ??
                                            `employee-${index}`
                                        }
                                        value={employee.id}
                                    >
                                        {employee.first_name}{" "}
                                        {employee.last_name} —{" "}
                                        {employee.email}
                                    </option>

                                ))}

                            </select>

                        )}


                        {/* BUTTONS */}
                        <div className="flex justify-end gap-3">

                            <button
                                onClick={() => {
                                    setAddingMember(false);
                                    setSelectedEmployee("");
                                    setError("");
                                }}
                                className="border px-4 py-2 rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleAddMember}
                                disabled={!selectedEmployee}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                            >
                                Add
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}