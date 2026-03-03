"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
    CheckCircle2,
    GraduationCap,
    Loader2,
    Plus,
    Save,
    Sparkles,
    Trash2,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UPDATE_COURSE, SUGGEST_LEARNING_OUTCOMES } from "@/lib/graphql/course";

interface Props {
    courseId: string;
    courseTitle: string;
    courseDescription: string;
    initialOutcomes: string[];
}

export default function LearningOutcomesEditor({
    courseId,
    courseTitle,
    courseDescription,
    initialOutcomes,
}: Props) {
    const [outcomes, setOutcomes] = useState<string[]>(
        initialOutcomes.length > 0 ? initialOutcomes : [""]
    );
    const [saving, setSaving] = useState(false);
    const [suggesting, setSuggesting] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [updateCourse] = useMutation(UPDATE_COURSE);
    const [suggestOutcomes] = useMutation(SUGGEST_LEARNING_OUTCOMES);

    function addOutcome() {
        setOutcomes([...outcomes, ""]);
    }

    function removeOutcome(index: number) {
        setOutcomes(outcomes.filter((_, i) => i !== index));
    }

    function updateOutcome(index: number, value: string) {
        const copy = [...outcomes];
        copy[index] = value;
        setOutcomes(copy);
    }

    async function handleSuggest() {
        if (suggesting) return;
        setSuggesting(true);
        setErrorMsg(null);
        try {
            const { data } = await suggestOutcomes({
                variables: { title: courseTitle, description: courseDescription },
            });
            const suggested = (data as any)?.suggestLearningOutcomes;
            if (Array.isArray(suggested) && suggested.length > 0) {
                setOutcomes(suggested);
            }
        } catch (err: any) {
            const msg = err?.message || "";
            if (msg.includes("RATE_LIMIT") || msg.includes("429")) {
                setErrorMsg("AI đang bị giới hạn tần suất. Vui lòng chờ vài giây rồi thử lại.");
            } else {
                setErrorMsg(`Lỗi AI: ${msg.slice(0, 100)}`);
            }
        } finally {
            setSuggesting(false);
        }
    }

    async function handleSave() {
        const filtered = outcomes.filter((o) => o.trim() !== "");
        if (filtered.length === 0) {
            setErrorMsg("Cần ít nhất 1 mục tiêu học tập.");
            return;
        }
        setSaving(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        try {
            await updateCourse({
                variables: {
                    id: courseId,
                    input: { learningOutcomes: filtered },
                },
            });
            setOutcomes(filtered);
            setSuccessMsg("✅ Đã lưu mục tiêu học tập!");
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            setErrorMsg(err?.message || "Có lỗi xảy ra khi lưu.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 lg:p-8 shadow-sm">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <GraduationCap className="h-5 w-5 text-primary-600" />
                    Mục tiêu học tập
                </h2>
                <button
                    onClick={handleSuggest}
                    disabled={suggesting}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-md"
                >
                    {suggesting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Đang gợi ý...</>
                    ) : (
                        <><Sparkles className="h-4 w-4" /> AI Gợi ý</>
                    )}
                </button>
            </div>

            <p className="mb-4 text-sm text-slate-500">
                Mô tả những gì học viên sẽ đạt được sau khi hoàn thành khóa học. Nhấn "AI Gợi ý" để tự động điền dựa trên tiêu đề và mô tả.
            </p>

            {/* Notifications */}
            {successMsg && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
                    <Check className="h-4 w-4 shrink-0" />
                    {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {errorMsg}
                </div>
            )}

            {/* Outcome Inputs */}
            <div className="space-y-3">
                {outcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                        <input
                            value={outcome}
                            onChange={(e) => updateOutcome(idx, e.target.value)}
                            placeholder={`Mục tiêu học tập ${idx + 1}...`}
                            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                        <button
                            onClick={() => removeOutcome(idx)}
                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between">
                <button
                    onClick={addOutcome}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
                >
                    <Plus className="h-4 w-4" /> Thêm mục tiêu
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-700 disabled:opacity-50 transition-all"
                >
                    {saving ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...</>
                    ) : (
                        <><Save className="h-4 w-4" /> Lưu mục tiêu</>
                    )}
                </button>
            </div>
        </div>
    );
}
