"use client";

import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { use } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle2, XCircle, Clock, Award,
    ArrowLeft, Trophy, AlertTriangle, BarChart3,
} from "lucide-react";

const GET_ATTEMPT_RESULT = gql`
  query GetAssessmentDetail($id: String!) {
    assessment(id: $id) {
      id
      title
      passingScore
      timeLimit
    }
  }
`;

export default function ExamResultsPage({
    params,
}: {
    params: Promise<{ id: string; attemptId: string }>;
}) {
    const resolvedParams = use(params);
    const { id: assessmentId, attemptId } = resolvedParams;
    const router = useRouter();

    const { data, loading } = useQuery(GET_ATTEMPT_RESULT, {
        variables: { id: assessmentId },
        fetchPolicy: "network-only",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assessment = (data as any)?.assessment;

    // Try to recover submission result from Apollo cache
    // The SUBMIT mutation returns { id, score, passed, isInvalid, completedAt }
    // We can read it from sessionStorage as a fallback
    const cachedResultRaw = typeof window !== "undefined"
        ? sessionStorage.getItem(`exam-result-${attemptId}`)
        : null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cachedResult: any = cachedResultRaw ? JSON.parse(cachedResultRaw) : null;

    // We need to save the result when the submit mutation returns.
    // For now, show a generic "completed" state with assessment info.

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const score = cachedResult?.score;
    const passed = cachedResult?.passed;
    const isInvalid = cachedResult?.isInvalid;
    const passingScore = assessment?.passingScore || 50;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">

                    {/* Result Banner */}
                    <div className={`p-10 text-center relative overflow-hidden ${isInvalid
                            ? "bg-gradient-to-br from-red-600 to-red-800"
                            : passed !== undefined
                                ? passed
                                    ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                                    : "bg-gradient-to-br from-amber-500 to-orange-600"
                                : "bg-gradient-to-br from-blue-600 to-indigo-700"
                        }`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />

                        <div className="relative z-10">
                            {isInvalid ? (
                                <div className="w-20 h-20 bg-white/10 border-2 border-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                    <AlertTriangle className="w-10 h-10 text-red-200" />
                                </div>
                            ) : passed !== undefined ? (
                                passed ? (
                                    <div className="w-20 h-20 bg-white/10 border-2 border-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                        <Trophy className="w-10 h-10 text-yellow-300" />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 bg-white/10 border-2 border-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                        <XCircle className="w-10 h-10 text-white/80" />
                                    </div>
                                )
                            ) : (
                                <div className="w-20 h-20 bg-white/10 border-2 border-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                    <Award className="w-10 h-10 text-blue-200" />
                                </div>
                            )}

                            <h1 className="text-3xl font-bold text-white mb-2">
                                {isInvalid
                                    ? "Bài thi không hợp lệ"
                                    : passed !== undefined
                                        ? passed ? "Chúc mừng! Bạn đã đạt!" : "Chưa đạt điểm yêu cầu"
                                        : "Bài thi đã hoàn thành"
                                }
                            </h1>

                            <p className="text-white/80 text-lg">
                                {assessment?.title || "Bài đánh giá"}
                            </p>

                            {score !== undefined && (
                                <div className="mt-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-4">
                                    <BarChart3 className="w-6 h-6 text-white/80" />
                                    <span className="text-5xl font-black text-white">{Math.round(score)}%</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-8">
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                                <div className="flex items-center justify-center gap-1.5 text-slate-500 text-sm font-medium mb-1">
                                    <CheckCircle2 className="w-4 h-4" /> Điểm đạt
                                </div>
                                <div className="text-2xl font-bold text-slate-800">{passingScore}%</div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                                <div className="flex items-center justify-center gap-1.5 text-slate-500 text-sm font-medium mb-1">
                                    <Clock className="w-4 h-4" /> Thời gian
                                </div>
                                <div className="text-2xl font-bold text-slate-800">{assessment?.timeLimit || "--"} phút</div>
                            </div>
                        </div>

                        {isInvalid && (
                            <div className="bg-red-50 text-red-800 rounded-2xl p-5 mb-8 border border-red-100 flex gap-4">
                                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold mb-1">Bài thi bị đánh dấu vi phạm</h4>
                                    <p className="text-sm">Bài thi của bạn đã bị phát hiện có dấu hiệu gian lận (chuyển tab, thoát fullscreen quá nhiều lần). Kết quả có thể không được công nhận.</p>
                                </div>
                            </div>
                        )}

                        {score === undefined && (
                            <div className="bg-blue-50 text-blue-800 rounded-2xl p-5 mb-8 border border-blue-100 flex gap-4">
                                <Award className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold mb-1">Bài làm đã được ghi nhận</h4>
                                    <p className="text-sm">Kết quả chi tiết sẽ được hiển thị sau khi hệ thống hoàn tất chấm điểm và phân tích.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => router.push("/exams")}
                                className="flex-1 py-3.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Về danh sách
                            </button>
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                            >
                                Về Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
