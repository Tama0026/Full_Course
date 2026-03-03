"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LogOut, GraduationCap, ChevronRight, LayoutDashboard,
    Award, FolderTree, BookOpen, Shield,
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/admin", icon: LayoutDashboard, label: "Tổng quan", exact: true },
    { href: "/admin/badges", icon: Award, label: "Quản lý Badge", exact: false },
    { href: "/admin/categories", icon: FolderTree, label: "Danh mục", exact: false },
    { href: "/admin/courses", icon: BookOpen, label: "Tất cả khóa học", exact: false },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
    }

    return (
        <aside className="flex flex-col w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10 group">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/20 shadow-md group-hover:bg-emerald-500/30 transition-colors">
                    <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <p className="text-sm font-bold text-white leading-none">E-Learning</p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">Admin Console</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
                    const isActive = exact ? pathname === href : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-emerald-500/20 text-emerald-300 shadow-sm"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                            <span className="flex-1">{label}</span>
                            {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-500/60" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 space-y-1 border-t border-white/10">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                >
                    <GraduationCap className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                    Về trang chủ
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 group"
                >
                    <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400" />
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
}
