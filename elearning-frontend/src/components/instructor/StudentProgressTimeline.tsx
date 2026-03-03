"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, CalendarDays } from "lucide-react";

type TimelineItem = {
    lessonTitle: string;
    chapterTitle: string;
    completedAt: string;
};

export default function StudentProgressTimeline({
    isOpen,
    onClose,
    studentName,
    timeline,
}: {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    timeline: TimelineItem[];
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        Tiến độ học tập: <span className="text-indigo-600">{studentName}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-6">
                    {timeline.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                            <Clock className="h-10 w-10 text-slate-300 mb-3" />
                            <p>Học viên chưa hoàn thành bài học nào.</p>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-indigo-100 ml-4 py-2 space-y-6">
                            {timeline.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.3 }}
                                    className="relative pl-6"
                                >
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[11px] top-1.5 h-5 w-5 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center shadow-sm">
                                        <CheckCircle2 className="h-3 w-3 text-indigo-500" />
                                    </div>

                                    {/* Content */}
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-indigo-200 transition-colors shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1">
                                                    {item.chapterTitle}
                                                </p>
                                                <h4 className="text-sm font-bold text-slate-800 leading-tight">
                                                    {item.lessonTitle}
                                                </h4>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-1.5 text-xs text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                                                <CalendarDays className="h-3 w-3" />
                                                <span>
                                                    {format(new Date(item.completedAt), "HH:mm - dd/MM/yyyy")}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-400">
                                            {formatDistanceToNow(new Date(item.completedAt), { addSuffix: true, locale: vi })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
