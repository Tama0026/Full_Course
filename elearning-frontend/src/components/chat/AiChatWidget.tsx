"use client";

import { useState, useRef, useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import { MessageSquare, X, Send, Sparkles, Bot, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { SUGGEST_COURSES } from "@/lib/graphql/course";

interface Message {
    role: "user" | "ai";
    content: string;
    isError?: boolean;
}

const SUGGESTIONS = [
    "Tôi muốn học lập trình web",
    "Có khóa học React không?",
    "Khóa học Python cho người mới",
    "Học thiết kế UI/UX ở đâu?",
];

export default function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "ai", content: "Chào bạn! 👋 Tôi là trợ lý AI của nền tảng. Hãy hỏi tôi về bất kỳ khóa học nào bạn muốn tìm hiểu!" }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const apolloClient = useApolloClient();

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
    }, [isOpen]);

    async function handleSend(text?: string) {
        const msg = (text ?? query).trim();
        if (!msg || loading) return;

        // [Log #1] Trước khi gửi
        const nonce = Date.now();
        console.log(`[ChatWidget] Sending — query: "${msg}", nonce: ${nonce}`);

        const userMsg: Message = { role: "user", content: msg };
        setMessages((prev) => [...prev, userMsg]);
        setQuery("");
        setLoading(true);

        try {
            const result = await apolloClient.query<{ suggestCourses: string }>({
                query: SUGGEST_COURSES,
                variables: { query: msg },
                fetchPolicy: "no-cache",  // bypass cache mỗi lần
            });

            // [Log #2] Nhận response
            const content = result.data?.suggestCourses;
            console.log(`[ChatWidget] Response received — ${content?.length ?? 0} chars`);

            setMessages((prev) => [...prev, {
                role: "ai",
                content: content || "Xin lỗi, hiện tại tôi không thể tìm thấy khóa học phù hợp."
            }]);
        } catch (err: any) {
            // [Log #3] Lỗi
            console.error("[ChatWidget] AI query failed:", err?.message || err);

            const errMsg = err?.message || "";
            const isRateLimit = errMsg.includes("RATE_LIMIT") || errMsg.includes("429");
            setMessages((prev) => [...prev, {
                role: "ai",
                content: isRateLimit
                    ? "⚠️ AI đang bị giới hạn tần suất. Vui lòng chờ vài giây rồi thử lại."
                    : "❌ Có lỗi xảy ra khi gọi AI. Vui lòng thử lại sau.",
                isError: true,
            }]);
        } finally {
            setLoading(false);
        }
    }

    function handleReset() {
        setMessages([{ role: "ai", content: "Chào bạn! 👋 Tôi là trợ lý AI của nền tảng. Hãy hỏi tôi về bất kỳ khóa học nào bạn muốn tìm hiểu!" }]);
        setQuery("");
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Box */}
            <div className={cn(
                "mb-4 flex w-[340px] sm:w-[400px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 transition-all duration-300 transform origin-bottom-right",
                isOpen ? "scale-100 opacity-100 max-h-[600px]" : "scale-50 opacity-0 pointer-events-none max-h-0"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-primary-700 to-primary-500 px-4 py-3 text-white shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Bot className="h-5 w-5" />
                            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400 ring-1 ring-primary-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm leading-none">Trợ lý học tập AI</p>
                            <p className="text-xs text-primary-200 mt-0.5">Tìm kiếm khóa học thông minh</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleReset}
                            title="Làm mới hội thoại"
                            className="rounded-md p-1.5 hover:bg-white/20 transition"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setIsOpen(false)} className="rounded-md p-1.5 hover:bg-white/20 transition">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 bg-slate-50 min-h-0 max-h-[350px] scroll-smooth">
                    {messages.map((m, i) => (
                        <div key={i} className={cn("flex max-w-[88%]", m.role === "user" ? "self-end" : "self-start")}>
                            {m.role === "ai" && (
                                <div className="mr-2 mt-1 shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
                                    <Bot className="h-3.5 w-3.5 text-primary-600" />
                                </div>
                            )}
                            <div className={cn(
                                "rounded-2xl px-3.5 py-2.5 text-sm shadow-sm",
                                m.role === "user"
                                    ? "bg-primary-600 text-white rounded-tr-none"
                                    : m.isError
                                        ? "bg-red-50 border border-red-200 text-red-700 rounded-tl-none"
                                        : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                            )}>
                                {m.role === "ai" ? (
                                    <div className="prose prose-sm max-w-none prose-p:my-0.5 prose-a:text-primary-600 prose-headings:font-semibold">
                                        <ReactMarkdown>{m.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <span className="whitespace-pre-wrap">{m.content}</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {loading && (
                        <div className="self-start flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                                <Bot className="h-3.5 w-3.5 text-primary-600" />
                            </div>
                            <div className="rounded-2xl rounded-tl-none bg-white border border-slate-200 px-4 py-3 shadow-sm flex gap-1 items-center">
                                <span className="h-2 w-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="h-2 w-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="h-2 w-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestion chips — chỉ hiển thị khi mới bắt đầu */}
                {messages.length <= 1 && !loading && (
                    <div className="px-4 pb-2 flex flex-wrap gap-1.5 bg-slate-50 shrink-0">
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => handleSend(s)}
                                className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <div className="border-t border-slate-200 bg-white p-3 shrink-0">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex items-center gap-2"
                    >
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={loading}
                            placeholder="Hỏi về khóa học..."
                            className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition hover:bg-primary-700 disabled:opacity-40"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 shadow-xl shadow-primary-500/30 transition-all hover:scale-110 hover:bg-primary-700 focus:outline-none"
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : (
                    <>
                        <MessageSquare className="h-6 w-6 text-white" />
                        <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
                        {/* notification dot */}
                        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
                    </>
                )}
            </button>
        </div>
    );
}
