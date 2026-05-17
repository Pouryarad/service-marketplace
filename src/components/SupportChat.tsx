"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Mic } from "lucide-react";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function SupportChat({
    userType = "client",
    userName,
    userEmail,
    hiddenByParent = false,
}: {
    userType?: "client" | "provider";
    userName?: string;
    userEmail?: string;
    hiddenByParent?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [dismissed, setDismissed] = useState(false);
const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        try {
            const saved = sessionStorage.getItem("support_chat_messages");
            if (saved) setMessages(JSON.parse(saved));
        } catch {}
    }, []);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        try {
            if (sessionStorage.getItem("support_chat_submitted") === "true") setSubmitted(true);
        } catch {}
    }, []);
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

   const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const saved = sessionStorage.getItem("support_chat_messages");
            const parsed = saved ? JSON.parse(saved) : [];
            if (parsed.length > 0) {
                setMessages(parsed);
            } else {
                sessionStorage.removeItem("support_chat_submitted");
                setSubmitted(false);
            }
        } catch {}
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (open && loaded && messages.length === 0) {
            setMessages([{
                role: "assistant",
                content: userName
                    ? `Hi ${userName}! What can I help you with today?`
                    : "Hi! I'm here to help. What's your name?",
            }]);
        }
    }, [open, loaded]);

    useEffect(() => {
        try { sessionStorage.setItem("support_chat_messages", JSON.stringify(messages)); } catch {}
    }, [messages]);

    useEffect(() => {
        try { sessionStorage.setItem("support_chat_submitted", String(submitted)); } catch {}
    }, [submitted]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 300);
    }, [open]);
    if (hiddenByParent) return null;

    const sendMessage = async () => {
        const content = input.trim();
        if (!content || loading) return;

        const newMessages: Message[] = [...messages, { role: "user", content }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/support/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages, userType, userName, userEmail }),
            });
            const data = await res.json();
            if (data.message) {
                setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
            }
            if (data.submitted) setSubmitted(true);
        } catch {
            setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Bubble button */}
            <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2">
                {!open && !dismissed && (
                    <div className="relative bg-white rounded-2xl shadow-lg border border-black/[0.06] px-4 py-2.5 text-sm font-medium text-[#0f1117] whitespace-nowrap animate-bounce">
                        💬 Need help? Ask me!
                        <button
                            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
                            className="absolute -top-2 -right-2 size-5 rounded-full bg-[#9ca3af] hover:bg-[#6b7280] flex items-center justify-center transition"
                            aria-label="Dismiss"
                        >
                            <X size={11} className="text-white" />
                        </button>
                    </div>
                )}
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="size-14 rounded-full bg-[#2563eb] shadow-lg flex items-center justify-center hover:bg-blue-700 transition"
                    aria-label="Support"
                >
                    {open ? (
                        <X size={22} className="text-white" />
                    ) : (
                        <span className="text-2xl">🤖</span>
                    )}
                </button>
            </div>

            {/* Chat window */}
            {open && (
                <div className="fixed bottom-36 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-black/[0.06] flex flex-col overflow-hidden" style={{ height: "460px" }}>
                    {/* Header */}
                    <div className="bg-[#2563eb] px-4 py-3 flex items-center gap-2 shrink-0">
                        <span className="size-8 rounded-full bg-white/20 flex items-center justify-center text-white font-black italic text-lg">i</span>
                        <div>
                            <p className="text-sm font-black text-white">ProFindly Support</p>
                            <p className="text-xs text-blue-200">We usually reply instantly</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.role === "user"
                                    ? "bg-[#2563eb] text-white rounded-tr-sm"
                                    : "bg-[#f3f5f9] text-[#0f1117] rounded-tl-sm"
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-[#f3f5f9] rounded-2xl rounded-tl-sm px-3 py-2">
                                    <div className="flex gap-1 items-center h-4">
                                        <span className="size-1.5 rounded-full bg-[#9ca3af] animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="size-1.5 rounded-full bg-[#9ca3af] animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="size-1.5 rounded-full bg-[#9ca3af] animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        {submitted && (
                            <div className="text-center py-2">
                                <p className="text-xs text-[#9ca3af]">✅ Your message has been sent. We'll get back to you shortly.</p>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    {!submitted && (
                        <div className="p-3 border-t border-black/[0.04] shrink-0">
                            <div className="flex items-center gap-2 bg-[#f3f5f9] rounded-xl px-3 py-2">
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent text-sm outline-none text-[#0f1117] placeholder:text-[#9ca3af]"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || loading}
                                    className="size-7 rounded-lg bg-[#2563eb] flex items-center justify-center text-white hover:bg-blue-700 transition disabled:opacity-40"
                                >
                                    <Send size={13} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}