"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
    BookOpen,
    Clock,
    GraduationCap,
    PlayCircle,
    Search,
    Trophy,
    Loader2,
    Award,
    Download,
    TrendingUp,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GET_MY_ENROLLMENTS, CLAIM_CERTIFICATE } from "@/lib/graphql/learning";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { motion, type Variants } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

/* ── Framer Motion Variants ── */
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const staggerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
};

/* ── Helpers ── */
function timeAgo(dateString: string) {
    const msFilter = Date.now() - new Date(dateString).getTime();
    if (msFilter < 0) return "Vừa xong";
    const minutes = Math.floor(msFilter / 60000);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
}

/* ── Donut Progress Chart ── */
function ProgressDonut({ percentage }: { percentage: number }) {
    const data = [
        { name: "Completed", value: percentage },
        { name: "Remaining", value: 100 - percentage },
    ];
    const COLORS = ["#6366f1", "#e2e8f0"];

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: 140, height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={65}
                        startAngle={90}
                        endAngle={-270}
                        cornerRadius={6}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Hoàn thành</span>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────
   Student Dashboard
   ──────────────────────────────────────────────────────── */

export default function StudentDashboard() {
    const [search, setSearch] = useState("");
    const [certModalOpen, setCertModalOpen] = useState(false);
    const [selectedCertUrl, setSelectedCertUrl] = useState<string | null>(null);

    const { data, loading, error } = useQuery<any>(GET_MY_ENROLLMENTS, {
        fetchPolicy: "network-only",
    });

    const [claimCertificate, { loading: claiming }] = useMutation(CLAIM_CERTIFICATE);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
                Có lỗi xảy ra: {error.message}
            </div>
        );
    }

    const enrollments = data?.myEnrollments || [];

    const processedCourses = enrollments.map((enrollment: any) => {
        const course = enrollment.course;
        const allLessons = course.sections?.flatMap((s: any) => s.lessons) || [];
        const totalLessons = allLessons.length;
        const completedLessons = enrollment.progresses?.length || 0;

        const completedIds = new Set(enrollment.progresses?.map((p: any) => p.lessonId));
        const sortedLessons = allLessons.sort((a: any, b: any) => a.order - b.order);
        const unwatchedLesson = sortedLessons.find((l: any) => !completedIds.has(l.id));
        const lastLesson = unwatchedLesson || sortedLessons[sortedLessons.length - 1];

        return {
            id: course.id,
            title: course.title,
            instructor: course.instructor?.email,
            totalLessons,
            completedLessons,
            lastLesson: lastLesson || null,
            isFinished: enrollment.isFinished,
        };
    });

    const filtered = processedCourses.filter((c: any) =>
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    const totalCourses = processedCourses.length;
    const completedCourses = processedCourses.filter(
        (c: any) => c.totalLessons > 0 && c.completedLessons === c.totalLessons
    ).length;
    const totalLessonsCompleted = processedCourses.reduce((s: number, c: any) => s + c.completedLessons, 0);
    const totalLessonsAll = processedCourses.reduce((s: number, c: any) => s + c.totalLessons, 0);
    const overallPct = totalLessonsAll > 0 ? Math.round((totalLessonsCompleted / totalLessonsAll) * 100) : 0;

    const allProgresses: any[] = [];
    enrollments.forEach((enrollment: any) => {
        const allLessons = enrollment.course.sections?.flatMap((s: any) => s.lessons) || [];
        enrollment.progresses?.forEach((p: any) => {
            const lesson = allLessons.find((l: any) => l.id === p.lessonId);
            allProgresses.push({
                courseId: enrollment.course.id,
                courseName: enrollment.course.title,
                lessonId: p.lessonId,
                lessonTitle: lesson?.title || "Bài học",
                completedAt: p.completedAt,
            });
        });
    });

    allProgresses.sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    const recentActivity = allProgresses.slice(0, 5);

    const handleClaimCert = async (courseId: string) => {
        try {
            const res = await claimCertificate({ variables: { courseId } });
            const certUrl = (res.data as any)?.claimCertificate?.certificateUrl;
            if (certUrl) {
                setSelectedCertUrl(certUrl);
                setCertModalOpen(true);
            }
        } catch (err: any) {
            alert("Lỗi nhận chứng chỉ: " + err.message);
        }
    };

    return (
        <div>
            {/* ═══ Overview Header ═══ */}
            <motion.div
                className="mb-8 flex flex-col lg:flex-row lg:items-center gap-6"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
            >
                {/* Left: Greeting + Donut */}
                <motion.div
                    variants={fadeInUp}
                    className="flex items-center gap-6 flex-1"
                >
                    <ProgressDonut percentage={overallPct} />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                            Xin chào! 👋
                        </h1>
                        <p className="mt-1 text-slate-500">
                            Tiếp tục hành trình học tập của bạn.
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-sm text-indigo-600 font-medium">
                            <TrendingUp className="h-4 w-4" />
                            {totalLessonsCompleted} / {totalLessonsAll} bài học hoàn thành
                        </div>
                    </div>
                </motion.div>

                {/* Right: Stats cards */}
                <motion.div
                    className="grid grid-cols-3 gap-3"
                    variants={staggerContainer}
                >
                    {[
                        { icon: BookOpen, label: "Khóa học", value: totalCourses, gradient: "from-blue-500 to-cyan-400" },
                        { icon: Trophy, label: "Hoàn thành", value: completedCourses, gradient: "from-emerald-500 to-teal-400" },
                        { icon: GraduationCap, label: "Bài đã học", value: totalLessonsCompleted, gradient: "from-amber-500 to-orange-400" },
                    ].map(({ icon: Icon, label, value, gradient }) => (
                        <motion.div
                            key={label}
                            variants={scaleIn}
                            className="rounded-xl border border-slate-200 bg-white p-4 text-center hover:shadow-md transition-shadow"
                        >
                            <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{value}</p>
                            <p className="text-xs text-slate-500">{label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            {/* ═══ Search ═══ */}
            <div className="mb-6 flex items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-900">Khóa học của tôi</h2>
                <div className="relative ml-auto w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm khóa học..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>
            </div>

            {/* ═══ Course Grid — Animated ═══ */}
            <motion.div
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-10"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
            >
                {filtered.map((course: any) => {
                    const pct = course.totalLessons > 0 ? Math.round((course.completedLessons / course.totalLessons) * 100) : 0;
                    const isComplete = course.totalLessons > 0 && pct === 100;

                    const targetLessonUrl = course.lastLesson
                        ? `/courses/${course.id}/lessons/${course.lastLesson.id}`
                        : `/courses/${course.id}`;

                    return (
                        <motion.div
                            key={course.id}
                            variants={scaleIn}
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-lg"
                        >
                            <div className="mb-4 aspect-video w-full rounded-xl bg-gradient-to-br from-primary-100 via-indigo-50 to-violet-100 flex items-center justify-center">
                                <BookOpen className="h-10 w-10 text-primary-300" />
                            </div>

                            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-primary-700 transition-colors">
                                {course.title}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">{course.instructor || "Không rõ giảng viên"}</p>

                            <div className="mt-auto pt-4">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium text-slate-600">
                                        {course.completedLessons}/{course.totalLessons} bài học
                                    </span>
                                    <span className={cn("text-xs font-bold", isComplete ? "text-emerald-600" : "text-indigo-600")}>
                                        {pct}%
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                    <motion.div
                                        className={cn(
                                            "h-full rounded-full",
                                            isComplete
                                                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                                : "bg-gradient-to-r from-indigo-500 to-violet-500"
                                        )}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                                {course.isFinished && (
                                    <button
                                        onClick={() => handleClaimCert(course.id)}
                                        disabled={claiming}
                                        className="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                                    >
                                        {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                                        Xem / Tải Chứng Chỉ
                                    </button>
                                )}
                                <a
                                    href={targetLessonUrl}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all bg-slate-50"
                                >
                                    {isComplete ? <Trophy className="h-4 w-4 text-emerald-600" /> : <PlayCircle className="h-4 w-4" />}
                                    {isComplete ? "Xem lại khóa học" : "Tiếp tục học"}
                                </a>
                            </div>
                        </motion.div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="col-span-full py-10 text-center text-slate-500">
                        Chưa có khóa học nào hoặc không tìm thấy.
                    </div>
                )}
            </motion.div>

            {/* ═══ Recent Activity ═══ */}
            {recentActivity.length > 0 && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                >
                    <h2 className="mb-4 text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-500" /> Hoạt động gần đây
                    </h2>
                    <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
                        {recentActivity.map((activity: any, i: number) => (
                            <a
                                key={i}
                                href={`/courses/${activity.courseId}/lessons/${activity.lessonId}`}
                                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
                                    <PlayCircle className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-800 truncate">{activity.lessonTitle}</p>
                                    <p className="text-xs text-slate-500">{activity.courseName}</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
                                    <Clock className="h-3.5 w-3.5" />
                                    {timeAgo(activity.completedAt)}
                                </div>
                            </a>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* ═══ Certificate Modal ═══ */}
            <Dialog open={certModalOpen} onOpenChange={setCertModalOpen}>
                <DialogContent className="max-w-4xl p-6 md:p-8 bg-zinc-900 border-zinc-800 text-white rounded-2xl shadow-2xl">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="flex justify-between items-center text-xl font-bold text-yellow-400">
                            <span>🎉 Chúc mừng bạn đã hoàn thành khóa học!</span>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedCertUrl && (
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative w-full aspect-[1.4/1] bg-black/50 rounded-lg overflow-hidden border border-zinc-700 shadow-xl flex justify-center items-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={selectedCertUrl}
                                    alt="Chứng chỉ hoàn thành khóa học"
                                    className="object-contain max-w-full max-h-full"
                                />
                            </div>

                            <a
                                href={selectedCertUrl.replace('/upload/', '/upload/fl_attachment/')}
                                download="Certificate.jpg"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                            >
                                <Download className="h-5 w-5" />
                                Tải Xuống Chứng Chỉ
                            </a>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
