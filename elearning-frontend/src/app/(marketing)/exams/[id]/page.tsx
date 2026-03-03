"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ASSESSMENT_DETAIL, START_ASSESSMENT_ATTEMPT, SUBMIT_ASSESSMENT_ATTEMPT } from "@/lib/graphql/assessment";
import { Loader2, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { useParams } from "next/navigation";

export default function TakeAssessmentPage() {
    const params = useParams();
    const assessmentId = params.id as string;

    // UI states
    const [viewState, setViewState] = useState<"intro" | "taking" | "result">("intro");
    const [showWarningModal, setShowWarningModal] = useState(false);

    // Exam states
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [startedAt, setStartedAt] = useState<Date | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<any>(null);

    const { data: detailData, loading: detailLoading } = useQuery(GET_ASSESSMENT_DETAIL, {
        variables: { id: assessmentId }
    });

    const [startAttempt, { loading: starting }] = useMutation(START_ASSESSMENT_ATTEMPT, {
        onCompleted: (data: any) => {
            setAttemptId(data.startAssessmentAttempt.id);
            setStartedAt(new Date(parseInt(data.startAssessmentAttempt.startedAt)));
            setViewState("taking");
            setShowWarningModal(false);
        },
        onError: (err: any) => {
            toast.error("Không thể bắt đầu kỳ thi: " + err.message);
            setShowWarningModal(false);
        }
    });

    const [submitAttempt, { loading: submitting }] = useMutation(SUBMIT_ASSESSMENT_ATTEMPT, {
        onCompleted: (data: any) => {
            setResult(data.submitAssessmentAttempt);
            setViewState("result");
            toast.success("Đã nộp bài thành công!");
        },
        onError: (err: any) => toast.error("Lỗi khi nộp bài: " + err.message)
    });

    const assessment = (detailData as any)?.assessment;

    // Timer Logic synced with Server startedAt
    useEffect(() => {
        if (viewState !== "taking" || !startedAt || !assessment) return;

        const interval = setInterval(() => {
            const now = new Date();
            const elapsed = (now.getTime() - startedAt.getTime()) / 1000;
            const remaining = (assessment.timeLimit * 60) - elapsed;

            setTimeLeft(Math.max(0, Math.floor(remaining)));

            if (remaining <= 0) {
                clearInterval(interval);
                handleAutoSubmit();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [viewState, startedAt, assessment]);

    const handleAutoSubmit = () => {
        toast.error("Hết giờ! Hệ thống đang tự động nộp bài.");
        forceSubmit();
    };

    const forceSubmit = () => {
        const formattedAnswers = Object.keys(answers).map(qId => ({
            questionId: qId,
            answer: answers[qId]
        }));
        submitAttempt({ variables: { attemptId, answers: formattedAnswers } });
    };

    const handleSelectAnswer = (qId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    if (detailLoading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (!assessment) return <div className="py-20 text-center">Không tìm thấy thông tin kỳ thi.</div>;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const isLowTime = timeLeft !== null && timeLeft <= 60; // Less than 1 min

    return (
        <div className="bg-slate-50 min-h-screen py-10 px-4">
            <div className="max-w-3xl mx-auto">

                {/* 1. INTRO VIEW */}
                {viewState === "intro" && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                        <div className="mb-6">
                            <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Kỳ Thi Độc Lập</span>
                            <h1 className="text-3xl font-bold text-slate-900 mt-4">{assessment.title}</h1>
                            <p className="text-slate-600 mt-2">{assessment.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-sm font-medium text-slate-500">Thời gian</p>
                                <p className="text-xl font-bold text-slate-900 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" /> {assessment.timeLimit} Phút</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-sm font-medium text-slate-500">Điều kiện qua</p>
                                <p className="text-xl font-bold text-slate-900 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" /> {assessment.passingScore}%</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowWarningModal(true)}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors"
                        >
                            Bắt Đầu Làm Bài
                        </button>
                    </div>
                )}

                {/* START WARNING MODAL */}
                <AnimatePresence>
                    {showWarningModal && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                                className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                            >
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Chuẩn bị thi</h3>
                                <p className="text-slate-600 text-sm mb-6">
                                    Thời gian bắt đầu được tính bằng máy chủ để đảm bảo tính công bằng. Bài thi sẽ tự động nộp khi hết giờ.
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowWarningModal(false)} className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200">
                                        Hủy
                                    </button>
                                    <button
                                        onClick={() => startAttempt({ variables: { assessmentId } })}
                                        disabled={starting}
                                        className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 flex justify-center items-center"
                                    >
                                        {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Đồng Ý"}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. TAKING VIEW */}
                {viewState === "taking" && (
                    <div className="space-y-6">
                        {/* Sticky Header with Timer */}
                        <div className={`sticky top-4 z-40 rounded-2xl p-4 flex items-center justify-between shadow-lg transition-colors ${isLowTime ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
                            <div className="font-medium truncate max-w-[200px] sm:max-w-xs">{assessment.title}</div>
                            <div className="flex gap-4 items-center">
                                <span className="text-sm opacity-80">Còn lại</span>
                                <div className={`text-2xl font-mono font-bold tracking-wider ${isLowTime ? 'animate-pulse' : ''}`}>
                                    {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                                </div>
                                <button
                                    onClick={forceSubmit}
                                    disabled={submitting}
                                    className="ml-4 px-4 py-2 bg-white text-slate-900 font-bold rounded-lg text-sm hover:bg-slate-100"
                                >
                                    Nộp Bài
                                </button>
                            </div>
                        </div>

                        {/* Questions List */}
                        <div className="space-y-6">
                            {(assessment.questions || []).map((q: any, idx: number) => (
                                <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="text-lg font-medium text-slate-900 mb-4">
                                        <span className="font-bold mr-2 text-blue-600">Câu {idx + 1}:</span>
                                        {q.prompt}
                                    </h3>
                                    <div className="space-y-3">
                                        {q.options.map((opt: string, oIdx: number) => {
                                            const isSelected = answers[q.id] === opt;
                                            return (
                                                <button
                                                    key={oIdx}
                                                    onClick={() => handleSelectAnswer(q.id, opt)}
                                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected
                                                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                                                        : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-700'
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. RESULT VIEW */}
                {viewState === "result" && result && (
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-lg">
                        {result.isInvalid ? (
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Bài Thi Không Hợp Lệ</h2>
                                <p className="text-slate-500 mt-2">Dữ liệu ghi nhận sai thời gian quy định hoặc có dấu hiệu gian lận.</p>
                            </div>
                        ) : result.passed ? (
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Chúc Mừng! Bạn Đã Vượt Qua</h2>
                                <p className="text-slate-500 mt-2">Bạn đáp ứng đủ điều kiện với số điểm xuất sắc.</p>
                            </div>
                        ) : (
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Chưa Đạt Yêu Cầu</h2>
                                <p className="text-slate-500 mt-2">Bạn cần ôn tập thêm để có thể qua bài thi này.</p>
                            </div>
                        )}

                        <div className="bg-slate-50 p-6 rounded-xl inline-block min-w-[250px] mb-8">
                            <p className="text-sm font-medium text-slate-500 uppercase">Điểm Của Bạn</p>
                            <p className={`text-5xl font-black mt-2 ${result.isInvalid ? 'text-red-500' : result.passed ? 'text-green-500' : 'text-slate-700'}`}>
                                {result.score?.toFixed(1) || 0} %
                            </p>
                        </div>

                        <div>
                            <Link href="/assessments" className="inline-block px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">
                                Quay Lại Danh Sách
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
