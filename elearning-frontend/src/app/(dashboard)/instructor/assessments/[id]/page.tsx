"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ASSESSMENT_DETAIL, CREATE_ASSESSMENT_QUESTION, DELETE_ASSESSMENT_QUESTION, ASSESSMENT_REPORT, PUBLISH_ASSESSMENT, UNPUBLISH_ASSESSMENT, AUTO_BALANCE_POINTS, GENERATE_AI_EXAM_QUESTIONS, UPDATE_QUESTION_INLINE } from "@/lib/graphql/assessment";
import { GET_MY_QUESTION_BANKS } from "@/lib/graphql/question-bank";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Plus, Trash2, CheckCircle2, Copy, Users, BarChart3, ShieldAlert, Ban, XCircle, Sparkles, Scale, Lock, Unlock, Key } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

type TabType = "questions" | "results";

export default function AssessmentEditorPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [activeTab, setActiveTab] = useState<TabType>("questions");

    const { data, loading, refetch } = useQuery(GET_ASSESSMENT_DETAIL, {
        variables: { id },
        fetchPolicy: "network-only"
    });

    const { data: reportData, loading: reportLoading } = useQuery(ASSESSMENT_REPORT, {
        variables: { assessmentId: id },
        fetchPolicy: "network-only",
        skip: activeTab !== "results",
    });

    const [createQuestion] = useMutation(CREATE_ASSESSMENT_QUESTION, { onCompleted: () => refetch() });
    const [deleteQuestion] = useMutation(DELETE_ASSESSMENT_QUESTION, { onCompleted: () => refetch() });
    const [publishAssessment] = useMutation(PUBLISH_ASSESSMENT, { onCompleted: () => refetch() });
    const [unpublishAssessment] = useMutation(UNPUBLISH_ASSESSMENT, { onCompleted: () => refetch() });
    const [autoBalancePoints] = useMutation(AUTO_BALANCE_POINTS, { onCompleted: () => refetch() });
    const [generateAi] = useMutation(GENERATE_AI_EXAM_QUESTIONS, { onCompleted: () => refetch() });
    const [updateInline] = useMutation(UPDATE_QUESTION_INLINE, { onCompleted: () => refetch() });

    const { data: banksData } = useQuery(GET_MY_QUESTION_BANKS);

    const [showForm, setShowForm] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [activeSet, setActiveSet] = useState(1);
    const [autoGenerating, setAutoGenerating] = useState(false);
    const [copyFromSet, setCopyFromSet] = useState(1);
    const [aiForm, setAiForm] = useState({ bankId: "", questionCount: 10 });
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ points: 1, difficulty: "MEDIUM", correctAnswer: "0" });

    const [formData, setFormData] = useState({
        prompt: "",
        options: ["", "", "", ""],
        correctAnswer: "0",
        explanation: "",
        points: 1,
        difficulty: "MEDIUM",
        order: 1
    });
    const [creating, setCreating] = useState(false);

    const handleOptionChange = (idx: number, value: string) => {
        const newOptions = [...formData.options];
        newOptions[idx] = value;
        setFormData({ ...formData, options: newOptions });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleCreate = async (e: any) => {
        e.preventDefault();
        if (formData.options.some(opt => !opt.trim())) {
            return toast.error("Vui lòng nhập đầy đủ 4 đáp án");
        }
        setCreating(true);
        try {
            await createQuestion({
                variables: {
                    assessmentId: id,
                    input: {
                        setCode: `SET_${activeSet}`,
                        prompt: formData.prompt,
                        options: formData.options,
                        correctAnswer: formData.correctAnswer.toString(),
                        explanation: formData.explanation,
                        points: Number(formData.points),
                        difficulty: formData.difficulty,
                        order: 1
                    }
                }
            });
            toast.success("Thêm câu hỏi thành công");
            setFormData({ prompt: "", options: ["", "", "", ""], correctAnswer: "0", explanation: "", points: 1, difficulty: "MEDIUM", order: formData.order + 1 });
            setShowForm(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error("Lỗi: " + err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (questionId: string) => {
        if (!confirm("Xóa câu hỏi này?")) return;
        try {
            await deleteQuestion({ variables: { id: questionId } });
            toast.success("Đã xóa câu hỏi");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error("Lỗi: " + err.message);
        }
    };

    if (loading) {
        return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ast = (data as any)?.assessment;

    if (!ast) {
        return <div className="p-10 text-center">Không tìm thấy bài thi</div>;
    }

    const handleAutoGenerate = async () => {
        if (!ast || ast.numberOfSets <= 1) return;
        const sourceSetCode = `SET_${copyFromSet}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sourceQuestions = ast.questions?.filter((q: any) => q.setCode === sourceSetCode) || [];
        if (sourceQuestions.length === 0) {
            return toast.error(`Mã đề ${copyFromSet} chưa có câu hỏi nào để copy!`);
        }
        if (!confirm(`Sao chép ${sourceQuestions.length} câu hỏi từ Mã đề ${copyFromSet} sang Mã đề ${activeSet}. Tiếp tục?`)) return;
        setAutoGenerating(true);
        try {
            const shuffledQuestions = [...sourceQuestions].sort(() => Math.random() - 0.5);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const q of shuffledQuestions) {
                await createQuestion({
                    variables: {
                        assessmentId: id,
                        input: {
                            setCode: `SET_${activeSet}`,
                            prompt: q.prompt,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                            explanation: q.explanation || "",
                            points: q.points,
                            difficulty: q.difficulty,
                            order: 1
                        }
                    }
                });
            }
            toast.success(`Đã copy ${sourceQuestions.length} câu từ Mã đề ${copyFromSet} sang Mã đề ${activeSet}!`);
            refetch();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error("Lỗi khi tạo tự động: " + error.message);
        } finally {
            setAutoGenerating(false);
        }
    };

    const handleSaveInline = async (questionId: string) => {
        try {
            await updateInline({
                variables: {
                    questionId,
                    input: {
                        points: Number(editForm.points),
                        difficulty: editForm.difficulty,
                        correctAnswer: editForm.correctAnswer
                    }
                }
            });
            toast.success("Đã cập nhật câu hỏi!");
            setEditingQuestionId(null);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handlePublishToggle = async () => {
        try {
            if (ast.isPublished) {
                await unpublishAssessment({ variables: { assessmentId: id } });
                toast.success("Đã khóa bài thi thành nháp (Draft).");
            } else {
                await publishAssessment({ variables: { assessmentId: id } });
                toast.success("Đã công bố bài thi thành công!");
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleAutoBalance = async () => {
        try {
            await autoBalancePoints({ variables: { assessmentId: id } });
            toast.success("Đã cân bằng lại điểm cho tất cả câu hỏi!");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleGenerateAi = async (e: React.FormEvent) => {
        e.preventDefault();
        setAutoGenerating(true);
        try {
            await generateAi({
                variables: {
                    assessmentId: id,
                    questionCount: aiForm.questionCount,
                    bankId: aiForm.bankId || null,
                    setCode: `SET_${activeSet}`
                }
            });
            toast.success("AI đã tạo xong đề thi!");
            setShowAiModal(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error("Lỗi AI: " + error.message);
        } finally {
            setAutoGenerating(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentQuestions = ast.questions?.filter((q: any) => q.setCode === `SET_${activeSet}`) || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const report = (reportData as any)?.assessmentReport;

    const getStatusBadge = (status: string, passed: boolean) => {
        if (status === "VOIDED") return { label: "Vi phạm", color: "bg-red-100 text-red-700", icon: <Ban className="w-3 h-3" /> };
        if (status === "IN_PROGRESS") return { label: "Đang thi", color: "bg-blue-100 text-blue-700", icon: <Loader2 className="w-3 h-3" /> };
        if (passed) return { label: "Đạt", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="w-3 h-3" /> };
        return { label: "Không đạt", color: "bg-amber-100 text-amber-700", icon: <XCircle className="w-3 h-3" /> };
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
            </button>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">{ast.title}</h1>
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${ast.isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {ast.isPublished ? "Đã công bố" : "Bản nháp (Draft)"}
                        </span>
                    </div>
                    <button
                        onClick={handlePublishToggle}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${ast.isPublished
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200"
                            }`}
                    >
                        {ast.isPublished ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        {ast.isPublished ? "Khóa (Draft)" : "Công bố bài thi"}
                    </button>
                </div>
                <p className="text-slate-500 mt-2">{ast.description}</p>
                {ast.type === 'PRIVATE' && ast.enrollCode && (
                    <div className="flex items-center gap-2 mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg w-fit">
                        <Key className="w-5 h-5 text-slate-500" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium mb-0.5">Mã ghi danh (Private)</p>
                            <span className="text-sm font-mono font-bold text-slate-800 tracking-wide">{ast.enrollCode}</span>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(ast.enrollCode);
                                toast.success('Đã copy mã ghi danh');
                            }}
                            className="text-xs text-violet-600 hover:text-violet-700 font-medium px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-md transition-colors ml-4"
                        >
                            Copy
                        </button>
                    </div>
                )}
                <div className="flex gap-3 mt-4 text-sm font-medium text-slate-600 flex-wrap">
                    <span className="bg-white px-3 py-1 rounded shadow-sm border border-slate-200">Thời gian: {ast.timeLimit} phút</span>
                    <span className="bg-white px-3 py-1 rounded shadow-sm border border-slate-200">Điểm đỗ: {ast.passingScore}%</span>
                    <span className="bg-white px-3 py-1 rounded shadow-sm border border-slate-200">Tổng điểm: {ast.totalPoints}đ</span>
                    <span className="bg-white px-3 py-1 rounded shadow-sm border border-slate-200">Mã đề: {ast.numberOfSets}</span>
                    <span className="bg-white px-3 py-1 rounded shadow-sm border border-slate-200">Max lượt: {ast.maxAttempts || 1}</span>
                    <span className="bg-white px-3 py-1 rounded shadow-sm border border-slate-200">Ngưỡng VP: {ast.maxViolations || 5}</span>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
                <button
                    onClick={() => setActiveTab("questions")}
                    className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === "questions"
                        ? "bg-white text-violet-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                        }`}
                >
                    <Plus className="w-4 h-4" /> Câu hỏi
                </button>
                <button
                    onClick={() => setActiveTab("results")}
                    className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === "results"
                        ? "bg-white text-violet-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                        }`}
                >
                    <Users className="w-4 h-4" /> Kết quả & Giám sát
                </button>
            </div>

            {/* ============ TAB: QUESTIONS ============ */}
            {activeTab === "questions" && (
                <>
                    {ast.numberOfSets > 1 && (
                        <>
                            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto overflow-y-hidden">
                                {Array.from({ length: ast.numberOfSets }).map((_: unknown, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveSet(i + 1)}
                                        className={`px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${activeSet === i + 1
                                            ? "bg-white text-violet-700 shadow-sm"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                                            }`}
                                    >
                                        Mã đề {i + 1}
                                    </button>
                                ))}
                            </div>

                            {currentQuestions.length === 0 && (
                                <div className="flex items-center gap-3 flex-wrap bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-2">
                                    <p className="text-sm text-amber-800 font-medium flex-1 min-w-[200px]">
                                        Mã đề {activeSet} chưa có câu hỏi. Copy từ mã đề khác:
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={copyFromSet}
                                            onChange={(e) => setCopyFromSet(parseInt(e.target.value))}
                                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium bg-white focus:ring-violet-500 focus:border-violet-500"
                                        >
                                            {Array.from({ length: ast.numberOfSets }).map((_: unknown, i: number) => {
                                                const setNum = i + 1;
                                                if (setNum === activeSet) return null;
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                const count = ast.questions?.filter((q: any) => q.setCode === `SET_${setNum}`).length || 0;
                                                return (
                                                    <option key={setNum} value={setNum}>
                                                        Mã đề {setNum} ({count} câu)
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        <button
                                            onClick={handleAutoGenerate}
                                            disabled={autoGenerating}
                                            className="flex items-center gap-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl shadow-sm disabled:opacity-50 transition-colors whitespace-nowrap"
                                        >
                                            {autoGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                                            Copy sang Mã đề {activeSet}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-slate-900 pl-2">Danh sách câu hỏi {ast.numberOfSets > 1 ? `(Mã đề ${activeSet})` : ""}</h2>
                            {currentQuestions.length > 0 && !ast.isPublished && (
                                <button
                                    onClick={handleAutoBalance}
                                    className="text-xs font-bold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-100 transition-colors shadow-sm"
                                >
                                    <Scale className="w-3.5 h-3.5" /> Auto-Balance
                                </button>
                            )}
                        </div>
                        {!ast.isPublished && !showForm && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAiModal(true)}
                                    className="bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors text-sm"
                                >
                                    <Sparkles className="w-4 h-4" /> AI Generate
                                </button>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors text-sm"
                                >
                                    <Plus className="w-4 h-4" /> Thêm câu
                                </button>
                            </div>
                        )}
                    </div>

                    {showAiModal && !ast.isPublished && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-md animate-in zoom-in-95">
                                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-600" /> Tạo đề bằng AI
                                </h3>
                                <p className="text-sm text-slate-500 mb-6">AI sẽ phân bổ điểm tự động dựa theo độ khó để khớp với tổng {ast.totalPoints}đ của kỳ thi.</p>

                                <form onSubmit={handleGenerateAi} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Số lượng câu hỏi</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            required
                                            value={aiForm.questionCount}
                                            onChange={(e) => setAiForm({ ...aiForm, questionCount: parseInt(e.target.value) })}
                                            className="w-full border-slate-200 rounded-xl p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Chọn Ngân hàng Đề (Context)</label>
                                        <select
                                            value={aiForm.bankId}
                                            onChange={(e) => setAiForm({ ...aiForm, bankId: e.target.value })}
                                            className="w-full border-slate-200 rounded-xl p-3 justify-between bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-700"
                                        >
                                            <option value="">Không dùng ngân hàng (Trắng)</option>
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {(banksData as any)?.myQuestionBanks?.items?.map((b: any) => (
                                                <option key={b.id} value={b.id}>{b.name} ({b.questionCount} câu)</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setShowAiModal(false)}
                                            className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-colors text-sm"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={autoGenerating}
                                            className="px-5 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold flex items-center justify-center min-w-[120px] transition-colors text-sm shadow-sm"
                                        >
                                            {autoGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tạo Đề Ngay"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {showForm && (
                        <form onSubmit={handleCreate} className="bg-violet-50/50 p-6 rounded-2xl border border-violet-100 space-y-4 animate-in fade-in zoom-in-95">
                            <h3 className="font-bold text-violet-900 mb-2">Thêm câu hỏi mới ({ast.numberOfSets > 1 ? `Mã đề ${activeSet}` : "Chung"})</h3>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nội dung câu hỏi</label>
                                <textarea
                                    required
                                    value={formData.prompt}
                                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                                    className="w-full border-slate-200 rounded-lg p-2.5 focus:ring-violet-500 focus:border-violet-500"
                                    placeholder="Nhập câu hỏi..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Điểm số</label>
                                    <input
                                        type="number" step="0.5" min="0.5" required
                                        value={formData.points}
                                        onChange={(e) => setFormData({ ...formData, points: parseFloat(e.target.value) })}
                                        className="w-full border-slate-200 rounded-lg p-2.5 focus:ring-violet-500 focus:border-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Độ khó</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className="w-full border-slate-200 rounded-lg p-2.5 focus:ring-violet-500 focus:border-violet-500"
                                    >
                                        <option value="EASY">EASY (Dễ)</option>
                                        <option value="MEDIUM">MEDIUM (TB)</option>
                                        <option value="HARD">HARD (Khó)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[0, 1, 2, 3].map((idx) => (
                                    <div key={idx} className="relative">
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Lựa chọn {idx + 1}</label>
                                        <input
                                            required
                                            value={formData.options[idx]}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            className="w-full border-slate-200 rounded-lg p-2.5 pr-10 focus:ring-violet-500 focus:border-violet-500 text-sm"
                                            placeholder={`Nhập đáp án ${idx + 1}...`}
                                        />
                                        <div className="absolute right-3 top-8 flex items-center">
                                            <input
                                                type="radio"
                                                name="correctAnswer"
                                                checked={formData.correctAnswer === idx.toString()}
                                                onChange={() => setFormData({ ...formData, correctAnswer: idx.toString() })}
                                                className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 italic mt-1">* Chọn nút tròn (Radio) ở góc phải đáp án để đánh dấu đó là đáp án đúng.</p>

                            <div className="flex justify-end gap-3 pt-4 border-t border-violet-100">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-medium transition-colors text-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-4 py-2 text-white bg-violet-600 hover:bg-violet-700 rounded-xl font-medium flex items-center justify-center min-w-[100px] transition-colors text-sm"
                                >
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lưu Câu Hỏi"}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-4">
                        {currentQuestions.length === 0 && !showForm && (
                            <div className="text-center p-10 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                                <p className="text-slate-500 italic">Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên!</p>
                            </div>
                        )}

                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {currentQuestions.map((q: any, i: number) => {
                            const correctIdx = parseInt(q.correctAnswer) || 0;
                            const isEditing = editingQuestionId === q.id;

                            return (
                                <div key={q.id} className={`bg-white p-5 rounded-2xl shadow-sm border relative group transition-colors ${isEditing ? 'border-violet-400 ring-2 ring-violet-100' : 'border-slate-200'}`}>
                                    <div className="pr-10 mb-3 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">Câu hỏi {i + 1}</span>
                                            {q.isAiGenerated && (
                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" /> AI
                                                </span>
                                            )}

                                            {isEditing ? (
                                                <div className="flex items-center gap-2 bg-violet-50 p-1.5 rounded-lg border border-violet-100 animate-in fade-in">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-medium text-violet-700">Độ khó:</span>
                                                        <select
                                                            value={editForm.difficulty}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, difficulty: e.target.value }))}
                                                            className="text-xs border border-violet-200 rounded px-1.5 py-0.5 focus:ring-violet-500 text-violet-900 bg-white"
                                                        >
                                                            <option value="EASY">EASY</option>
                                                            <option value="MEDIUM">MEDIUM</option>
                                                            <option value="HARD">HARD</option>
                                                        </select>
                                                    </div>
                                                    <div className="w-px h-4 bg-violet-200" />
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-medium text-violet-700">Điểm:</span>
                                                        <input
                                                            type="number" step="0.5" min="0.5"
                                                            value={editForm.points}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, points: Number(e.target.value) }))}
                                                            className="w-16 text-xs border border-violet-200 rounded px-1.5 py-0.5 focus:ring-violet-500 text-violet-900 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${q.difficulty === 'HARD' ? 'bg-red-50 text-red-600 border-red-200' : q.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                                        {q.difficulty}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">
                                                        ★ {q.points}đ
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-slate-900">{q.prompt}</h4>
                                    </div>
                                    <div className="space-y-2 pl-4 border-l-2 border-slate-100">
                                        {q.options.map((opt: string, idx: number) => (
                                            <div key={idx} className={`text-sm flex items-center gap-2 ${idx === correctIdx && !isEditing ? "text-emerald-700 font-medium" : "text-slate-600"} ${isEditing && parseInt(editForm.correctAnswer) === idx ? "text-violet-700 font-bold bg-violet-50 rounded px-2" : ""}`}>
                                                {isEditing ? (
                                                    <input
                                                        type="radio"
                                                        name={`edit-correct-${q.id}`}
                                                        checked={parseInt(editForm.correctAnswer) === idx}
                                                        onChange={() => setEditForm(prev => ({ ...prev, correctAnswer: idx.toString() }))}
                                                        className="w-4 h-4 text-violet-600 focus:ring-violet-500 cursor-pointer"
                                                    />
                                                ) : (
                                                    idx === correctIdx ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />
                                                )}
                                                {opt}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Buttons */}
                                    {!ast.isPublished && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur rounded-lg p-1 shadow-sm border border-slate-100">
                                            {isEditing ? (
                                                <>
                                                    <button onClick={() => setEditingQuestionId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                                                        Hủy
                                                    </button>
                                                    <button onClick={() => handleSaveInline(q.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-md transition-colors shadow-sm">
                                                        Lưu
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditForm({ points: q.points, difficulty: q.difficulty, correctAnswer: q.correctAnswer.toString() });
                                                            setEditingQuestionId(q.id);
                                                        }}
                                                        className="px-3 py-1.5 text-xs font-bold text-violet-600 hover:bg-violet-50 rounded-md transition-colors"
                                                    >
                                                        Chỉnh sửa
                                                    </button>
                                                    <div className="w-px h-4 bg-slate-200 mx-1" />
                                                    <button
                                                        onClick={() => handleDelete(q.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Xóa câu hỏi"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            {/* ============ TAB: RESULTS & MONITORING ============ */}
            {activeTab === "results" && (
                <div className="space-y-6">
                    {reportLoading ? (
                        <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>
                    ) : !report ? (
                        <div className="text-center p-10 bg-slate-50 rounded-2xl border border-slate-200">
                            <p className="text-slate-500">Chưa có dữ liệu kết quả.</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                                    <div className="flex items-center justify-center gap-2 text-slate-500 mb-2">
                                        <Users className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Lượt thi</span>
                                    </div>
                                    <p className="text-3xl font-bold text-slate-900">{report.totalAttempts}</p>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                                    <div className="flex items-center justify-center gap-2 text-slate-500 mb-2">
                                        <BarChart3 className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Điểm TB</span>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-600">{report.avgScore}%</p>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                                    <div className="flex items-center justify-center gap-2 text-slate-500 mb-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Tỷ lệ đạt</span>
                                    </div>
                                    <p className="text-3xl font-bold text-emerald-600">{report.passRate}%</p>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                                    <div className="flex items-center justify-center gap-2 text-slate-500 mb-2">
                                        <ShieldAlert className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Bị huỷ (VP)</span>
                                    </div>
                                    <p className="text-3xl font-bold text-red-600">{report.voidedCount}</p>
                                </div>
                            </div>

                            {/* Student Results Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-violet-600" />
                                        Danh sách thí sinh ({report.attempts.length})
                                    </h3>
                                </div>
                                {report.attempts.length === 0 ? (
                                    <div className="p-10 text-center text-slate-400 italic">
                                        Chưa có thí sinh nào tham gia.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="text-left px-5 py-3 font-bold text-slate-500 text-xs uppercase">Thí sinh</th>
                                                    <th className="text-center px-3 py-3 font-bold text-slate-500 text-xs uppercase">Mã đề</th>
                                                    <th className="text-center px-3 py-3 font-bold text-slate-500 text-xs uppercase">Điểm</th>
                                                    <th className="text-center px-3 py-3 font-bold text-slate-500 text-xs uppercase">Trạng thái</th>
                                                    <th className="text-center px-3 py-3 font-bold text-slate-500 text-xs uppercase">Vi phạm</th>
                                                    <th className="text-center px-3 py-3 font-bold text-slate-500 text-xs uppercase">Thời gian</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {report.attempts.map((at: any) => {
                                                    const badge = getStatusBadge(at.status, at.passed);
                                                    return (
                                                        <tr key={at.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-5 py-4">
                                                                <div>
                                                                    <p className="font-semibold text-slate-900">{at.userName || "N/A"}</p>
                                                                    <p className="text-xs text-slate-400">{at.userEmail}</p>
                                                                </div>
                                                            </td>
                                                            <td className="text-center px-3 py-4">
                                                                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                                    {at.setCode}
                                                                </span>
                                                            </td>
                                                            <td className="text-center px-3 py-4">
                                                                <span className={`text-lg font-bold ${at.score !== null
                                                                    ? (at.passed ? "text-emerald-600" : "text-amber-600")
                                                                    : "text-slate-300"
                                                                    }`}>
                                                                    {at.score !== null ? `${at.score}%` : "--"}
                                                                </span>
                                                            </td>
                                                            <td className="text-center px-3 py-4">
                                                                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${badge.color}`}>
                                                                    {badge.icon} {badge.label}
                                                                </span>
                                                            </td>
                                                            <td className="text-center px-3 py-4">
                                                                {at.violationCount > 0 ? (
                                                                    <div className="relative inline-block">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const el = e.currentTarget.nextElementSibling;
                                                                                if (el) el.classList.toggle("hidden");
                                                                            }}
                                                                            className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-full cursor-pointer transition"
                                                                        >
                                                                            <ShieldAlert className="w-3 h-3" />
                                                                            {at.violationCount} vi phạm ▾
                                                                        </button>
                                                                        <div className="hidden absolute z-50 right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 text-left">
                                                                            <p className="text-xs font-bold text-slate-700 mb-2">📋 Chi tiết vi phạm</p>
                                                                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                                                                {at.violations?.length > 0 ? at.violations.map((v: any, vi: number) => (
                                                                                    <div key={vi} className="flex items-center gap-2 px-2.5 py-1.5 bg-red-50 rounded-lg text-xs">
                                                                                        <span className="text-red-500 font-bold">#{vi + 1}</span>
                                                                                        <span className="font-semibold text-slate-700">
                                                                                            {v.type === "TAB_SWITCH" ? "Chuyển tab" : v.type === "FULLSCREEN_EXIT" ? "Thoát toàn màn hình" : v.type === "DISCONNECT_TIMEOUT" ? "Mất kết nối" : `${v.type}`}
                                                                                        </span>
                                                                                        <span className="ml-auto text-slate-400">{format(new Date(v.timestamp), "HH:mm:ss")}</span>
                                                                                    </div>
                                                                                )) : (
                                                                                    <p className="text-xs text-slate-400 italic">Không có dữ liệu chi tiết</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-slate-300">0</span>
                                                                )}
                                                            </td>
                                                            <td className="text-center px-3 py-4 text-xs text-slate-500">
                                                                {at.startedAt && format(new Date(at.startedAt), "dd/MM HH:mm")}
                                                                {at.completedAt && (
                                                                    <span className="block text-slate-400">
                                                                        → {format(new Date(at.completedAt), "HH:mm")}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
