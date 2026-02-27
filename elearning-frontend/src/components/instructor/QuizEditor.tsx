"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Loader2, Plus, Save, Trash2, Sparkles } from "lucide-react";
import { GET_INSTRUCTOR_QUIZ, GENERATE_QUIZ_WITH_AI, UPDATE_QUIZ } from "@/lib/graphql/quiz";

interface QuestionInput {
    id?: string;
    content: string;
    options: string[];
    correctAnswer: number;
}

export default function QuizEditor({ lessonId, lessonBody }: { lessonId: string, lessonBody: string }) {
    const { data: quizData, loading: fetchingQuiz, refetch } = useQuery<any>(GET_INSTRUCTOR_QUIZ, {
        variables: { lessonId },
        fetchPolicy: "network-only",
        skip: !lessonId,
    });

    const [generateAi, { loading: generating }] = useMutation<any>(GENERATE_QUIZ_WITH_AI);
    const [updateQuiz, { loading: saving }] = useMutation<any>(UPDATE_QUIZ);

    const [questions, setQuestions] = useState<QuestionInput[]>([]);
    const [questionCount, setQuestionCount] = useState<number>(5);

    useEffect(() => {
        if (quizData?.getQuiz?.questions) {
            setQuestions(
                quizData.getQuiz.questions.map((q: any) => ({
                    id: q.id,
                    content: q.content,
                    options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
                    correctAnswer: q.correctAnswer,
                }))
            );
        } else {
            setQuestions([]);
        }
    }, [quizData]);

    const handleGenerateAI = async () => {
        if (!lessonBody || lessonBody.trim().length === 0) {
            alert("Bài học chưa có Nội dung Markdown. Vui lòng cập nhật Nội dung (và Lưu) trước khi tạo Quiz AI.");
            return;
        }
        if (!confirm(`Hệ thống sẽ dựa vào Nội dung Markdown để tạo ${questionCount} câu hỏi trắc nghiệm. Bất kỳ Quiz cũ nào cũng sẽ bị ghi đè.\nLƯU Ý: Tiến trình sinh có thể mất 15-30 giây.`)) return;

        try {
            const result = await generateAi({ variables: { lessonId, count: questionCount } });
            const generatedQ = result.data.generateQuizWithAI.questions;
            setQuestions(generatedQ.map((q: any) => ({
                id: q.id,
                content: q.content,
                options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
                correctAnswer: q.correctAnswer,
            })));
            alert("Đã tạo Quiz AI thành công!");
        } catch (e: any) {
            alert("Lỗi khi tạo Quiz AI: " + e.message);
        }
    };

    const handleSave = async () => {
        if (questions.length === 0) {
            alert("Quiz cần ít nhất 1 câu hỏi.");
            return;
        }

        // Validate
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.content.trim()) return alert(`Câu ${i + 1} thiếu nội dung.`);
            if (q.options.length < 2) return alert(`Câu ${i + 1} cần ít nhất 2 đáp án.`);
            if (q.options.some((o) => !o.trim())) return alert(`Câu ${i + 1} có đáp án trống.`);
            if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) return alert(`Câu ${i + 1} có đáp án đúng không hợp lệ.`);
        }

        try {
            await updateQuiz({
                variables: {
                    input: {
                        lessonId,
                        questions: questions.map((q) => ({
                            content: q.content,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                        })),
                    },
                },
            });
            alert("Lưu Quiz thành công!");
            refetch();
        } catch (e: any) {
            alert("Lỗi lưu Quiz: " + e.message);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, { content: "", options: ["", "", "", ""], correctAnswer: 0 }]);
    };

    const removeQuestion = (index: number) => {
        const newQs = [...questions];
        newQs.splice(index, 1);
        setQuestions(newQs);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQs = [...questions];
        (newQs[index] as any)[field] = value;
        setQuestions(newQs);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQs = [...questions];
        newQs[qIndex].options[oIndex] = value;
        setQuestions(newQs);
    };

    const addOption = (qIndex: number) => {
        const newQs = [...questions];
        newQs[qIndex].options.push("");
        setQuestions(newQs);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const newQs = [...questions];
        newQs[qIndex].options.splice(oIndex, 1);
        if (newQs[qIndex].correctAnswer >= newQs[qIndex].options.length) {
            newQs[qIndex].correctAnswer = Math.max(0, newQs[qIndex].options.length - 1);
        }
        setQuestions(newQs);
    };

    if (fetchingQuiz) {
        return <div className="p-4 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">Quản lý Quiz (Trắc nghiệm)</h3>
                    <p className="text-xs text-slate-500 mt-1">Quiz hiển thị ở cuối bài học. Đạt 80% để hoàn thành.</p>
                </div>
                <div className="flex items-center gap-2">
                    {questions.length === 0 && (
                        <div className="flex items-center gap-2">
                            <select
                                value={questionCount}
                                onChange={(e) => setQuestionCount(Number(e.target.value))}
                                disabled={generating}
                                className="h-[36px] rounded-lg border border-slate-300 bg-white px-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                <option value={3}>3 câu hỏi</option>
                                <option value={5}>5 câu hỏi</option>
                                <option value={10}>10 câu hỏi</option>
                                <option value={15}>15 câu hỏi</option>
                            </select>
                            <button
                                type="button"
                                onClick={handleGenerateAI}
                                disabled={generating}
                                className="inline-flex items-center gap-2 rounded-lg bg-orange-100 px-3 py-2 text-sm font-medium text-orange-700 hover:bg-orange-200 transition-colors disabled:opacity-50"
                            >
                                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                Tạo Quiz bằng AI
                            </button>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || generating}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Lưu Quiz
                    </button>
                </div>
            </div>

            {questions.length > 0 && (
                <div className="flex items-center justify-end -mt-2 gap-2">
                    <select
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        disabled={generating}
                        className="h-[28px] rounded border border-slate-200 bg-white px-1.5 py-0 text-xs text-slate-600 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 disabled:opacity-50"
                    >
                        <option value={3}>3 câu</option>
                        <option value={5}>5 câu</option>
                        <option value={10}>10 câu</option>
                        <option value={15}>15 câu</option>
                    </select>
                    <button
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={generating}
                        className="text-xs font-medium text-orange-600 hover:text-orange-700 disabled:opacity-50 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded"
                    >
                        {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        Tạo lại Quiz
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3 relative group">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Câu hỏi {qIndex + 1}</label>
                                <textarea
                                    className="w-full text-sm font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 bg-slate-50 p-2 rounded-lg border border-slate-200"
                                    rows={2}
                                    value={q.content}
                                    onChange={(e) => updateQuestion(qIndex, "content", e.target.value)}
                                    placeholder="Nội dung câu hỏi..."
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                                className="text-slate-400 hover:text-red-500 transition-colors pt-6"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="pl-2 space-y-2">
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name={`correct-${qIndex}`}
                                        checked={q.correctAnswer === oIndex}
                                        onChange={() => updateQuestion(qIndex, "correctAnswer", oIndex)}
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                                    />
                                    <div className="flex-1 flex items-center gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 text-sm text-slate-700 bg-white border-b border-slate-200 focus:border-indigo-500 focus:outline-none py-1"
                                            value={opt}
                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                            placeholder={`Đáp án ${oIndex + 1}`}
                                        />
                                        {q.options.length > 2 && (
                                            <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="text-slate-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addOption(qIndex)}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-2 flex items-center gap-1"
                            >
                                <Plus className="h-3 w-3" /> Thêm đáp án
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addQuestion}
                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 bg-slate-50"
            >
                <Plus className="h-5 w-5" /> Thêm câu hỏi thủ công
            </button>
        </div>
    );
}
