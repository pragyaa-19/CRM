import { useCallback, useEffect, useRef, useState } from "react";

const API_URL = "http://127.0.0.1:8000";
const WS_URL = "ws://127.0.0.1:8000";

/* ---------- Helpers ---------- */

function getUserIdFromToken(token) {
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.user_id ?? payload.sub ?? null;
    } catch {
        return null;
    }
}

function normalize(raw) {
    let data = raw;

    if (typeof raw === "string") {
        try {
            data = JSON.parse(raw);
        } catch {
            data = { content: raw };
        }
    }

    if (typeof data !== "object" || data === null) {
        data = { content: String(data) };
    }

    const id = data.id ?? null;

    return {
        id,
        sender: data.sender ?? data.sender_id ?? data.user ?? null,
        sender_name: data.sender_name ?? "",
        conversation_name: data.conversation_name ?? "",
        content: data.content ?? data.message ?? "",
        created_at: data.created_at ?? new Date().toISOString(),
        is_read: data.is_read ?? false,
        is_deleted: data.is_deleted ?? false,
        is_edited: data.is_edited ?? false,
        key: id != null ? `message-${id}` : `local-${crypto.randomUUID()}`,
    };
}

function mergeMessages(existing, incoming) {
    const merged = [];
    const seenIds = new Set();
    const seenLocalKeys = new Set();

    for (const message of [...existing, ...incoming]) {
        if (message.id != null) {
            const idKey = String(message.id);

            if (seenIds.has(idKey)) continue;
            seenIds.add(idKey);
        } else {
            if (seenLocalKeys.has(message.key)) continue;
            seenLocalKeys.add(message.key);
        }

        merged.push(message);
    }

    return merged.sort((a, b) => {
        return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
        );
    });
}

const timeFormat = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
});

const dayFormat = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
});

function sameDay(a, b) {
    return new Date(a).toDateString() === new Date(b).toDateString();
}

const STATUS = {
    connecting: { label: "Connecting…", dot: "bg-amber-400" },
    open: { label: "Connected", dot: "bg-emerald-500" },
    closed: { label: "Reconnecting…", dot: "bg-red-500" },
};

/* ---------- Component ---------- */

export default function Chat({ conversationId, conversationName }) {
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState("");
    const [status, setStatus] = useState("connecting");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showJump, setShowJump] = useState(false);

    const socketRef = useRef(null);
    const listRef = useRef(null);
    const inputRef = useRef(null);
    const stickToBottom = useRef(true);

    const token = localStorage.getItem("access_token");
    const myId = getUserIdFromToken(token);

    /* ---------- Load message history ---------- */

    useEffect(() => {
        const controller = new AbortController();

        setMessages([]);
        setLoading(true);
        setError(null);

        async function loadHistory() {
            try {
                const response = await fetch(
                    `${API_URL}/messages/api/conversations/${conversationId}/messages/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Server responded with ${response.status}`
                    );
                }

                const data = await response.json();

                const history = (
                    Array.isArray(data) ? data : data.results ?? []
                ).map(normalize);

                setMessages((current) =>
                    mergeMessages(history, current)
                );

                setError(null);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Unable to load chat history:", err);
                    setError("Couldn't load earlier messages.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadHistory();

        return () => controller.abort();
    }, [conversationId, token]);

    /* ---------- WebSocket ---------- */

    useEffect(() => {
        let retries = 0;
        let retryTimer = null;
        let disposed = false;
        let currentSocket = null;

        if (!token) {
            setStatus("closed");
            setError("Please log in again to connect to chat.");
            return undefined;
        }

        const connect = () => {
            if (disposed) return;

            setStatus("connecting");

            const encodedToken = encodeURIComponent(token);

            const socket = new WebSocket(
                `${WS_URL}/ws/chat/${conversationId}/?token=${encodedToken}`
            );

            currentSocket = socket;
            socketRef.current = socket;

            socket.onopen = () => {
                if (disposed) {
                    socket.close();
                    return;
                }

                console.log(
                    "Chat WebSocket connected:",
                    new Date().toISOString()
                );

                retries = 0;
                setStatus("open");
            };

            socket.onmessage = (event) => {
                if (disposed) return;

                console.log(
                    "Chat WebSocket message received:",
                    new Date().toISOString(),
                    event.data
                );

                try {
                    const incomingMessage = normalize(event.data);

                    setMessages((current) =>
                        mergeMessages(current, [incomingMessage])
                    );
                } catch (err) {
                    console.error(
                        "Could not process incoming chat message:",
                        err
                    );
                }
            };

            socket.onerror = (event) => {
                console.error("Chat WebSocket error:", event);
                socket.close();
            };

            socket.onclose = () => {
                if (disposed) return;

                if (socketRef.current === socket) {
                    socketRef.current = null;
                }

                setStatus("closed");

                const delay = Math.min(
                    1000 * 2 ** retries,
                    15000
                );

                retries += 1;

                console.warn(
                    `Chat WebSocket closed; reconnecting in ${delay}ms.`
                );

                retryTimer = setTimeout(connect, delay);
            };
        };

        connect();

        return () => {
            disposed = true;

            if (retryTimer) {
                clearTimeout(retryTimer);
            }

            if (currentSocket) {
                currentSocket.onopen = null;
                currentSocket.onmessage = null;
                currentSocket.onerror = null;
                currentSocket.onclose = null;
                currentSocket.close();
            }

            if (socketRef.current === currentSocket) {
                socketRef.current = null;
            }
        };
    }, [conversationId, token]);

    /* ---------- Scrolling ---------- */

    const scrollToBottom = useCallback((smooth = true) => {
        const element = listRef.current;

        if (!element) return;

        element.scrollTo({
            top: element.scrollHeight,
            behavior: smooth ? "smooth" : "auto",
        });
    }, []);

    const handleScroll = () => {
        const element = listRef.current;

        if (!element) return;

        const nearBottom =
            element.scrollHeight -
            element.scrollTop -
            element.clientHeight <
            80;

        stickToBottom.current = nearBottom;

        if (nearBottom) {
            setShowJump(false);
        }
    };

    useEffect(() => {
        if (stickToBottom.current) {
            scrollToBottom(!loading);
        } else if (messages.length) {
            setShowJump(true);
        }
    }, [messages, loading, scrollToBottom]);

    /* ---------- Send message ---------- */

    const send = () => {
        const text = draft.trim();
        const socket = socketRef.current;

        if (
            !text ||
            !socket ||
            socket.readyState !== WebSocket.OPEN
        ) {
            return;
        }

        try {
            socket.send(
                JSON.stringify({
                    content: text,
                })
            );

            setDraft("");
            stickToBottom.current = true;

            if (inputRef.current) {
                inputRef.current.style.height = "auto";
            }
        } catch (err) {
            console.error("Unable to send chat message:", err);
            setError("Message could not be sent. Please try again.");
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            send();
        }
    };

    const handleInput = (event) => {
        setDraft(event.target.value);

        event.target.style.height = "auto";

        event.target.style.height = `${Math.min(
            event.target.scrollHeight,
            128
        )}px`;
    };

    const connected = status === "open";
    const { label, dot } = STATUS[status];

    /* ---------- Render ---------- */

    return (
        <div className="mx-auto flex h-full min-h-0 w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <header className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
                <h1 className="text-base font-semibold text-gray-900">
                    {conversationName ||
                        messages[0]?.conversation_name ||
                        `Conversation #${conversationId}`}
                </h1>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span
                        className={`h-2 w-2 rounded-full ${dot} ${
                            status === "open" ? "" : "animate-pulse"
                        }`}
                    />

                    {label}
                </div>
            </header>

            <div className="relative flex-1 overflow-hidden">
                <div
                    ref={listRef}
                    onScroll={handleScroll}
                    className="h-full overflow-y-auto bg-gray-50 px-4 py-4"
                    role="log"
                    aria-live="polite"
                >
                    {error && (
                        <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {loading && (
                        <p className="py-10 text-center text-sm text-gray-400">
                            Loading messages…
                        </p>
                    )}

                    {!loading &&
                        messages.length === 0 &&
                        !error && (
                            <p className="py-10 text-center text-sm text-gray-400">
                                No messages yet. Say hello!
                            </p>
                        )}

                    {messages.map((message, index) => {
                        const previous = messages[index - 1];

                        const mine =
                            myId != null &&
                            String(message.sender) === String(myId);

                        const newDay =
                            !previous ||
                            !sameDay(
                                previous.created_at,
                                message.created_at
                            );

                        const grouped =
                            previous &&
                            !newDay &&
                            String(previous.sender) ===
                                String(message.sender);

                        return (
                            <div key={message.key}>
                                {newDay && (
                                    <div className="my-4 text-center text-xs text-gray-400">
                                        {dayFormat.format(
                                            new Date(message.created_at)
                                        )}
                                    </div>
                                )}

                                <div
                                    className={`flex flex-col ${
                                        mine
                                            ? "items-end"
                                            : "items-start"
                                    } ${
                                        grouped ? "mt-1" : "mt-3"
                                    }`}
                                >
                                    {!mine &&
                                        !grouped &&
                                        message.sender != null && (
                                            <span className="mb-1 ml-1 text-xs text-gray-500">
                                                {message.sender_name}
                                            </span>
                                        )}

                                    <div
                                        className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                                            mine
                                                ? "rounded-br-md bg-blue-800 text-white"
                                                : "rounded-bl-md border border-white bg-white text-gray-900"
                                        }`}
                                    >
                                        {message.content}

                                        <span className="ml-2 inline-block translate-y-0.5 text-[10px] text-gray-400">
                                            {timeFormat.format(
                                                new Date(
                                                    message.created_at
                                                )
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {showJump && (
                    <button
                        type="button"
                        onClick={() => {
                            stickToBottom.current = true;
                            scrollToBottom();
                            setShowJump(false);
                        }}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-md hover:bg-gray-700"
                    >
                        New messages ↓
                    </button>
                )}
            </div>

            <div className="flex items-end gap-2 border-t border-gray-200 bg-white p-3">
                <textarea
                    ref={inputRef}
                    rows={1}
                    value={draft}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        connected
                            ? "Type a message…"
                            : "Waiting for connection…"
                    }
                    className="max-h-32 flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />

                <button
                    type="button"
                    onClick={send}
                    disabled={!connected || !draft.trim()}
                    className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Send
                </button>
            </div>
        </div>
    );
}