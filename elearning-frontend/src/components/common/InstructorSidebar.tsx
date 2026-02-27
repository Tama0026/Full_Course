"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    User, LogOut,
    GraduationCap, ChevronRight, Home, LayoutDashboard, Plus,
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/instructor", icon: LayoutDashboard, label: "Instructor Dashboard", exact: true },
];

export default function InstructorSidebar() {
    const pathname = usePathname();

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
    }

    return (
        <aside className="flex flex-col w-64 min-h-screen bg-gradient-to-b from-violet-950 to-indigo-900 shadow-2xl">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10 group">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 shadow-md group-hover:bg-white/25 transition-colors">
                    <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold text-white leading-none">E-Learning</p>
                    <p className="text-[10px] text-violet-300 mt-0.5">Instructor Studio</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-0.5">
                {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
                    const isActive = exact ? pathname === href : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-white/20 text-white shadow-sm"
                                : "text-violet-200 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-violet-300 group-hover:text-white"}`} />
                            <span className="flex-1">{label}</span>
                            {isActive && <ChevronRight className="w-3.5 h-3.5 text-violet-300" />}
                        </Link>
                    );
                })}

                {/* Shortcut: Tạo khóa học mới */}
                <Link
                    href="/instructor/courses/create"
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-violet-200 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                    <Plus className="w-4 h-4 flex-shrink-0 text-violet-300 group-hover:text-white" />
                    <span className="flex-1">Tạo khóa học</span>
                </Link>
            </nav>

            {/* Profile & Logout */}
            <div className="px-3 py-4 space-y-1 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-violet-200 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 group"
                >
                    <LogOut className="w-4 h-4 text-violet-300 group-hover:text-red-300" />
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
}
