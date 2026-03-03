"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
    Award, Plus, Trash2, Edit3, Loader2,
    Sparkles, Shield, BookOpen, X, Check, AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { GET_MY_COURSES } from "@/lib/graphql/course";
import {
    GET_MY_CREATED_BADGES,
    CREATE_COURSE_BADGE,
    UPDATE_COURSE_BADGE,
    DELETE_COURSE_BADGE,
} from "@/lib/graphql/gamification";

/* ── Framer Motion Variants ── */
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const staggerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

/* ── Emoji Picker (simple predefined set) ── */
const EMOJI_OPTIONS = [
    "🏅", "🌟", "📚", "🎯", "🏆", "🎓", "💎", "⭐", "🔥", "👑",
    "💡", "🚀", "💪", "🎖️", "✨", "🧠", "💻", "🎨", "📝", "🏄",
];

/* ── Criteria Templates ── */
const CRITERIA_TEMPLATES = [
    { label: "Hoàn thành 1 bài học", value: "COMPLETE_1_LESSON" },
    { label: "Hoàn thành 3 bài học", value: "COMPLETE_3_LESSONS" },
    { label: "Hoàn thành 5 bài học", value: "COMPLETE_5_LESSONS" },
    { label: "Hoàn thành 10 bài học", value: "COMPLETE_10_LESSONS" },
    { label: "Hoàn thành khóa học (1 course)", value: "COMPLETE_1_COURSE" },
    { label: "Đạt 100 điểm", value: "REACH_100_POINTS" },
    { label: "Đạt 500 điểm", value: "REACH_500_POINTS" },
];

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    criteria: string;
    courseId?: string;
    courseName?: string;
    creatorId: string;
    awardedCount?: number;
}

interface Course {
    id: string;
    title: string;
}

/* ────────────────────────────────────────────────────────
   INSTRUCTOR BADGES PAGE
   ──────────────────────────────────────────────────────── */

export default function InstructorBadgesPage() {
    const [showForm, setShowForm] = useState(false);
    const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form state
    const [formName, setFormName] = useState("");
    const [formDesc, setFormDesc] = useState("");
    const [formIcon, setFormIcon] = useState("🏅");
    const [formCriteria, setFormCriteria] = useState("");
    const [formCourseId, setFormCourseId] = useState("");

    // Queries
    const { data: badgesData, loading: badgesLoading, refetch: refetchBadges } = useQuery<any>(GET_MY_CREATED_BADGES, {
        fetchPolicy: "network-only",
    });
    const { data: coursesData } = useQuery<any>(GET_MY_COURSES);

    // Mutations
    const [createBadge, { loading: creating }] = useMutation(CREATE_COURSE_BADGE);
    const [updateBadge, { loading: updating }] = useMutation(UPDATE_COURSE_BADGE);
    const [deleteBadge] = useMutation(DELETE_COURSE_BADGE);

    const badges: Badge[] = badgesData?.myCreatedBadges || [];
    const courses: Course[] = coursesData?.myCourses || [];

    const resetForm = () => {
        setFormName("");
        setFormDesc("");
        setFormIcon("🏅");
        setFormCriteria("");
        setFormCourseId("");
        setEditingBadge(null);
        setShowForm(false);
    };

    const openEditForm = (badge: Badge) => {
        setFormName(badge.name);
        setFormDesc(badge.description);
        setFormIcon(badge.icon);
        setFormCriteria(badge.criteria);
        setFormCourseId(badge.courseId || "");
        setEditingBadge(badge);
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!formName.trim() || !formDesc.trim() || !formCriteria || !formCourseId) return;

        try {
            if (editingBadge) {
                await updateBadge({
                    variables: {
                        badgeId: editingBadge.id,
                        input: {
                            name: formName,
                            description: formDesc,
                            icon: formIcon,
                            criteria: formCriteria,
                        },
                    },
                });
            } else {
                await createBadge({
                    variables: {
                        input: {
                            name: formName,
                            description: formDesc,
                            icon: formIcon,
                            criteria: formCriteria,
                            courseId: formCourseId,
                        },
                    },
                });
            }
            resetForm();
            refetchBadges();
        } catch (err: any) {
            alert(err.message || "Lỗi khi lưu Badge");
        }
    };

    const handleDelete = async (badgeId: string) => {
        try {
            await deleteBadge({ variables: { badgeId } });
            setDeletingId(null);
            refetchBadges();
        } catch (err: any) {
            alert(err.message || "Lỗi khi xóa Badge");
            setDeletingId(null);
        }
    };

    // ── Loading ──
    if (badgesLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="flex items-center justify-between mb-8"
            >
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                        <Award className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Quản lý Badge</h1>
                        <p className="text-sm text-slate-500">Tạo và quản lý badge cho khóa học của bạn</p>
                    </div>
                </div>

                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                    <Plus className="h-4 w-4" />
                    Tạo Badge
                </button>
            </motion.div>

            {/* ── Create/Edit Form ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-8"
                    >
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-amber-500" />
                                    {editingBadge ? "Chỉnh sửa Badge" : "Tạo Badge mới"}
                                </h2>
                                <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-slate-100">
                                    <X className="h-4 w-4 text-slate-400" />
                                </button>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tên Badge</label>
                                    <input
                                        value={formName}
                                        onChange={e => setFormName(e.target.value)}
                                        placeholder="VD: Master JavaScript"
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all"
                                    />
                                </div>

                                {/* Course Selector */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Khóa học</label>
                                    <select
                                        value={formCourseId}
                                        onChange={e => setFormCourseId(e.target.value)}
                                        disabled={!!editingBadge}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Chọn khóa học...</option>
                                        {courses.map((c: Course) => (
                                            <option key={c.id} value={c.id}>{c.title}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mô tả</label>
                                    <input
                                        value={formDesc}
                                        onChange={e => setFormDesc(e.target.value)}
                                        placeholder="VD: Hoàn thành tất cả bài học JavaScript"
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all"
                                    />
                                </div>

                                {/* Criteria */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tiêu chí đạt Badge</label>
                                    <select
                                        value={formCriteria}
                                        onChange={e => setFormCriteria(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all"
                                    >
                                        <option value="">Chọn tiêu chí...</option>
                                        {CRITERIA_TEMPLATES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Icon Picker */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Icon</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {EMOJI_OPTIONS.map(emoji => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => setFormIcon(emoji)}
                                                className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${formIcon === emoji
                                                    ? "bg-violet-100 border-2 border-violet-500 scale-110 shadow-sm"
                                                    : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                                                    }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                                <button
                                    onClick={resetForm}
                                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={creating || updating || !formName.trim() || !formCriteria || !formCourseId}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {(creating || updating) ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                    {editingBadge ? "Cập nhật" : "Tạo Badge"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Badge List ── */}
            {badges.length === 0 ? (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 mb-6">
                        <Award className="h-10 w-10 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Chưa có Badge nào</h3>
                    <p className="text-sm text-slate-400 max-w-sm">
                        Tạo badge đầu tiên cho khóa học của bạn để khuyến khích học viên hoàn thành bài học.
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {badges.map((badge: Badge) => (
                        <motion.div
                            key={badge.id}
                            variants={fadeInUp}
                            className="group relative rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:shadow-lg hover:-translate-y-1"
                        >
                            {/* Badge Icon + Info */}
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-2xl shadow-sm">
                                    {badge.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 truncate">{badge.name}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{badge.description}</p>
                                </div>
                            </div>

                            {/* Meta */}
                            <div className="mt-4 flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
                                    <BookOpen className="h-3 w-3" />
                                    {badge.courseName || "N/A"}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                                    <Shield className="h-3 w-3" />
                                    {badge.criteria}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                    onClick={() => openEditForm(badge)}
                                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                                >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    Sửa
                                </button>
                                {deletingId === badge.id ? (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleDelete(badge.id)}
                                            className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                                        >
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            Xác nhận
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(null)}
                                            className="rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-100"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setDeletingId(badge.id)}
                                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Xóa
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* ── System Badges Info ── */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/50 p-5"
            >
                <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="text-sm font-semibold text-amber-800">Badge hệ thống (Global)</h4>
                        <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                            Ngoài các badge bạn tạo riêng cho từng khóa học, hệ thống còn có các badge toàn cục
                            (ví dụ: &quot;Hoàn thành 5 bài học&quot;, &quot;Đạt 100 điểm&quot;) được trao tự động dựa trên toàn bộ
                            hoạt động của học viên. Chỉ Admin mới có thể quản lý badge hệ thống.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
