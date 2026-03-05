"use client";

import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/hooks/useAuth";
import { GET_MY_ENROLLMENTS } from "@/lib/graphql/learning";
import { GET_STUDENT_ASSESSMENTS_WITH_ATTEMPTS } from "@/lib/graphql/assessment";
import Link from "next/link";
import {
    BookOpen,
    ClipboardList,
    Trophy,
    TrendingUp,
    Clock,
    PlayCircle,
    Loader2,
    GraduationCap,
    ArrowRight,
    Sparkles,
    Award,
    BarChart3,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";

/* ── Framer Motion Variants ── */
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

/* ── Helpers ── */
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
}

/* ── Stat Card Component ── */
function StatCard({
    icon: Icon,
    label,
    value,
    gradient,
    href,
}: {
    icon: any;
    label: string;
    value: string | number;
    gradient: string;
    href?: string;
}) {
    const card = (
        <motion.div
            variants={scaleIn}
            className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-lg transition-all duration-300 group cursor-pointer"
        >
            <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-500 font-medium">{label}</p>
                </div>
            </div>
        </motion.div>
    );

    if (href) return <Link href={href}>{card}</Link>;
    return card;
}

/* ────────────────────────────────────────────────────────
   Dashboard Home Page — /dashboard
   ──────────────────────────────────────────────────────── */

export default function DashboardHomePage() {
    const { user, isLoading: authLoading } = useAuth();

    const { data: enrollData, loading: enrollLoading } = useQuery<any>(GET_MY_ENROLLMENTS, {
        fetchPolicy: "cache-and-network",
        skip: user?.role !== "STUDENT",
    });

    const { data: assessData, loading: assessLoading } = useQuery<any>(GET_STUDENT_ASSESSMENTS_WITH_ATTEMPTS, {
        fetchPolicy: "cache-and-network",
        skip: user?.role !== "STUDENT",
    });

    if (authLoading || enrollLoading || assessLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // ── Courses stats ──
    const enrollments = enrollData?.myEnrollments || [];
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter((e: any) => {
        const allLessons = e.course?.sections?.flatMap((s: any) => s.lessons) || [];
        const completedLessons = e.progresses?.length || 0;
        return allLessons.length > 0 && completedLessons >= allLessons.length;
    }).length;

    // ── Assessment stats ──
    const assessments = assessData?.assessments || [];
    const allAttempts = assessments.flatMap((a: any) => a.attempts || []);
    const averageScore =
        allAttempts.length > 0
            ? Math.round(allAttempts.reduce((sum: number, att: any) => sum + (att.score || 0), 0) / allAttempts.length)
            : 0;
    const pendingExams = assessments.filter((a: any) => {
        const hasAttempt = a.attempts && a.attempts.length > 0;
        return !hasAttempt && a.isActive;
    }).length;

    // ── Recent courses for quick access ──
    const recentCourses = enrollments.slice(0, 3).map((e: any) => {
        const allLessons = e.course?.sections?.flatMap((s: any) => s.lessons) || [];
        const completedCount = e.progresses?.length || 0;
        const pct = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
        const completedIds = new Set(e.progresses?.map((p: any) => p.lessonId));
        const sortedL = [...allLessons].sort((a: any, b: any) => a.order - b.order);
        const nextLesson = sortedL.find((l: any) => !completedIds.has(l.id)) || sortedL[sortedL.length - 1];
        return {
            id: e.course.id,
            title: e.course.title,
            thumbnail: e.course.thumbnail,
            pct,
            nextLessonUrl: nextLesson
                ? `/courses/${e.course.id}/lessons/${nextLesson.id}`
                : `/courses/${e.course.id}`,
        };
    });

    return (
        <div className="max-w-6xl mx-auto">
            {/* ═══ Welcome Banner ═══ */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-8 mb-8 text-white shadow-xl"
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
                <div className="relative flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-5 w-5 text-amber-300" />
                            <span className="text-sm font-medium text-indigo-200">{getGreeting()}</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold">
                            {user?.name || user?.email?.split("@")[0] || "Bạn"}
                        </h1>
                        <p className="mt-2 text-indigo-200 text-sm max-w-md">
                            Tiếp tục hành trình học tập và chinh phục mục tiêu của bạn.
                        </p>
                    </div>
                    <Link
                        href="/explore"
                        className="inline-flex items-center gap-2 rounded-2xl bg-white/20 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white hover:bg-white/30 transition-all"
                    >
                        Xem tất cả khóa học
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </motion.div>

            {/* ═══ Stats Grid ═══ */}
            <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
            >
                <StatCard
                    icon={BookOpen}
                    label="Khóa học đã đăng ký"
                    value={totalCourses}
                    gradient="from-blue-500 to-cyan-400"
                    href="/student"
                />
                <StatCard
                    icon={Trophy}
                    label="Khóa học hoàn thành"
                    value={completedCourses}
                    gradient="from-emerald-500 to-teal-400"
                    href="/student"
                />
                <StatCard
                    icon={BarChart3}
                    label="Điểm TB kỳ thi"
                    value={allAttempts.length > 0 ? `${averageScore}%` : "—"}
                    gradient="from-amber-500 to-orange-400"
                    href="/exams"
                />
                <StatCard
                    icon={ClipboardList}
                    label="Kỳ thi chưa làm"
                    value={pendingExams}
                    gradient="from-violet-500 to-purple-400"
                    href="/exams"
                />
            </motion.div>

            {/* ═══ Recent Courses ═══ */}
            {recentCourses.length > 0 && (
                <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-indigo-500" />
                            Tiếp tục học
                        </h2>
                        <Link href="/explore" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <motion.div
                        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        {recentCourses.map((course: any) => (
                            <motion.div key={course.id} variants={scaleIn}>
                                <Link
                                    href={course.nextLessonUrl}
                                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-lg transition-all"
                                >
                                    <div className="mb-4 aspect-video w-full rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 via-indigo-50 to-violet-100 flex items-center justify-center">
                                        {course.thumbnail ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <BookOpen className="h-10 w-10 text-primary-300" />
                                        )}
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                                        {course.title}
                                    </h3>
                                    <div className="mt-auto pt-3">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-medium text-slate-500">Tiến độ</span>
                                            <span className="text-xs font-bold text-indigo-600">{course.pct}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${course.pct === 100 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-indigo-500 to-violet-500"}`}
                                                style={{ width: `${course.pct}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors">
                                        <PlayCircle className="h-4 w-4" />
                                        {course.pct === 100 ? "Xem lại" : "Tiếp tục"}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            )}

            {/* ═══ Upcoming Exams Quick Link ═══ */}
            {pendingExams > 0 && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    className="mt-8"
                >
                    <Link
                        href="/exams"
                        className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-5 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 text-white shadow-lg">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">
                                    Bạn có {pendingExams} kỳ thi chưa làm
                                </p>
                                <p className="text-xs text-slate-500">Nhấn để xem danh sách kỳ thi</p>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
