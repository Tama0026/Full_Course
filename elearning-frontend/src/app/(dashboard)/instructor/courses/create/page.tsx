"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Check,
    GraduationCap,
    LayoutList,
    Loader2,
    Plus,
    Trash2,
    Video,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CREATE_COURSE, CREATE_SECTION, CREATE_LESSON, GET_MY_COURSES, GENERATE_LESSON_CONTENT } from "@/lib/graphql/course";
import { useApolloClient } from "@apollo/client/react";
import CloudinaryUploader from "@/components/learning/CloudinaryUploader";

/* ── Types ── */
interface LessonDraft {
    title: string;
    type: "VIDEO" | "DOCUMENT";
    videoUrl: string;
    body: string;
    duration?: number;
    format?: string;
}

interface SectionDraft {
    title: string;
    lessons: LessonDraft[];
}

const STEPS = [
    { label: "Thông tin chung", icon: BookOpen },
    { label: "Nội dung khóa học", icon: LayoutList },
    { label: "Xác nhận & Xuất bản", icon: Check },
];

export default function CreateCoursePage() {
    const router = useRouter();
    const [step, setStep] = useState(0);

    // Step 1: General info
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Step 2: Curriculum
    const [sections, setSections] = useState<SectionDraft[]>([]);

    // Dialog for adding lesson
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogSectionIdx, setDialogSectionIdx] = useState(0);
    const [lessonTitle, setLessonTitle] = useState("");
    const [lessonType, setLessonType] = useState<"VIDEO" | "DOCUMENT">("VIDEO");
    const [lessonVideoUrl, setLessonVideoUrl] = useState("");
    const [lessonBody, setLessonBody] = useState("");
    const [lessonFormat, setLessonFormat] = useState<string | undefined>();
    const [lessonDuration, setLessonDuration] = useState<number | undefined>();
    const [generatingAi, setGeneratingAi] = useState(false);

    const apolloClient = useApolloClient();

    // Mutations
    const [createCourse] = useMutation(CREATE_COURSE);
    const [createSection] = useMutation(CREATE_SECTION);
    const [createLesson] = useMutation(CREATE_LESSON, {
        refetchQueries: [{ query: GET_MY_COURSES }],
    });

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    /** 
     * AI content generation — uses apolloClient.mutate directly
     * with fetchPolicy:'no-cache' so every click is a fresh HTTP request.
     * A timestamp nonce is appended to the title so Apollo never deduplicates.
     */
    async function generateAiContent() {
        if (!lessonTitle || generatingAi) return;

        // [Nhiệm vụ 3] Log #1: trước khi gửi request
        const nonce = Date.now();
        console.log(`[AI] Sending request — title: "${lessonTitle}", nonce: ${nonce}`);

        setGeneratingAi(true);
        setLessonBody(""); // Reset nội dung cũ

        try {
            const result = await apolloClient.mutate({
                mutation: GENERATE_LESSON_CONTENT,
                variables: { title: lessonTitle, nonce }, // nonce giúp bypass cache
                fetchPolicy: "no-cache",
            });

            // [Nhiệm vụ 3] Log #2: khi nhận response
            console.log(`[AI] Response received — length: ${(result.data as any)?.generateLessonContent?.length ?? 0} chars`);

            const content = (result.data as any)?.generateLessonContent;
            if (content) {
                setLessonType("DOCUMENT");
                setLessonBody(content); // Ghi đè nội dung mới
            }
        } catch (err: any) {
            // [Nhiệm vụ 3] Log #3: khi gặp lỗi
            console.error("[AI] Generation failed:", err?.message || err);

            // Phân biệt lỗi Rate Limit 429 và lỗi khác
            const errMsg: string = err?.message || err?.graphQLErrors?.[0]?.message || "";
            if (errMsg.includes("RATE_LIMIT") || errMsg.includes("429")) {
                alert("AI đang bị giới hạn tần suất (429). Vui lòng chờ vài giây rồi thử lại.");
            } else {
                alert(`Lỗi khi tạo nội dung AI: ${errMsg || "Unknown error"}`);
            }
        } finally {
            setGeneratingAi(false); // [Nhiệm vụ 1] Luôn reset isLoading về false
        }
    }

    /* ── Validation ── */
    function validateStep1(): boolean {
        const e: Record<string, string> = {};
        if (!title.trim()) e.title = "Tên khóa học là bắt buộc";
        if (!description.trim()) e.description = "Mô tả là bắt buộc";
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0) e.price = "Giá phải là số >= 0";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function validateStep2(): boolean {
        if (sections.length === 0) {
            setSubmitError("Cần ít nhất 1 chương.");
            return false;
        }
        for (const s of sections) {
            if (!s.title.trim()) {
                setSubmitError("Tất cả chương phải có tiêu đề.");
                return false;
            }
        }
        setSubmitError(null);
        return true;
    }

    function nextStep() {
        if (step === 0 && !validateStep1()) return;
        if (step === 1 && !validateStep2()) return;
        setStep(Math.min(step + 1, STEPS.length - 1));
    }

    function prevStep() { setStep(Math.max(step - 1, 0)); }

    /* ── Section management ── */
    function addSection() {
        setSections([...sections, { title: "", lessons: [] }]);
    }

    function removeSection(idx: number) {
        setSections(sections.filter((_, i) => i !== idx));
    }

    function updateSectionTitle(idx: number, value: string) {
        const copy = [...sections];
        copy[idx].title = value;
        setSections(copy);
    }

    /* ── Lesson dialog ── */
    function openLessonDialog(sectionIdx: number) {
        setDialogSectionIdx(sectionIdx);
        setLessonTitle("");
        setLessonType("VIDEO");
        setLessonVideoUrl("");
        setLessonBody("");
        setLessonFormat(undefined);
        setLessonDuration(undefined);
        setDialogOpen(true);
    }

    function addLesson() {
        if (!lessonTitle.trim()) return;
        const copy = [...sections];
        copy[dialogSectionIdx].lessons.push({
            title: lessonTitle,
            type: lessonType,
            videoUrl: lessonVideoUrl,
            body: lessonBody,
            format: lessonFormat,
            duration: lessonDuration,
        });
        setSections(copy);
        setDialogOpen(false);
    }

    function removeLesson(sectionIdx: number, lessonIdx: number) {
        const copy = [...sections];
        copy[sectionIdx].lessons = copy[sectionIdx].lessons.filter((_, i) => i !== lessonIdx);
        setSections(copy);
    }

    /* ── Submit ── */
    async function handleSubmit() {
        setSubmitting(true);
        setSubmitError(null);
        try {
            // 1. Create course
            const { data: courseData } = await createCourse({
                variables: {
                    input: {
                        title: title.trim(),
                        description: description.trim(),
                        price: parseFloat(price),
                        published: false,
                    },
                },
            });
            const courseId = (courseData as any).createCourse.id;

            // 2. Create sections + lessons sequentially
            for (let si = 0; si < sections.length; si++) {
                const s = sections[si];
                const { data: sectionData } = await createSection({
                    variables: {
                        input: {
                            title: s.title.trim(),
                            order: si + 1,
                            courseId,
                        },
                    },
                });
                const sectionId = (sectionData as any).createSection.id;

                for (let li = 0; li < s.lessons.length; li++) {
                    const l = s.lessons[li];
                    await createLesson({
                        variables: {
                            input: {
                                title: l.title.trim(),
                                type: l.type,
                                videoUrl: l.type === 'VIDEO' ? (l.videoUrl.trim() || "https://placeholder.video") : l.videoUrl.trim(),
                                body: l.type === 'DOCUMENT' ? l.body.trim() : "",
                                format: l.format,
                                duration: l.duration,
                                order: li + 1,
                                sectionId,
                            },
                        },
                    });
                }
            }

            router.push("/instructor");
        } catch (err: any) {
            setSubmitError(err?.message || "Có lỗi xảy ra khi tạo khóa học.");
        } finally {
            setSubmitting(false);
        }
    }

    const totalLessons = sections.reduce((s, sec) => s + sec.lessons.length, 0);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => router.push("/instructor")}
                            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Quay lại
                        </button>
                        <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl flex items-center gap-3">
                            <GraduationCap className="h-8 w-8 text-primary-600" />
                            Tạo khóa học mới
                        </h1>
                    </div>
                </div>

                {/* Stepper */}
                <div className="mb-8 flex items-center gap-2">
                    {STEPS.map(({ label, icon: Icon }, idx) => (
                        <div key={label} className="flex items-center gap-2">
                            <button
                                onClick={() => { if (idx < step) setStep(idx); }}
                                className={cn(
                                    "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                                    idx === step
                                        ? "bg-primary-600 text-white shadow-md"
                                        : idx < step
                                            ? "bg-primary-100 text-primary-700 cursor-pointer"
                                            : "bg-slate-100 text-slate-400 cursor-default"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{label}</span>
                                <span className="sm:hidden">{idx + 1}</span>
                            </button>
                            {idx < STEPS.length - 1 && (
                                <div className={cn("h-0.5 w-8", idx < step ? "bg-primary-400" : "bg-slate-200")} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step content */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 lg:p-8 shadow-sm">
                    {/* ══════════ STEP 1: General Info ══════════ */}
                    {step === 0 && (
                        <div className="space-y-5">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tên khóa học *</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ví dụ: Lập trình React từ A-Z"
                                    className={cn("w-full rounded-lg border px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20", errors.title ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-primary-500")}
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Mô tả khóa học *</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Mô tả chi tiết về khóa học..."
                                    rows={5}
                                    className={cn("w-full rounded-lg border px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none", errors.description ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-primary-500")}
                                />
                                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-1">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Giá (VNĐ) *</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        className={cn("w-full rounded-lg border px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20", errors.price ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-primary-500")}
                                    />
                                    {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════ STEP 2: Curriculum ══════════ */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900">Nội dung khóa học</h2>
                                <button
                                    onClick={addSection}
                                    className="flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                                >
                                    <Plus className="h-4 w-4" /> Thêm chương
                                </button>
                            </div>

                            {sections.length === 0 && (
                                <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
                                    <LayoutList className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                    <p className="text-sm text-slate-500">Chưa có chương nào. Nhấn &quot;Thêm chương&quot; để bắt đầu.</p>
                                </div>
                            )}

                            {sections.map((section, si) => (
                                <div key={si} className="rounded-xl border border-slate-200 overflow-hidden">
                                    {/* Section header */}
                                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 border-b border-slate-200">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-100 text-xs font-bold text-primary-700">
                                            {si + 1}
                                        </span>
                                        <input
                                            value={section.title}
                                            onChange={(e) => updateSectionTitle(si, e.target.value)}
                                            placeholder="Tên chương..."
                                            className="flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                                        />
                                        <button
                                            onClick={() => removeSection(si)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Lessons */}
                                    <div className="bg-white divide-y divide-slate-100">
                                        {section.lessons.map((lesson, li) => (
                                            <div key={li} className="flex items-center gap-3 px-4 py-3 text-sm group">
                                                <Video className="h-4 w-4 text-primary-500 shrink-0" />
                                                <span className="flex-1 text-slate-700">{li + 1}. {lesson.title}</span>
                                                {lesson.type === 'VIDEO' && lesson.videoUrl && (
                                                    <span className="hidden sm:inline text-xs text-slate-400 truncate max-w-[200px]">{lesson.videoUrl}</span>
                                                )}
                                                {lesson.type === 'DOCUMENT' && (
                                                    <span className="hidden sm:inline text-xs border border-primary-200 bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded">Tài liệu</span>
                                                )}
                                                <button
                                                    onClick={() => removeLesson(si, li)}
                                                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        {section.lessons.length === 0 && (
                                            <div className="px-4 py-3 text-xs text-slate-400 italic">Chưa có bài học nào</div>
                                        )}
                                    </div>

                                    {/* Add lesson button */}
                                    <div className="border-t border-slate-100 px-4 py-2">
                                        <button
                                            onClick={() => openLessonDialog(si)}
                                            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
                                        >
                                            <Plus className="h-3.5 w-3.5" /> Thêm bài học
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ══════════ STEP 3: Confirm ══════════ */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-slate-900">Xác nhận thông tin</h2>

                            <div className="rounded-xl border border-slate-200 p-5 space-y-4">
                                <div>
                                    <span className="text-xs font-semibold uppercase text-slate-400">Tên khóa học</span>
                                    <p className="text-base font-semibold text-slate-900 mt-0.5">{title || "(Trống)"}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold uppercase text-slate-400">Mô tả</span>
                                    <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-wrap">{description || "(Trống)"}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <span className="text-xs font-semibold uppercase text-slate-400">Giá</span>
                                        <p className="text-lg font-bold text-primary-700 mt-0.5">{parseFloat(price || "0").toLocaleString("vi-VN")}₫</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold uppercase text-slate-400">Chương</span>
                                        <p className="text-lg font-bold text-slate-900 mt-0.5">{sections.length}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold uppercase text-slate-400">Bài học</span>
                                        <p className="text-lg font-bold text-slate-900 mt-0.5">{totalLessons}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Curriculum preview */}
                            <div className="space-y-2">
                                {sections.map((s, si) => (
                                    <div key={si} className="rounded-lg border border-slate-200 overflow-hidden">
                                        <div className="bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800">
                                            Chương {si + 1}: {s.title}
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            {s.lessons.map((l, li) => (
                                                <div key={li} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600">
                                                    <Video className="h-3.5 w-3.5 text-primary-500" />
                                                    {l.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {submitError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    {submitError}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation buttons */}
                <div className="mt-6 flex items-center justify-between">
                    <button
                        onClick={prevStep}
                        disabled={step === 0}
                        className="flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" /> Quay lại
                    </button>

                    {step < STEPS.length - 1 ? (
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-1 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-700 transition-all"
                        >
                            Tiếp theo <ArrowRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-700 disabled:opacity-50 transition-all"
                        >
                            {submitting ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Đang tạo...</>
                            ) : (
                                <><Check className="h-4 w-4" /> Tạo khóa học</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* ═══ Lesson Dialog ═══ */}
            {dialogOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setDialogOpen(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">Thêm bài học</h3>
                                <button onClick={() => setDialogOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-slate-700">Tiêu đề bài học *</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={lessonTitle}
                                            onChange={(e) => setLessonTitle(e.target.value)}
                                            placeholder="Ví dụ: Giới thiệu React Components"
                                            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={generateAiContent}
                                            disabled={!lessonTitle || generatingAi}
                                            className="flex shrink-0 items-center justify-center rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {generatingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gợi ý AI (văn bản)"}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setLessonType("VIDEO")}
                                        className={cn("px-4 py-2 text-sm font-medium rounded-lg border transition-colors", lessonType === "VIDEO" ? "bg-primary-50 border-primary-500 text-primary-700" : "border-slate-200 text-slate-500 hover:bg-slate-50")}
                                    >Video Link</button>
                                    <button
                                        type="button"
                                        onClick={() => setLessonType("DOCUMENT")}
                                        className={cn("px-4 py-2 text-sm font-medium rounded-lg border transition-colors", lessonType === "DOCUMENT" ? "bg-primary-50 border-primary-500 text-primary-700" : "border-slate-200 text-slate-500 hover:bg-slate-50")}
                                    >Soạn thảo (Văn bản)</button>
                                </div>
                                {lessonType === "VIDEO" ? (
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Tải lên Video</label>
                                        <CloudinaryUploader
                                            resourceType="video"
                                            currentUrl={lessonVideoUrl}
                                            onUploadSuccess={(url: string) => setLessonVideoUrl(url)}
                                            onClear={() => setLessonVideoUrl("")}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">Soạn thảo nội dung (Markdown)</label>
                                            <textarea
                                                value={lessonBody}
                                                onChange={(e) => setLessonBody(e.target.value)}
                                                rows={5}
                                                placeholder="Nội dung bài viết..."
                                                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">Tài liệu đính kèm (PDF - Tùy chọn)</label>
                                            <CloudinaryUploader
                                                resourceType="raw"
                                                currentUrl={lessonVideoUrl}
                                                onUploadSuccess={(url: string) => setLessonVideoUrl(url)}
                                                onClear={() => setLessonVideoUrl("")}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    onClick={() => setDialogOpen(false)}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={addLesson}
                                    disabled={!lessonTitle.trim()}
                                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
