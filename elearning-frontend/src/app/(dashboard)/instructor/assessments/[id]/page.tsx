"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ASSESSMENT_DETAIL, CREATE_ASSESSMENT_QUESTION, DELETE_ASSESSMENT_QUESTION } from "@/lib/graphql/assessment";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AssessmentEditorPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data, loading, refetch } = useQuery(GET_ASSESSMENT_DETAIL, {
        variables: { id },
        fetchPolicy: "network-only"
    });

    const [createQuestion] = useMutation(CREATE_ASSESSMENT_QUESTION, { onCompleted: () => refetch() });
    const [deleteQuestion] = useMutation(DELETE_ASSESSMENT_QUESTION, { onCompleted: () => refetch() });

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        prompt: "",
        options: ["", "", "", ""],
        correctAnswer: "0",
        explanation: "",
        order: 1
    });
    const [creating, setCreating] = useState(false);

    const handleOptionChange = (idx: number, value: string) => {
        const newOptions = [...formData.options];
        newOptions[idx] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (formData.options.some(opt => !opt.trim())) {
            return toast.error("Vui lòng nhập đầy đủ 4 đáp án");
        }

        setCreating(true);
        try {
            await createQuestion({
                variables: {
                    assessmentId: id,
                    input: {
                        prompt: formData.prompt,
                        options: formData.options,
                        correctAnswer: formData.correctAnswer.toString(),
                        explanation: formData.explanation,
                        order: 1
                    }
                }
            });
            toast.success("Thêm câu hỏi thành công");
            setFormData({
                prompt: "",
                options: ["", "", "", ""],
                correctAnswer: "0",
                explanation: "",
                order: formData.order + 1
            });
            setShowForm(false);
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
        } catch (err: any) {
            toast.error("Lỗi: " + err.message);
        }
    };

    if (loading) {
        return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;
    }

    const ast = (data as any)?.assessment;

    if (!ast) {
        return <div className="p-10 text-center">Không tìm thấy bài thi</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
            </button>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{ast.title}</h1>
                <p className="text-slate-500">{ast.description}</p>
                <div className="flex gap-4 mt-4 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 w-fit">
                    <span className="bg-white px-3 py-1 rounded shadow-sm border border-slate-200">⏱ Thời gian: {ast.timeLimit} phút</span>
                    <span className="bg-white px-3 py-1 rounded shadow-sm border border-slate-200">🎯 Điểm đỗ: {ast.passingScore}%</span>
                    <span className="bg-white px-3 py-1 rounded shadow-sm border border-slate-200">❓ Câu hỏi: {ast.questions?.length || 0}</span>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Danh sách câu hỏi</h2>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-colors text-sm"
                    >
                        <Plus className="w-4 h-4" /> Thêm câu hỏi
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="bg-violet-50/50 p-6 rounded-2xl border border-violet-100 space-y-4 animate-in fade-in zoom-in-95">
                    <h3 className="font-bold text-violet-900 mb-2">Thêm câu hỏi mới</h3>
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
                {ast.questions?.length === 0 && !showForm && (
                    <div className="text-center p-10 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                        <p className="text-slate-500 italic">Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên!</p>
                    </div>
                )}

                {ast.questions?.map((q: any, i: number) => {
                    const correctIdx = parseInt(q.correctAnswer) || 0;
                    return (
                        <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative group">
                            <div className="pr-10 mb-3">
                                <span className="text-sm font-bold text-violet-600 mb-1 block">Câu hỏi {i + 1}</span>
                                <h4 className="font-semibold text-slate-900">{q.prompt}</h4>
                            </div>

                            <div className="space-y-2 pl-4 border-l-2 border-slate-100">
                                {q.options.map((opt: string, idx: number) => (
                                    <div key={idx} className={`text-sm flex items-center gap-2 ${idx === correctIdx ? "text-emerald-700 font-medium" : "text-slate-600"}`}>
                                        {idx === correctIdx ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                                        {opt}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleDelete(q.id)}
                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Xóa câu hỏi"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
