"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ADMIN_STATS } from "@/lib/graphql/admin";
import { motion, type Variants } from "framer-motion";
import { Users, BookOpen, GraduationCap, Award, UserCheck, Briefcase, Loader2 } from "lucide-react";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
};

const STAT_CARDS = [
    { key: "totalUsers", label: "Tổng người dùng", icon: Users, color: "from-blue-500 to-indigo-600", bg: "bg-blue-50", text: "text-blue-600" },
    { key: "totalStudents", label: "Học viên", icon: UserCheck, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", text: "text-emerald-600" },
    { key: "totalInstructors", label: "Giảng viên", icon: Briefcase, color: "from-violet-500 to-purple-600", bg: "bg-violet-50", text: "text-violet-600" },
    { key: "totalCourses", label: "Khóa học", icon: BookOpen, color: "from-amber-500 to-orange-600", bg: "bg-amber-50", text: "text-amber-600" },
    { key: "totalEnrollments", label: "Lượt đăng ký", icon: GraduationCap, color: "from-rose-500 to-pink-600", bg: "bg-rose-50", text: "text-rose-600" },
    { key: "totalBadges", label: "Huy hiệu", icon: Award, color: "from-cyan-500 to-sky-600", bg: "bg-cyan-50", text: "text-cyan-600" },
];

export default function AdminOverviewPage() {
    const { data, loading } = useQuery<any>(GET_ADMIN_STATS, { fetchPolicy: "cache-and-network" });
    const stats = data?.adminStats;

    if (loading && !stats) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-2">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Tổng quan hệ thống E-Learning</p>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
                {STAT_CARDS.map(({ key, label, icon: Icon, bg, text }) => (
                    <motion.div
                        key={key}
                        variants={cardVariants}
                        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="absolute -right-4 -top-4 opacity-5 transition-transform group-hover:scale-110">
                            <Icon className="h-28 w-28" />
                        </div>
                        <div className="relative z-10 flex items-center gap-4">
                            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${bg} ${text}`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{label}</p>
                                <p className="text-3xl font-bold text-slate-900">
                                    {stats?.[key]?.toLocaleString() ?? "—"}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
