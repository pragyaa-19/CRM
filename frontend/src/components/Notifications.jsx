import { useCallback, useEffect, useRef, useState } from "react";

const API_URL = "http://127.0.0.1:8000/notifications/api/";
const WS_URL = "ws://127.0.0.1:8000/ws/notifications/";

function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const seenNotificationIds = useRef(new Set());
    const dropdownRef = useRef(null);

    const getHeaders = useCallback(() => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
    }), []);

    // Fetch notifications belonging to the logged-in user
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API_URL, {
                method: "GET",
                headers: getHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch notifications (${response.status})`);
            }

            const data = await response.json();
            const fetchedNotifications = Array.isArray(data) ? data : data.results || [];

            fetchedNotifications.forEach((notification) => {
                seenNotificationIds.current.add(notification.id);
            });

            setNotifications((previous) => {
                const fetchedIds = new Set(fetchedNotifications.map((n) => n.id));
                const liveNotifications = previous.filter((n) => !fetchedIds.has(n.id));
                return [...liveNotifications, ...fetchedNotifications];
            });
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setError("Unable to load notifications.");
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    // Fetch the unread notification count
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}unread-count/`, {
                method: "GET",
                headers: getHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch unread count (${response.status})`);
            }

            const data = await response.json();
            setUnreadCount(data.unread_count ?? 0);
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    }, [getHeaders]);

    // Connect to the notification WebSocket
    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");

        if (!accessToken) {
            console.warn("Notification WebSocket not connected: access token missing.");
            return;
        }

        let socket;
        let reconnectTimer;
        let shouldReconnect = true;

        const connectWebSocket = () => {
            const token = encodeURIComponent(accessToken);
            socket = new WebSocket(`${WS_URL}?token=${token}`);

            socket.onopen = () => console.log("Notification WebSocket connected.");

            socket.onmessage = (event) => {
                try {
                    const notification = JSON.parse(event.data);

                    if (notification.id == null) return;
                    if (seenNotificationIds.current.has(notification.id)) return;

                    seenNotificationIds.current.add(notification.id);

                    setNotifications((previous) => [notification, ...previous]);

                    if (!notification.is_read) {
                        setUnreadCount((previous) => previous + 1);
                    }
                } catch (error) {
                    console.error("Error processing notification:", error);
                }
            };

            socket.onerror = (error) => console.error("Notification WebSocket error:", error);

            socket.onclose = () => {
                if (shouldReconnect) {
                    reconnectTimer = setTimeout(connectWebSocket, 3000);
                }
            };
        };

        connectWebSocket();

        return () => {
            shouldReconnect = false;
            clearTimeout(reconnectTimer);
            if (socket && socket.readyState !== WebSocket.CLOSED) {
                socket.close();
            }
        };
    }, []);

    // Initial fetch on mount
    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    // Handle clicking outside to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Mark one notification as read
    const markAsRead = async (notification) => {
        if (notification.is_read) return;

        try {
            const response = await fetch(`${API_URL}${notification.id}/mark-read/`, {
                method: "PATCH",
                headers: getHeaders(),
            });

            if (!response.ok) throw new Error(`Failed to mark as read (${response.status})`);

            setNotifications((previous) =>
                previous.map((item) =>
                    item.id === notification.id ? { ...item, is_read: true } : item
                )
            );
            setUnreadCount((previous) => Math.max(0, previous - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
            setError("Unable to update notification.");
        }
    };

    // Mark every unread notification as read
    const markAllAsRead = async () => {
        const unreadNotifications = notifications.filter((n) => !n.is_read);
        if (unreadNotifications.length === 0) return;

        try {
            setError("");
            const results = await Promise.all(
                unreadNotifications.map(async (notification) => {
                    const response = await fetch(`${API_URL}${notification.id}/mark-read/`, {
                        method: "PATCH",
                        headers: getHeaders(),
                    });

                    if (!response.ok) throw new Error(`Failed to mark ${notification.id} as read`);
                    return notification.id;
                })
            );

            const successfullyReadIds = new Set(results);

            setNotifications((previous) =>
                previous.map((notification) =>
                    successfullyReadIds.has(notification.id)
                        ? { ...notification, is_read: true }
                        : notification
                )
            );

            setUnreadCount((previous) => Math.max(0, previous - results.length));
        } catch (error) {
            console.error("Error marking all as read:", error);
            setError("Some notifications could not be updated. Please try again.");
            fetchNotifications();
            fetchUnreadCount();
        }
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => {
                    const nextOpen = !isOpen;
                    setIsOpen(nextOpen);
                    if (nextOpen) {
                        fetchNotifications();
                        fetchUnreadCount();
                    }
                }}
                className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`Notifications, ${unreadCount} unread`}
                aria-expanded={isOpen}
            >
                <svg
                    className="h-8 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                </svg>
                
                {unreadCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-3 w-80 origin-top-right overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black ring-opacity-5">
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Notifications
                        </h3>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                className="text-xs font-medium text-blue-600 hover:text-blue-800"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {error && (
                        <div role="alert" className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="max-h-[22rem] divide-y divide-gray-100 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center p-8">
                                <p className="text-sm text-gray-500">Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <p className="text-sm text-gray-500">You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() => markAsRead(notification)}
                                    className={`relative block w-full px-4 py-3.5 text-left transition-colors hover:bg-gray-50 ${
                                        notification.is_read ? "bg-white" : "bg-blue-50/40"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {!notification.is_read && (
                                            <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-hidden="true" />
                                        )}

                                        <div className="flex-1">
                                            <p className={`text-sm ${notification.is_read ? "text-gray-600" : "font-medium text-gray-900"}`}>
                                                {notification.message}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                {notification.is_read ? "Read" : "Unread · Click to mark as read"}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notification;