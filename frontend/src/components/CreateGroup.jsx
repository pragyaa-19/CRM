import { useEffect, useRef, useState } from "react";

const API_URL = "http://127.0.0.1:8000";
const USERS_URL = `${API_URL}/messages/api/users/`;

export default function CreateGroup({ onClose,onGroupCreated }) {
    // Group name
    const [groupName, setGroupName] = useState("");
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [createError, setCreateError] = useState("");
    // Users displayed on the screen
    const [users, setUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    // Pagination
    const [pageUrl, setPageUrl] = useState(USERS_URL);
    const [nextPage, setNextPage] = useState(null);

    // Loading and error states
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [error, setError] = useState("");

    // References for infinite scrolling
    const usersContainerRef = useRef(null);
    const bottomRef = useRef(null);
    const loadingRef = useRef(false);

    const token = localStorage.getItem("access_token");

    // 1. Fetch users from the backend
    useEffect(() => {
        const controller = new AbortController();

        const fetchUsers = async () => {
            loadingRef.current = true;
            setLoadingUsers(true);
            setError("");

            try {
                const res = await fetch(pageUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error(
                        `Server responded with ${res.status}`
                    );
                }

                const data = await res.json();

                const pageResults = Array.isArray(data.results)
                    ? data.results
                    : Array.isArray(data)
                        ? data
                        : [];

                // First page: display its users
                if (pageUrl === USERS_URL) {
                    setUsers(pageResults);
                } else {
                    // Next pages: append users to the existing list
                    setUsers((prev) => {
                        const existingIds = new Set(
                            prev.map((user) => user.id)
                        );

                        const newUsers = pageResults.filter(
                            (user) => !existingIds.has(user.id)
                        );

                        return [...prev, ...newUsers];
                    });
                }

                // Save the next page URL provided by DRF
                setNextPage(data.next ?? null);

                console.log("Pagination response:", data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Could not load users:", err);
                    setError("Could not load users. Please try again.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    loadingRef.current = false;
                    setLoadingUsers(false);
                }
            }
        };

        fetchUsers();

        return () => controller.abort();
    }, [pageUrl, token]);

    // 2. Automatically load the next page when the user scrolls down
    useEffect(() => {
        const container = usersContainerRef.current;
        const bottomElement = bottomRef.current;

        // Stop if the elements or next page do not exist
        if (!container || !bottomElement || !nextPage) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    nextPage &&
                    !loadingRef.current
                ) {
                    // Prevent duplicate requests
                    loadingRef.current = true;

                    // Changing pageUrl triggers the fetching effect
                    setPageUrl(nextPage);
                }
            },
            {
                root: container,
                rootMargin: "0px",
                threshold: 0,
            }
        );

        observer.observe(bottomElement);

        // Stop observing when the effect is cleaned up
        return () => observer.disconnect();
    }, [nextPage]);
    const handleCreateGroup = async () => {
        const name = groupName.trim();

        if (!name) {
            setCreateError("Please enter a group name.");
            return;
        }

        if (selectedMembers.length === 0) {
            setCreateError("Please select at least one member.");
            return;
        }

        setCreatingGroup(true);
        setCreateError("");

        try {
            const res = await fetch(
                `${API_URL}/messages/api/conversations/group/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: name,
                        members: selectedMembers.map((member) => member.id),
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.detail || `Server responded with ${res.status}`
                );
            }

            console.log("Group created:", data);

            // Parent component ko group ki details denge
            if (onGroupCreated) {
                onGroupCreated(data);
            }

            onClose();

        } catch (err) {
            console.error("Could not create group:", err);
            setCreateError(err.message || "Could not create group.");
        } finally {
            setCreatingGroup(false);
        }
    };
    return (
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                    Create Group
                </h2>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-100"
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>

            {/* Group name */}
            <label
                htmlFor="group-name"
                className="mb-2 block text-sm font-medium text-gray-700"
            >
                Group Name
            </label>

            <input
                id="group-name"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="mb-6 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            />

            {/* Members heading */}
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Select Members
            </h3>

            {/* Scrollable users list */}
            <div
                ref={usersContainerRef}
                className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2"
            >
                {loadingUsers && users.length === 0 && (
                    <p className="py-4 text-center text-sm text-gray-500">
                        Loading users...
                    </p>
                )}

                {!loadingUsers && !error && users.length === 0 && (
                    <p className="py-4 text-center text-sm text-gray-500">
                        No users found.
                    </p>
                )}

                {/* Display the users */}
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="rounded-lg border border-gray-100 px-3 py-2"
                    >
                        <label className="flex cursor-pointer items-center gap-3">

                            <input
                                type="checkbox"
                                checked={selectedMembers.some(
                                    (member) => member.id === user.id
                                )}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedMembers((prev) => [
                                            ...prev,
                                            user,
                                        ]);
                                    } else {
                                        setSelectedMembers((prev) =>
                                            prev.filter(
                                                (member) => member.id !== user.id
                                            )
                                        );
                                    }
                                }}
                            />

                            <span className="text-sm text-gray-800">
                                {user.username}
                            </span>

                        </label>
                    </div>
                ))}

                {/* Loading indicator for the next page */}
                {loadingUsers && users.length > 0 && (
                    <p className="py-3 text-center text-xs text-gray-500">
                        Loading more users...
                    </p>
                )}

                {/* Error message */}
                {error && (
                    <p className="py-3 text-center text-sm text-red-500">
                        {error}
                    </p>
                )}

                {/* Observer watches this element */}
                <div
                    ref={bottomRef}
                    className="h-1"
                    aria-hidden="true"
                />
            </div>

            {/* End of list */}
            {!nextPage && users.length > 0 && !loadingUsers && (
                <p className="mt-3 text-center text-xs text-gray-400">
                    You've reached the end.
                </p>
            )}
            {createError && (
                <p className="mt-3 text-sm text-red-600">
                    {createError}
                </p>
            )}

            <button
                type="button"
                onClick={handleCreateGroup}
                disabled={creatingGroup}
                className="mt-5 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {creatingGroup ? "Creating Group..." : "Create Group"}
            </button>
        </div>
    );
}