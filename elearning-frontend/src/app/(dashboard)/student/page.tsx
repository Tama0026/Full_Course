"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GET_MY_ENROLLMENTS, CLAIM_CERTIFICATE } from "@/lib/graphql/learning";
import { useMutation } from "@apollo/client/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
            {/* Header greeting */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                    Xin chào! 👋
                </h1>
                <p className="mt-1 text-slate-500">
                    Tiếp tục hành trình học tập của bạn.
                </p>
            </div>

            {/* Stats row */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
                {[
                    { icon: BookOpen, label: "Khóa học", value: totalCourses, color: "bg-primary-100 text-primary-600" },
                    { icon: Trophy, label: "Hoàn thành", value: completedCourses, color: "bg-green-100 text-green-600" },
                    { icon: GraduationCap, label: "Bài học đã học", value: totalLessonsCompleted, color: "bg-amber-100 text-amber-600" },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className={cn("mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg", color)}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{value}</p>
                        <p className="text-sm text-slate-500">{label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="mb-6 flex items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-900">Khóa học của tôi</h2>
                <div className="relative ml-auto w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm khóa học..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>
            </div>

            {/* Course grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-10">
                {filtered.map((course: any) => {
                    const pct = course.totalLessons > 0 ? Math.round((course.completedLessons / course.totalLessons) * 100) : 0;
                    const isComplete = course.totalLessons > 0 && pct === 100;

                    const targetLessonUrl = course.lastLesson
                        ? `/courses/${course.id}/lessons/${course.lastLesson.id}`
                        : `/courses/${course.id}`;

                    return (
                        <div
                            key={course.id}
                            className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
                        >
                            <div className="mb-4 aspect-video w-full rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
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
                                    <span className={cn("text-xs font-bold", isComplete ? "text-green-600" : "text-primary-600")}>
                                        {pct}%
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            isComplete ? "bg-green-500" : "bg-primary-600"
                                        )}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                                {course.isFinished && (
                                    <button
                                        onClick={() => handleClaimCert(course.id)}
                                        disabled={claiming}
                                        className="flex items-center justify-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-100 transition-colors"
                                    >
                                        {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                                        Xem / Tải Chứng Chỉ
                                    </button>
                                )}
                                <a
                                    href={targetLessonUrl}
                                    className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors bg-slate-50"
                                >
                                    {isComplete ? <Trophy className="h-4 w-4 text-green-600" /> : <PlayCircle className="h-4 w-4" />}
                                    {isComplete ? "Xem lại khóa học" : "Tiếp tục học"}
                                </a>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="col-span-full py-10 text-center text-slate-500">
                        Chưa có khóa học nào hoặc không tìm thấy.
                    </div>
                )}
            </div>

            {/* Recent activity */}
            {recentActivity.length > 0 && (
                <div>
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Hoạt động gần đây</h2>
                    <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                        {recentActivity.map((activity, i) => (
                            <a
                                key={i}
                                href={`/courses/${activity.courseId}/lessons/${activity.lessonId}`}
                                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
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
                </div>
            )}

            {/* Certificate Modal Using Base UI Dialog */}
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
