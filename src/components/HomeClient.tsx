"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Send, Mic, ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import type { Category } from "@/lib/types";
import SupportChat from "@/components/SupportChat";


type Message = {
  role: "user" | "assistant";
  content: string;
  providers?: ProviderMatch[];
};

type ProviderMatch = {
  id: string;
  slug: string;
  fullName: string;
  categoryName: string;
  location: string;
  profilePhotoUrl: string;
  oneLine?: string;
  matchReason?: string;
};

export default function HomeClient({ categories }: { categories: Category[] }) {
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("home_chat_messages");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) setMessages(parsed);
      }
    } catch { }
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem("home_chat_messages", JSON.stringify(messages)); } catch { }
  }, [messages]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (chatMode) {
      document.body.setAttribute("data-chat", "true");
    } else {
      document.body.removeAttribute("data-chat");
    }
  }, [chatMode]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("home_chat_messages");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setMessages(parsed);
          setChatMode(true);
        }
      }
    } catch { }
  }, []);

  useEffect(() => {
    if (chatMode && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "I'm here to connect you with the right professional as fast as possible. What are you looking for, and what language do you prefer?",
      }]);
    }
  }, [chatMode]);

  useEffect(() => {
    try { sessionStorage.setItem("home_chat_messages", JSON.stringify(messages)); } catch { }
  }, [messages]);

  useEffect(() => {
    const el = document.querySelector(".messages-container");
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const enterChatMode = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setChatMode(true);
    setTimeout(() => inputRef.current?.focus(), 400);
  };

  const exitChatMode = () => {
    setChatMode(false);
    setInput("");
  };

  const newSearch = () => {
    setMessages([]);
    setInput("");
    try { sessionStorage.removeItem("home_chat_messages"); } catch { }
    setChatMode(false);
    setTimeout(() => setChatMode(true), 50);
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.message,
        providers: data.providers ?? [],
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice not supported in this browser.");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-CA";
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  return (
    <>
      <main className={`flex flex-col bg-[#f3f5f9] text-[#1f1f1f] overflow-x-hidden ${chatMode ? "overflow-hidden" : "min-h-screen"}`} style={chatMode ? { height: "100dvh" } : {}}>

        {/* HERO */}
        {!chatMode ? (
          <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 sm:px-6 pt-12 pb-8 text-center">
            <div className="scale-90 sm:scale-100">
              <Logo centered size="lg" />
            </div>
            <h1 className="mt-6 max-w-[95%] sm:max-w-3xl font-display text-2xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Find the right service in your area in seconds
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#6b7280] sm:text-base">
              Connect with trusted local professionals near you.
            </p>
            <div className="mt-8 w-full max-w-xl">
              <p className="text-xs text-[#2563eb] font-semibold mb-2 tracking-wide uppercase flex items-center justify-center gap-1">
                <span>✦</span> AI-powered matching
              </p>              
              <div
                onClick={enterChatMode}
                className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full border border-black/10 bg-white p-2 shadow-sm cursor-text"
              >
                <Search className="ml-3 text-[#9ca3af]" size={21} />
                <span className="h-12 flex-1 flex items-center text-base text-[#9ca3af]">
                  Search therapist, realtor, Persian lawyer...
                </span>
                <button className="rounded-full bg-[#2563eb] px-5 py-3 text-sm font-bold text-white hover:opacity-90 transition flex items-center gap-1.5">
                  <span className="text-xs">✦</span> Ask AI
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#4b5563] shadow-sm border border-black/5">
                <ShieldCheck size={18} className="text-[#22c55e]" />
                Verified providers
              </p>
            </div>
          </section>
        ) : (
          <section className="flex flex-col mx-auto w-full max-w-3xl px-4 sm:px-6 relative" style={{ height: "calc(100dvh - 57px)", minHeight: 0, overflow: "hidden" }}>
            <svg width="100%" height="100%" viewBox="0 0 390 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
                  <stop offset="25%" stopColor="#2563eb" stopOpacity="0.32" />
                  <stop offset="72%" stopColor="#2563eb" stopOpacity="0.26" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
                  <stop offset="38%" stopColor="#2563eb" stopOpacity="0.18" />
                  <stop offset="78%" stopColor="#2563eb" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.08" />
                  <stop offset="45%" stopColor="#2563eb" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="g4" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
                  <stop offset="55%" stopColor="#2563eb" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 48 0 C 58 150, 38 290, 62 600" fill="none" stroke="url(#g1)" strokeWidth="1.2" />
              <path d="M 138 0 C 122 180, 152 340, 130 600" fill="none" stroke="url(#g2)" strokeWidth="1" />
              <path d="M 242 0 C 258 160, 228 300, 250 600" fill="none" stroke="url(#g3)" strokeWidth="1.3" />
              <path d="M 338 0 C 320 200, 352 360, 334 600" fill="none" stroke="url(#g4)" strokeWidth="0.9" />
              <circle cx="60" cy="190" r="2.5" fill="#2563eb" opacity="0.22" />
              <circle cx="134" cy="310" r="2" fill="#2563eb" opacity="0.18" />
              <circle cx="246" cy="220" r="2.8" fill="#2563eb" opacity="0.16" />
              <circle cx="336" cy="370" r="2" fill="#2563eb" opacity="0.2" />
            </svg>
            {/* Chat header */}
            <div className="flex items-center gap-3 py-4 shrink-0" style={{ position: "relative", zIndex: 1 }}>
              <button onClick={exitChatMode} className="size-9 rounded-full bg-white border border-black/[0.06] flex items-center justify-center hover:bg-[#f0f2f7] transition shadow-sm shrink-0">
                <ArrowLeft size={16} />
              </button>
              <div className="flex-1">
                <p className="font-black text-[#0f1117] text-sm">ProFindly AI</p>
                <p className="text-xs text-[#9ca3af]">Finding the right professional for you</p>
              </div>
              <button
                onClick={newSearch}
                className="text-xs text-[#9ca3af] hover:text-[#2563eb] transition font-medium shrink-0"
              >
                New search
              </button>
            </div>

            {/* Messages */}
            <div className="messages-container flex-1 overflow-y-auto space-y-4 pb-4 pr-1 flex flex-col justify-end" style={{ position: "relative", zIndex: 1, minHeight: 0, overscrollBehavior: "contain" }}>      {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${msg.role === "user"
                  ? "bg-[#2563eb] text-white rounded-2xl rounded-tr-sm px-4 py-3"
                  : "bg-white text-[#0f1117] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-black/[0.04]"
                  }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  {msg.providers && msg.providers.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.providers.map((p) => (
                        <Link key={p.id} href={`/providers/${p.slug}`}
                          className="flex items-center gap-3 bg-[#f3f5f9] rounded-xl p-3 hover:bg-[#e8edf5] transition">
                          <div className="relative size-12 rounded-xl overflow-hidden shrink-0">
                            {p.profilePhotoUrl && <Image src={p.profilePhotoUrl} alt={p.fullName} fill className="object-cover" sizes="48px" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-[#0f1117] truncate">{p.fullName}</p>
                            <p className="text-xs text-[#6b7280] truncate">{p.categoryName} · {p.location}</p>
                            {p.matchReason && <p className="text-xs text-[#2563eb] mt-0.5 truncate">{p.matchReason}</p>}
                          </div>
                          <div className="shrink-0 text-[#9ca3af]">→</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-black/[0.04]">
                    <div className="flex gap-1 items-center h-5">
                      <span className="size-2 rounded-full bg-[#9ca3af] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="size-2 rounded-full bg-[#9ca3af] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="size-2 rounded-full bg-[#9ca3af] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 pb-3 pt-2 sm:mb-[20%]" style={{ position: "relative", zIndex: 1 }}>
              <div className="flex items-center gap-2 bg-white rounded-2xl border border-black/[0.06] p-2 shadow-sm">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={messages.some(m => m.providers && m.providers.length > 0) ? "Chat ended — providers suggested above" : "Type your message..."}
                  disabled={messages.some(m => m.providers && m.providers.length > 0)}
                  className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-[#0f1117] placeholder:text-[#9ca3af] disabled:opacity-50"
                />
                <button
                  onClick={startVoice}
                  disabled={messages.some(m => m.providers && m.providers.length > 0)}
                  className={`size-9 rounded-xl flex items-center justify-center transition ${listening ? "bg-red-500 text-white" : "bg-[#f3f5f9] text-[#6b7280] hover:bg-[#e8edf5]"} disabled:opacity-40`}
                >
                  <Mic size={16} />
                </button>
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading || messages.some(m => m.providers && m.providers.length > 0)}
                  className="size-9 rounded-xl bg-[#2563eb] flex items-center justify-center text-white hover:bg-blue-700 transition disabled:opacity-40"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </section>
        )}
        {/* CATEGORIES — hide in chat mode */}
        {!chatMode && (
          <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold sm:text-2xl">Explore Categories</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative flex min-h-[120px] items-center justify-center overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="absolute inset-0 bg-[#eff6ff] opacity-0 group-hover:opacity-100 transition duration-300" />
                  <div className="relative z-10 px-3 text-center">
                    <p className="text-2xl mb-1">{getCategoryEmoji(category.slug)}</p>
                    <p className="text-sm font-bold text-[#0f1117] group-hover:text-[#2563eb] transition">{category.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SupportChat userType="client" hiddenByParent={chatMode} />
    </>

  );
}

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    "immigration-consultant": "🛂",
    "realtor": "🏠",
    "mortgage-broker": "🏦",
    "lawyer": "⚖️",
    "accountant": "📊",
    "therapist": "🧠",
    "insurance-broker": "🛡️",
    "financial-advisor": "💰",
    "car-dealer": "🚗",
    "contractor": "🔨",
    "dentist": "🦷",
    "doctor": "👨‍⚕️",
    "photographer": "📸",
    "personal-trainer": "💪",
    "tutor": "📚",
    "cleaning-service": "🧹",
    "electrician": "⚡",
    "plumber": "🔧",
    "moving-company": "📦",
    "web-developer": "💻",
  };
  return map[slug] ?? "🔷";
}