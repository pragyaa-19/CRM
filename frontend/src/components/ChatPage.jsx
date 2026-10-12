import { useEffect, useState } from "react";

import Chat from "../pages/WebSocketTest";
import CreateGroup from "./CreateGroup";
import Sidebar from "../components/Sidebar";
import CurrentUser from "../components/CurrentUser";
import Header from "../components/Header";
import AddEmployee from "../pages/AddEmployee";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function ChatPage() {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [conversations, setConversations] = useState({
        groups: [],
        dm: [],
    });

    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedConversationId, setSelectedConversationId] = useState(null);

    const token = localStorage.getItem("access_token");

    useEffect(() => {
        const trimmedSearch = search.trim();

        if (!trimmedSearch) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const controller = new AbortController();

        const delayDebounceFn = setTimeout(async () => {
            try {
                const res = await fetch(
                    `${API_URL}/messages/api/users/search/?q=${encodeURIComponent(
                        trimmedSearch
                    )}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    }
                );

                if (!res.ok) {
                    throw new Error(`Server responded with ${res.status}`);
                }

                const data = await res.json();
                setSearchResults(Array.isArray(data) ? data : data.results ?? []);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Error searching users:", err);
                    setSearchResults([]);
                }
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            clearTimeout(delayDebounceFn);
            controller.abort();
        };
    }, [search, token]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchConversations = async () => {
            try {
                const res = await fetch(`${API_URL}/messages/api/conversations/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error(`Server responded with ${res.status}`);
                }

                const data = await res.json();

                setConversations({
                    groups: Array.isArray(data.groups) ? data.groups : [],
                    dm: Array.isArray(data.dm) ? data.dm : [],
                });
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Error loading conversations:", err);
                }
            }
        };

        fetchConversations();

        return () => controller.abort();
    }, [token]);

    const openDirectConversation = async (user) => {
        try {
            const res = await fetch(`${API_URL}/messages/api/conversations/direct/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_id: user.id,
                }),
            });

            if (!res.ok) {
                throw new Error(`Server responded with ${res.status}`);
            }

            const data = await res.json();

            const newDm = {
                conversation_id: data.conversation_id,
                user: data.username ?? user.username,
                last_message: null,
                last_message_time: null,
            };

            setConversations((prev) => {
                const isExisting = prev.dm.some(
                    (chat) => String(chat.conversation_id) === String(data.conversation_id)
                );

                if (isExisting) return prev;

                return {
                    ...prev,
                    dm: [newDm, ...prev.dm],
                };
            });

            setSelectedConversationId(data.conversation_id);
            setSearch("");
            setSearchResults([]);
        } catch (err) {
            console.error("Could not open conversation:", err);
        }
    };

    const selectedGroup = conversations.groups.find(
        (group) => String(group.conversation_id) === String(selectedConversationId)
    );

    const selectedDM = conversations.dm.find(
        (chat) => String(chat.conversation_id) === String(selectedConversationId)
    );

    const selectedConversationName = selectedGroup?.name || selectedDM?.user || null;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            <CurrentUser onUserLoaded={setCurrentUser} />

            <Sidebar
                isSidebarOpen={isSidebarOpen}
                currentUser={currentUser}
                onAddEmployeeClick={() => setIsModalOpen(true)}
            />

            {/* Changed this wrapper to flex-col so Header stays on top */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                
                {/* Header is now at the top level of the right side */}
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    currentUser={currentUser}
                />

                {/* New flex row container for Recent Convos and Chat Area underneath the Header */}
                <div className="flex min-h-0 flex-1 overflow-hidden border-t border-gray-200">
                    
                    <aside className="flex h-full w-80 shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white p-4">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Recent Conversations
                            </h2>

                            <button
                                type="button"
                                onClick={() => setShowCreateGroup(true)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-lg text-gray-600 hover:bg-gray-100"
                                title="Create Group"
                                aria-label="Create Group"
                            >
                                +
                            </button>
                        </div>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search people..."
                            className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />

                        {search.trim() && (
                            <div className="mb-4">
                                {isSearching ? (
                                    <p className="px-3 py-2 text-sm text-gray-500">
                                        Searching...
                                    </p>
                                ) : (
                                    <>
                                        {searchResults.map((user) => (
                                            <button
                                                type="button"
                                                key={user.id}
                                                onClick={() => openDirectConversation(user)}
                                                className="block w-full cursor-pointer rounded-lg p-3 text-left hover:bg-gray-100"
                                            >
                                                {user.username}
                                            </button>
                                        ))}

                                        {searchResults.length === 0 && (
                                            <p className="px-3 py-2 text-sm text-gray-500">
                                                No users found.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {conversations.groups.length > 0 && (
                            <div className="mb-6">
                                <h3 className="mb-2 text-xs font-semibold uppercase text-gray-400">
                                    Groups
                                </h3>

                                {conversations.groups.map((group) => (
                                    <button
                                        type="button"
                                        key={group.conversation_id}
                                        onClick={() => setSelectedConversationId(group.conversation_id)}
                                        className={`mb-2 block w-full rounded-lg p-3 text-left transition ${
                                            String(selectedConversationId) === String(group.conversation_id)
                                                ? "bg-gray-200"
                                                : "hover:bg-gray-100"
                                        }`}
                                    >
                                        <div className="font-medium text-gray-900">
                                            {group.name}
                                        </div>

                                        {group.last_message && (
                                            <div className="truncate text-sm text-gray-500">
                                                {group.last_message}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {conversations.dm.length > 0 && (
                            <div>
                                <h3 className="mb-2 text-xs font-semibold uppercase text-gray-400">
                                    Direct Messages
                                </h3>

                                {conversations.dm.map((chat) => (
                                    <button
                                        type="button"
                                        key={chat.conversation_id}
                                        onClick={() => setSelectedConversationId(chat.conversation_id)}
                                        className={`mb-2 block w-full rounded-lg p-3 text-left transition ${
                                            String(selectedConversationId) === String(chat.conversation_id)
                                                ? "bg-gray-200"
                                                : "hover:bg-gray-100"
                                        }`}
                                    >
                                        <div className="font-medium text-gray-900">
                                            {chat.user}
                                        </div>

                                        {chat.last_message && (
                                            <div className="truncate text-sm text-gray-500">
                                                {chat.last_message}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {conversations.groups.length === 0 &&
                            conversations.dm.length === 0 &&
                            !search.trim() && (
                                <p className="text-sm text-gray-400">
                                    No conversations yet.
                                </p>
                            )}
                    </aside>

                    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-gray-50">
                        <div className="min-h-0 flex-1 p-3 sm:p-4">
                            {selectedConversationId ? (
                                <Chat
                                    conversationId={selectedConversationId}
                                    conversationName={selectedConversationName}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    Select a conversation
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {showCreateGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <CreateGroup
                        onClose={() => setShowCreateGroup(false)}
                        onGroupCreated={(group) => {
                            const newGroup = {
                                conversation_id: group.conversation_id,
                                name: group.name,
                                last_message: null,
                                last_message_time: null,
                            };

                            setConversations((prev) => {
                                const isExisting = prev.groups.some(
                                    (item) => String(item.conversation_id) === String(group.conversation_id)
                                );
                                
                                if (isExisting) return prev;

                                return {
                                    ...prev,
                                    groups: [newGroup, ...prev.groups],
                                };
                            });

                            setSelectedConversationId(group.conversation_id);
                            setShowCreateGroup(false);
                        }}
                    />
                </div>
            )}

            {isModalOpen && (
                <AddEmployee onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
}