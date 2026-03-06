"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client/react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
    DISCOVERY_COURSES,
    ENROLL_BY_CODE,
    AI_RECOMMENDATIONS,
} from "@/lib/graphql/course";
import { SUGGEST_COURSES } from "@/lib/graphql/course";
import { GET_CATEGORIES } from "@/lib/graphql/category";
import Link from "next/link";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Search,
    BookOpen,
    Clock,
    Star,
    Lock,
    Unlock,
    KeyRound,
    Sparkles,
    Loader2,
    ArrowRight,
    Filter,
    GraduationCap,
    TrendingUp,
    Send,
    X,
    Bot,
} from "lucide-react";

/* ── Debounce hook ── */
function useDebounce(value: string, delay: number) {
    const [debounced, setDebounced] = useState(value);
    useMemo(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

/* ── Format duration ── */
function formatDuration(seconds: number) {
    if (seconds < 3600) return `${Math.round(seconds / 60)} phút`;
    return `${(seconds / 3600).toFixed(1)} giờ`;
}

/* ── Chat message type ── */
interface ChatMessage {
    role: "user" | "ai";
    content: string;
}

export default function ExplorePage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Categories query
    const { data: catData } = useQuery(GET_CATEGORIES, {
        fetchPolicy: "cache-first",
    });

    // Dynamic category list
    const categoriesList = useMemo(() => {
        const fetchedCats = (catData as any)?.categories?.map((c: any) => c.name) || [];
        return ["Tất cả", ...fetchedCats];
    }, [catData]);

    // Search & Filter state
    const [searchInput, setSearchInput] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Tất cả");
    const debouncedSearch = useDebounce(searchInput, 300);

    // Enroll code state
    const [enrollCode, setEnrollCode] = useState("");
    const [showCodeInput, setShowCodeInput] = useState(false);

    // AI Chatbox state
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            role: "ai",
            content:
                "Xin chào! 👋 Mình là trợ lý AI. Bạn muốn tìm khóa học gì? Hãy mô tả mục tiêu hoặc chủ đề bạn quan tâm nhé!",
        },
    ]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // AI suggest courses lazy query
    const [suggestCourses, { loading: suggesting }] =
        useLazyQuery(SUGGEST_COURSES, { fetchPolicy: "no-cache" });

    const handleChatSend = useCallback(async () => {
        const msg = chatInput.trim();
        if (!msg || suggesting) return;
        setChatInput("");
        setChatMessages((prev) => [...prev, { role: "user", content: msg }]);

        try {
            const { data: chatData } = await suggestCourses({
                variables: { query: msg },
            });
            const aiResponse =
                (chatData as any)?.suggestCourses || "Xin lỗi, mình chưa tìm được gợi ý phù hợp.";
            setChatMessages((prev) => [
                ...prev,
                { role: "ai", content: aiResponse },
            ]);
        } catch {
            setChatMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content: "Đã có lỗi xảy ra. Vui lòng thử lại sau nhé! 🙏",
                },
            ]);
        }
    }, [chatInput, suggesting, suggestCourses]);

    // Discovery courses query
    const { data, loading, refetch } = useQuery(DISCOVERY_COURSES, {
        variables: {
            search: debouncedSearch || undefined,
            category:
                selectedCategory === "Tất cả" ? undefined : selectedCategory,
        },
        fetchPolicy: "cache-and-network",
    });

    // Enroll by code mutation
    const [enrollByCodeMut, { loading: enrolling }] = useMutation(
        ENROLL_BY_CODE,
        {
            onCompleted: () => {
                toast.success("Đăng ký khóa học thành công!");
                setEnrollCode("");
                setShowCodeInput(false);
                queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
                refetch();
            },
            onError: (err) => {
                toast.error(err.message || "Mã không hợp lệ");
            },
        }
    );

    // AI recommendations query
    const { data: aiData } = useQuery(AI_RECOMMENDATIONS, {
        fetchPolicy: "cache-first",
    });

    const courses = (data as any)?.discoveryCourses || [];

    // Parse AI recommendations
    const aiRecs = useMemo(() => {
        if (!(aiData as any)?.aiRecommendations) return null;
        try {
            return JSON.parse((aiData as any).aiRecommendations);
        } catch {
            return null;
        }
    }, [aiData]);

    const handleEnrollByCode = useCallback(() => {
        if (!enrollCode.trim()) return;
        enrollByCodeMut({
            variables: { code: enrollCode.toUpperCase().trim() },
        });
    }, [enrollCode, enrollByCodeMut]);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* ═══ Header ═══ */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="h-7 w-7 text-indigo-600" />
                    Khám phá khóa học
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Tìm kiếm, duyệt và đăng ký các khóa học mới
                </p>
            </div>

            {/* ═══ Search + Enroll Code ═══ */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm khóa học..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                </div>
                <button
                    onClick={() => setShowCodeInput(!showCodeInput)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${showCodeInput
                        ? "bg-indigo-600 text-white"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                >
                    <KeyRound className="h-4 w-4" />
                    Nhập mã khóa học
                </button>
            </div>

            {/* ═══ Enroll Code Input (collapsible) ═══ */}
            {showCodeInput && (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-3">
                        <KeyRound className="h-5 w-5 text-indigo-600" />
                        <h3 className="text-sm font-semibold text-slate-900">
                            Nhập mã đăng ký khóa học
                        </h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                        Nhập mã mà giảng viên cung cấp (không phân biệt chữ hoa/thường)
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="VD: JS-2026-X8Y"
                            value={enrollCode}
                            onChange={(e) =>
                                setEnrollCode(e.target.value.toUpperCase())
                            }
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleEnrollByCode()
                            }
                            className="flex-1 px-4 py-2.5 rounded-xl border border-indigo-200 bg-white text-sm font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                        <button
                            onClick={handleEnrollByCode}
                            disabled={enrolling || !enrollCode.trim()}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {enrolling ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Unlock className="h-4 w-4" />
                            )}
                            Đăng ký
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ Category Filter ═══ */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
                {categoriesList.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* ═══ AI Recommendations ═══ */}
            {aiRecs && aiRecs.recommendations?.length > 0 && (
                <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <h3 className="text-sm font-semibold text-slate-900">
                            AI gợi ý cho bạn
                        </h3>
                    </div>
                    {aiRecs.motivation && (
                        <p className="text-sm text-purple-700 mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            {aiRecs.motivation}
                        </p>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {aiRecs.recommendations.map((rec: any) => (
                            <Link
                                key={rec.courseId}
                                href={`/courses/${rec.courseId}`}
                                className="group rounded-xl border border-purple-100 bg-white p-4 hover:shadow-md transition-all"
                            >
                                <h4 className="text-sm font-medium text-slate-900 group-hover:text-indigo-700 line-clamp-2">
                                    {rec.title}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    {rec.reason}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ Course Grid ═══ */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-20">
                    <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">
                        Không tìm thấy khóa học nào
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course: any) => {
                        const isPrivate = course.type === "PRIVATE";
                        const lessonCount =
                            course.sections?.flatMap(
                                (s: any) => s.lessons || []
                            ).length || 0;

                        return (
                            <Link
                                key={course.id}
                                href={`/courses/${course.id}`}
                                className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg transition-all"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video w-full bg-gradient-to-br from-indigo-100 via-violet-50 to-purple-100 flex items-center justify-center relative overflow-hidden">
                                    {course.thumbnail ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <BookOpen className="h-10 w-10 text-indigo-300" />
                                    )}
                                    {isPrivate && (
                                        <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-semibold backdrop-blur-sm">
                                            <Lock className="h-3 w-3" />
                                            Private
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col p-4">
                                    {course.category && (
                                        <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                                            {course.category}
                                        </span>
                                    )}
                                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                        {course.description}
                                    </p>

                                    <div className="mt-auto pt-3 flex items-center gap-3 text-xs text-slate-400">
                                        {!isPrivate && (
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="h-3 w-3" />
                                                {lessonCount} bài
                                            </span>
                                        )}
                                        {course.totalDuration > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDuration(
                                                    course.totalDuration
                                                )}
                                            </span>
                                        )}
                                        {course.averageRating > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Star className="h-3 w-3 text-amber-400" />
                                                {course.averageRating.toFixed(1)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        {isPrivate ? (
                                            <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                                                <KeyRound className="h-3 w-3" />
                                                Cần mã đăng ký
                                            </span>
                                        ) : course.price > 0 ? (
                                            <span className="text-sm font-bold text-indigo-600">
                                                {new Intl.NumberFormat("vi-VN").format(course.price)}₫
                                            </span>
                                        ) : (
                                            <span className="text-xs font-semibold text-emerald-600">
                                                Miễn phí
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-400">
                                            {course.instructor?.name || course.instructor?.email}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* ═══ AI Chatbox (Floating) ═══ */}
            {!chatOpen && (
                <button
                    onClick={() => setChatOpen(true)}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3.5 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                >
                    <Bot className="h-5 w-5" />
                    <span className="text-sm font-semibold">Hỏi AI</span>
                </button>
            )}

            {chatOpen && (
                <div
                    className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden"
                    style={{ height: "480px" }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            <div>
                                <h4 className="text-sm font-semibold">AI Trợ lý</h4>
                                <p className="text-[10px] text-indigo-200">
                                    Gợi ý khóa học phù hợp
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setChatOpen(false)}
                            className="rounded-lg p-1 hover:bg-white/20 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                        {chatMessages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-indigo-600 text-white rounded-br-md"
                                        : "bg-slate-100 text-slate-800 rounded-bl-md"
                                        }`}
                                >
                                    {msg.role === "ai" ? (
                                        <div className="prose prose-sm prose-slate max-w-none [&>p]:mb-1.5 [&>ul]:mt-1 [&>ol]:mt-1 [&>p:last-child]:mb-0 text-[13px]">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}
                        {suggesting && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-slate-100 px-3 py-2.5">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleChatSend()
                                }
                                placeholder="VD: Tôi muốn học React..."
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                            <button
                                onClick={handleChatSend}
                                disabled={!chatInput.trim() || suggesting}
                                className="rounded-xl bg-indigo-600 p-2.5 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
