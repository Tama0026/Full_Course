"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Bot, X, Send, Loader2, Sparkles, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const ASK_TUTOR = gql`
  mutation AskTutor($question: String!, $lessonId: String!) {
    askTutor(question: $question, lessonId: $lessonId)
  }
`;

type Message = {
    role: "user" | "ai";
    text: string;
};

interface AiTutorWidgetProps {
    lessonId: string;
    lessonTitle?: string;
    /** When true, renders as inline collapsible panel instead of floating bubble */
    inline?: boolean;
}

export default function AiTutorWidget({ lessonId, lessonTitle, inline = false }: AiTutorWidgetProps) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            text: `Xin chào! Tôi là AI Tutor của bạn 👋\n\nTôi đang học cùng bài **"${lessonTitle || "này"}"**. Hãy hỏi tôi bất cứ điều gì về bài học nhé!`,
        },
    ]);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const [askTutor, { loading }] = useMutation<any>(ASK_TUTOR);

    useEffect(() => {
        if (open) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            inputRef.current?.focus();
        }
    }, [open, messages]);

    async function handleSend() {
        const question = input.trim();
        if (!question || loading) return;

        setInput("");
        setMessages((prev) => [...prev, { role: "user", text: question }]);

        try {
            const { data } = await askTutor({ variables: { question, lessonId } });
            const answer = data?.askTutor || "Xin lỗi, tôi gặp sự cố. Vui lòng thử lại.";
            setMessages((prev) => [...prev, { role: "ai", text: answer }]);
        } catch (err: any) {
            const errMsg = err?.message || "";
            const reply = errMsg.includes("RATE_LIMIT")
                ? "⏳ AI đang bận, vui lòng thử lại sau vài giây."
                : "❌ Có lỗi xảy ra. Vui lòng thử lại.";
            setMessages((prev) => [...prev, { role: "ai", text: reply }]);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    /* ── Chat Body (shared between modes) ── */
    const chatBody = (
        <>
            {/* Messages */}
            <div className={cn(
                "flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50",
                inline ? "max-h-[380px]" : ""
            )}>
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                        {msg.role === "ai" && (
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mt-1">
                                <Bot className="w-3.5 h-3.5 text-white" />
                            </div>
                        )}
                        <div
                            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                                ? "bg-indigo-600 text-white rounded-tr-sm whitespace-pre-wrap"
                                : "bg-white text-slate-800 rounded-tl-sm shadow-sm border border-slate-100 prose prose-sm prose-slate max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0"
                                }`}
                        >
                            {msg.role === "ai" ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.text}
                                </ReactMarkdown>
                            ) : (
                                msg.text
                            )}
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                    <div className="flex gap-2">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mt-1">
                            <Bot className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 bg-white flex gap-2 items-end">
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Hỏi về bài học hiện tại..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 max-h-24 overflow-y-auto"
                    style={{ scrollbarWidth: "none" }}
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
            </div>
        </>
    );

    /* ═══════════════════════════════════════════════
       INLINE MODE — Collapsible panel embedded in page
       ═══════════════════════════════════════════════ */
    if (inline) {
        return (
            <div className="rounded-2xl border border-indigo-200 bg-white overflow-hidden shadow-sm">
                {/* Toggle header */}
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="flex items-center gap-3 w-full px-5 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white transition-all hover:from-violet-700 hover:to-indigo-700"
                >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-bold">AI Tutor</p>
                        <p className="text-[11px] text-violet-200 truncate">
                            Hỏi đáp trực tiếp về bài học
                        </p>
                    </div>
                    {open ? (
                        <ChevronUp className="w-5 h-5 text-white/70" />
                    ) : (
                        <MessageCircle className="w-5 h-5 text-white/70" />
                    )}
                </button>

                {/* Collapsible body */}
                {open && (
                    <div className="flex flex-col">
                        {chatBody}
                    </div>
                )}
            </div>
        );
    }

    /* ═══════════════════════════════════════════════
       FLOATING MODE — Bottom-right bubble (default)
       ═══════════════════════════════════════════════ */
    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Mở AI Tutor"
                className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-2xl transition-all duration-300 ${open
                    ? "bg-slate-700 hover:bg-slate-800"
                    : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 hover:scale-105"
                    }`}
            >
                {open ? (
                    <><ChevronDown className="h-4 w-4" /> Đóng Tutor</>
                ) : (
                    <><Sparkles className="h-4 w-4" /> AI Tutor</>
                )}
            </button>

            {/* Chat panel */}
            <div
                className={`fixed bottom-20 right-6 z-50 flex flex-col w-[360px] max-h-[520px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden transition-all duration-300 ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">AI Tutor</p>
                        <p className="text-[11px] text-violet-200 truncate">
                            {lessonTitle ? `Bài: ${lessonTitle}` : "Hỏi về nội dung bài học"}
                        </p>
                    </div>
                    <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors p-1">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {chatBody}
            </div>
        </>
    );
}
