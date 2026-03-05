"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_INSTRUCTOR_ASSESSMENTS, CREATE_ASSESSMENT, DELETE_ASSESSMENT } from "@/lib/graphql/assessment";
import { Loader2, Plus, Trash2, Edit, ClipboardList, Clock, ShieldAlert, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InstructorAssessmentsPage() {
    const router = useRouter();
    const { data, loading, refetch } = useQuery(GET_INSTRUCTOR_ASSESSMENTS, { fetchPolicy: "network-only" });
    const [createAssessment] = useMutation(CREATE_ASSESSMENT, { onCompleted: () => refetch() });
    const [deleteAssessment] = useMutation(DELETE_ASSESSMENT, { onCompleted: () => refetch() });

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        timeLimit: 30,
        passingScore: 80,
        totalPoints: 100,
        numberOfSets: 1,
        maxAttempts: 1,
        maxViolations: 5,
        isActive: true
    });
    const [creating, setCreating] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const result = await createAssessment({
                variables: {
                    input: {
                        ...formData,
                        timeLimit: parseInt(formData.timeLimit.toString()),
                        passingScore: parseFloat(formData.passingScore.toString()),
                        totalPoints: parseFloat(formData.totalPoints.toString()),
                        numberOfSets: parseInt(formData.numberOfSets.toString())
                    }
                }
            });
            const newAssessmentId = (result.data as any)?.createAssessment?.id;
            toast.success("Tạo kỳ thi thành công! Vui lòng thêm câu hỏi.");
            setShowCreateForm(false);
            setFormData({ title: "", description: "", timeLimit: 30, passingScore: 80, totalPoints: 100, numberOfSets: 1, maxAttempts: 1, maxViolations: 5, isActive: true });

            if (newAssessmentId) {
                router.push(`/instructor/assessments/${newAssessmentId}`);
            }
        } catch (err: any) {
            toast.error("Lỗi khi tạo kỳ thi: " + err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa kỳ thi này không?")) return;
        try {
            await deleteAssessment({ variables: { id } });
            toast.success("Đã xóa kỳ thi");
        } catch (err: any) {
            toast.error("Lỗi xóa kỳ thi: " + err.message);
        }
    };

    const assessments = (data as any)?.assessments || [];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-violet-600" /> Quản Lý Kỳ Thi
                    </h1>
                    <p className="text-slate-500 mt-1">Khởi tạo và cấu hình các kỳ thi độc lập dành cho học viên</p>
                </div>
                {!showCreateForm && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Tạo Kỳ Thi Mới
                    </button>
                )}
            </div>

            {showCreateForm && (
                <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-in slide-in-from-top-4">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Nhập thông tin kỳ thi</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tên kỳ thi</label>
                            <input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full border-slate-200 rounded-lg p-2.5 focus:ring-violet-500 focus:border-violet-500"
                                placeholder="VD: Đánh giá năng lực Frontend 2026"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border-slate-200 rounded-lg p-2.5 focus:ring-violet-500 focus:border-violet-500 min-h-[100px]"
                                placeholder="Nhập mô tả..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                    <Clock className="w-4 h-4" /> Thời gian làm bài (Phút)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={formData.timeLimit}
                                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 0 })}
                                    className="w-full border-slate-200 rounded-lg p-2.5 focus:ring-violet-500 focus:border-violet-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                    <ShieldAlert className="w-4 h-4" /> Điểm sàn để qua (%)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    required
                                    value={formData.passingScore}
                                    onChange={(e) => setFormData({ ...formData, passingScore: parseFloat(e.target.value) || 0 })}
                                    className="w-full border-slate-200 rounded-lg p-2.5 focus:ring-violet-500 focus:border-violet-500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                    🌟 Tổng điểm (ví dụ: 10, 100)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={formData.totalPoints}
                                    onChange={(e) => setFormData({ ...formData, totalPoints: parseFloat(e.target.value) || 0 })}
                                    className="w-full border-slate-200 rounded-lg p-2.5 focus:ring-violet-500 focus:border-violet-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                    <RotateCcw className="w-4 h-4" /> Số lượt thi tối đa
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    required
                                    value={formData.maxAttempts}
                                    onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) || 1 })}
                                    className="w-full border-slate-200 rounded-lg p-2.5 focus:ring-violet-500 focus:border-violet-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                    <ShieldAlert className="w-4 h-4" /> Ngưỡng vi phạm huỷ bài
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    required
                                    value={formData.maxViolations}
                                    onChange={(e) => setFormData({ ...formData, maxViolations: parseInt(e.target.value) || 5 })}
                                    className="w-full border-slate-200 rounded-lg p-2.5 focus:ring-violet-500 focus:border-violet-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng Mã đề</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    required
                                    value={formData.numberOfSets}
                                    onChange={(e) => setFormData({ ...formData, numberOfSets: parseInt(e.target.value) || 1 })}
                                    className="w-full border-slate-200 rounded-lg p-2.5 focus:ring-violet-500 focus:border-violet-500"
                                />
                            </div>
                            <div className="flex-1 flex items-center gap-2 mt-6">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="rounded text-violet-600 focus:ring-violet-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Trạng thái Mở kỳ thi</label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                            >
                                Hủy Bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={creating}
                                className="px-5 py-2.5 text-white bg-violet-600 hover:bg-violet-700 rounded-xl font-medium flex items-center justify-center min-w-[120px] transition-colors"
                            >
                                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tạo Mới"}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>
            ) : assessments.length === 0 ? (
                <div className="text-center bg-white border border-slate-200 rounded-2xl py-16 shadow-sm">
                    <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có kỳ thi nào</h3>
                    <p className="text-slate-500">Bắt đầu bằng cách tạo kỳ thi độc lập đầu tiên của bạn.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {assessments.map((ast: any) => (
                        <div key={ast.id} className="bg-white border text-left border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col relative group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-slate-900 pr-8">{ast.title}</h3>
                                <span className={`absolute top-6 right-6 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${ast.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {ast.isActive ? 'ĐANG MỞ' : 'ĐÃ ĐÓNG'}
                                </span>
                            </div>

                            <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">{ast.description}</p>

                            <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Thời gian: <span className="font-semibold text-slate-900 ml-1">{ast.timeLimit} phút</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <ShieldAlert className="w-4 h-4 mr-2" />
                                        Điểm đỗ: <span className="font-semibold text-slate-900 ml-1">{ast.passingScore}%</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <span className="w-4 h-4 mr-2 flex justify-center items-center">💎</span>
                                        Tổng điểm: <span className="font-semibold text-slate-900 ml-1">{ast.totalPoints}đ</span>
                                    </div>
                                </div>
                                <div className="text-center flex flex-col justify-center items-center">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Max Lượt</p>
                                    <p className="font-semibold text-slate-700">{ast.maxAttempts || 1}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-[11px] text-slate-400 font-medium">
                                    Tạo ngày {format(new Date(parseInt(ast.createdAt)), "dd/MM/yyyy")}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/instructor/assessments/${ast.id}`}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block"
                                        title="Chỉnh sửa kỳ thi"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(ast.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Xóa kỳ thi"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
