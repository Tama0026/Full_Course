"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ADMIN_ALL_BADGES, ADMIN_CREATE_BADGE, ADMIN_UPDATE_BADGE, ADMIN_DELETE_BADGE } from "@/lib/graphql/admin";
import { useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Award, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Badge {
    id: string; name: string; description: string; icon: string;
    criteria: string; criteriaType: string; threshold: number;
    courseId?: string; courseName?: string;
    creatorId: string; awardedCount: number; createdAt: string;
}

const CRITERIA_TYPES = [
    { value: "LESSONS_COMPLETED", label: "Bài học đã hoàn thành", unit: "bài học" },
    { value: "COURSES_COMPLETED", label: "Khóa học đã hoàn thành", unit: "khóa học" },
    { value: "POINTS_EARNED", label: "Điểm tích lũy", unit: "điểm" },
    { value: "LOGIN_STREAK", label: "Chuỗi đăng nhập liên tiếp", unit: "ngày" },
];

const ICON_OPTIONS = ["🌟", "📚", "🎯", "🏆", "🎓", "💎", "⭐", "🔥", "👑", "🏅", "🥇", "🎖️", "💪", "🚀", "✨"];

function getCriteriaUnit(type: string) {
    return CRITERIA_TYPES.find(t => t.value === type)?.unit || "";
}

function getCriteriaLabel(type: string) {
    return CRITERIA_TYPES.find(t => t.value === type)?.label || type;
}

export default function AdminBadgesPage() {
    const { data, loading, refetch } = useQuery<any>(GET_ADMIN_ALL_BADGES, { fetchPolicy: "cache-and-network" });
    const [createBadge] = useMutation(ADMIN_CREATE_BADGE);
    const [updateBadge] = useMutation(ADMIN_UPDATE_BADGE);
    const [deleteBadge] = useMutation(ADMIN_DELETE_BADGE);

    const [showModal, setShowModal] = useState(false);
    const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({
        name: "", description: "", icon: "🏅",
        criteriaType: "LESSONS_COMPLETED", threshold: 1,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmState, setConfirmState] = useState<{ open: boolean; badge: Badge | null }>({ open: false, badge: null });

    const badges: Badge[] = data?.adminAllBadges || [];
    const filteredBadges = badges.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.description.toLowerCase().includes(search.toLowerCase())
    );

    function openCreate() {
        setEditingBadge(null);
        setFormData({ name: "", description: "", icon: "🏅", criteriaType: "LESSONS_COMPLETED", threshold: 1 });
        setError(null);
        setShowModal(true);
    }

    function openEdit(badge: Badge) {
        setEditingBadge(badge);
        setFormData({
            name: badge.name, description: badge.description, icon: badge.icon,
            criteriaType: badge.criteriaType || "LESSONS_COMPLETED",
            threshold: badge.threshold || 1,
        });
        setError(null);
        setShowModal(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            if (editingBadge) {
                await updateBadge({
                    variables: {
                        badgeId: editingBadge.id,
                        input: {
                            name: formData.name,
                            description: formData.description,
                            icon: formData.icon,
                            criteriaType: formData.criteriaType,
                            threshold: formData.threshold,
                        },
                    },
                });
            } else {
                await createBadge({
                    variables: {
                        input: {
                            name: formData.name,
                            description: formData.description,
                            icon: formData.icon,
                            criteriaType: formData.criteriaType,
                            threshold: formData.threshold,
                        },
                    },
                });
            }
            await refetch();
            setShowModal(false);
            toast.success(editingBadge ? "Cập nhật badge thành công" : "Tạo badge mới thành công");
        } catch (err: any) {
            toast.error(err.message || "Có lỗi xảy ra");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(badge: Badge) {
        setConfirmState({ open: true, badge });
    }

    async function executeDelete(badge: Badge) {
        try {
            await deleteBadge({ variables: { badgeId: badge.id } });
            await refetch();
            toast.success(`Đã xóa badge "${badge.name}"`);
        } catch (err: any) {
            toast.error(err.message || "Không thể xóa badge");
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Award className="h-6 w-6 text-amber-500" /> Quản lý Badge
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">{badges.length} badge trong hệ thống</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition-colors"
                >
                    <Plus className="h-4 w-4" /> Thêm Badge
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm badge..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                />
            </div>

            {/* Badge Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredBadges.map((badge) => (
                    <motion.div
                        key={badge.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200/60 text-2xl shrink-0">
                                {badge.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-slate-800 truncate">{badge.name}</h3>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{badge.description}</p>
                            </div>
                        </div>

                        {/* Dynamic criteria display */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60">
                                    {getCriteriaLabel(badge.criteriaType)}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono font-semibold border border-blue-200/60">
                                    ≥ {badge.threshold} {getCriteriaUnit(badge.criteriaType)}
                                </span>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-slate-400">
                            {badge.awardedCount} đã nhận
                            {badge.courseName && (
                                <span className="ml-2 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    📘 {badge.courseName}
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(badge)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-colors">
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDelete(badge)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredBadges.length === 0 && !loading && (
                <div className="text-center py-16 text-slate-400">
                    <Award className="mx-auto h-12 w-12 mb-3 opacity-40" />
                    <p>Chưa có badge nào{search ? " khớp với tìm kiếm" : ""}.</p>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900">
                                    {editingBadge ? "Chỉnh sửa Badge" : "Thêm Badge mới"}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                    <X className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên Badge</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                                        placeholder="VD: Bậc thầy hoàn thành"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                                        placeholder="VD: Hoàn thành 50 bài học"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
                                    <div className="flex flex-wrap gap-2">
                                        {ICON_OPTIONS.map((icon) => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, icon }))}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl border-2 transition-all ${formData.icon === icon
                                                    ? "border-emerald-500 bg-emerald-50 scale-110 shadow-sm"
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                                    }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ═══ Dynamic Criteria Section ═══ */}
                                <div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Loại tiêu chí</label>
                                        <select
                                            value={formData.criteriaType}
                                            onChange={(e) => setFormData(prev => ({ ...prev, criteriaType: e.target.value }))}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white"
                                        >
                                            {CRITERIA_TYPES.map(({ value, label }) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Con số mục tiêu ({getCriteriaUnit(formData.criteriaType)})
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min={1}
                                            value={formData.threshold}
                                            onChange={(e) => setFormData(prev => ({ ...prev, threshold: parseInt(e.target.value) || 1 }))}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                                            placeholder="VD: 50"
                                        />
                                    </div>

                                    {/* ═══ Preview Label ═══ */}
                                    <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 p-3">
                                        <p className="text-xs font-medium text-emerald-800">
                                            📋 Preview: Người dùng cần đạt{" "}
                                            <span className="font-bold text-emerald-900">{formData.threshold}</span>{" "}
                                            <span className="font-bold text-emerald-900">{getCriteriaUnit(formData.criteriaType)}</span>{" "}
                                            để nhận badge này.
                                        </p>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                                    >
                                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {editingBadge ? "Lưu thay đổi" : "Tạo Badge"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmDialog
                open={confirmState.open}
                title="Xóa Badge"
                description={`Bạn có chắc muốn xóa badge "${confirmState.badge?.name}"? Chỉ xóa được nếu chưa có học viên nào sở hữu.`}
                confirmText="Xóa"
                danger
                onConfirm={() => confirmState.badge && executeDelete(confirmState.badge)}
                onCancel={() => setConfirmState({ open: false, badge: null })}
            />
        </div>
    );
}
