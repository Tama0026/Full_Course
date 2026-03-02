"use client";

import { useRef } from "react";
import {
    ArrowRight,
    BookOpen,
    GraduationCap,
    PlayCircle,
    Shield,
    Star,
    TrendingUp,
    Users,
    Sparkles,
    Zap,
} from "lucide-react";
import { motion, useInView, type Variants } from "framer-motion";
import Link from "next/link";

/* ── Framer Motion Variants ── */
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
};

const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/* ── Animated Counter Hook ── */
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const [count, setCount] = __useState(0);

    __useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const step = Math.max(1, Math.ceil(target / 60));
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 20);
        return () => clearInterval(timer);
    }, [isInView, target]);

    return <span ref={ref}>{isInView ? `${count.toLocaleString("vi-VN")}${suffix}` : "0"}</span>;
}

import { useState as __useState, useEffect as __useEffect } from "react";

const STATS = [
    { icon: Users, value: 10000, suffix: "+", label: "Học viên" },
    { icon: BookOpen, value: 200, suffix: "+", label: "Khóa học" },
    { icon: GraduationCap, value: 50, suffix: "+", label: "Giảng viên" },
    { icon: Star, value: 4.8, suffix: "", label: "Đánh giá TB", isDecimal: true },
];

const WHY_US = [
    {
        icon: PlayCircle,
        title: "Video chất lượng cao",
        desc: "Bài giảng được quay với chất lượng 4K, âm thanh rõ ràng, dễ theo dõi.",
        gradient: "from-blue-500 to-cyan-400",
    },
    {
        icon: Shield,
        title: "Chứng chỉ hoàn thành",
        desc: "Nhận chứng chỉ được công nhận sau khi hoàn thành khóa học.",
        gradient: "from-violet-500 to-purple-400",
    },
    {
        icon: Sparkles,
        title: "AI Tutor thông minh",
        desc: "Hỗ trợ giải đáp thắc mắc 24/7 với trợ lý AI được tích hợp sẵn.",
        gradient: "from-amber-500 to-orange-400",
    },
];

/* ────────────────────────────────────────────────────────
   Homepage — Client Component for Framer Motion
   ──────────────────────────────────────────────────────── */

interface HomePageClientProps {
    featuredCourses: any[];
}

export default function HomePageClient({ featuredCourses }: HomePageClientProps) {
    return (
        <>
            {/* ════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 text-white">
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/20 blur-[120px]" />
                <div className="pointer-events-none absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-[100px]" />
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-primary-500/10 blur-[80px]" />

                <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32 lg:px-8 lg:py-40">
                    <motion.div
                        className="mx-auto max-w-3xl text-center"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        {/* Badge */}
                        <motion.div variants={fadeInUp}>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-5 py-2 text-sm font-medium text-indigo-200">
                                <Zap className="h-4 w-4 text-amber-400" />
                                Nền tảng học trực tuyến #1 Việt Nam
                            </span>
                        </motion.div>

                        {/* Heading */}
                        <motion.h1
                            variants={fadeInUp}
                            className="mt-8 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]"
                        >
                            Nâng tầm kỹ năng với{" "}
                            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                                khóa học trực tuyến
                            </span>{" "}
                            chất lượng cao
                        </motion.h1>

                        {/* Subheading */}
                        <motion.p
                            variants={fadeInUp}
                            className="mt-6 text-lg leading-relaxed text-slate-300 sm:text-xl"
                        >
                            Khám phá hàng trăm khóa học từ các giảng viên hàng đầu. Học mọi
                            lúc, mọi nơi với video bài giảng chất lượng cao và chứng chỉ hoàn
                            thành.
                        </motion.p>

                        {/* CTA buttons with Glassmorphism */}
                        <motion.div
                            variants={fadeInUp}
                            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                        >
                            <Link
                                href="/courses"
                                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-4 text-base font-semibold text-white shadow-[0_8px_32px_rgba(99,102,241,0.4)] transition-all hover:shadow-[0_12px_40px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Khám phá khóa học
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/20 hover:-translate-y-0.5"
                            >
                                <PlayCircle className="h-5 w-5 text-violet-300" />
                                Học thử miễn phí
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Stats row — animated counters */}
                    <motion.div
                        className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        {STATS.map(({ icon: Icon, value, suffix, label, isDecimal }) => (
                            <motion.div key={label} variants={scaleIn} className="text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm text-indigo-300">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <p className="text-2xl font-bold text-white">
                                    {isDecimal ? `${value}` : <AnimatedNumber target={value} suffix={suffix} />}
                                </p>
                                <p className="text-sm text-slate-400">{label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
          FEATURED COURSES
          ════════════════════════════════════════════════ */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    {/* Section header */}
                    <motion.div
                        className="text-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                        variants={fadeInUp}
                    >
                        <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700 mb-4">
                            <TrendingUp className="h-3.5 w-3.5" /> Trending
                        </span>
                        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                            Khóa học nổi bật
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
                            Được chọn lọc bởi đội ngũ chuyên gia, được đánh giá cao bởi hàng
                            ngàn học viên.
                        </p>
                    </motion.div>

                    {/* Course grid */}
                    <motion.div
                        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px" }}
                        variants={staggerContainer}
                    >
                        {featuredCourses.length > 0 ? (
                            featuredCourses.map((course: any) => (
                                <motion.div key={course.id} variants={scaleIn}>
                                    <Link
                                        href={`/courses/${course.id}`}
                                        className="group flex flex-col h-full rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary-200"
                                    >
                                        <div className="mb-4 aspect-video w-full rounded-xl bg-gradient-to-br from-primary-100 via-indigo-50 to-violet-100 flex items-center justify-center">
                                            <BookOpen className="h-10 w-10 text-primary-300 group-hover:text-primary-500 transition-colors" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-primary-700 transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                                            {course.description}
                                        </p>
                                        <div className="mt-auto pt-4 flex items-center justify-between">
                                            <span className="text-xs text-slate-400">
                                                {course.lessonCount} bài học
                                            </span>
                                            <span className="text-sm font-bold text-primary-600">
                                                {course.price > 0
                                                    ? `${course.price.toLocaleString("vi-VN")}₫`
                                                    : "Miễn phí"}
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-10 text-center text-slate-500">
                                Chưa có khóa học nổi bật nào
                            </div>
                        )}
                    </motion.div>

                    {/* View all link */}
                    <motion.div
                        className="mt-12 text-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <Link
                            href="/courses"
                            className="group inline-flex items-center gap-2 text-base font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            Xem tất cả khóa học
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
          WHY US SECTION
          ════════════════════════════════════════════════ */}
            <section className="py-20 lg:py-28 bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    <motion.div
                        className="text-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                        variants={fadeInUp}
                    >
                        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                            Tại sao chọn E-Learning?
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
                            Chúng tôi cam kết mang đến trải nghiệm học tập tốt nhất.
                        </p>
                    </motion.div>

                    <motion.div
                        className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px" }}
                        variants={staggerContainer}
                    >
                        {WHY_US.map(({ icon: Icon, title, desc, gradient }) => (
                            <motion.div
                                key={title}
                                variants={fadeInUp}
                                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1"
                            >
                                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                    {desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
          CTA BANNER
          ════════════════════════════════════════════════ */}
            <section className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    <motion.div
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-8 py-16 text-center text-white shadow-2xl sm:px-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px" }}
                        variants={scaleIn}
                    >
                        {/* Decorative inner glow */}
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

                        <div className="relative">
                            <h2 className="text-3xl font-bold sm:text-4xl">
                                Sẵn sàng bắt đầu học?
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
                                Đăng ký miễn phí ngay hôm nay và nhận quyền truy cập vào các khóa
                                học miễn phí đầu tiên.
                            </p>
                            <Link
                                href="/register"
                                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-violet-700 shadow-lg transition-all hover:bg-violet-50 hover:-translate-y-0.5 hover:shadow-xl"
                            >
                                Đăng ký miễn phí
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
