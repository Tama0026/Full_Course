"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    PlayCircle,
    Menu,
    X,
    FileText,
    MessageSquare,
    StickyNote,
    BookOpen,
    Loader2,
    Lock,
    Award,
    Download,
    PartyPopper,
    Info,
} from "lucide-react";
import { useMutation, useQuery } from "@apollo/client/react";
import { cn } from "@/lib/utils";
import { triggerRainConfetti } from "@/lib/confetti";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Course, Lesson, Progress, Section } from "@/lib/graphql/types";
import { MARK_LESSON_COMPLETE, CLAIM_CERTIFICATE, UPDATE_VIDEO_PROGRESS, GET_VIDEO_PROGRESS } from "@/lib/graphql/learning";
import AiTutorWidget from "@/components/common/AiTutorWidget";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import DiscussionSection from "@/components/learning/DiscussionSection";
import NotesSection from "@/components/learning/NotesSection";
import LessonMarkdownRenderer from "@/components/learning/LessonMarkdownRenderer";
import QuizSection from "@/components/learning/QuizSection";
import dynamic from 'next/dynamic';

import ReactPlayerType from 'react-player';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

/* ────────────────────────────────────────────────────────
   Sidebar Section Item
   ──────────────────────────────────────────────────────── */
function SidebarSectionItem({
    section,
    activeLessonId,
    completedIds,
    onSelect,
}: {
    section: Section;
    activeLessonId: string;
    completedIds: Set<string>;
    onSelect: (id: string) => void;
}) {
    const [open, setOpen] = useState(
        section.lessons?.some((l) => l.id === activeLessonId) || false
    );
    const done = section.lessons?.filter((l) => completedIds.has(l.id)).length || 0;
    const total = section.lessons?.length || 0;

    return (
        <div className="border-b border-slate-200 last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
            >
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{section.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{done}/{total} bài học</p>
                </div>
                <ChevronRight className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-90")} />
            </button>
            <div className={cn("overflow-hidden transition-all duration-200", open ? "max-h-[2000px]" : "max-h-0")}>
                <ul className="pb-2">
                    {section.lessons?.slice().sort((a, b) => a.order - b.order).map((lesson) => {
                        const active = lesson.id === activeLessonId;
                        const completed = completedIds.has(lesson.id);
                        return (
                            <li key={lesson.id}>
                                <button
                                    onClick={() => {
                                        if (lesson.isLocked) {
                                            toast.info("🔒 Bài học này đã bị khóa. Vui lòng hoàn thành bài học trước bằng cách làm Quiz để mở khóa bài học này.");
                                            return;
                                        }
                                        onSelect(lesson.id);
                                    }}
                                    className={cn(
                                        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                                        active ? "bg-primary-50 text-primary-700 font-medium border-l-2 border-primary-600" : "text-slate-600 hover:bg-slate-50",
                                        lesson.isLocked && "opacity-60 cursor-not-allowed"
                                    )}
                                >
                                    {completed ? (
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                                    ) : lesson.isLocked ? (
                                        <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                                    ) : (
                                        <PlayCircle className={cn("h-4 w-4 shrink-0", active ? "text-primary-600" : "text-slate-400")} />
                                    )}
                                    <span className="truncate flex-1">{lesson.title}</span>
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
   Tab Content Components
   ──────────────────────────────────────────────────────── */
function TabOverview({ lesson }: { lesson: Lesson }) {
    const isVideo = lesson.type !== "DOCUMENT";

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-900">{lesson.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                    {lesson.type === 'DOCUMENT' ? 'Bài học dạng tài liệu' : 'Bài học dạng video'}
                </p>
            </div>

            {/* VIDEO type: show body as supplementary notes */}
            {isVideo && lesson.body ? (
                <LessonMarkdownRenderer body={lesson.body} title={lesson.title} />
            ) : isVideo && !lesson.body ? (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-6 text-center">
                    <BookOpen className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">Nội dung bài học đang được cập nhật...</p>
                </div>
            ) : (
                /* DOCUMENT type: body is already shown in the main area above */
                <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                    <p className="text-sm text-blue-700">
                        📖 Nội dung bài học đã được hiển thị ở phần chính phía trên.
                    </p>
                </div>
            )}
        </div>
    );
}

// TabNotes and TabDiscussion are now real components imported above

/* ────────────────────────────────────────────────────────
   CLIENT VIEW
   ──────────────────────────────────────────────────────── */

interface LessonClientViewProps {
    course: Course;
    lesson: Lesson;
    completedItems: Progress[];
    progressPercentage: number;
    currentUserId?: string;
}

export function LessonClientView({
    course,
    lesson: initialLesson,
    completedItems,
    progressPercentage: initialProgressPercentage,
    currentUserId,
}: LessonClientViewProps) {
    const router = useRouter();
    const playerRef = useRef<any>(null);
    const [videoReady, setVideoReady] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [activeLessonId, setActiveLessonId] = useState(initialLesson.id);

    // We maintain completed state on client to feel instantly responsive
    const [completedIds, setCompletedIds] = useState<Set<string>>(
        new Set(completedItems.map(p => p.lessonId))
    );
    const [progress, setProgress] = useState(initialProgressPercentage);

    const [activeTab, setActiveTab] = useState<"overview" | "notes" | "discussion">("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [marking, setMarking] = useState(false);

    // Certificate states
    const [certModalOpen, setCertModalOpen] = useState(false);
    const [certUrl, setCertUrl] = useState<string | null>(null);
    const [claimingCert, setClaimingCert] = useState(false);

    const [markComplete] = useMutation(MARK_LESSON_COMPLETE);
    const [claimCertificate] = useMutation(CLAIM_CERTIFICATE);
    const [saveVideoProgress] = useMutation<any>(UPDATE_VIDEO_PROGRESS);

    // Fetch saved video time for the current lesson
    const { data: videoProgressData } = useQuery<any>(GET_VIDEO_PROGRESS, {
        variables: { lessonId: activeLessonId },
        fetchPolicy: "network-only",
        skip: !activeLessonId,
    });

    // Seek to saved position when video is ready
    const savedCurrentTime: number = videoProgressData?.videoProgress?.currentTime ?? 0;

    // Save video progress every 10 seconds
    const progressSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (progressSaveIntervalRef.current) {
                clearInterval(progressSaveIntervalRef.current);
            }
        };
    }, []);

    // Flatten all lessons from sections
    const allLessons = course.sections?.flatMap(s => s.lessons || []) || [];

    // IMPORTANT: When the active lesson is the initial lesson (loaded via dedicated GET_LESSON query),
    // prefer initialLesson because it has the correctly resolved videoUrl.
    // The allLessons data from course sections may have a different videoUrl resolution.
    const activeLesson = activeLessonId === initialLesson.id
        ? initialLesson
        : (allLessons.find((l) => l.id === activeLessonId) || initialLesson);
    const currentIndex = allLessons.findIndex((l) => l.id === activeLessonId);

    const nextLesson = currentIndex !== -1 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;

    const isCompleted = completedIds.has(activeLessonId);

    // Debug: Log the video URL being used
    useEffect(() => {
        console.log('[LessonClientView] Active lesson:', {
            id: activeLesson?.id,
            type: activeLesson?.type,
            videoUrl: activeLesson?.videoUrl || '(none)',
            hasBody: !!activeLesson?.body,
        });
        setVideoError(false);
        setVideoReady(false);
    }, [activeLesson?.id, activeLesson?.videoUrl]);

    const tabs = [
        { key: "overview" as const, label: "Tổng quan", icon: BookOpen },
        { key: "notes" as const, label: "Ghi chú", icon: StickyNote },
        { key: "discussion" as const, label: "Thảo luận", icon: MessageSquare },
    ];

    async function handleMarkComplete() {
        setMarking(true);
        try {
            await markComplete({ variables: { lessonId: activeLessonId } });

            const newSet = new Set(completedIds);
            newSet.add(activeLessonId);
            setCompletedIds(newSet);
            const newProgress = Math.round((newSet.size / Math.max(1, allLessons.length)) * 100);
            setProgress(newProgress);

            // Trigger confetti and modal if all lessons are completed
            if (newProgress >= 100 && progress < 100) {
                triggerRainConfetti(3000);
                window.scrollTo({ top: 0, behavior: "smooth" });
                // Auto-claim and open certificate modal
                handleClaimCert();
            } else if (nextLesson && !nextLesson.isLocked) {
                navigateToLesson(nextLesson.id);
            } else if (!nextLesson) {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        } catch (error) {
            console.error("Failed to mark lesson complete:", error);
            // In a real app, maybe show a toast here
        } finally {
            setMarking(false);
        }
    }

    async function handleClaimCert() {
        setClaimingCert(true);
        try {
            const res = await claimCertificate({ variables: { courseId: course.id } });
            const url = (res.data as any)?.claimCertificate?.certificateUrl;
            if (url) {
                setCertUrl(url);
                setCertModalOpen(true);
            }
        } catch (err: any) {
            toast.error("Lỗi nhận chứng chỉ: " + err.message);
        } finally {
            setClaimingCert(false);
        }
    }

    function navigateToLesson(lessonId: string) {
        // Full navigation since this is SRR driven, or just change state if we had all lessons client-side
        // Better to actually navigate so URL updates
        router.push(`/courses/${course.id}/lessons/${lessonId}`);
        setSidebarOpen(false);
    }

    const sections = course.sections || [];
    const sidebarProps = { sections, activeLessonId, completedIds, onSelect: navigateToLesson };

    return (
        <>
            {/* ═══ LEFT: Video + Tabs ═══ */}
            <div className="flex flex-1 flex-col overflow-y-auto">
                {/* Content Player / Document Reader */}
                <div className={cn("w-full", activeLesson?.type === "VIDEO" || !activeLesson?.type ? "bg-slate-900" : "bg-white border-b border-slate-200")}>
                    <div className={cn("relative mx-auto max-w-5xl", activeLesson?.type === "VIDEO" || !activeLesson?.type ? "aspect-video" : "min-h-[50vh] p-8 lg:p-12")}>
                        {activeLesson?.isLocked ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl m-8 p-10 text-center shadow-sm">
                                <Lock className="h-16 w-16 mb-4 text-slate-300" />
                                <h3 className="text-xl font-bold text-slate-800">Bài Học Đã Bị Khóa</h3>
                                <p className="mt-2 text-slate-500 max-w-md">
                                    Bạn cần hoàn thành Quiz của bài học trước (Đạt điểm ≥ 80%) để tiếp tục mở khóa bài học này.
                                </p>
                            </div>
                        ) : activeLesson?.type === "DOCUMENT" ? (
                            <div className="max-w-none space-y-6">
                                {activeLesson.videoUrl && activeLesson.videoUrl.includes('cloudinary.com') && (
                                    (activeLesson.videoUrl.includes('/video/') || activeLesson.videoUrl.endsWith('.mp4') || activeLesson.videoUrl.endsWith('.webm')) ? (
                                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 shadow-lg mb-8">
                                            {/* @ts-ignore */}
                                            <ReactPlayer
                                                key={activeLesson.id}
                                                url={activeLesson.videoUrl}
                                                width="100%"
                                                height="100%"
                                                controls
                                                config={{ file: { forceVideo: true, attributes: { controlsList: 'nodownload' } } }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-8 w-8 text-blue-600" />
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-bold text-slate-800">Tài liệu đính kèm</h3>
                                                    <p className="text-xs text-slate-500">Tài liệu bảo mật, link sẽ hết hạn sau 15 phút.</p>
                                                </div>
                                                <a href={activeLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition">
                                                    Mở Tài liệu
                                                </a>
                                            </div>
                                        </div>
                                    )
                                )}
                                <LessonMarkdownRenderer
                                    body={activeLesson.body || "Nội dung bài học đang được cập nhật..."}
                                    title={activeLesson.title}
                                />
                            </div>
                        ) : activeLesson?.videoUrl && !videoError ? (
                            <>
                                {/* Loading overlay */}
                                {!videoReady && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                                        <div className="text-center">
                                            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-3" />
                                            <p className="text-sm text-slate-400">Đang tải video...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Use native <video> for direct file URLs (Cloudinary, .mp4, etc.) */}
                                {/* Use ReactPlayer for YouTube and other supported platforms */}
                                {activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be') ? (
                                    // @ts-ignore
                                    <ReactPlayer
                                        key={activeLesson.id}
                                        ref={playerRef}
                                        url={activeLesson.videoUrl}
                                        width="100%"
                                        height="100%"
                                        controls
                                        pip={videoReady}
                                        playing={false}
                                        onReady={() => {
                                            console.log('[VideoPlayer] YouTube Ready');
                                            setVideoReady(true);
                                            setVideoError(false);
                                        }}
                                        onError={(e: any) => {
                                            console.error('[VideoPlayer] YouTube Error:', e);
                                            setVideoError(true);
                                        }}
                                        className="absolute top-0 left-0"
                                        config={{
                                            youtube: {
                                                playerVars: {
                                                    origin: typeof window !== 'undefined' ? window.location.origin : '',
                                                    modestbranding: 1,
                                                    rel: 0,
                                                },
                                            },
                                        }}
                                    />
                                ) : (
                                    <video
                                        key={activeLesson.id}
                                        ref={playerRef}
                                        src={activeLesson.videoUrl}
                                        controls
                                        controlsList="nodownload"
                                        className="absolute top-0 left-0 w-full h-full bg-black relative z-20"
                                        onCanPlay={(e) => {
                                            const videoEl = e.currentTarget;
                                            if (savedCurrentTime > 5) {
                                                videoEl.currentTime = savedCurrentTime;
                                            }
                                            setVideoReady(true);
                                            setVideoError(false);
                                        }}
                                        onPlay={() => {
                                            if (progressSaveIntervalRef.current) clearInterval(progressSaveIntervalRef.current);
                                            progressSaveIntervalRef.current = setInterval(() => {
                                                const el = playerRef.current as HTMLVideoElement | null;
                                                if (el && !el.paused && el.currentTime > 0) {
                                                    saveVideoProgress({ variables: { lessonId: activeLessonId, currentTime: el.currentTime } });
                                                }
                                            }, 10_000);
                                        }}
                                        onPause={(e) => {
                                            if (progressSaveIntervalRef.current) {
                                                clearInterval(progressSaveIntervalRef.current);
                                                progressSaveIntervalRef.current = null;
                                            }
                                            const ct = e.currentTarget.currentTime;
                                            if (ct > 0) saveVideoProgress({ variables: { lessonId: activeLessonId, currentTime: ct } });
                                        }}
                                        onEnded={() => {
                                            if (progressSaveIntervalRef.current) clearInterval(progressSaveIntervalRef.current);
                                            saveVideoProgress({ variables: { lessonId: activeLessonId, currentTime: 0 } });
                                        }}
                                        onError={(e) => {
                                            console.error('[VideoPlayer] Native video error:', e, 'URL:', activeLesson.videoUrl?.substring(0, 80));
                                            setVideoError(true);
                                        }}
                                    />
                                )}
                            </>
                        ) : activeLesson?.videoUrl && videoError ? (
                            <div className="flex h-full w-full items-center justify-center text-slate-400 bg-slate-900 absolute top-0 left-0">
                                <div className="text-center">
                                    <div className="mx-auto h-20 w-20 mb-4 flex items-center justify-center rounded-full bg-red-900/30">
                                        <PlayCircle className="h-10 w-10 text-red-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Không thể tải video</h3>
                                    <p className="text-sm font-medium mb-6 text-slate-400 max-w-sm mx-auto">Đã xảy ra lỗi khi tải video. Vui lòng thử lại hoặc kiểm tra kết nối mạng.</p>
                                    <button
                                        onClick={() => { setVideoError(false); setVideoReady(false); }}
                                        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400 bg-slate-900 absolute top-0 left-0">
                                <div className="text-center">
                                    <div className="mx-auto h-20 w-20 mb-4 flex items-center justify-center rounded-full bg-slate-800">
                                        <Lock className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Khóa học này chưa được mua.</h3>
                                    <p className="text-sm font-medium mb-6 text-slate-400 max-w-sm mx-auto">Vui lòng thanh toán để xem video và trải nghiệm đầy đủ các tính năng.</p>
                                    <button
                                        onClick={() => router.push(`/course/${course.id}`)}
                                        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                                    >
                                        Thanh toán ngay
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content below video */}
                <div className="flex-1 p-4 lg:p-6">
                    {/* Lesson title + progress */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 lg:text-2xl">{activeLesson?.title}</h1>
                            <p className="mt-1 text-sm text-slate-500">Tiến độ khóa học: {progress}%</p>
                        </div>
                        {isCompleted && (
                            <span className="shrink-0 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm font-medium text-green-700">
                                <CheckCircle2 className="h-4 w-4" /> Đã hoàn thành
                            </span>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="mb-6 h-2 w-full rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-primary-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => {
                                if (prevLesson) {
                                    if (prevLesson.isLocked) {
                                        toast.info("🔒 Bài học này đã bị khóa.");
                                        return;
                                    }
                                    navigateToLesson(prevLesson.id);
                                }
                            }}
                            disabled={!prevLesson}
                            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" /> Bài trước
                        </button>
                        {nextLesson && (
                            <button
                                onClick={() => {
                                    if (nextLesson.isLocked) {
                                        toast.info("🔒 Bài học này đã bị khóa. Vui lòng hoàn thành bài học hiện tại (hoặc Quiz) trước khi qua bài này.");
                                        return;
                                    }
                                    navigateToLesson(nextLesson.id);
                                }}
                                className="flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                            >
                                Bài tiếp theo <ChevronRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-slate-200 mb-6">
                        <div className="flex gap-1 overflow-x-auto">
                            {tabs.map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={cn(
                                        "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                                        activeTab === key
                                            ? "border-primary-600 text-primary-700"
                                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab content */}
                    <div>
                        {activeTab === "overview" && activeLesson && (
                            <div className="rounded-lg border border-slate-200 bg-white p-5">
                                <TabOverview lesson={activeLesson} />
                            </div>
                        )}
                        {activeTab === "notes" && <NotesSection lessonId={activeLessonId} videoRef={playerRef} />}
                        {activeTab === "discussion" && <DiscussionSection lessonId={activeLessonId} currentUserId={currentUserId} />}
                    </div>

                    {/* Quiz Section & AI Tutor - always below overview content */}
                    {activeTab === "overview" && activeLesson && (
                        <div className="mt-8 space-y-6">
                            {/* Quiz enforcement note */}
                            <div className="flex items-start gap-3 rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-indigo-800">
                                <Info className="h-5 w-5 shrink-0 text-indigo-600 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold">Hướng dẫn hoàn thành bài học</p>
                                    <p className="mt-1 text-indigo-700">
                                        Bài học này sẽ tự động được đánh dấu hoàn thành <strong>chỉ khi bạn vượt qua bài trắc nghiệm (Quiz) với số điểm từ 80% trở lên.</strong><br />
                                        Hãy ôn tập kỹ nội dung và sử dụng AI Tutor bên dưới nếu bạn có nội dung chưa hiểu rõ nhé!
                                    </p>
                                </div>
                            </div>

                            {/* Inline AI Tutor Component */}
                            <div className="mb-6">
                                <AiTutorWidget
                                    lessonId={activeLessonId}
                                    lessonTitle={activeLesson.title}
                                    inline={true}
                                />
                            </div>

                            {/* Quiz Component */}
                            <QuizSection
                                lessonId={activeLessonId}
                                onSuccess={() => handleMarkComplete()}
                            />
                        </div>
                    )}

                    {/* Course Completion Banner */}
                    {progress >= 100 && (
                        <div className="mt-8 relative overflow-hidden rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-6 md:p-8 shadow-lg">
                            <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-yellow-200/30 blur-2xl" />
                            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-orange-200/30 blur-2xl" />
                            <div className="relative flex flex-col md:flex-row items-center gap-6">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                                    <PartyPopper className="h-10 w-10 text-white" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-slate-900">Chúc mừng! Bạn đã hoàn thành khóa học!</h3>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Bạn đã hoàn thành tất cả bài học trong khóa <strong>{course.title}</strong>. Nhận chứng chỉ của bạn ngay bây giờ!
                                    </p>
                                </div>
                                <button
                                    onClick={handleClaimCert}
                                    disabled={claimingCert}
                                    className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {claimingCert ? <Loader2 className="h-5 w-5 animate-spin" /> : <Award className="h-5 w-5" />}
                                    Xem / Tải Chứng Chỉ
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ RIGHT: Desktop Sidebar ═══ */}
            <aside className="hidden w-80 shrink-0 border-l border-slate-200 bg-white lg:flex lg:flex-col">
                <div className="border-b border-slate-200 px-4 py-4">
                    <h2 className="text-sm font-bold text-slate-900 line-clamp-2">{course.title}</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {sections.slice().sort((a, b) => a.order - b.order).map((section) => (
                        <SidebarSectionItem key={section.id} section={section} {...sidebarProps} />
                    ))}
                </div>
            </aside>

            {/* ═══ MOBILE: FAB + Drawer ═══ */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors lg:hidden"
                aria-label="Mở danh sách bài học"
            >
                <Menu className="h-5 w-5" />
            </button>

            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}
            <div className={cn("fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] transform bg-white shadow-2xl transition-transform duration-300 lg:hidden", sidebarOpen ? "translate-x-0" : "translate-x-full")}>
                <button onClick={() => setSidebarOpen(false)} className="absolute right-3 top-3 z-10 rounded-md p-1 text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                </button>
                <div className="flex h-full flex-col">
                    <div className="border-b border-slate-200 px-4 py-4 pr-10">
                        <h2 className="text-sm font-bold text-slate-900 line-clamp-2">{course.title}</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {sections.slice().sort((a, b) => a.order - b.order).map((section) => (
                            <SidebarSectionItem key={section.id} section={section} {...sidebarProps} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Certificate Preview Modal */}
            <Dialog open={certModalOpen} onOpenChange={setCertModalOpen}>
                <DialogContent className="max-w-4xl p-6 md:p-8 bg-zinc-900 border-zinc-800 text-white rounded-2xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <DialogHeader className="mb-6 text-center">
                            <DialogTitle className="text-2xl md:text-3xl font-bold text-yellow-400 font-sans">
                                Chúc mừng bạn đã chinh phục thành công khóa học {course.title}!
                            </DialogTitle>
                            <p className="text-slate-300 mt-2 text-sm md:text-base">
                                Công sức của bạn đã được đền đáp xứng đáng. Dưới đây là chứng chỉ hoàn thành khóa học dành riêng cho bạn.
                            </p>
                        </DialogHeader>

                        {certUrl && (
                            <div className="flex flex-col items-center gap-6 mt-4">
                                <div className="relative w-full aspect-[1.4/1] bg-black/50 rounded-lg overflow-hidden border border-zinc-700 shadow-xl flex justify-center items-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={certUrl}
                                        alt="Chứng chỉ hoàn thành khóa học"
                                        className="object-contain max-w-full max-h-full"
                                    />
                                </div>

                                <a
                                    href={certUrl.replace('/upload/', '/upload/fl_attachment/')}
                                    download="Certificate.jpg"
                                    className="inline-flex items-center gap-2 px-8 py-4 mt-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg rounded-full transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-[0_4px_20px_rgba(234,179,8,0.5)]"
                                >
                                    <Download className="h-6 w-6" />
                                    Tải Xuống Chứng Chỉ
                                </a>
                            </div>
                        )}
                    </motion.div>
                </DialogContent>
            </Dialog>

            {/* AI Tutor floating widget — context-aware to the active lesson */}
            {activeLesson && (
                <AiTutorWidget
                    lessonId={activeLesson.id}
                    lessonTitle={activeLesson.title}
                />
            )}
        </>
    );
}

