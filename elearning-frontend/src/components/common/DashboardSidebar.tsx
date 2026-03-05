"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
    BookOpen,
    Award,
    User,
    LogOut,
    GraduationCap,
    ChevronRight,
    LayoutDashboard,
    Plus,
    ClipboardList,
    Database,
    Bot,
    Trophy,
    FileText,
    Loader2,
    Home,
} from "lucide-react";

/* ── Navigation items per role ── */

const STUDENT_NAV = [
    { href: "/dashboard", icon: Home, label: "Dashboard", exact: true },
    { href: "/explore", icon: GraduationCap, label: "Khám phá", exact: false },
    { href: "/student", icon: BookOpen, label: "Khóa học của tôi", exact: true },
    { href: "/exams", icon: ClipboardList, label: "Kỳ thi", exact: false },
    { href: "/student/achievements", icon: Trophy, label: "Thành tựu", exact: false },
    { href: "/certificates", icon: Award, label: "Chứng chỉ", exact: false },
    { href: "/interview", icon: Bot, label: "AI Phỏng vấn", exact: false },
    { href: "/profile", icon: User, label: "Hồ sơ", exact: false },
];

const INSTRUCTOR_NAV = [
    { href: "/instructor", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { href: "/instructor/courses", icon: BookOpen, label: "Quản lý khóa học", exact: true },
    { href: "/instructor/assessments", icon: ClipboardList, label: "Kỳ thi độc lập", exact: false },
    { href: "/instructor/question-bank", icon: Database, label: "Ngân hàng đề thi", exact: false },
    { href: "/instructor/badges", icon: Award, label: "Quản lý Badge", exact: false },
];

const ADMIN_NAV = [
    { href: "/admin", icon: LayoutDashboard, label: "Admin Dashboard", exact: true },
    { href: "/admin/categories", icon: Database, label: "Quản lý danh mục", exact: false },
    { href: "/admin/courses", icon: BookOpen, label: "Quản lý khóa học", exact: false },
    { href: "/admin/badges", icon: Award, label: "Hệ thống Huy hiệu", exact: false },
];

/**
 * Unified sidebar for the Dashboard layout.
 * Uses useAuth() (TanStack Query) to show role-specific navigation.
 * Active state is driven by usePathname().
 */
export default function DashboardSidebar() {
    const pathname = usePathname();
    const { user, isLoading, logout } = useAuth();

    // Choose items based on role
    const navItems = (() => {
        if (user?.role === "ADMIN") return ADMIN_NAV;
        if (user?.role === "INSTRUCTOR") return INSTRUCTOR_NAV;
        return STUDENT_NAV;
    })();

    const isInstructorOrAdmin = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

    // Gradient style per role
    const sidebarClass = isInstructorOrAdmin
        ? "bg-gradient-to-b from-violet-950 to-indigo-900"
        : "bg-white border-r border-slate-100";

    const textPrimary = isInstructorOrAdmin ? "text-white" : "text-slate-900";
    const textSecondary = isInstructorOrAdmin ? "text-violet-200" : "text-slate-600";
    const textMuted = isInstructorOrAdmin ? "text-violet-300" : "text-slate-400";
    const activeClass = isInstructorOrAdmin
        ? "bg-white/20 text-white shadow-sm"
        : "bg-blue-50 text-blue-700 shadow-sm";
    const hoverClass = isInstructorOrAdmin
        ? "hover:bg-white/10 hover:text-white"
        : "hover:bg-slate-50 hover:text-slate-900";
    const activeIconClass = isInstructorOrAdmin ? "text-white" : "text-blue-600";
    const inactiveIconClass = isInstructorOrAdmin
        ? "text-violet-300 group-hover:text-white"
        : "text-slate-400 group-hover:text-slate-600";
    const chevronClass = isInstructorOrAdmin ? "text-violet-300" : "text-blue-400";
    const borderClass = isInstructorOrAdmin ? "border-white/10" : "border-slate-100";
    const logoutHover = isInstructorOrAdmin
        ? "hover:bg-red-500/20 hover:text-red-300"
        : "hover:bg-red-50 hover:text-red-600";
    const logoutIcon = isInstructorOrAdmin
        ? "text-violet-300 group-hover:text-red-300"
        : "text-slate-400 group-hover:text-red-500";

    const subtitle = (() => {
        if (user?.role === "ADMIN") return "Admin Panel";
        if (user?.role === "INSTRUCTOR") return "Instructor Studio";
        return "Học mọi lúc, mọi nơi";
    })();

    if (isLoading) {
        return (
            <aside className="flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-100 shrink-0 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </aside>
        );
    }

    return (
        <aside className={`flex flex-col w-64 h-screen sticky top-0 shadow-sm shrink-0 ${sidebarClass}`}>
            {/* Logo */}
            <Link
                href={isInstructorOrAdmin ? "/" : "/"}
                className={`flex items-center gap-3 px-6 py-5 border-b ${borderClass} group transition-colors`}
            >
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${isInstructorOrAdmin ? "bg-white/15 shadow-md group-hover:bg-white/25" : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md group-hover:scale-105"} transition-all`}>
                    <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className={`text-sm font-bold ${textPrimary} leading-none`}>E-Learning</p>
                    <p className={`text-[10px] ${textMuted} mt-0.5`}>{subtitle}</p>
                </div>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map(({ href, icon: Icon, label, exact }) => {
                    const isActive = exact ? pathname === href : pathname.startsWith(href);
                    return (
                        <Link
                            key={href + label}
                            href={href}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? activeClass : `${textSecondary} ${hoverClass}`}`}
                        >
                            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? activeIconClass : inactiveIconClass}`} />
                            <span className="flex-1">{label}</span>
                            {isActive && <ChevronRight className={`w-3.5 h-3.5 ${chevronClass}`} />}
                        </Link>
                    );
                })}

                {/* Instructor shortcut: Create Course */}
                {user?.role === "INSTRUCTOR" && (
                    <Link
                        href="/instructor/courses/create"
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${textSecondary} ${hoverClass} transition-all duration-200`}
                    >
                        <Plus className={`w-4 h-4 flex-shrink-0 ${inactiveIconClass}`} />
                        <span className="flex-1">Tạo khóa học</span>
                    </Link>
                )}
            </nav>

            {/* User info & Logout */}
            <div className={`px-3 py-4 space-y-1 border-t ${borderClass}`}>
                {user && (
                    <div className={`px-3 py-2 mb-1 text-xs ${textMuted} truncate`}>
                        {user.name || user.email}
                    </div>
                )}
                <button
                    onClick={logout}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${textSecondary} ${logoutHover} transition-all duration-200 group`}
                >
                    <LogOut className={`w-4 h-4 ${logoutIcon}`} />
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
}
