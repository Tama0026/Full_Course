"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_QUIZ, SUBMIT_QUIZ } from "@/lib/graphql/quiz";
import { Quiz, Question } from "@/lib/graphql/types";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizSectionProps {
    lessonId: string;
    onSuccess?: () => void;
}

export default function QuizSection({ lessonId, onSuccess }: QuizSectionProps) {
    const { data, loading, error } = useQuery(GET_QUIZ, {
        variables: { lessonId },
        fetchPolicy: "network-only",
    });

    const [submitQuiz, { loading: submitting }] = useMutation(SUBMIT_QUIZ);

    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [result, setResult] = useState<{ success: boolean; score: number; totalQuestions: number; message: string } | null>(null);

    if (loading) return <div className="p-8 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
    if (error) return null; // If no quiz exists or error, just hide silently

    const quiz: Quiz = (data as any)?.getQuiz;
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return null;

    const handleSelect = (questionId: string, optionIndex: number) => {
        if (result) return; // Prevent changing answers after submit
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < quiz.questions.length) {
            alert("Vui lòng trả lời tất cả các câu hỏi.");
            return;
        }

        const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
            questionId,
            selectedOption,
        }));

        try {
            const res = await submitQuiz({
                variables: { lessonId, answers: formattedAnswers }
            });

            if ((res.data as any)?.submitQuiz) {
                setResult((res.data as any).submitQuiz);
                if ((res.data as any).submitQuiz.success && onSuccess) {
                    onSuccess(); // Trigger parent refresh to unlock next lesson
                }
            }
        } catch (err: any) {
            console.error(err);
            alert("Có lỗi xảy ra khi nộp bài: " + err.message);
        }
    };

    return (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                Bài Kiểm Tra (Quiz)
            </h3>

            <div className="space-y-8">
                {quiz.questions.map((question: Question, index: number) => {
                    let parsedOptions: string[] = [];
                    try {
                        parsedOptions = JSON.parse(question.options);
                    } catch (e) { }

                    return (
                        <div key={question.id} className="space-y-4">
                            <p className="font-medium text-slate-800">
                                <span className="text-primary-600 mr-2">Câu {index + 1}:</span>
                                {question.content}
                            </p>
                            <div className="grid gap-3 pl-6 border-l-2 border-slate-100">
                                {parsedOptions.map((opt: string, optIndex: number) => {
                                    const isSelected = answers[question.id] === optIndex;
                                    return (
                                        <button
                                            key={optIndex}
                                            onClick={() => handleSelect(question.id, optIndex)}
                                            disabled={!!result}
                                            className={cn(
                                                "text-left w-full px-4 py-3 rounded-lg border transition-all text-sm",
                                                isSelected
                                                    ? "border-primary-500 bg-primary-50 text-primary-900 shadow-sm"
                                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700",
                                                result && "opacity-60 cursor-not-allowed"
                                            )}
                                        >
                                            {String.fromCharCode(65 + optIndex)}. {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Results Section Using Framer Motion */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "mt-8 p-6 rounded-lg border flex flex-col md:flex-row items-center gap-4 justify-between",
                            result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            {result.success ? (
                                <CheckCircle2 className="h-10 w-10 text-green-600 shrink-0" />
                            ) : (
                                <XCircle className="h-10 w-10 text-red-600 shrink-0" />
                            )}
                            <div>
                                <h4 className={cn("text-lg font-bold", result.success ? "text-green-800" : "text-red-800")}>
                                    Điểm số: {result.score} / {result.totalQuestions}
                                </h4>
                                <p className={cn("text-sm", result.success ? "text-green-600" : "text-red-600")}>
                                    {result.message}
                                </p>
                            </div>
                        </div>

                        {!result.success && (
                            <button
                                onClick={() => {
                                    setResult(null);
                                    setAnswers({});
                                }}
                                className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium whitespace-nowrap"
                            >
                                Làm lại bài
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {!result && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || Object.keys(answers).length < quiz.questions.length}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
                    >
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Nộp Bài
                    </button>
                </div>
            )}
        </div>
    );
}
