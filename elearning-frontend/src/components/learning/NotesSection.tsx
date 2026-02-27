"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_LESSON_NOTES, CREATE_NOTE, DELETE_NOTE } from "@/lib/graphql/note";
import { StickyNote, Plus, Play, Trash2, Loader2 } from "lucide-react";

function formatTimestamp(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

interface NotesSectionProps {
    lessonId: string;
    videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export default function NotesSection({ lessonId, videoRef }: NotesSectionProps) {
    const [content, setContent] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const { data, loading } = useQuery<any>(GET_LESSON_NOTES, { variables: { lessonId } });

    const [createNote, { loading: creating }] = useMutation(CREATE_NOTE, {
        refetchQueries: [{ query: GET_LESSON_NOTES, variables: { lessonId } }],
    });

    const [deleteNote] = useMutation(DELETE_NOTE, {
        refetchQueries: [{ query: GET_LESSON_NOTES, variables: { lessonId } }],
    });

    async function handleAddNote() {
        if (!content.trim()) return;
        const timestamp = videoRef?.current?.currentTime || 0;
        await createNote({
            variables: { input: { content, lessonId, videoTimestamp: timestamp } },
        });
        setContent("");
        setIsAdding(false);
    }

    function handleSeek(timestamp: number) {
        if (videoRef?.current) {
            videoRef.current.currentTime = timestamp;
            videoRef.current.play();
        }
    }

    const notes = data?.lessonNotes || [];

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <StickyNote className="h-5 w-5 text-primary-600" />
                    Ghi chú ({notes.length})
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Thêm ghi chú
                </button>
            </div>

            {/* Add note form */}
            {isAdding && (
                <div className="mb-4 rounded-lg border border-primary-200 bg-primary-50/50 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-primary-600 font-medium">
                        <Play className="h-3.5 w-3.5" />
                        Ghi chú tại: {formatTimestamp(videoRef?.current?.currentTime || 0)}
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Viết ghi chú..."
                        rows={3}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none bg-white"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddNote}
                            disabled={creating || !content.trim()}
                            className="flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                        >
                            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Lưu
                        </button>
                        <button
                            onClick={() => { setIsAdding(false); setContent(""); }}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {/* Notes list */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
            ) : notes.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                    Chưa có ghi chú nào cho bài học này.
                </div>
            ) : (
                <div className="space-y-2">
                    {notes.map((note: any) => (
                        <div
                            key={note.id}
                            className="group flex items-start gap-3 rounded-lg border border-slate-100 p-3 hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
                        >
                            <button
                                onClick={() => handleSeek(note.videoTimestamp)}
                                className="mt-0.5 flex h-7 w-12 shrink-0 items-center justify-center rounded bg-primary-100 text-xs font-mono font-semibold text-primary-700 hover:bg-primary-200 transition-colors"
                                title="Nhảy tới thời điểm này"
                            >
                                <Play className="h-3 w-3 mr-0.5" />
                                {formatTimestamp(note.videoTimestamp)}
                            </button>
                            <p className="flex-1 text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                            <button
                                onClick={() => deleteNote({ variables: { id: note.id } })}
                                className="shrink-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
