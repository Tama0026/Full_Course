"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    open,
    title = "Xác nhận",
    description,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    danger = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${danger
                                ? "bg-red-100 text-red-600"
                                : "bg-amber-100 text-amber-600"
                                }`}>
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                                <p className="text-sm text-slate-500 mt-1 whitespace-pre-line">{description}</p>
                            </div>
                            <button onClick={onCancel} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                                <X className="h-4 w-4 text-slate-400" />
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => { onConfirm(); onCancel(); }}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${danger
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-emerald-600 hover:bg-emerald-700"
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
