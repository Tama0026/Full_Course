"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_QUESTION_BANK, CREATE_BANK_QUESTION, DELETE_BANK_QUESTION, BULK_IMPORT_QUESTIONS, PARSE_RAW_QUESTIONS } from "@/lib/graphql/question-bank";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Plus, Trash2, CheckCircle2, UploadCloud, FileJson, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function QuestionBankDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: bankData, loading: bankLoading, refetch } = useQuery(GET_QUESTION_BANK, {
        variables: { id },
        fetchPolicy: "network-only",
        skip: !id
    });

    const [deleteQuestion] = useMutation(DELETE_BANK_QUESTION, { onCompleted: () => refetch() });
    const [bulkImport] = useMutation(BULK_IMPORT_QUESTIONS, { onCompleted: () => refetch() });
    const [parseRawQuestionsMutation] = useMutation(PARSE_RAW_QUESTIONS);

    const [showImportModal, setShowImportModal] = useState(false);
    const [importJsonStr, setImportJsonStr] = useState("");
    const [importing, setImporting] = useState(false);

    const [showMagicImport, setShowMagicImport] = useState(false);
    const [rawText, setRawText] = useState("");
    const [parsing, setParsing] = useState(false);

    const bank = (bankData as any)?.questionBank;

    // Computed Preview Data
    const previewData = useMemo(() => {
        if (!importJsonStr.trim()) return null;
        try {
            const parsed = JSON.parse(importJsonStr);
            if (!Array.isArray(parsed)) throw new Error("Root element must be a JSON array.");

            // Validate basic shapes
            const valid = parsed.map((q: any) => ({
                content: typeof q.content === "string" ? q.content : "Lỗi: Không có nội dung",
                options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ["Lỗi: Options không hợp lệ"],
                correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : -1,
                difficulty: ["EASY", "MEDIUM", "HARD"].includes(q.difficulty) ? q.difficulty : "EASY",
                explanation: typeof q.explanation === "string" ? q.explanation : "",
                isValid: typeof q.content === "string" && Array.isArray(q.options) && q.options.length >= 2 && typeof q.correctAnswer === "number" && q.correctAnswer >= 0 && q.correctAnswer < q.options.length
            }));

            return valid;
        } catch (e: any) {
            return { error: e.message };
        }
    }, [importJsonStr]);

    const handleBulkImport = async () => {
        if (!previewData || 'error' in previewData) {
            toast.error("Dữ liệu JSON không hợp lệ");
            return;
        }

        const invalidCount = previewData.filter(q => !q.isValid).length;
        if (invalidCount > 0) {
            if (!confirm(`Phát hiện ${invalidCount} câu hỏi có định dạng không chuẩn (hoặc sai vị trí đáp án). Bạn có muốn bỏ qua chúng và tiếp tục import các câu còn lại không?`)) {
                return;
            }
        }

        const validQuestions = previewData.filter(q => q.isValid).map(q => ({
            content: q.content,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || "",
            difficulty: q.difficulty || "MEDIUM"
        }));

        if (validQuestions.length === 0) {
            toast.error("Không có câu hỏi hợp lệ nào để import!");
            return;
        }

        setImporting(true);
        try {
            const result = await bulkImport({
                variables: {
                    bankId: id,
                    questions: validQuestions
                }
            });
            const importedCount = (result.data as any)?.bulkImportQuestions?.count;
            toast.success(`Đã import thành công ${importedCount} câu hỏi vào ngân hàng!`);
            setShowImportModal(false);
            setImportJsonStr("");
        } catch (err: any) {
            toast.error("Lỗi khi import: " + err.message);
        } finally {
            setImporting(false);
        }
    };

    const handleMagicImport = async () => {
        if (!rawText.trim()) { toast.error("Vui lòng nhập văn bản thô!"); return; }
        setParsing(true);
        try {
            const result = await parseRawQuestionsMutation({ variables: { rawText } });
            const jsonStr = (result.data as any)?.parseRawQuestions;
            if (!jsonStr) throw new Error("Không nhận được dữ liệu từ AI");
            setImportJsonStr(jsonStr);
            setShowMagicImport(false);
            setShowImportModal(true);
            setRawText("");
            toast.success("AI đã bóc tách xong, kiểm tra lại bảng Preview!");
        } catch (err: any) {
            toast.error("Lỗi trích xuất: " + err.message);
        } finally {
            setParsing(false);
        }
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng? Các bài thi đã lấy câu hỏi này rồi vẫn sẽ LƯU BẢN SAO của nó.")) return;
        try {
            await deleteQuestion({ variables: { id: questionId } });
            toast.success("Đã xóa câu hỏi khỏi Ngân hàng");
        } catch (err: any) {
            toast.error("Lỗi xóa câu hỏi: " + err.message);
        }
    };

    if (bankLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
    if (!bank) return <div className="text-center py-20 text-slate-500">Không tìm thấy ngân hàng đề (404)</div>;

    const questions = bank.questions || [];

    return (
        <div className="p-6 max-w-6xl mx-auto pb-32">
            <Link
                href="/instructor/question-bank"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
            </Link>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8 max-w-4xl animate-in slide-in-from-top-4">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-slate-900">{bank.name}</h1>
                            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg">
                                {bank.category}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 max-w-2xl">{bank.description}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-4">
                <h2 className="text-lg font-bold text-slate-900 pl-2">Danh sách {questions.length} câu hỏi lưu trữ</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowMagicImport(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors text-sm"
                    >
                        <UploadCloud className="w-4 h-4" /> Magic Import (AI)
                    </button>
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors text-sm"
                    >
                        <FileJson className="w-4 h-4" /> Bulk Import (JSON)
                    </button>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="text-center p-10 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                        <p className="text-slate-500 italic">Ngân hàng đề đang trống. Hãy Import câu hỏi!</p>
                    </div>
                ) : (
                    questions.map((q: any, i: number) => {
                        const correctIdx = parseInt(q.correctAnswer) || 0;
                        return (
                            <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative group">
                                <div className="pr-10 mb-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">Câu hỏi {i + 1}</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${q.difficulty === 'HARD' ? 'bg-red-50 text-red-600 border-red-200' : q.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                            {q.difficulty}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-slate-900">{q.content}</h4>
                                </div>
                                <div className="space-y-2 pl-4 border-l-2 border-slate-100">
                                    {q.options.map((opt: string, idx: number) => (
                                        <div key={idx} className={`text-sm flex items-center gap-2 ${idx === correctIdx ? "text-emerald-700 font-medium" : "text-slate-600"}`}>
                                            {idx === correctIdx ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Xóa khỏi ngân hàng"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    })
                )}
            </div>

            {/* IMPORT MODAL & PREVIEW */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 overflow-y-auto pt-20 pb-10">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <FileJson className="w-5 h-5 text-indigo-600" /> Bulk Import JSON Array
                            </h3>
                            <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-700 font-bold p-1">X</button>
                        </div>

                        {/* Body */}
                        <div className="p-5 overflow-y-auto flex-1 bg-slate-50 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Paste JSON data here:</label>
                                <textarea
                                    className="w-full h-40 border-slate-300 rounded-xl p-3 font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500 text-slate-700"
                                    placeholder='[\n  {\n    "content": "What is React?",\n    "options": ["Library", "Framework", "Language"],\n    "correctAnswer": 0,\n    "difficulty": "EASY"\n  }\n]'
                                    value={importJsonStr}
                                    onChange={(e) => setImportJsonStr(e.target.value)}
                                />
                            </div>

                            {/* Preview Area */}
                            {importJsonStr.trim() && (
                                <div className="bg-white border text-sm border-slate-200 rounded-xl overflow-hidden mt-2 flex-1 flex flex-col">
                                    <div className="p-3 bg-indigo-50 border-b border-slate-200 font-bold text-indigo-900 flex items-center gap-2">
                                        Import Preview
                                    </div>
                                    <div className="p-0 overflow-x-auto max-h-60 overflow-y-auto">
                                        {previewData && 'error' in previewData ? (
                                            <div className="p-4 text-red-600 flex items-center gap-2 font-medium">
                                                <AlertCircle className="w-5 h-5" /> JSON Parse Error: {previewData.error}
                                            </div>
                                        ) : previewData && previewData.length === 0 ? (
                                            <div className="p-4 text-slate-500 text-center">JSON Array trống.</div>
                                        ) : (
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-100 text-slate-600 uppercase text-xs font-bold sticky top-0 shadow-sm">
                                                        <th className="p-3 border-b border-slate-200 w-10 text-center">Stt</th>
                                                        <th className="p-3 border-b border-slate-200">Câu hỏi</th>
                                                        <th className="p-3 border-b border-slate-200 w-32 border-l">Độ khó</th>
                                                        <th className="p-3 border-b border-slate-200 w-64 border-l">Đáp án đúng</th>
                                                        <th className="p-3 border-b border-slate-200 w-24 text-center border-l">Hợp lệ?</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                    {(previewData as any[]).map((row, idx) => (
                                                        <tr key={idx} className={`border-b border-slate-100 hover:bg-slate-50 ${!row.isValid ? 'bg-red-50' : ''}`}>
                                                            <td className="p-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                                                            <td className="p-3 max-w-xs truncate text-slate-800" title={row.content}>{row.content}</td>
                                                            <td className="p-3 border-l border-slate-100">
                                                                <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold rounded text-slate-600">{row.difficulty}</span>
                                                            </td>
                                                            <td className="p-3 border-l border-slate-100 truncate max-w-[150px] text-emerald-700 font-semibold text-xs" title={row.options[row.correctAnswer]}>
                                                                {row.options[row.correctAnswer] || <span className="text-red-500">Thiếu / Sai index</span>}
                                                            </td>
                                                            <td className="p-3 text-center border-l border-slate-100">
                                                                {row.isValid
                                                                    ? <span className="text-emerald-600 font-bold flex justify-center"><CheckCircle2 className="w-4 h-4" /></span>
                                                                    : <span className="text-red-500 font-bold flex justify-center"><AlertCircle className="w-4 h-4" /></span>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                    <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                                        <span>Tổng số: {previewData && !('error' in previewData) ? (previewData as any[]).length : 0} câu</span>
                                        {previewData && !('error' in previewData) && (previewData as any[]).some(r => !r.isValid) && (
                                            <span className="text-red-600 font-bold">Lưu ý: Có câu hỏi không hợp lệ định dạng. Bạn sẽ mất chúng nếu import!</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
                            <button onClick={() => setShowImportModal(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                                Hủy
                            </button>
                            <button
                                onClick={handleBulkImport}
                                disabled={importing || !importJsonStr.trim() || Boolean(previewData && 'error' in previewData)}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl flex items-center justify-center min-w-[150px] transition-colors shadow-sm"
                            >
                                {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Lưu vào Bank"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAGIC IMPORT MODAL */}
            {showMagicImport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 overflow-y-auto pt-20 pb-10">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-purple-700 flex items-center gap-2">
                                <UploadCloud className="w-5 h-5" /> Magic Import (Sử dụng AI)
                            </h3>
                            <button onClick={() => setShowMagicImport(false)} className="text-slate-400 hover:text-slate-700 font-bold p-1">X</button>
                        </div>
                        <div className="p-5 bg-slate-50 flex-1">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Dán văn bản thô (Word, PDF) chứa đề thi vào đây:</label>
                            <textarea
                                className="w-full h-80 border-slate-300 rounded-xl p-4 text-sm focus:ring-purple-500 focus:border-purple-500 text-slate-700 shadow-inner"
                                placeholder="..."
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                            />
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" /> AI sẽ tự động phân tách câu hỏi, đáp án, và nhận diện độ khó.
                            </p>
                        </div>
                        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
                            <button onClick={() => setShowMagicImport(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                                Hủy
                            </button>
                            <button
                                onClick={handleMagicImport}
                                disabled={parsing || !rawText.trim()}
                                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-xl flex items-center justify-center min-w-[150px] transition-colors shadow-sm"
                            >
                                {parsing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Trích xuất bằng AI"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
