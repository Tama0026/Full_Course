"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CATEGORIES, CREATE_CATEGORY, DELETE_CATEGORY } from "@/lib/graphql/admin";
import { useState } from "react";
import { Loader2, Plus, Trash2, FolderTree, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Category {
    id: string;
    name: string;
    slug: string;
    order: number;
}

export default function AdminCategoriesPage() {
    const { data, loading, refetch } = useQuery<any>(GET_CATEGORIES, { fetchPolicy: "cache-and-network" });
    const [createCategory] = useMutation(CREATE_CATEGORY);
    const [deleteCategory] = useMutation(DELETE_CATEGORY);

    const [newName, setNewName] = useState("");
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmState, setConfirmState] = useState<{ open: boolean; cat: Category | null }>({ open: false, cat: null });

    const categories: Category[] = data?.categories || [];

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newName.trim()) {
            toast.error("Vui lòng nhập tên danh mục");
            return;
        }
        setAdding(true);
        setError(null);
        try {
            await createCategory({ variables: { input: { name: newName.trim() } } });
            setNewName("");
            await refetch();
            toast.success("Tạo danh mục thành công");
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra");
        } finally {
            setAdding(false);
        }
    }

    async function handleDelete(cat: Category) {
        setConfirmState({ open: true, cat });
    }

    async function executeDelete(cat: Category) {
        try {
            await deleteCategory({ variables: { id: cat.id } });
            await refetch();
            toast.success(`Đã xóa danh mục "${cat.name}"`);
        } catch (err: any) {
            toast.error(err.message || "Không thể xóa danh mục");
        }
    }

    if (loading && !data) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-2">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <FolderTree className="h-6 w-6 text-emerald-600" /> Quản lý Danh mục
                </h1>
                <p className="text-sm text-slate-500 mt-1">{categories.length} danh mục</p>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleCreate} className="flex gap-3 mb-6">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Tên danh mục mới..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                    />
                </div>
                <button
                    type="submit"
                    disabled={adding}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                    {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Thêm
                </button>
            </form>

            {error && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>
            )}

            {/* Categories List */}
            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {categories.map((cat, index) => (
                        <motion.div
                            key={cat.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.03 }}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-bold">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{cat.name}</p>
                                    <p className="text-xs text-slate-400 font-mono">{cat.slug}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(cat)}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {categories.length === 0 && !loading && (
                <div className="text-center py-16 text-slate-400">
                    <FolderTree className="mx-auto h-12 w-12 mb-3 opacity-40" />
                    <p>Chưa có danh mục nào.</p>
                </div>
            )}

            <ConfirmDialog
                open={confirmState.open}
                title="Xóa danh mục"
                description={`Bạn có chắc muốn xóa danh mục "${confirmState.cat?.name}"?`}
                confirmText="Xóa"
                danger
                onConfirm={() => confirmState.cat && executeDelete(confirmState.cat)}
                onCancel={() => setConfirmState({ open: false, cat: null })}
            />
        </div>
    );
}
