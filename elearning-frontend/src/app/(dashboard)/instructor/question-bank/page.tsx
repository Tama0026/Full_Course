"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_MY_QUESTION_BANKS, CREATE_QUESTION_BANK, DELETE_QUESTION_BANK } from "@/lib/graphql/question-bank";
import { Loader2, Plus, Trash2, Database, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QuestionBankListPage() {
    const router = useRouter();
    const { data, loading, refetch } = useQuery(GET_MY_QUESTION_BANKS, { fetchPolicy: "network-only" });
    const [createBank] = useMutation(CREATE_QUESTION_BANK, { onCompleted: () => refetch() });
    const [deleteBank] = useMutation(DELETE_QUESTION_BANK, { onCompleted: () => refetch() });

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "", category: "" });
    const [creating, setCreating] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const result = await createBank({
                variables: {
                    input: formData
                }
            });
            const newBankId = (result.data as any)?.createQuestionBank?.id;
            toast.success("Tạo Ngân hàng Đề thành công!");
            setShowCreateForm(false);
            setFormData({ name: "", description: "", category: "" });

            if (newBankId) {
                router.push(`/instructor/question-bank/${newBankId}`);
            }
        } catch (err: any) {
            toast.error("Lỗi khi tạo: " + err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Bạn có chắc chắn muốn xóa ngân hàng đề này không? Các bài thi đang dùng có thể bị ảnh hưởng (chỉ metadata).")) return;
        try {
            await deleteBank({ variables: { id } });
            toast.success("Đã xóa Ngân hàng Đề");
        } catch (err: any) {
            toast.error("Lỗi xóa: " + err.message);
        }
    };

    const banks = (data as any)?.myQuestionBanks?.items || [];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Database className="w-6 h-6 text-indigo-600" /> Ngân Hàng Đề Thi
                    </h1>
                    <p className="text-slate-500 mt-1">Quản lý và tái sinh các câu hỏi thi cho Assessment</p>
                </div>
                {!showCreateForm && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Tạo Ngân Hàng Đề
                    </button>
                )}
            </div>

            {showCreateForm && (
                <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-in slide-in-from-top-4">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Nhập thông tin Ngân hàng Đề</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tên ngân hàng đề</label>
                            <input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border-slate-200 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="VD: Khối kiến thức React Nâng Cao"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border-slate-200 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                                placeholder="Nhập mô tả..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cấp độ / Category</label>
                            <input
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full border-slate-200 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="VD: Frontend, Backend, Web Basic..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={creating}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center justify-center min-w-[120px] transition-colors disabled:opacity-50 shadow-sm"
                            >
                                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tạo mới"}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : banks.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                    <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Chưa có ngân hàng đề nào</h3>
                    <p className="text-slate-500 mb-6">Hãy tạo ngân hàng đề đầu tiên để tích lũy câu hỏi cho các kỳ thi.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {banks.map((bank: any) => (
                        <Link
                            href={`/instructor/question-bank/${bank.id}`}
                            key={bank.id}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200 group flex flex-col relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                            <div className="flex justify-between items-start mb-4 pl-3">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{bank.name}</h3>
                                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg inline-block">
                                        {bank.category}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(bank.id, e)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1 pl-3">{bank.description}</p>

                            <div className="pl-3 mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
                                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                    <Database className="w-3.5 h-3.5" />
                                    <b>{bank.questionCount}</b> câu hỏi
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    {format(new Date(bank.createdAt), "dd/MM/yyyy")}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
