import { useCallback, useEffect, useRef, useState } from "react";

const API_URL = "http://127.0.0.1:8000";
const WS_URL = "ws://127.0.0.1:8000";

/* ---------- helpers ---------- */

// Read the user id out of the JWT so we can tell "my" messages from others.
// (SimpleJWT puts it in `user_id`; adjust if your backend uses another claim.)
function getUserIdFromToken(token) {
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

    return {
        id: data.id ?? null,

        sender: data.sender ?? data.sender_id ?? data.user ?? null,

        sender_name: data.sender_name ?? "",

        conversation_name: data.conversation_name ?? "",

        content: data.content ?? data.message ?? "",

        created_at: data.created_at ?? new Date().toISOString(),

        is_read: data.is_read ?? false,

        is_deleted: data.is_deleted ?? false,

        is_edited: data.is_edited ?? false,

        key: data.id ?? `local-${crypto.randomUUID()}`,
    };
}



// Add messages, skipping any whose server id we already have.
function mergeMessages(existing, incoming) {
    const seen = new Set(existing.filter((m) => m.id != null).map((m) => m.id));
    const fresh = incoming.filter((m) => m.id == null || !seen.has(m.id));
    return [...existing, ...fresh];
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

/* ---------- component ---------- */

export default function Chat({ conversationId, conversationName, }) {
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

    /* ----- load history ----- */
    useEffect(() => {
        setMessages([]);
        setLoading(true);
        setError(null);
        const controller = new AbortController();

        (async () => {
            try {
                const res = await fetch(
                    `${API_URL}/messages/api/conversations/${conversationId}/messages/`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        signal: controller.signal,
                    }
                );

                if (!res.ok) throw new Error(`Server responded with ${res.status}`);

                const data = await res.json();
                const list = Array.isArray(data) ? data : data.results ?? [];

                // history first, then anything that arrived over the socket meanwhile
                setMessages((prev) => mergeMessages(list.map(normalize), prev));
                setError(null);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError("Couldn't load earlier messages.");
                }
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [conversationId, token]);

    /* ----- websocket with auto-reconnect ----- */
    useEffect(() => {
        let retries = 0;
        let retryTimer;
        let disposed = false;

        const connect = () => {
            setStatus("connecting");

            const ws = new WebSocket(
                `${WS_URL}/ws/chat/${conversationId}/?token=${token}`
            );
            socketRef.current = ws;

            ws.onopen = () => {
                retries = 0;
                setStatus("open");
            };

            ws.onmessage = (event) => {
                setMessages((prev) => mergeMessages(prev, [normalize(event.data)]));
            };

            ws.onclose = () => {
                if (disposed) return;
                setStatus("closed");

                // exponential backoff: 1s, 2s, 4s … capped at 15s
                const delay = Math.min(1000 * 2 ** retries, 15000);
                retries += 1;
                retryTimer = setTimeout(connect, delay);
            };

            ws.onerror = () => ws.close();
        };

        connect();

        return () => {
            disposed = true;
            clearTimeout(retryTimer);
            socketRef.current?.close();
        };
    }, [conversationId, token]);

    /* ----- scrolling ----- */
    const scrollToBottom = useCallback((smooth = true) => {
        const el = listRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    }, []);

    const handleScroll = () => {
        const el = listRef.current;
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        stickToBottom.current = nearBottom;
        if (nearBottom) setShowJump(false);
    };

    useEffect(() => {
        if (stickToBottom.current) {
            scrollToBottom(!loading);
        } else if (messages.length) {
            setShowJump(true);
        }
    }, [messages, loading, scrollToBottom]);

    /* ----- sending ----- */
    const send = () => {
        const text = draft.trim();
        const ws = socketRef.current;

        if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;

        ws.send(
            JSON.stringify({
                content: text,
            })
        );
        setDraft("");
        stickToBottom.current = true;

        if (inputRef.current) inputRef.current.style.height = "auto";
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const handleInput = (e) => {
        setDraft(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
    };

    const connected = status === "open";
    const { label, dot } = STATUS[status];

    /* ----- render ----- */
    return (
        <div className="mx-auto flex h-full min-h-0 w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* header */}
            <header className="flex items-center justify-between border-b border-gray-200 px-5 py-3">

                <h1 className="text-base font-semibold text-gray-900">
                    {conversationName || messages[0]?.conversation_name || `Conversation #${conversationId}`}
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span
                        className={`h-2 w-2 rounded-full ${dot} ${status === "open" ? "" : "animate-pulse"
                            }`}
                    />
                    {label}
                </div>
            </header>
            {/* messages */}
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

                    {!loading && messages.length === 0 && !error && (
                        <p className="py-10 text-center text-sm text-gray-400">
                            No messages yet. Say hello!
                        </p>
                    )}
                    {messages.map((msg, i) => {
                        const prev = messages[i - 1];
                        const mine = myId != null && String(msg.sender) === String(myId);
                        const newDay = !prev || !sameDay(prev.created_at, msg.created_at);
                        const grouped = prev && !newDay && prev.sender === msg.sender;
                        return (
                            <div key={msg.key}>
                                {newDay && (
                                    <div className="my-4 text-center text-xs text-gray-400">
                                        {dayFormat.format(new Date(msg.created_at))}
                                    </div>
                                )}

                                <div
                                    className={`flex flex-col ${mine ? "items-end" : "items-start"
                                        } ${grouped ? "mt-1" : "mt-3"}`}
                                >
                                    {!mine && !grouped && msg.sender != null && (
                                        <span className="mb-1 ml-1 text-xs text-gray-500">
                                            {msg.sender_name}
                                        </span>
                                    )}

                                    <div
                                        className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${mine
                                            ? "rounded-br-md bg-gray-900 text-white"
                                            : "rounded-bl-md border border-gray-200 bg-white text-gray-900"
                                            }`}
                                    >
                                        {msg.content}
                                        <span className="ml-2 inline-block translate-y-0.5 text-[10px] text-gray-400">
                                            {timeFormat.format(new Date(msg.created_at))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {showJump && (
                    <button
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

            {/* composer */}
            <div className="flex items-end gap-2 border-t border-gray-200 bg-white p-3">
                <textarea
                    ref={inputRef}
                    rows={1}
                    value={draft}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={connected ? "Type a message…" : "Waiting for connection…"}
                    className="max-h-32 flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />

                <button
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