"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import {
    ArrowLeft,
    Check,
    Loader2,
    Save,
    GraduationCap,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { GET_COURSE_DETAIL, UPDATE_COURSE, GET_MY_COURSES } from "@/lib/graphql/course";
import CurriculumEditor from "./CurriculumEditor";

export default function EditCoursePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    const { data, loading: fetching } = useQuery<any>(GET_COURSE_DETAIL, {
        variables: { id: courseId },
        skip: !courseId,
    });

    const [updateCourse, { loading: saving }] = useMutation(UPDATE_COURSE, {
        refetchQueries: [{ query: GET_MY_COURSES }],
    });

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [published, setPublished] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Pre-fill when data arrives
    useEffect(() => {
        if (data?.course) {
            setTitle(data.course.title || "");
            setDescription(data.course.description || "");
            setPrice(String(data.course.price ?? ""));
            setPublished(data.course.published ?? false);
        }
    }, [data]);

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (!title.trim()) e.title = "Tên khóa học là bắt buộc";
        if (!description.trim()) e.description = "Mô tả là bắt buộc";
        const pn = parseFloat(price);
        if (isNaN(pn) || pn < 0) e.price = "Giá phải là số >= 0";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSave() {
        if (!validate()) return;
        setSaveError(null);
        setSuccessMsg(null);
        try {
            await updateCourse({
                variables: {
                    id: courseId,
                    input: {
                        title: title.trim(),
                        description: description.trim(),
                        price: parseFloat(price),
                        published,
                    },
                },
            });
            setSuccessMsg("✅ Cập nhật thành công!");
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            setSaveError(err?.message || "Có lỗi xảy ra khi lưu thông tin.");
        }
    }

    if (fetching) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!data?.course) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
                Không tìm thấy khóa học.
            </div>
        );
    }

    const course = data.course;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-3xl px-4 py-8 lg:py-12">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push("/instructor")}
                        className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" /> Quay lại Dashboard
                    </button>
                    <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 lg:text-3xl">
                        <GraduationCap className="h-8 w-8 text-primary-600" />
                        Chỉnh sửa khóa học
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 truncate max-w-xl">{course.title}</p>
                </div>

                {/* Notifications */}
                {successMsg && (
                    <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                        <Check className="h-5 w-5 shrink-0" />
                        {successMsg}
                    </div>
                )}
                {saveError && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {saveError}
                    </div>
                )}

                {/* Form */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 lg:p-8 shadow-sm space-y-5">
                    {/* Title */}
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                            Tên khóa học *
                        </label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Tên khóa học..."
                            className={cn(
                                "w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20",
                                errors.title ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-primary-500"
                            )}
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                            Mô tả *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            placeholder="Mô tả chi tiết về nội dung khóa học..."
                            className={cn(
                                "w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none",
                                errors.description ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-primary-500"
                            )}
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                    </div>

                    {/* Price + Published */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Giá (VNĐ) *
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                min="0"
                                className={cn(
                                    "w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20",
                                    errors.price ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-primary-500"
                                )}
                            />
                            {price && !isNaN(parseFloat(price)) && (
                                <p className="mt-1 text-xs text-slate-400">{formatPrice(parseFloat(price))}</p>
                            )}
                            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Trạng thái hiển thị
                            </label>
                            <button
                                type="button"
                                onClick={() => setPublished(!published)}
                                className={cn(
                                    "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-all",
                                    published
                                        ? "border-green-300 bg-green-50 text-green-700"
                                        : "border-slate-300 text-slate-500"
                                )}
                            >
                                {published ? "Công khai" : "Bản nháp"}
                                <div className={cn("h-5 w-9 rounded-full transition-colors flex items-center px-0.5", published ? "bg-green-500" : "bg-slate-300")}>
                                    <div className={cn("h-4 w-4 rounded-full bg-white transition-transform", published ? "translate-x-4" : "translate-x-0")} />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Save button */}
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-700 disabled:opacity-50 transition-all"
                        >
                            {saving ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...</>
                            ) : (
                                <><Save className="h-4 w-4" /> Lưu thông tin cơ bản</>
                            )}
                        </button>
                    </div>
                </div>

                <CurriculumEditor courseId={course.id} initialSections={course.sections || []} />
            </div>
        </div>
    );
}
