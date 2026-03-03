"use client";

import { useQuery } from "@apollo/client/react";
import { GET_MY_ACHIEVEMENT_STATS, GET_ALL_BADGES_WITH_STATUS } from "@/lib/graphql/gamification";
import { Loader2, Trophy, Medal, Star, Target, Info, Download, Share2, Award } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useState, useRef } from "react";
import * as htmlToImage from "html-to-image";
import Image from "next/image";

/* ── Animation Variants ── */
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
};

const badgeVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 15 } },
};

/* ── Criteria Label Map ── */
const CRITERIA_LABELS: Record<string, string> = {
    COMPLETE_1_LESSON: "Hoàn thành 1 bài học",
    COMPLETE_3_LESSONS: "Hoàn thành 3 bài học",
    COMPLETE_5_LESSONS: "Hoàn thành 5 bài học",
    COMPLETE_10_LESSONS: "Hoàn thành 10 bài học",
    COMPLETE_25_LESSONS: "Hoàn thành 25 bài học",
    COMPLETE_1_COURSE: "Hoàn thành toàn bộ một khóa học",
    COMPLETE_3_COURSES: "Hoàn thành 3 khóa học",
    REACH_100_POINTS: "Đạt 100 điểm tích lũy",
    REACH_500_POINTS: "Đạt 500 điểm tích lũy",
    REACH_1000_POINTS: "Đạt 1000 điểm tích lũy",
};

export default function AchievementsPage() {
    const galleryRef = useRef<HTMLDivElement>(null);
    const [hoveredBadgeId, setHoveredBadgeId] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    // Fetch Stats
    const { data: statsData, loading: statsLoading } = useQuery<any>(GET_MY_ACHIEVEMENT_STATS, {
        fetchPolicy: "cache-and-network"
    });

    // Fetch All Badges
    const { data: badgesData, loading: badgesLoading } = useQuery<any>(GET_ALL_BADGES_WITH_STATUS, {
        fetchPolicy: "cache-and-network"
    });

    const stats = statsData?.myAchievementStats;
    const allBadges = badgesData?.allBadgesWithStatus || [];

    // Filter Badges
    const globalBadges = allBadges.filter((b: any) => !b.courseId);
    const courseBadges = allBadges.filter((b: any) => !!b.courseId);

    // Group course badges by course name
    const courseBadgesGrouped = courseBadges.reduce((acc: any, badge: any) => {
        const courseName = badge.courseName || "Khóa học khác";
        if (!acc[courseName]) acc[courseName] = [];
        acc[courseName].push(badge);
        return acc;
    }, {});

    const isLoading = statsLoading || badgesLoading;

    async function handleShare() {
        if (!galleryRef.current) return;
        setDownloading(true);
        try {
            // Wait a small tick to ensure all fonts/images are rendered
            await new Promise(res => setTimeout(res, 100));
            const dataUrl = await htmlToImage.toPng(galleryRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: "#f8fafc", // slate-50
                filter: (node) => node.id !== "download-btn",
            });
            const link = document.createElement("a");
            link.download = `Thanh-tuu-Elearning-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Lỗi khi tải ảnh:", error);
            alert("Không thể tải ảnh, vui lòng thử lại.");
        } finally {
            setDownloading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-8" ref={galleryRef}>
            {/* ═══ Header Section ═══ */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md bg-white">
                        {stats?.userAvatar ? (
                            <Image src={stats.userAvatar} alt="Avatar" width={64} height={64} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white uppercase">
                                {stats?.userName?.charAt(0) || "U"}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Thành tựu của tôi</h1>
                        <p className="text-sm text-slate-500">
                            {stats?.userName || "Học viên"} • Khám phá bộ sưu tập huy hiệu của bạn
                        </p>
                    </div>
                </div>

                <button
                    id="download-btn"
                    onClick={handleShare}
                    disabled={downloading}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Tải ảnh khoe thành tích
                </button>
            </div>

            {/* ═══ Stats Cards ═══ */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10"
            >
                <motion.div variants={cardVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-10 transition-transform group-hover:scale-110">
                        <Star className="h-24 w-24 text-amber-500" />
                    </div>
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="flex p-3 rounded-xl bg-amber-50 text-amber-600">
                            <Star className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Tổng điểm</p>
                            <p className="text-2xl font-bold text-slate-900">{stats?.totalPoints || 0}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={cardVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-10 transition-transform group-hover:scale-110">
                        <Trophy className="h-24 w-24 text-indigo-500" />
                    </div>
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="flex p-3 rounded-xl bg-indigo-50 text-indigo-600">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Xếp hạng Global</p>
                            <p className="text-2xl font-bold text-slate-900">#{stats?.globalRank || "-"}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={cardVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-10 transition-transform group-hover:scale-110">
                        <Target className="h-24 w-24 text-emerald-500" />
                    </div>
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="flex p-3 rounded-xl bg-emerald-50 text-emerald-600">
                            <Target className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Percentile (Top)</p>
                            <p className="text-2xl font-bold text-slate-900">{stats?.percentile ? `Top ${stats.percentile}%` : "Top 100%"}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={cardVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-10 transition-transform group-hover:scale-110">
                        <Medal className="h-24 w-24 text-rose-500" />
                    </div>
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="flex p-3 rounded-xl bg-rose-50 text-rose-600">
                            <Medal className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Huy hiệu đạt được</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {stats?.earnedBadges || 0} <span className="text-sm font-medium text-slate-400">/ {stats?.totalBadges || 0}</span>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* ═══ Global Badges ═══ */}
            <div className="mb-10">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Medal className="h-5 w-5 text-indigo-600" />
                    Huy hiệu hệ thống (Global)
                </h2>
                <BadgeGrid badges={globalBadges} hoveredBadgeId={hoveredBadgeId} setHoveredBadgeId={setHoveredBadgeId} downloading={downloading} />
            </div>

            {/* ═══ Course Badges ═══ */}
            {Object.keys(courseBadgesGrouped).length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-emerald-600" />
                        Huy hiệu khóa học
                    </h2>
                    <div className="space-y-8">
                        {Object.entries(courseBadgesGrouped).map(([courseName, badges]: [string, any]) => (
                            <div key={courseName} className="rounded-xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                                    {courseName}
                                </h3>
                                <BadgeGrid badges={badges} hoveredBadgeId={hoveredBadgeId} setHoveredBadgeId={setHoveredBadgeId} downloading={downloading} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {Object.keys(courseBadgesGrouped).length === 0 && (
                <div className="rounded-xl border border-slate-200 border-dashed bg-slate-50 py-12 text-center text-slate-500">
                    <Award className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p>Bạn chưa tham gia khóa học nào có cấp huy hiệu riêng.</p>
                </div>
            )}
        </div>
    );
}

function BadgeGrid({ badges, hoveredBadgeId, setHoveredBadgeId, downloading }: { badges: any[], hoveredBadgeId: string | null, setHoveredBadgeId: (id: string | null) => void, downloading: boolean }) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
            {badges.map((badge) => (
                <motion.div
                    key={badge.id}
                    variants={badgeVariants}
                    onMouseEnter={() => setHoveredBadgeId(badge.id)}
                    onMouseLeave={() => setHoveredBadgeId(null)}
                    className="relative cursor-default"
                >
                    <div className={`
                        flex flex-col items-center justify-center text-center p-4 rounded-2xl border transition-all duration-300 h-full
                        ${badge.earned
                            ? "bg-white border-amber-200 shadow-[0_4px_20px_-4px_rgba(251,191,36,0.2)] hover:shadow-[0_8px_30px_-4px_rgba(251,191,36,0.3)] hover:-translate-y-1"
                            : "bg-slate-50 border-slate-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                        }
                    `}>
                        {/* Glow effect for earned badges */}
                        {badge.earned && (
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/5 to-orange-400/5 pointer-events-none" />
                        )}

                        <div className={`
                            flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-3 shadow-inner
                            ${badge.earned ? "bg-gradient-to-br from-amber-100 to-orange-100" : "bg-slate-200"}
                        `}>
                            {badge.icon}
                        </div>

                        <h4 className={`text-sm font-bold mb-1 ${badge.earned ? "text-slate-800" : "text-slate-500"}`}>
                            {badge.name}
                        </h4>
                        <p className={`text-[10px] leading-snug ${badge.earned ? "text-slate-600" : "text-slate-400"}`}>
                            {badge.description}
                        </p>

                        {/* Lock / Unlock Icon */}
                        <div className="mt-3">
                            {badge.earned ? (
                                <div className="inline-flex items-center gap-1 bg-amber-100/50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-amber-200/50">
                                    <Star className="w-3 h-3 fill-amber-500 border-none" />
                                    <span>Đã đạt</span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-500">
                                    <Target className="w-3.5 h-3.5" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tooltip Overlay */}
                    {hoveredBadgeId === badge.id && (
                        <div className="absolute z-50 left-1/2 -bottom-2 translate-y-full -translate-x-1/2 w-48 bg-slate-900 border border-slate-700 text-white text-xs p-3 rounded-xl shadow-2xl pointer-events-none">
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-t border-l border-slate-700 rotate-45" />
                            <div className="relative z-10 space-y-1.5">
                                <p className="font-semibold text-amber-400">Điều kiện nhận:</p>
                                <p className="text-slate-300 leading-relaxed">
                                    {CRITERIA_LABELS[badge.criteria] || badge.description}
                                </p>
                                {badge.earned && badge.awardedAt && (
                                    <p className="text-[10px] text-slate-400 pt-1.5 mt-1.5 border-t border-slate-700 font-mono">
                                        {new Date(badge.awardedAt).toLocaleDateString('vi-VN')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            ))}
        </motion.div>
    );
}
