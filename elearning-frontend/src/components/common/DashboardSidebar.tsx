"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BookOpen, Award, User, LogOut,
    GraduationCap, ChevronRight, Home, Bot,
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/student", icon: BookOpen, label: "Khóa học của tôi" },
    { href: "/student/achievements", icon: Award, label: "Thành tựu" },
    { href: "/certificates", icon: Award, label: "Chứng chỉ" },
    { href: "/interview", icon: Bot, label: "AI Phỏng vấn" },
    { href: "/profile", icon: User, label: "Hồ sơ" },
];

export default function DashboardSidebar() {
    const pathname = usePathname();

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
    }

    return (
        <aside className="flex flex-col w-64 min-h-screen bg-white border-r border-slate-100 shadow-sm">
            {/* Logo — click để về trang chủ */}
            <Link
                href="/"
                className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 hover:bg-slate-50 transition-colors group"
            >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900 leading-none">E-Learning</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Học mọi lúc, mọi nơi</p>
                </div>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-0.5">
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                    // Exact match for /student, otherwise startswith for subpages (if added later)
                    const isActive = href === "/student"
                        ? pathname === href
                        : pathname.startsWith(href) && href !== "/dashboard";
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-700 shadow-sm"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <Icon
                                className={`w-4 h-4 flex-shrink-0 ${isActive
                                    ? "text-blue-600"
                                    : "text-slate-400 group-hover:text-slate-600"
                                    }`}
                            />
                            <span className="flex-1">{label}</span>
                            {isActive && (
                                <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                >
                    <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
}
