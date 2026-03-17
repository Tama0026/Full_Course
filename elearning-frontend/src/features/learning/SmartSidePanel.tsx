"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, FileText, Send, Sparkles, Clock, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { GENERATE_LESSON_TAKEAWAYS } from '@/lib/graphql/course';
import { ASK_VIDEO_CONTEXT_QUESTION } from '@/lib/graphql/learning';
import { useRouter } from 'next/navigation';

interface SmartSidePanelProps {
    lessonId: string;
    courseTitle: string;
    keyTakeaways?: string | null;
    getCurrentTime: () => number;
    onSeek: (time: number) => void;
    isInstructor?: boolean;
}

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
    videoTimeObj?: number; // the time when user asked
}

export function SmartSidePanel({
    lessonId,
    courseTitle,
    keyTakeaways,
    getCurrentTime,
    onSeek,
    isInstructor = false
}: SmartSidePanelProps) {
    const [activeTab, setActiveTab] = useState<'notes' | 'qa'>('notes');
    const [isGenerating, setIsGenerating] = useState(false);
    const [takeawaysList, setTakeawaysList] = useState<{ time: number; text: string }[]>([]);
    const router = useRouter();

    // Q&A State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isAsking, setIsAsking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mutations
    const [generateTakeaways] = useMutation(GENERATE_LESSON_TAKEAWAYS, {
        refetchQueries: ["GetLesson", "GetCourse"] // We'll rely on Apollo cache or refetch
    });

    const [askContextQuestion] = useMutation(ASK_VIDEO_CONTEXT_QUESTION);

    // Load chat history from localStorage on mount
    useEffect(() => {
        if (!lessonId) return;
        try {
            const saved = localStorage.getItem(`qa-history-${lessonId}`);
            if (saved) {
                setMessages(JSON.parse(saved).map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                })));
            } else {
                // Initial generic greeting
                setMessages([
                    { role: 'ai', content: `Xin chào! Cần mình giải thích khái niệm gì trong bài học "${courseTitle}" không?`, timestamp: new Date() }
                ]);
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }, [lessonId, courseTitle]);

    // Save chat history on change
    useEffect(() => {
        if (messages.length > 0 && lessonId) {
            localStorage.setItem(`qa-history-${lessonId}`, JSON.stringify(messages));
        }
    }, [messages, lessonId]);

    // Process key takeaways JSON
    useEffect(() => {
        if (keyTakeaways) {
            try {
                const parsed = JSON.parse(keyTakeaways);
                if (Array.isArray(parsed)) {
                    // Sort chronologically just in case
                    setTakeawaysList(parsed.sort((a, b) => a.time - b.time));
                }
            } catch (e) {
                console.error("Invalid Takeaways JSON", e);
            }
        }
    }, [keyTakeaways]);

    // Scroll to bottom of chat
    useEffect(() => {
        if (activeTab === 'qa') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

    const handleGenerateTakeaways = async () => {
        try {
            setIsGenerating(true);
            await generateTakeaways({ variables: { lessonId } });
            toast.success("Đã phân tích video thành công!");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Không thể tạo ghi chú thông minh.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAskQuestion = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isAsking) return;

        const question = inputValue.trim();
        const currTime = getCurrentTime();

        // Add user message optimistically
        const newUserMsg: ChatMessage = {
            role: 'user',
            content: question,
            timestamp: new Date(),
            videoTimeObj: currTime
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsAsking(true);

        try {
            const { data } = await askContextQuestion({
                variables: {
                    lessonId,
                    question,
                    currentTime: currTime
                }
            });

            const aiResponse = (data as any)?.askVideoContextQuestion;

            if (aiResponse) {
                setMessages(prev => [...prev, {
                    role: 'ai',
                    content: aiResponse,
                    timestamp: new Date()
                }]);
            }
        } catch (error: any) {
            toast.error("AI không thể trả lời lúc này.");
            setMessages(prev => [...prev, {
                role: 'ai',
                content: "Xin lỗi, mình đang gặp sự cố kết nối. Bạn thử lại sau nhé.",
                timestamp: new Date()
            }]);
        } finally {
            setIsAsking(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col absolute inset-0 bg-white dark:bg-gray-900 border-l dark:border-gray-800 shadow-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b dark:border-gray-800 shrink-0">
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors relative
            ${activeTab === 'notes' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}
        `}
                >
                    <FileText size={18} />
                    Key Notes
                    {activeTab === 'notes' && (
                        <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('qa')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors relative
            ${activeTab === 'qa' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}
        `}
                >
                    <Bot size={18} />
                    AI Tutor
                    {activeTab === 'qa' && (
                        <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-gray-50/50 dark:bg-gray-900/50">
                <AnimatePresence mode="wait">

                    {/* NOTES TAB */}
                    {activeTab === 'notes' && (
                        <motion.div
                            key="notes"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="absolute inset-0 overflow-y-auto p-5"
                        >
                            {/* Empty State */}
                            {!keyTakeaways || takeawaysList.length === 0 ? (
                                <div className="min-h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500 pb-10">
                                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-2">
                                        <Sparkles className="w-8 h-8 text-indigo-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chưa có Ghi chú AI</h3>
                                    <p className="text-sm max-w-[200px]">
                                        Khám phá ý chính và vị trí thời gian của video thông qua AI.
                                    </p>
                                    <button
                                        onClick={handleGenerateTakeaways}
                                        disabled={isGenerating}
                                        className="mt-4 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-75 flex items-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        ) : (
                                            <Sparkles size={18} />
                                        )}
                                        {isGenerating ? 'Đang phân tích...' : 'Lấy ghi chú thông minh'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Video Timestamps</h4>
                                        {isInstructor && (
                                            <button
                                                onClick={handleGenerateTakeaways}
                                                disabled={isGenerating}
                                                title="Phân tích lại"
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100 dark:border-gray-700"
                                            >
                                                <Sparkles size={14} className={isGenerating ? "animate-spin" : ""} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {takeawaysList.map((item, idx) => (
                                            <motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={idx}
                                                onClick={() => onSeek(item.time)}
                                                className="w-full group text-left p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/80 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all relative overflow-hidden flex gap-4 items-start"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                <div className="shrink-0 pt-0.5">
                                                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold tracking-tight">
                                                        {formatTime(item.time)}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                                    {item.text}
                                                </p>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Q&A TAB */}
                    {activeTab === 'qa' && (
                        <motion.div
                            key="qa"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="absolute inset-0 flex flex-col bg-gray-50 dark:bg-gray-900"
                        >
                            {/* Chat History */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

                                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                      ${msg.role === 'ai' ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}
        `}>
                                            {msg.role === 'ai' ? <Bot size={16} /> : <MessageSquare size={14} />}
                                        </div>

                                        <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-4 py-2.5 rounded-2xl text-[15px]
                        ${msg.role === 'user'
                                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
                                                }
        `}>
                                                <div className="whitespace-pre-wrap leading-relaxed">
                                                    {msg.content}
                                                </div>
                                            </div>

                                            {msg.videoTimeObj !== undefined && (
                                                <button
                                                    onClick={() => onSeek(msg.videoTimeObj!)}
                                                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-indigo-500 font-medium px-1"
                                                >
                                                    <Clock size={11} />
                                                    Hỏi lúc {formatTime(msg.videoTimeObj)}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {isAsking && (
                                    <div className="flex gap-3">
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center">
                                            <Bot size={16} />
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1.5 items-center">
                                            <motion.div className="w-2 h-2 rounded-full bg-indigo-400" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                                            <motion.div className="w-2 h-2 rounded-full bg-indigo-400" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                                            <motion.div className="w-2 h-2 rounded-full bg-indigo-400" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-800 shrink-0">
                                <form
                                    onSubmit={handleAskQuestion}
                                    className="flex items-center gap-2 relative bg-gray-50 dark:bg-gray-900 focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/50 rounded-2xl p-1.5 border border-transparent focus-within:border-indigo-200 dark:focus-within:border-indigo-800 transition-all"
                                >
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Hỏi AI về nội dung vừa xem..."
                                        className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none dark:text-gray-100 placeholder:text-gray-400"
                                        disabled={isAsking}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim() || isAsking}
                                        className="shrink-0 p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                                    >
                                        <Send size={16} className="ml-0.5" />
                                    </button>
                                </form>
                                <div className="mt-2 text-center">
                                    <span className="text-[10px] text-gray-500 font-medium">AI liên kết câu trả lời với tiến trình video bạn đang xem. Mọi thông tin được tạo ra bởi AI.</span>
                                </div>
                            </div>

                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
