"use client";

import { useQuery } from "@apollo/client/react";
import { Trophy, Medal, Crown, Star } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { GET_TOP_STUDENTS } from "@/lib/graphql/gamification";

/* ── Framer Motion Variants ── */
const slideIn: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: "easeOut", delay: i * 0.08 },
    }),
};

const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ── Rank Icon ── */
function RankIcon({ rank }: { rank: number }) {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-slate-400">#{rank}</span>;
}

/* ── Rank Badge Gradient ── */
function getRankStyle(rank: number) {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border-yellow-300/50";
    if (rank === 2) return "bg-gradient-to-r from-slate-200/40 to-slate-300/30 border-slate-300/50";
    if (rank === 3) return "bg-gradient-to-r from-amber-200/30 to-orange-200/20 border-amber-300/40";
    return "bg-white border-slate-200";
}

/* ────────────────────────────────────────────────────────
   Leaderboard Component
   ──────────────────────────────────────────────────────── */

interface LeaderboardProps {
    /** "compact" for homepage, "full" for dashboard */
    variant?: "compact" | "full";
    limit?: number;
}

export default function Leaderboard({ variant = "full", limit = 10 }: LeaderboardProps) {
    const { data, loading } = useQuery<any>(GET_TOP_STUDENTS, {
        variables: { limit },
        fetchPolicy: "cache-and-network",
    });

    const students = data?.topStudents || [];

    if (loading && students.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400 text-sm">
                Chưa có dữ liệu bảng xếp hạng.
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            className={variant === "compact" ? "" : "rounded-2xl border border-slate-200 bg-white overflow-hidden"}
        >
            {/* Header */}
            <div className={`flex items-center gap-3 ${variant === "compact" ? "mb-4" : "p-5 pb-3"}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
                    <Trophy className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Bảng xếp hạng</h3>
                    <p className="text-xs text-slate-500">Top {limit} học viên xuất sắc nhất</p>
                </div>
            </div>

            {/* Student List */}
            <div className={variant === "compact" ? "space-y-2" : "px-4 pb-4 space-y-2"}>
                {students.map((student: any, index: number) => (
                    <motion.div
                        key={student.id}
                        custom={index}
                        variants={slideIn}
                        initial="hidden"
                        animate="visible"
                        className={`flex items-center gap-3 rounded-xl border p-3 transition-all hover:shadow-md hover:-translate-y-0.5 ${getRankStyle(student.rank)}`}
                    >
                        {/* Rank */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                            <RankIcon rank={student.rank} />
                        </div>

                        {/* Avatar */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-sm">
                            {student.userAvatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={student.userAvatar} alt="" className="h-full w-full rounded-full object-cover" />
                            ) : (
                                (student.userName?.[0] || "?").toUpperCase()
                            )}
                        </div>

                        {/* Name */}
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                                {student.userName || "Ẩn danh"}
                            </p>
                        </div>

                        {/* Points */}
                        <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5">
                            <Star className="h-3.5 w-3.5 text-indigo-500" />
                            <span className="text-sm font-bold text-indigo-700">
                                {student.totalPoints.toLocaleString("vi-VN")}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
