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
import { GET_INSTRUCTOR_STATS } from "@/lib/graphql/course";
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

    const { data: statsData, loading: statsLoading, error: statsError } = useQuery<any>(GET_INSTRUCTOR_STATS, {
        fetchPolicy: "network-only",
    });

    const stats = statsData?.instructorStats;
    const breakdown: any[] = stats?.courseBreakdown || [];

    const loading = statsLoading;

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
        );
    }

    if (statsError) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
                Có lỗi xảy ra: {statsError.message}
            </div>
        );
    }

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

        </div>
    );
}

