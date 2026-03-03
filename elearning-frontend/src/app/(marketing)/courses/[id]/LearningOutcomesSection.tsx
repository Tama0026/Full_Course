"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, GraduationCap } from "lucide-react";

interface Props {
    outcomes: string[];
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function LearningOutcomesSection({ outcomes }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    if (!outcomes || outcomes.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-primary-600" />
                    Bạn sẽ học được gì?
                </h2>
                <p className="text-sm text-slate-400 italic">
                    Mục tiêu học tập đang được cập nhật...
                </p>
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary-600" />
                Bạn sẽ học được gì?
            </h2>

            <motion.div
                className="grid gap-3 sm:grid-cols-2 text-sm text-slate-600"
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            >
                {outcomes.map((item, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        className="flex items-start gap-2.5"
                    >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        <span>{item}</span>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
