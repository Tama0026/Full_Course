"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
    START_ASSESSMENT_ATTEMPT,
    GET_ASSESSMENT_DETAIL,
    SUBMIT_ASSESSMENT_ATTEMPT,
} from "@/lib/graphql/assessment";
import { useExamStore } from "@/stores/useExamStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock, AlertTriangle, CheckCircle2,
    ChevronRight, ChevronLeft, Info, ShieldAlert, Monitor, WifiOff,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

interface Question {
    id: string;
    prompt: string;
    options: string[];
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

export default function ExamAttemptPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const resolvedParams = use(params);
    const assessmentId = resolvedParams.id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [attempt, setAttempt] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSubmittingExam, setIsSubmittingExam] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isVoided, setIsVoided] = useState(false);
    const [voidReason, setVoidReason] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [showReconnectWarning, setShowReconnectWarning] = useState(false);
    const [maxViolations, setMaxViolations] = useState(5);

    const submitCalledRef = useRef(false);
    const socketRef = useRef<Socket | null>(null);
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Zustand
    const {
        answersByAttempt,
        currentIndex,
        setAnswer,
        setCurrentIndex,
        warnCount,
        setWarnCount,
        initAttempt,
        clearAttempt,
    } = useExamStore();

    // GraphQL
    const { data: assessmentData, loading: loadingInfo } = useQuery(GET_ASSESSMENT_DETAIL, {
        variables: { id: assessmentId },
        fetchPolicy: "network-only",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assessmentInfo = (assessmentData as any)?.assessment;

    const [startAttempt, { loading: starting }] = useMutation(START_ASSESSMENT_ATTEMPT, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onCompleted: (data: any) => {
            const att = data.startAssessmentAttempt;
            setAttempt(att);
            setQuestions(att.questions);
            initAttempt(att.id);

            if (assessmentInfo?.timeLimit) {
                const startedAt = new Date(att.startedAt).getTime();
                const now = Date.now();
                const durationSec = Math.floor((now - startedAt) / 1000);
                const totalSec = assessmentInfo.timeLimit * 60;
                setTimeLeft(Math.max(0, totalSec - durationSec));
            } else {
                setTimeLeft(3600);
            }

            if (assessmentInfo?.maxViolations) {
                setMaxViolations(assessmentInfo.maxViolations);
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => {
            toast.error(err.message || "Lỗi khi bắt đầu bài thi.");
            router.back();
        },
    });

    const [submitAttempt] = useMutation(SUBMIT_ASSESSMENT_ATTEMPT, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onCompleted: (data: any) => {
            const result = data.submitAssessmentAttempt;
            toast.success("Đã nộp bài thành công!");
            if (attempt) clearAttempt(attempt.id);
            sessionStorage.setItem(`exam-result-${result.id}`, JSON.stringify(result));
            // Disconnect socket
            socketRef.current?.disconnect();
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
            router.push(`/assessments/${assessmentId}/results/${result.id}`);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => {
            toast.error(err.message || "Lỗi khi nộp bài.");
            setIsSubmittingExam(false);
            submitCalledRef.current = false;
        },
    });

    // ============ SOCKET.IO CONNECTION ============
    useEffect(() => {
        if (!attempt) return;

        let cancelled = false;

        async function connectSocket() {
            try {
                // Fetch token from server-side API (cookie is HttpOnly)
                const res = await fetch("/api/auth/token");
                const json = await res.json();
                if (!json.token || cancelled) return;

                const socket = io(`${SOCKET_URL}/exam`, {
                    auth: { token: json.token },
                    transports: ["websocket", "polling"],
                    reconnection: true,
                    reconnectionAttempts: 10,
                    reconnectionDelay: 1000,
                });

                if (cancelled) {
                    socket.disconnect();
                    return;
                }

                socketRef.current = socket;

                socket.on("connect", () => {
                    setSocketConnected(true);
                    setShowReconnectWarning(false);
                    if (reconnectTimerRef.current) {
                        clearTimeout(reconnectTimerRef.current);
                        reconnectTimerRef.current = null;
                    }
                    socket.emit("join-exam", { attemptId: attempt.id });
                });

                socket.on("disconnect", () => {
                    setSocketConnected(false);
                    setShowReconnectWarning(true);
                    reconnectTimerRef.current = setTimeout(() => {
                        if (!socketRef.current?.connected) {
                            toast.error("Mất kết nối quá 30 giây. Vi phạm đã được ghi nhận.");
                        }
                    }, 30_000);
                });

                socket.on("exam-state", (data: { violationCount: number; maxViolations: number; status: string }) => {
                    setWarnCount(data.violationCount);
                    setMaxViolations(data.maxViolations);
                    if (data.status === "VOIDED") {
                        setIsVoided(true);
                        setVoidReason("Bài thi đã bị huỷ do vi phạm.");
                    }
                });

                socket.on("violation-ack", (data: { violationCount: number; remaining: number; maxViolations: number }) => {
                    setWarnCount(data.violationCount);
                    setMaxViolations(data.maxViolations);
                    toast.error(
                        `🚨 Vi phạm (${data.violationCount}/${data.maxViolations}). Còn ${data.remaining} lần trước khi bị huỷ bài.`,
                        { duration: 6000 }
                    );
                });

                socket.on("exam-voided", (data: { reason: string; violationCount: number }) => {
                    setIsVoided(true);
                    setVoidReason(data.reason);
                    setWarnCount(data.violationCount);
                });

                socket.on("auth-error", () => {
                    toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                    router.push("/login");
                });
            } catch (err) {
                console.error("Socket connection failed:", err);
            }
        }

        connectSocket();

        return () => {
            cancelled = true;
            socketRef.current?.disconnect();
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attempt?.id]);

    // Start attempt on mount
    useEffect(() => {
        if (assessmentId && assessmentInfo && !attempt && !starting) {
            startAttempt({ variables: { assessmentId } });
        }
    }, [assessmentId, assessmentInfo, attempt, starting, startAttempt]);

    // Timer logic
    useEffect(() => {
        if (timeLeft === null || isSubmittingExam || !attempt || isVoided) return;
        if (timeLeft <= 0) {
            handleFinalSubmit();
            return;
        }
        const timer = setInterval(() => setTimeLeft((prev) => (prev ? prev - 1 : 0)), 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, isSubmittingExam, attempt, isVoided]);

    // ============ SEND VIOLATION VIA WEBSOCKET (DEBOUNCED) ============
    const lastViolationRef = useRef<number>(0);

    const emitViolation = useCallback((type: string) => {
        if (!attempt || isSubmittingExam || isVoided) return;

        // Debounce: ignore violations within 2 seconds of each other
        const now = Date.now();
        if (now - lastViolationRef.current < 2000) {
            console.log(`[AntiCheat] Debounced: ${type} (within 2s of last violation)`);
            return;
        }
        lastViolationRef.current = now;

        console.log(`[AntiCheat] 🚨 Emitting violation: ${type}`);
        socketRef.current?.emit("violation", {
            attemptId: attempt.id,
            type,
        });
    }, [attempt, isSubmittingExam, isVoided]);

    // ============ ANTI-CHEAT EVENTS ============
    useEffect(() => {
        if (!attempt || isSubmittingExam || isVoided) return;

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            if (!document.fullscreenElement) {
                console.log("[AntiCheat] Fullscreen exited");
                emitViolation("FULLSCREEN_EXIT");
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.log("[AntiCheat] Tab hidden (visibilitychange)");
                emitViolation("TAB_SWITCH");
            }
        };

        // Removed: WINDOW_BLUR — it fires together with visibilitychange,
        // causing duplicate violations. TAB_SWITCH already covers this case.

        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                (e.ctrlKey && ["c", "v", "p", "a", "s", "u"].includes(e.key.toLowerCase())) ||
                (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) ||
                e.key === "F12" ||
                (e.altKey && e.key === "Tab") ||
                (e.metaKey)
            ) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        const handleDragStart = (e: DragEvent) => e.preventDefault();

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown, true);
        document.addEventListener("dragstart", handleDragStart);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown, true);
            document.removeEventListener("dragstart", handleDragStart);
        };
    }, [attempt, isSubmittingExam, isVoided, emitViolation]);

    // Auto-request fullscreen on mount
    useEffect(() => {
        if (attempt && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(() => {
                setIsFullscreen(false);
            });
        }
    }, [attempt]);

    // Derived state
    const attemptId = attempt?.id;
    const currentAnswers = attemptId ? answersByAttempt[attemptId] || {} : {};
    const currentQuestion = questions[currentIndex];
    const answeredCount = Object.keys(currentAnswers).length;
    const pendingCount = questions.length - answeredCount;

    const handleAnswerSelect = (index: number) => {
        if (!currentQuestion || !attemptId) return;
        setAnswer(attemptId, currentQuestion.id, index.toString());
    };

    const handleNext = () => currentIndex < questions.length - 1 && setCurrentIndex(currentIndex + 1);
    const handlePrev = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const enterFullscreen = () => {
        document.documentElement.requestFullscreen().then(() => {
            setIsFullscreen(true);
        }).catch(() => {
            toast.error("Trình duyệt không hỗ trợ chế độ toàn màn hình.");
        });
    };

    const handleFinalSubmit = () => {
        if (!attemptId || submitCalledRef.current) return;
        submitCalledRef.current = true;
        setIsSubmittingExam(true);
        setShowConfirmModal(false);

        const answersPayload = Object.entries(currentAnswers).map(([qId, ansStr]) => {
            const q = questions.find(q => q.id === qId);
            const answerIdx = parseInt(ansStr as string, 10);
            const answerText = q ? q.options[answerIdx] : "";
            return { questionId: qId, answer: answerText };
        });

        submitAttempt({
            variables: { attemptId, answers: answersPayload },
        });
    };

    // =============== VOIDED STATE ===============
    if (isVoided) {
        return (
            <div className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center">
                <div className="max-w-lg w-full mx-4 text-center">
                    <div className="bg-red-500/10 border-2 border-red-500/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                        <ShieldAlert className="w-12 h-12 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Bài thi đã bị huỷ</h1>
                    <p className="text-slate-400 mb-6 leading-relaxed">{voidReason}</p>
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 mb-8 text-red-400 font-medium text-sm">
                        Số lần vi phạm: {warnCount}/{maxViolations}
                    </div>
                    <button
                        onClick={() => {
                            socketRef.current?.disconnect();
                            if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
                            router.push("/exams");
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all"
                    >
                        Quay về danh sách
                    </button>
                </div>
            </div>
        );
    }

    // =============== LOADING STATE ===============
    if (loadingInfo || starting || !attempt) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <h2 className="text-xl font-medium text-slate-800">Đang chuẩn bị đề thi...</h2>
                    <p className="text-slate-500 mt-2 text-sm">Vui lòng không tắt trình duyệt.</p>
                </div>
            </div>
        );
    }

    // =============== SUBMITTING STATE ===============
    if (isSubmittingExam) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <div className="relative mb-6">
                    <div className="w-20 h-20 border-4 border-blue-200 rounded-full" />
                    <div className="absolute inset-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <CheckCircle2 className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Đang chấm điểm...</h2>
                <p className="text-slate-500 mt-2 max-w-sm text-center">
                    Hệ thống đang chấm điểm và phân tích bài làm. Vui lòng chờ.
                </p>
            </div>
        );
    }

    // =============== FULLSCREEN BLOCKER ===============
    if (!isFullscreen) {
        return (
            <div className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center">
                <div className="max-w-lg w-full mx-4 text-center">
                    <div className="bg-red-500/10 border-2 border-red-500/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                        <Monitor className="w-12 h-12 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Yêu cầu Toàn Màn Hình</h1>
                    <p className="text-slate-400 mb-3 leading-relaxed">
                        Bạn phải bật chế độ <strong className="text-white">Toàn Màn Hình</strong> để tiếp tục.
                        Thoát toàn màn hình sẽ bị ghi nhận vi phạm.
                    </p>
                    {warnCount > 0 && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 mb-6 inline-flex items-center gap-2 text-red-400 font-medium text-sm">
                            <ShieldAlert className="w-4 h-4" />
                            Vi phạm: {warnCount}/{maxViolations}
                        </div>
                    )}
                    <div className="mt-6">
                        <button
                            onClick={enterFullscreen}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-600/30"
                        >
                            Bật Toàn Màn Hình
                        </button>
                    </div>
                    <p className="text-slate-600 text-xs mt-6">
                        Thời gian còn lại: {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                    </p>
                </div>
            </div>
        );
    }

    // =============== MAIN EXAM UI ===============
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 relative select-none" style={{ userSelect: "none", WebkitUserSelect: "none" }}>

            {/* Reconnection warning */}
            {showReconnectWarning && !socketConnected && (
                <div className="bg-amber-600 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium z-50 animate-pulse">
                    <WifiOff className="w-4 h-4" />
                    Mất kết nối. Đang thử kết nối lại... (30 giây trước khi ghi nhận vi phạm)
                </div>
            )}

            {/* Violation banner */}
            {warnCount > 0 && (
                <div className="bg-red-600 text-white px-4 py-1.5 flex items-center justify-center gap-2 text-sm font-medium z-50">
                    <ShieldAlert className="w-4 h-4" />
                    Vi phạm: {warnCount}/{maxViolations}. Vượt ngưỡng sẽ bị huỷ bài thi ngay lập tức.
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 line-clamp-1">{assessmentInfo?.title}</h1>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                            Mã đề: <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{attempt.setCode}</span>
                            {!socketConnected && <span className="ml-2 text-red-500">● Offline</span>}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {warnCount > 0 && (
                            <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-full text-sm font-medium">
                                <AlertTriangle className="w-4 h-4" />
                                <span>{warnCount}/{maxViolations}</span>
                            </div>
                        )}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl font-bold ${(timeLeft || 0) < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                            <Clock className="w-5 h-5" />
                            {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                        </div>
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition shadow-sm"
                        >
                            Nộp Bài
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
                {/* Left: Question */}
                <div className="flex-1 flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion?.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex-1 flex flex-col"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-sm">
                                    Câu {currentIndex + 1} / {questions.length}
                                </span>
                                {currentQuestion && currentAnswers[currentQuestion.id] && (
                                    <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" /> Đã chọn
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl text-slate-800 font-medium mb-8 leading-relaxed">
                                {currentQuestion?.prompt}
                            </h2>
                            <div className="flex flex-col gap-3 mt-auto">
                                {currentQuestion?.options.map((option: string, idx: number) => {
                                    const isSelected = currentQuestion && currentAnswers[currentQuestion.id] === idx.toString();
                                    const labels = ["A", "B", "C", "D", "E", "F"];
                                    return (
                                        <button key={idx} onClick={() => handleAnswerSelect(idx)}
                                            className={`group flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200
                                                ${isSelected ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors
                                                ${isSelected ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700"}`}>
                                                {labels[idx]}
                                            </div>
                                            <span className={`flex-1 text-[15px] ${isSelected ? "text-blue-900 font-medium" : "text-slate-700"}`}>{option}</span>
                                            {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                    <div className="mt-6 flex items-center justify-between">
                        <button onClick={handlePrev} disabled={currentIndex === 0}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                            <ChevronLeft className="w-5 h-5" /> Câu trước
                        </button>
                        <button onClick={handleNext} disabled={currentIndex === questions.length - 1}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                            Câu tiếp <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Right: Question Grid */}
                <div className="w-full lg:w-80 flex flex-col self-start shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="text-slate-800 font-bold mb-4 flex items-center justify-between">
                            Danh sách câu hỏi
                            <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{answeredCount}/{questions.length}</span>
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((q, idx) => {
                                const isAnswered = !!currentAnswers[q.id];
                                const isCurrent = idx === currentIndex;
                                return (
                                    <button key={q.id} onClick={() => setCurrentIndex(idx)}
                                        className={`h-10 rounded-lg text-sm font-semibold transition-all flex items-center justify-center
                                            ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                                            ${isAnswered ? 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-200"></div> Đã trả lời
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <div className="w-3 h-3 rounded-sm bg-white border border-slate-200"></div> Chưa trả lời
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Submission Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
                            onClick={() => setShowConfirmModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-50">
                            <div className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-2">
                                <Info className="w-6 h-6 text-blue-500" /> Xác nhận nộp bài
                            </div>
                            <p className="text-slate-600 mb-6">Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?</p>
                            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-500 font-medium">Đã trả lời:</span>
                                    <span className="text-blue-600 font-bold">{answeredCount} / {questions.length}</span>
                                </div>
                                {pendingCount > 0 && (
                                    <div className="flex justify-between items-center text-amber-600">
                                        <span className="font-medium">Chưa trả lời:</span>
                                        <span className="font-bold">{pendingCount} câu</span>
                                    </div>
                                )}
                            </div>
                            {pendingCount > 0 && (
                                <div className="bg-amber-50 text-amber-800 text-sm px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
                                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p>Bạn vẫn còn {pendingCount} câu chưa trả lời. Các câu này sẽ bị tính sai.</p>
                                </div>
                            )}
                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
                                    Quay lại
                                </button>
                                <button onClick={handleFinalSubmit}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition">
                                    Nộp bài ngay
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
