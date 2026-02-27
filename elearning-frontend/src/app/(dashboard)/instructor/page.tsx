"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import {
    BarChart3,
    BookOpen,
    DollarSign,
    Edit3,
    Eye,
    EyeOff,
    Loader2,
    Plus,
    Users,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { GET_MY_COURSES, GET_INSTRUCTOR_STATS, TOGGLE_COURSE_STATUS } from "@/lib/graphql/course";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InstructorDashboard() {
    const router = useRouter();
    const { data: coursesData, loading: coursesLoading, error: coursesError } = useQuery<any>(GET_MY_COURSES, {
        fetchPolicy: "network-only",
    });

    const { data: statsData, loading: statsLoading } = useQuery<any>(GET_INSTRUCTOR_STATS, {
        fetchPolicy: "network-only",
    });

    const [toggleCourseStatus, { loading: toggling }] = useMutation(TOGGLE_COURSE_STATUS, {
        refetchQueries: [{ query: GET_MY_COURSES }],
    });

    if (coursesLoading || statsLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
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

    const courses = coursesData?.myCourses || [];
    const stats = statsData?.instructorStats || {
        totalRevenue: 0,
        totalStudents: 0,
        avgCompletionRate: 0,
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        if (toggling) return;
        try {
            await toggleCourseStatus({ variables: { id } });
        } catch (e: any) {
            alert(e?.message || "Lỗi cập nhật trạng thái");
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                        Dashboard Giảng viên
                    </h1>
                    <p className="mt-1 text-slate-500">Quản lý khóa học và theo dõi hiệu suất.</p>
                </div>
                <Link
                    href="/instructor/courses/create"
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                >
                    <Plus className="h-4 w-4" /> Tạo khóa học
                </Link>
            </div>

            {/* Analytics cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-primary-200 bg-gradient-to-br from-primary-600 to-primary-700 p-5 text-white shadow-sm">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                        <DollarSign className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-bold font-sans">{formatPrice(stats.totalRevenue)}</p>
                    <p className="text-sm text-primary-100">Tổng doanh thu</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                        <Users className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 font-sans">{stats.totalStudents}</p>
                    <p className="text-sm text-slate-500">Tổng học viên đăng ký</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <BarChart3 className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 font-sans">{stats.avgCompletionRate}%</p>
                    <p className="text-sm text-slate-500">Tỷ lệ hoàn thành TB</p>
                </div>
            </div>

            {/* Course management list */}
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Danh sách Khóa học</h2>
            <div className="space-y-4">
                {courses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center text-slate-500">
                        Bạn chưa có khóa học nào. Hãy tạo khóa học đầu tiên!
                    </div>
                ) : courses.map((course: any) => (
                    <div key={course.id} className={cn("rounded-xl border border-slate-200 bg-white p-5 transition-all", !course.isActive && "opacity-60")}>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            {/* Course info */}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-semibold text-slate-900 truncate">{course.title}</h3>
                                    <span
                                        className={cn(
                                            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                                            course.published
                                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                : "bg-slate-100 text-slate-600 border border-slate-200"
                                        )}
                                    >
                                        {course.published ? "Công khai" : "Bản nháp"}
                                    </span>
                                    {!course.isActive && (
                                        <span className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                            Đã ẩn
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {formatPrice(course.price)}</span>
                                    <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {course.sections?.reduce((s: number, sec: any) => s + (sec.lessons?.length || 0), 0) || 0} bài học</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <Link
                                    href={`/instructor/courses/${course.id}/edit`}
                                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <Edit3 className="h-3.5 w-3.5" /> Sửa
                                </Link>
                                <button
                                    onClick={() => handleToggle(course.id, course.isActive)}
                                    className={cn(
                                        "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors w-24 justify-center",
                                        course.isActive
                                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                            : "border-green-200 text-green-700 hover:bg-green-50"
                                    )}
                                >
                                    {course.isActive ? (
                                        <><EyeOff className="h-3.5 w-3.5" /> Ẩn</>
                                    ) : (
                                        <><Eye className="h-3.5 w-3.5" /> Hiện</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
