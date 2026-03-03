"use client";
import { useQuery, useMutation } from "@apollo/client/react";
import { BookOpen, DollarSign, Edit3, Eye, EyeOff, Loader2, Plus, Users, CheckCircle2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { GET_MY_COURSES, GET_INSTRUCTOR_STATS, TOGGLE_COURSE_STATUS } from "@/lib/graphql/course";
import Link from "next/link";
import { toast } from "sonner";

export default function InstructorCoursesPage() {
    const { data: coursesData, loading: coursesLoading, error: coursesError } = useQuery<any>(GET_MY_COURSES, {
        fetchPolicy: "network-only",
    });

    // We fetch stats as well to show the breakdown of completion inside the course items
    const { data: statsData, loading: statsLoading } = useQuery<any>(GET_INSTRUCTOR_STATS, {
        fetchPolicy: "network-only",
    });

    const [toggleCourseStatus, { loading: toggling }] = useMutation(TOGGLE_COURSE_STATUS, {
        refetchQueries: [{ query: GET_MY_COURSES }],
    });

    const courses = coursesData?.myCourses || [];
    const stats = statsData?.instructorStats;
    const breakdown: any[] = stats?.courseBreakdown || [];

    const loading = coursesLoading || statsLoading;

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
        );
    }

    if (coursesError) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
                Có lỗi xảy ra: {coursesError.message}
            </div>
        );
    }

    const handleToggle = async (id: string) => {
        if (toggling) return;
        try {
            await toggleCourseStatus({ variables: { id } });
            toast.success("Đã cập nhật trạng thái khóa học.");
        } catch (e: any) {
            const msg = e?.graphQLErrors?.[0]?.message || e?.message || "Lỗi cập nhật trạng thái";
            toast.error(msg, { duration: 8000 });
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">Khóa học của bạn</h1>
                    <p className="mt-1 text-slate-500">Quản lý các khóa học đang giảng dạy.</p>
                </div>
                <Link
                    href="/instructor/courses/create"
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4" /> Tạo khóa học
                </Link>
            </div>

            {/* Courses List */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-3">
                    {courses.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center text-slate-500">
                            Bạn chưa có khóa học nào. Hãy tạo khóa học đầu tiên!
                        </div>
                    ) : courses.map((course: any) => {
                        const stat = breakdown.find((b: any) => b.courseId === course.id);
                        return (
                            <div key={course.id} className={cn("rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-sm", !course.isActive && "opacity-60")}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    {/* Thumbnail */}
                                    <div className="hidden sm:block h-16 w-28 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-50">
                                        {course.thumbnail ? (
                                            <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <BookOpen className="h-6 w-6 text-violet-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-base font-semibold text-slate-900 truncate">{course.title}</h3>
                                            <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                course.published ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                                            )}>
                                                {course.published ? "Công khai" : "Bản nháp"}
                                            </span>
                                            {!course.isActive && (
                                                <span className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200">Đã ẩn</span>
                                            )}
                                        </div>
                                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {formatPrice(course.price)}</span>
                                            <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {course.sections?.reduce((s: number, sec: any) => s + (sec.lessons?.length || 0), 0) || 0} bài học</span>
                                            {stat && (
                                                <>
                                                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {stat.studentCount} học viên</span>
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                        <span className={stat.completionRate >= 70 ? "text-emerald-600" : ""}>{stat.completionRate}% hoàn thành</span>
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                                        <Link
                                            href={`/instructor/courses/${course.id}/students`}
                                            className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                                        >
                                            <Users className="h-3.5 w-3.5" /> Học viên
                                        </Link>
                                        <Link
                                            href={`/instructor/courses/${course.id}/edit`}
                                            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                                        >
                                            <Edit3 className="h-3.5 w-3.5" /> Sửa
                                        </Link>
                                        <button
                                            onClick={() => handleToggle(course.id)}
                                            className={cn("flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors w-24 justify-center",
                                                course.isActive ? "border-amber-200 text-amber-700 hover:bg-amber-50" : "border-green-200 text-green-700 hover:bg-green-50"
                                            )}
                                        >
                                            {course.isActive ? <><EyeOff className="h-3.5 w-3.5" /> Ẩn</> : <><Eye className="h-3.5 w-3.5" /> Hiện</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
