"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Settings, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CourseNavProps {
    courseId: string;
    courseTitle: string;
}

export default function CourseNav({ courseId, courseTitle }: CourseNavProps) {
    const pathname = usePathname();

    const tabs = [
        {
            name: "Chung",
            href: `/instructor/courses/${courseId}/edit`,
            icon: BookOpen,
        },
        {
            name: "Học viên",
            href: `/instructor/courses/${courseId}/students`,
            icon: Users,
        },
        {
            name: "Cài đặt",
            href: `#`,
            icon: Settings,
            isComingSoon: true,
        },
    ];

    const handleComingSoon = (e: React.MouseEvent) => {
        e.preventDefault();
        toast.info("Tính năng đang phát triển", {
            description: "Tính năng cài đặt nâng cao sẽ sớm ra mắt trong các bản cập nhật tới.",
        });
    };

    return (
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 lg:px-8">
                {/* Header Information */}
                <div className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <Link
                        href="/instructor/courses"
                        className="inline-flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-0.5">
                            <span className="uppercase tracking-wider text-xs font-bold text-violet-600">Quản lý khóa học</span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 truncate">
                            {courseTitle || "Đang tải..."}
                        </h1>
                    </div>
                </div>

                {/* Tab Navigation - Scrollable on mobile */}
                <div className="flex overflow-x-auto hide-scrollbar">
                    <nav className="flex space-x-2 pb-0 flex-nowrap" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.href;
                            const Icon = tab.icon;

                            return tab.isComingSoon ? (
                                <button
                                    key={tab.name}
                                    onClick={handleComingSoon}
                                    className="relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-lg"
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.name}
                                </button>
                            ) : (
                                <Link
                                    key={tab.name}
                                    href={tab.href as string}
                                    className={cn(
                                        "relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors rounded-t-lg",
                                        isActive
                                            ? "text-blue-700 bg-blue-50/50"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "")} />
                                    {tab.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}
