"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
    Lock,
    Send,
    Loader2,
    MessageSquare,
    GraduationCap,
    Bot,
    User,
    Sparkles,
    ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { GET_MY_CERTIFICATES } from "@/lib/graphql/learning";
import { CHAT_INTERVIEW, IS_INTERVIEW_UNLOCKED } from "@/lib/graphql/gamification";

/* ── Framer Motion Variants ── */
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const messageAnim: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

/* ────────────────────────────────────────────────────────
   AI Interview Page
   ──────────────────────────────────────────────────────── */

export default function InterviewPage() {
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [selectedCourseName, setSelectedCourseName] = useState<string>("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);

    const { data: certData, loading: certLoading } = useQuery<any>(GET_MY_CERTIFICATES, {
        fetchPolicy: "network-only",
    });

    const [chatInterview, { loading: chatLoading }] = useMutation<{
        chatInterview: { reply: string; courseId: string; courseName: string };
    }>(CHAT_INTERVIEW);

    const certificates = certData?.myCertificates || [];

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSelectCourse = (courseId: string, courseName: string) => {
        setSelectedCourseId(courseId);
        setSelectedCourseName(courseName);
        setMessages([]);
    };

    const handleSend = async () => {
        if (!input.trim() || !selectedCourseId || chatLoading) return;

        const userMsg = input.trim();
        setInput("");
        const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMsg }];
        setMessages(newMessages);

        try {
            const { data } = await chatInterview({
                variables: {
                    courseId: selectedCourseId,
                    message: userMsg,
                    history: newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
                },
            });

            const reply = data?.chatInterview?.reply || "Xin lỗi, đã có lỗi xảy ra.";
            setMessages(prev => [...prev, { role: "assistant", content: reply }]);
        } catch (err: any) {
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: `❌ Lỗi: ${err.message}` },
            ]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ── Loading State ──
    if (certLoading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    // ── No Certificates — Locked State ──
    if (certificates.length === 0) {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="flex flex-col items-center justify-center h-[70vh] text-center px-4"
            >
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-full blur-2xl scale-150" />
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 shadow-lg">
                        <Lock className="h-12 w-12 text-slate-400" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-3">
                    🔒 Phỏng vấn AI chưa mở khóa
                </h1>
                <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
                    Bạn cần hoàn thành ít nhất một khóa học và nhận chứng chỉ trước khi tham gia phỏng vấn thử với AI.
                </p>
                <Link
                    href="/student"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                    <GraduationCap className="h-5 w-5" />
                    Quay lại học tập
                </Link>
            </motion.div>
        );
    }

    // ── Course Selection ──
    if (!selectedCourseId) {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="max-w-3xl mx-auto"
            >
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
                            <Bot className="h-5 w-5" />
                        </div>
                        AI Interview Room
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Chọn khóa học bạn đã hoàn thành để bắt đầu phỏng vấn thử.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {certificates.map((cert: any) => (
                        <motion.button
                            key={cert.id}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectCourse(cert.courseId, cert.courseNameAtIssue || "Khóa học")}
                            className="group flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:shadow-lg hover:border-indigo-200"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                    <span className="text-xs font-medium text-amber-600">Đã hoàn thành</span>
                                </div>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2">
                                {cert.courseNameAtIssue || "Khóa học"}
                            </h3>
                            <p className="mt-1 text-xs text-slate-400">
                                Chứng chỉ: {cert.certificateCode}
                            </p>
                            <div className="mt-auto pt-4 w-full">
                                <span className="flex items-center justify-center gap-2 rounded-xl bg-indigo-50 py-2.5 text-sm font-medium text-indigo-700 group-hover:bg-indigo-100 transition-colors">
                                    <MessageSquare className="h-4 w-4" />
                                    Bắt đầu phỏng vấn
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        );
    }

    // ── Chat Interface ──
    return (
        <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 pb-4 mb-4 border-b border-slate-200"
            >
                <button
                    onClick={() => { setSelectedCourseId(null); setMessages([]); }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 text-slate-600" />
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
                    <Bot className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-900">AI Tech Interviewer</h2>
                    <p className="text-xs text-slate-500">{selectedCourseName}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-200">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-700">Online</span>
                </div>
            </motion.div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                {messages.length === 0 && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        className="flex flex-col items-center justify-center h-full text-center"
                    >
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 mb-4">
                            <MessageSquare className="h-8 w-8 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">
                            Bắt đầu phỏng vấn!
                        </h3>
                        <p className="text-sm text-slate-400 max-w-sm">
                            Gửi lời chào để AI nhà tuyển dụng bắt đầu phỏng vấn bạn về kiến thức khóa học &quot;{selectedCourseName}&quot;.
                        </p>
                    </motion.div>
                )}

                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            variants={messageAnim}
                            initial="hidden"
                            animate="visible"
                            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            {/* Avatar */}
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm ${msg.role === "user"
                                ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white"
                                : "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                                }`}>
                                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.role === "user"
                                ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-tr-sm"
                                : "bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200"
                                }`}>
                                <div className={`text-sm leading-relaxed prose prose-sm max-w-none ${msg.role === "user" ? "prose-invert" : ""}`}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {chatLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="rounded-2xl rounded-tl-sm bg-slate-100 border border-slate-200 px-4 py-3">
                            <div className="flex gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập câu trả lời của bạn..."
                            rows={1}
                            className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            style={{ minHeight: "48px", maxHeight: "120px" }}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || chatLoading}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                    >
                        {chatLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </button>
                </div>
                <p className="mt-2 text-center text-xs text-slate-400">
                    AI phỏng vấn dựa trên nội dung khóa học. Nhấn Enter để gửi.
                </p>
            </div>
        </div>
    );
}
