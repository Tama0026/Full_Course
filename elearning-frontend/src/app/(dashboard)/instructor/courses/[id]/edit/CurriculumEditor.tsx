"use client";

import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation } from "@apollo/client/react";
import {
    Plus,
    Trash2,
    Video,
    FileText,
    GripVertical,
    Pencil,
    Save,
    Loader2,
    Sparkles,
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import CloudinaryUploader from "@/components/learning/CloudinaryUploader";
import QuizEditor from "@/components/instructor/QuizEditor";
import { UPDATE_CURRICULUM, GET_COURSE_DETAIL, GENERATE_LESSON_CONTENT_WITH_QUIZ } from "@/lib/graphql/course";
import { GENERATE_QUIZ_WITH_AI } from "@/lib/graphql/quiz";
import { useApolloClient } from "@apollo/client/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type LessonItem = {
    id?: string;
    title: string;
    type: "VIDEO" | "DOCUMENT";
    videoUrl?: string;
    body?: string;
    duration?: number;
    isPreview?: boolean;
};

type SectionItem = {
    id?: string;
    title: string;
    lessons: LessonItem[];
};

type CurriculumFormValues = {
    sections: SectionItem[];
};

export default function CurriculumEditor({
    courseId,
    initialSections,
}: {
    courseId: string;
    initialSections: any[];
}) {
    const apolloClient = useApolloClient();
    const [generatingAi, setGeneratingAi] = useState(false);
    const [aiQuizCount, setAiQuizCount] = useState<number>(5);
    // Ref to trigger QuizEditor refetch after AI gen
    const quizEditorRefetchRef = useRef<(() => void) | null>(null);

    const [updateCurriculum, { loading: saving }] = useMutation(UPDATE_CURRICULUM, {
        refetchQueries: [{ query: GET_COURSE_DETAIL, variables: { id: courseId } }],
    });

    const { register, control, handleSubmit, setValue, watch, getValues } =
        useForm<CurriculumFormValues>({
            defaultValues: {
                sections: initialSections.length > 0 ? initialSections.map(s => ({
                    id: s.id,
                    title: s.title,
                    lessons: s.lessons.map((l: any) => ({
                        id: l.id,
                        title: l.title,
                        type: l.type,
                        videoUrl: l.videoUrl || "",
                        body: l.body || "",
                        duration: l.duration || 0,
                        isPreview: l.isPreview || false,
                    }))
                })) : [{ title: "Chương 1", lessons: [] }],
            },
        });

    const {
        fields: sections,
        append: appendSection,
        remove: removeSection,
    } = useFieldArray({
        control,
        name: "sections",
    });

    // Dialog state for editing a single lesson
    const [editingLesson, setEditingLesson] = useState<{
        sectionIndex: number;
        lessonIndex: number;
    } | null>(null);

    // Watch the current editing lesson
    const watchedSections = watch("sections");

    const generateAiContent = async () => {
        if (!editingLesson || generatingAi) return;

        const currentTitle = getValues(`sections.${editingLesson.sectionIndex}.lessons.${editingLesson.lessonIndex}.title`);
        if (!currentTitle) {
            toast.warning("Vui lòng nhập tên bài học trước khi tạo nội dung bằng AI.");
            return;
        }

        const lessonId = getValues(`sections.${editingLesson.sectionIndex}.lessons.${editingLesson.lessonIndex}.id`);
        if (!lessonId) {
            toast.warning("Vui lòng lưu chương trình học trước khi sử dụng AI Gen.");
            return;
        }

        setGeneratingAi(true);

        try {
            const result = await apolloClient.mutate({
                mutation: GENERATE_LESSON_CONTENT_WITH_QUIZ,
                variables: { title: currentTitle, lessonId, quizCount: aiQuizCount },
                fetchPolicy: "no-cache",
            });

            const content = (result.data as any)?.generateLessonContentWithQuiz;
            if (content) {
                setValue(`sections.${editingLesson.sectionIndex}.lessons.${editingLesson.lessonIndex}.type`, "DOCUMENT", { shouldDirty: true });
                setValue(`sections.${editingLesson.sectionIndex}.lessons.${editingLesson.lessonIndex}.body`, content, { shouldDirty: true });
                // Trigger QuizEditor refetch
                quizEditorRefetchRef.current?.();
                toast.success(`Đã tạo nội dung + ${aiQuizCount} câu Quiz thành công!`);
            }
        } catch (err: any) {
            console.error("[AI] Generation failed:", err?.message || err);
            const errMsg: string = err?.message || err?.graphQLErrors?.[0]?.message || "";
            if (errMsg.includes("RATE_LIMIT") || errMsg.includes("429")) {
                toast.error("AI đang bị giới hạn tần suất (429). Vui lòng chờ vài phút rồi thử lại.");
            } else if (errMsg.includes("503") || errMsg.includes("High Demand") || errMsg.includes("UNAVAILABLE")) {
                toast.error("Hệ thống AI đang bị quá tải do nhiều người sử dụng. Vui lòng thử lại sau một lát.");
            } else {
                toast.error(`Lỗi khi tạo nội dung AI: ${errMsg || "Unknown error"}`);
            }
        } finally {
            setGeneratingAi(false);
        }
    };
    const onSave = async (data: CurriculumFormValues) => {
        try {
            await updateCurriculum({
                variables: {
                    id: courseId,
                    input: {
                        sections: data.sections.map((sec, sIdx) => ({
                            id: sec.id || undefined,
                            title: sec.title || `Chương ${sIdx + 1}`,
                            order: sIdx,
                            lessons: sec.lessons.map((les, lIdx) => {
                                // Auto-correct type: if videoUrl exists, it must be a VIDEO lesson.
                                // Otherwise, if it has no video but has body text, it's a DOCUMENT.
                                const inferredType = les.videoUrl ? "VIDEO" : "DOCUMENT";

                                return {
                                    id: les.id || undefined,
                                    title: les.title || `Bài học ${lIdx + 1}`,
                                    type: inferredType,
                                    videoUrl: les.videoUrl,
                                    body: les.body,
                                    duration: les.duration,
                                    isPreview: les.isPreview,
                                    order: lIdx,
                                };
                            }),
                        })),
                    },
                },
            });
            toast.success("Đã lưu chương trình học thành công!");
        } catch (err: any) {
            console.error(err);
            toast.error("Lỗi khi lưu chương trình học: " + err.message);
        }
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mt-8 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Chương trình học</h2>
                <button
                    onClick={handleSubmit(onSave)}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    {saving ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...</>
                    ) : (
                        <><Save className="h-4 w-4" /> Lưu thay đổi</>
                    )}
                </button>
            </div>

            <Accordion type="multiple" className="w-full space-y-4">
                {sections.map((section, sIndex) => {
                    const lessons = watchedSections[sIndex]?.lessons || [];

                    return (
                        <AccordionItem
                            key={section.id || `sec-${sIndex}`}
                            value={`sec-${sIndex}`}
                            className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                        >
                            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-100/50 transition-colors data-[state=open]:border-b data-[state=open]:border-slate-200">
                                <div className="flex items-center gap-3 text-left w-full pr-4">
                                    <GripVertical className="h-5 w-5 text-slate-400 cursor-move hover:text-slate-600 shrink-0" />
                                    <div className="flex-1">
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            Chương {sIndex + 1}
                                        </div>
                                        <input
                                            {...register(`sections.${sIndex}.title`)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="font-semibold text-slate-800 bg-transparent border-0 border-b border-transparent focus:border-indigo-500 focus:ring-0 w-full p-0 py-1 transition-colors"
                                            placeholder="Tên chương (vd: Giới thiệu khóa học)"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeSection(sIndex);
                                        }}
                                        className="rounded bg-red-50 p-2 text-red-500 hover:bg-red-100 transition-colors ml-auto shrink-0"
                                        title="Xóa chương này"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </AccordionTrigger>

                            <AccordionContent className="bg-white px-5 py-4">
                                <div className="space-y-3">
                                    {lessons.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500 text-sm">
                                            Chương này chưa có bài học nào.
                                        </div>
                                    ) : (
                                        lessons.map((lesson, lIndex) => (
                                            <div
                                                key={lesson.id || `les-${lIndex}`}
                                                className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-lg border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md"
                                            >
                                                <div className="flex flex-1 items-center gap-3 overflow-hidden">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                        {lesson.type === "VIDEO" ? <Video className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-medium text-slate-800 text-sm mb-0.5">
                                                            {lesson.title || `Bài ${lIndex + 1}`}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                                            <span className="font-semibold">{lesson.type}</span>
                                                            {lesson.videoUrl && <span className="text-green-600 flex items-center gap-1">• Có nội dung đính kèm</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 gap-2 pl-12 md:pl-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingLesson({ sectionIndex: sIndex, lessonIndex: lIndex })}
                                                        className="inline-flex items-center gap-1 rounded bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" /> Chi tiết
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const currentSections = getValues("sections");
                                                            const updatedLessons = [...currentSections[sIndex].lessons];
                                                            updatedLessons.splice(lIndex, 1);
                                                            setValue(`sections.${sIndex}.lessons`, updatedLessons, { shouldDirty: true });
                                                        }}
                                                        className="rounded bg-slate-50 p-1.5 text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const currentSections = getValues("sections");
                                            const updatedLessons = [
                                                ...currentSections[sIndex].lessons,
                                                { title: "", type: "VIDEO" as const, videoUrl: "", body: "" },
                                            ];
                                            setValue(`sections.${sIndex}.lessons`, updatedLessons, { shouldDirty: true });
                                        }}
                                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" /> Thêm bài học mới
                                    </button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>

            <button
                type="button"
                onClick={() => appendSection({ title: "", lessons: [] })}
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
                <Plus className="h-4 w-4" /> Thêm chương mới
            </button>

            {/* Editing Dialog */}
            <Dialog open={editingLesson !== null} onOpenChange={(open) => {
                if (!open) setEditingLesson(null);
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Chỉnh sửa chi tiết bài học</DialogTitle>
                    </DialogHeader>

                    {editingLesson !== null && (
                        <div className="space-y-6 mt-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tên bài học</label>
                                <div className="flex gap-2">
                                    <input
                                        {...register(`sections.${editingLesson.sectionIndex}.lessons.${editingLesson.lessonIndex}.title`)}
                                        className="flex-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        placeholder="Ví dụ: Thiết lập môi trường"
                                    />
                                </div>
                            </div>

                            {/* AI All-in-One: Generate Content + Quiz */}
                            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
                                <label className="mb-2 block text-sm font-semibold text-indigo-800">AI Gen (Văn bản + Quiz)</label>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={aiQuizCount}
                                        onChange={(e) => setAiQuizCount(Number(e.target.value))}
                                        disabled={generatingAi}
                                        className="h-[38px] rounded-lg border border-indigo-300 bg-white px-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        <option value={3}>3 câu Quiz</option>
                                        <option value={5}>5 câu Quiz</option>
                                        <option value={10}>10 câu Quiz</option>
                                        <option value={15}>15 câu Quiz</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={generateAiContent}
                                        disabled={generatingAi}
                                        className="flex flex-1 shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                    >
                                        {generatingAi ? (
                                            <><Loader2 className="h-4 w-4 animate-spin" /> Đang tạo...</>
                                        ) : (
                                            <><Sparkles className="h-4 w-4" /> AI Gen (Văn bản + Quiz)</>
                                        )}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-indigo-600/70">AI sẽ tự động tạo nội dung bài học và câu hỏi trắc nghiệm cùng lúc.</p>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Loại nội dung</label>
                                <select
                                    {...register(`sections.${editingLesson.sectionIndex}.lessons.${editingLesson.lessonIndex}.type`)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                >
                                    <option value="VIDEO">Video</option>
                                    <option value="DOCUMENT">Tài liệu (PDF/Đọc)</option>
                                </select>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Upload File (Video / PDF)</label>
                                <CloudinaryUploader
                                    resourceType="auto"
                                    onUploadSuccess={(url: string) => {
                                        setValue(`sections.${editingLesson.sectionIndex}.lessons.${editingLesson.lessonIndex}.videoUrl`, url, { shouldDirty: true });
                                    }}
                                />
                                {watchedSections[editingLesson.sectionIndex]?.lessons[editingLesson.lessonIndex]?.videoUrl && (
                                    <div className="mt-3 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-md border border-green-200 break-all">
                                        Đã đính kèm URL: {watchedSections[editingLesson.sectionIndex].lessons[editingLesson.lessonIndex].videoUrl}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Thời lượng (phút)</label>
                                <input
                                    type="number"
                                    min="0"
                                    {...register(`sections.${editingLesson.sectionIndex}.lessons.${editingLesson.lessonIndex}.duration`, { valueAsNumber: true })}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    placeholder="vd: 15"
                                />
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <input
                                    type="checkbox"
                                    id={`isPreview-${editingLesson.lessonIndex}`}
                                    {...register(`sections.${editingLesson.sectionIndex}.lessons.${editingLesson.lessonIndex}.isPreview`)}
                                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor={`isPreview-${editingLesson.lessonIndex}`} className="text-sm font-medium text-slate-700 select-none">
                                    Cho phép học thử miễn phí (Preview)
                                </label>
                            </div>

                            <div>
                                <label className="mb-1.5 block flex items-center justify-between text-sm font-semibold text-slate-700">
                                    <span>Nội dung bài học (Markdown)</span>
                                    <span className="text-xs font-normal text-slate-400">Tuỳ chọn</span>
                                </label>
                                <textarea
                                    {...register(`sections.${editingLesson.sectionIndex}.lessons.${editingLesson.lessonIndex}.body`)}
                                    rows={8}
                                    placeholder="Viết nội dung markdown ở đây..."
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y font-mono mb-2"
                                />
                                <div className="mt-8 pt-6 border-t border-slate-200">
                                    {getValues(`sections.${editingLesson.sectionIndex}.lessons.${editingLesson.lessonIndex}.id`) ? (
                                        <QuizEditor
                                            lessonId={getValues(`sections.${editingLesson.sectionIndex}.lessons.${editingLesson.lessonIndex}.id`) as string}
                                            lessonBody={watch(`sections.${editingLesson.sectionIndex}.lessons.${editingLesson.lessonIndex}.body`) || ""}
                                            onRefetchReady={(refetch) => { quizEditorRefetchRef.current = refetch; }}
                                        />
                                    ) : (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                                            Vui lòng lưu thay đổi chương trình học (Save) trước khi bạn có thể quản lý Quiz cho bài học mới này.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-6 border-t pt-4">
                        <button
                            type="button"
                            onClick={() => setEditingLesson(null)}
                            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-md transition-colors"
                        >
                            Xong phần này
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
