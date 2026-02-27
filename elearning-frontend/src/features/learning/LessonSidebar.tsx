"use client";

import { useState } from "react";
import {
    ChevronRight,
    Menu,
    X,
    PlayCircle,
    CheckCircle2,
    Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────
   Types — mirroring backend schema
   ──────────────────────────────────────────────────────── */

interface Lesson {
    id: string;
    title: string;
    order: number;
    videoUrl: string;
}

interface Section {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

interface LessonSidebarProps {
    courseTitle: string;
    sections: Section[];
    activeLessonId?: string;
    completedLessonIds?: Set<string>;
    onLessonSelect?: (lessonId: string) => void;
    className?: string;
}

/* ────────────────────────────────────────────────────────
   Section Accordion Item
   ──────────────────────────────────────────────────────── */

function SectionItem({
    section,
    activeLessonId,
    completedLessonIds = new Set(),
    onLessonSelect,
}: {
    section: Section;
    activeLessonId?: string;
    completedLessonIds?: Set<string>;
    onLessonSelect?: (lessonId: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(
        section.lessons.some((l) => l.id === activeLessonId)
    );

    const completedCount = section.lessons.filter((l) =>
        completedLessonIds.has(l.id)
    ).length;

    return (
        <div className="border-b border-slate-200 last:border-b-0">
            {/* Section header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                        {section.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {completedCount}/{section.lessons.length} bài học
                    </p>
                </div>
                <ChevronRight
                    className={cn(
                        "ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                        isOpen && "rotate-90"
                    )}
                />
            </button>

            {/* Lesson list */}
            <div
                className={cn(
                    "overflow-hidden transition-all duration-200",
                    isOpen ? "max-h-[2000px]" : "max-h-0"
                )}
            >
                <ul className="pb-2">
                    {section.lessons
                        .sort((a, b) => a.order - b.order)
                        .map((lesson) => {
                            const isActive = lesson.id === activeLessonId;
                            const isCompleted = completedLessonIds.has(lesson.id);

                            return (
                                <li key={lesson.id}>
                                    <button
                                        onClick={() => onLessonSelect?.(lesson.id)}
                                        className={cn(
                                            "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                                            isActive
                                                ? "bg-primary-50 text-primary-700 font-medium border-l-2 border-primary-600"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                                        ) : isActive ? (
                                            <PlayCircle className="h-4 w-4 shrink-0 text-primary-600" />
                                        ) : (
                                            <PlayCircle className="h-4 w-4 shrink-0 text-slate-400" />
                                        )}
                                        <span className="truncate">{lesson.title}</span>
                                    </button>
                                </li>
                            );
                        })}
                </ul>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────
   Lesson Sidebar Component
   ──────────────────────────────────────────────────────── */

export function LessonSidebar({
    courseTitle,
    sections,
    activeLessonId,
    completedLessonIds = new Set(),
    onLessonSelect,
    className,
}: LessonSidebarProps) {
    return (
        <div className={cn("flex h-full flex-col bg-white", className)}>
            {/* Sidebar header */}
            <div className="border-b border-slate-200 px-4 py-4">
                <h2 className="text-sm font-bold text-slate-900 line-clamp-2">
                    {courseTitle}
                </h2>
            </div>

            {/* Scrollable section/lesson tree */}
            <div className="flex-1 overflow-y-auto">
                {sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                        <SectionItem
                            key={section.id}
                            section={section}
                            activeLessonId={activeLessonId}
                            completedLessonIds={completedLessonIds}
                            onLessonSelect={onLessonSelect}
                        />
                    ))}
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────
   Mobile Sidebar Drawer
   ──────────────────────────────────────────────────────── */

export function MobileSidebarTrigger({
    courseTitle,
    sections,
    activeLessonId,
    completedLessonIds,
    onLessonSelect,
}: LessonSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Hamburger button — visible on mobile only */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors lg:hidden"
                aria-label="Mở danh sách bài học"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-out drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] transform bg-white shadow-2xl transition-transform duration-300 lg:hidden",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Close button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute right-3 top-3 z-10 rounded-md p-1 text-slate-400 hover:text-slate-600"
                    aria-label="Đóng"
                >
                    <X className="h-5 w-5" />
                </button>

                <LessonSidebar
                    courseTitle={courseTitle}
                    sections={sections}
                    activeLessonId={activeLessonId}
                    completedLessonIds={completedLessonIds}
                    onLessonSelect={(id) => {
                        onLessonSelect?.(id);
                        setIsOpen(false);
                    }}
                />
            </div>
        </>
    );
}
