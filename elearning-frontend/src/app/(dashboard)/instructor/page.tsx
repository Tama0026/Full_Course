"use client";
import { useState } from "react";

import { useQuery, useMutation } from "@apollo/client/react";
import {
    BarChart3, BookOpen, DollarSign, Edit3, Eye, EyeOff,
    Loader2, Plus, Users, TrendingUp, CheckCircle2,
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell,
} from "recharts";
import { cn, formatPrice } from "@/lib/utils";
import { GET_MY_COURSES, GET_INSTRUCTOR_STATS, TOGGLE_COURSE_STATUS } from "@/lib/graphql/course";
import Link from "next/link";
import { toast } from "sonner";

/* ─── Custom Recharts Tooltip ─── */
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl text-sm">
            <p className="font-semibold text-slate-800 mb-1 max-w-[180px] truncate">{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} style={{ color: p.fill }} className="font-medium">
                    {p.name}: <span className="text-slate-900">{p.value}{p.dataKey === "completionRate" || p.dataKey === "avgQuizScore" ? "%" : ""}</span>
                </p>
            ))}
        </div>
    );
}

const BAR_COLORS = ["#6d28d9", "#4f46e5", "#7c3aed", "#5b21b6", "#4338ca"];

export default function InstructorDashboard() {
    const [activeTab, setActiveTab] = useState<"overview" | "courses" | "analytics">("overview");

    const { data: coursesData, loading: coursesLoading, error: coursesError } = useQuery<any>(GET_MY_COURSES, {
        fetchPolicy: "network-only",
    });
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
                    <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">Dashboard Giảng viên</h1>
                    <p className="mt-1 text-slate-500">Quản lý khóa học và theo dõi hiệu suất.</p>
                </div>
                <Link
                    href="/instructor/courses/create"
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4" /> Tạo khóa học
                </Link>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: "overview", label: "Tổng quan" },
                        { id: "courses", label: "Khóa học" },
                        { id: "analytics", label: "Phân tích" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                                activeTab === tab.id
                                    ? "border-violet-600 text-violet-600"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab: Tổng quan */}
            {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid gap-4 sm:grid-cols-4">
                        {[
                            {
                                icon: DollarSign, label: "Doanh thu", value: formatPrice(stats?.totalRevenue ?? 0),
                                gradient: "from-violet-600 to-indigo-600", textColor: "text-white", subColor: "text-violet-100",
                            },
                            {
                                icon: Users, label: "Học viên", value: stats?.totalStudents ?? 0,
                                gradient: "from-white to-white", textColor: "text-slate-900", subColor: "text-slate-500",
                                iconBg: "bg-violet-100", iconColor: "text-violet-600",
                            },
                            {
                                icon: BookOpen, label: "Khóa học", value: stats?.totalCourses ?? 0,
                                gradient: "from-white to-white", textColor: "text-slate-900", subColor: "text-slate-500",
                                iconBg: "bg-indigo-100", iconColor: "text-indigo-600",
                            },
                            {
                                icon: TrendingUp, label: "Tỷ lệ hoàn thành", value: `${stats?.avgCompletionRate ?? 0}%`,
                                gradient: "from-white to-white", textColor: "text-slate-900", subColor: "text-slate-500",
                                iconBg: "bg-emerald-100", iconColor: "text-emerald-600",
                            },
                        ].map(({ icon: Icon, label, value, gradient, textColor, subColor, iconBg, iconColor }) => (
                            <div key={label} className={cn("rounded-xl border border-slate-200 bg-gradient-to-br p-5 shadow-sm", gradient)}>
                                <div className={cn("mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg", iconBg || "bg-white/20")}>
                                    <Icon className={cn("h-5 w-5", iconColor || "text-white")} />
                                </div>
                                <p className={cn("text-2xl font-bold font-sans", textColor)}>{value}</p>
                                <p className={cn("text-sm mt-0.5", subColor)}>{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab: Phân tích */}
            {activeTab === "analytics" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {breakdown.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center text-slate-500">
                            Chưa có dữ liệu phân tích.
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Students per course */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-violet-500" /> Học viên theo khóa học
                                </h2>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={breakdown} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="title"
                                            tick={{ fontSize: 11, fill: "#64748b" }}
                                            tickFormatter={(v) => v.length > 16 ? v.slice(0, 14) + "…" : v}
                                        />
                                        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey="studentCount" name="Học viên" radius={[6, 6, 0, 0]}>
                                            {breakdown.map((_: any, i: number) => (
                                                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Completion rate per course */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-emerald-500" /> Tỷ lệ hoàn thành theo khóa học
                                </h2>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={breakdown} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="title"
                                            tick={{ fontSize: 11, fill: "#64748b" }}
                                            tickFormatter={(v) => v.length > 16 ? v.slice(0, 14) + "…" : v}
                                        />
                                        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={[0, 100]} unit="%" />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey="completionRate" name="Hoàn thành" radius={[6, 6, 0, 0]}>
                                            {breakdown.map((d: any, i: number) => (
                                                <Cell key={i} fill={d.completionRate >= 70 ? "#10b981" : d.completionRate >= 40 ? "#6366f1" : "#f59e0b"} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Khóa học */}
            {activeTab === "courses" && (
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
                                        <div className="flex items-center gap-2 shrink-0">
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
            )}
        </div>
    );
}

