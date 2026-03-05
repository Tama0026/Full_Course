"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ASSESSMENT_DETAIL, MY_ATTEMPT_HISTORY } from "@/lib/graphql/assessment";
import { useRouter } from "next/navigation";
import { use } from "react";
import { ClipboardList, Clock, ShieldAlert, BookOpen, AlertCircle, History, CheckCircle2, XCircle, Ban } from "lucide-react";
import { format } from "date-fns";

export default function AssessmentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const assessmentId = resolvedParams.id;
    const router = useRouter();

    const { data, loading, error } = useQuery(GET_ASSESSMENT_DETAIL, {
        variables: { id: assessmentId },
        fetchPolicy: "network-only",
    });

    const { data: historyData } = useQuery(MY_ATTEMPT_HISTORY, {
        variables: { assessmentId },
        fetchPolicy: "network-only",
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (error || !(data as any)?.assessment) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4">
                <AlertCircle className="w-16 h-16 text-slate-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy bài thi</h2>
                <p className="text-slate-500 mb-6">
                    Bài thi này không tồn tại hoặc bạn không có quyền truy cập.
                </p>
                <button
                    onClick={() => router.push("/exams")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ast = (data as any).assessment;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attempts: any[] = (historyData as any)?.myAttemptHistory || [];
    const maxAttempts = ast.maxAttempts || 1;
    const maxViolations = ast.maxViolations || 5;
    const attemptsUsed = attempts.length;
    const canStartExam = attemptsUsed < maxAttempts;

    const getStatusBadge = (attempt: { status: string; passed: boolean }) => {
        if (attempt.status === "VOIDED") return { label: "Vi phạm", color: "bg-red-100 text-red-700", icon: <Ban className="w-3 h-3" /> };
        if (attempt.passed) return { label: "Đạt", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="w-3 h-3" /> };
        return { label: "Không đạt", color: "bg-amber-100 text-amber-700", icon: <XCircle className="w-3 h-3" /> };
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                                <ClipboardList className="w-8 h-8 text-blue-100" />
                            </div>
                            <h1 className="text-3xl font-bold mb-4">{ast.title}</h1>
                            <p className="text-blue-100 leading-relaxed max-w-2xl">
                                {ast.description || "Bài đánh giá năng lực"}
                            </p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            Thông tin chi tiết
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-medium">Thời gian</span>
                                </div>
                                <div className="text-xl font-bold text-slate-900">{ast.timeLimit} phút</div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <ShieldAlert className="w-4 h-4" />
                                    <span className="text-sm font-medium">Điểm đạt</span>
                                </div>
                                <div className="text-xl font-bold text-slate-900">{ast.passingScore}%</div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <ClipboardList className="w-4 h-4" />
                                    <span className="text-sm font-medium">Số câu</span>
                                </div>
                                <div className="text-xl font-bold text-slate-900">{ast.questions?.length || 0}</div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <History className="w-4 h-4" />
                                    <span className="text-sm font-medium">Lượt thi</span>
                                </div>
                                <div className="text-xl font-bold text-slate-900">
                                    {attemptsUsed}/{maxAttempts}
                                </div>
                            </div>
                        </div>

                        {/* Warning box */}
                        <div className="bg-amber-50 rounded-2xl p-5 mb-8 border border-amber-100 flex gap-4">
                            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-amber-900 mb-1">Lưu ý quan trọng</h4>
                                <ul className="text-sm text-amber-800 space-y-2 list-disc pl-4">
                                    <li>Trình duyệt yêu cầu toàn màn hình (Fullscreen) để làm bài.</li>
                                    <li>Chuyển tab, ẩn trình duyệt hoặc sử dụng đa màn hình sẽ bị ghi nhận vi phạm.</li>
                                    <li>Bài thi sẽ tự động bị huỷ khi vượt <strong>{maxViolations} vi phạm</strong>.</li>
                                    <li>Bạn được phép thi tối đa <strong>{maxAttempts} lượt</strong> cho bài này.</li>
                                    <li>Sau khi hết giờ, hệ thống sẽ tự động thu bài.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Attempt History */}
                        {attempts.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <History className="w-5 h-5 text-blue-600" />
                                    Lịch sử làm bài
                                </h3>
                                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                    <div className="divide-y divide-slate-100">
                                        {attempts.map((at, idx) => {
                                            const badge = getStatusBadge(at);
                                            return (
                                                <div key={at.id} className="px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm font-medium text-slate-400 w-8">#{idx + 1}</span>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                                                                    {badge.icon} {badge.label}
                                                                </span>
                                                                {at.violationCount > 0 && (
                                                                    <span className="text-xs text-red-500 font-medium">
                                                                        {at.violationCount} vi phạm
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-400 mt-1">
                                                                {at.completedAt
                                                                    ? format(new Date(at.completedAt), "dd/MM/yyyy HH:mm")
                                                                    : "Đang làm bài"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-slate-800">
                                                            {at.score !== null ? `${at.score}%` : "--"}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => router.push("/exams")}
                                className="flex-1 py-3.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Trở về
                            </button>
                            {canStartExam ? (
                                <button
                                    onClick={() => router.push(`/assessments/${assessmentId}/attempt`)}
                                    className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                                >
                                    Bắt đầu làm bài {attemptsUsed > 0 && `(Lượt ${attemptsUsed + 1}/${maxAttempts})`}
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-slate-400 cursor-not-allowed"
                                >
                                    Đã hết lượt thi ({attemptsUsed}/{maxAttempts})
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
