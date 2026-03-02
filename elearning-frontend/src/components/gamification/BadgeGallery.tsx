"use client";

import { motion, type Variants } from "framer-motion";
import { Award, Info } from "lucide-react";
import { useState } from "react";

/* ── Framer Motion Variants ── */
const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const badgeVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
        opacity: 1, y: 0, scale: 1,
        transition: { type: "spring", stiffness: 260, damping: 20 },
    },
};

/* ── Criteria Label Map ── */
const CRITERIA_LABELS: Record<string, string> = {
    COMPLETE_1_LESSON: "Hoàn thành 1 bài học trong khóa",
    COMPLETE_3_LESSONS: "Hoàn thành 3 bài học trong khóa",
    COMPLETE_5_LESSONS: "Hoàn thành 5 bài học trong khóa",
    COMPLETE_10_LESSONS: "Hoàn thành 10 bài học trong khóa",
    COMPLETE_25_LESSONS: "Hoàn thành 25 bài học trong khóa",
    COMPLETE_1_COURSE: "Hoàn thành toàn bộ khóa học",
    COMPLETE_3_COURSES: "Hoàn thành 3 khóa học",
    REACH_100_POINTS: "Đạt 100 điểm tích lũy",
    REACH_500_POINTS: "Đạt 500 điểm tích lũy",
    REACH_1000_POINTS: "Đạt 1000 điểm tích lũy",
};

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    criteria: string;
}

interface BadgeGalleryProps {
    badges: Badge[];
}

export default function BadgeGallery({ badges }: BadgeGalleryProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    if (!badges || badges.length === 0) return null;

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Award className="h-6 w-6 text-amber-500" />
                Achievements You Can Earn
            </h2>
            <p className="text-sm text-slate-500 mb-6">
                Hoàn thành khóa học để nhận các huy hiệu đặc biệt!
            </p>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={containerVariants}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
                {badges.map((badge) => (
                    <motion.div
                        key={badge.id}
                        variants={badgeVariants}
                        onMouseEnter={() => setHoveredId(badge.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        whileHover={{ y: -6, scale: 1.03 }}
                        className="group relative cursor-default"
                    >
                        {/* Glassmorphism Card */}
                        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-5 shadow-lg transition-shadow duration-300 hover:shadow-2xl hover:border-amber-300/50">
                            {/* Gradient glow behind icon */}
                            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-2xl group-hover:from-amber-400/40 group-hover:to-orange-400/40 transition-all duration-500" />

                            <div className="relative z-10 flex items-start gap-3.5">
                                {/* Icon */}
                                <motion.div
                                    animate={hoveredId === badge.id ? { rotate: [0, -10, 10, -5, 0] } : {}}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200/60 text-2xl shadow-sm"
                                >
                                    {badge.icon}
                                </motion.div>

                                {/* Title + Criteria */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-slate-800 truncate">
                                        {badge.description || badge.name}
                                    </h3>
                                    <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                                        <Info className="h-3 w-3 shrink-0" />
                                        <span className="truncate">
                                            {CRITERIA_LABELS[badge.criteria] || badge.criteria}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tooltip on hover */}
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={hoveredId === badge.id ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="relative z-10 overflow-hidden"
                            >
                                <div className="mt-3 pt-3 border-t border-slate-200/60">
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        <span className="font-semibold text-amber-700">Điều kiện:</span>{" "}
                                        {CRITERIA_LABELS[badge.criteria] || badge.description}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
