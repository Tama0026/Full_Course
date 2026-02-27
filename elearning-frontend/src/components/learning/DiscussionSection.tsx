"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_LESSON_COMMENTS, CREATE_COMMENT, DELETE_COMMENT } from "@/lib/graphql/comment";
import { MessageSquare, Reply, Send, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function timeAgo(date: string) {
    const ms = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
}

interface CommentItemProps {
    comment: any;
    lessonId: string;
    currentUserId?: string;
    depth?: number;
}

function CommentItem({ comment, lessonId, currentUserId, depth = 0 }: CommentItemProps) {
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState("");

    const [createComment, { loading: creating }] = useMutation(CREATE_COMMENT, {
        refetchQueries: [{ query: GET_LESSON_COMMENTS, variables: { lessonId } }],
    });

    const [deleteComment] = useMutation(DELETE_COMMENT, {
        refetchQueries: [{ query: GET_LESSON_COMMENTS, variables: { lessonId } }],
    });

    async function handleReply() {
        if (!replyText.trim()) return;
        await createComment({
            variables: { input: { content: replyText, lessonId, parentId: comment.id } },
        });
        setReplyText("");
        setShowReply(false);
    }

    return (
        <div className={cn("group", depth > 0 && "ml-8 border-l-2 border-slate-100 pl-4")}>
            <div className="flex gap-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                    {comment.user?.email?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                            {comment.user?.email || "Ẩn danh"}
                        </span>
                        <span className="text-xs text-slate-400">{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{comment.content}</p>
                    <div className="mt-2 flex items-center gap-3">
                        {depth < 2 && (
                            <button
                                onClick={() => setShowReply(!showReply)}
                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary-600 transition-colors"
                            >
                                <Reply className="h-3.5 w-3.5" /> Trả lời
                            </button>
                        )}
                        {currentUserId === comment.userId && (
                            <button
                                onClick={() => deleteComment({ variables: { id: comment.id } })}
                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Xóa
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showReply && (
                <div className="ml-11 mb-3 flex gap-2">
                    <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleReply()}
                        placeholder="Viết phản hồi..."
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    <button
                        onClick={handleReply}
                        disabled={creating || !replyText.trim()}
                        className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                </div>
            )}

            {comment.replies?.map((reply: any) => (
                <CommentItem
                    key={reply.id}
                    comment={reply}
                    lessonId={lessonId}
                    currentUserId={currentUserId}
                    depth={depth + 1}
                />
            ))}
        </div>
    );
}

export default function DiscussionSection({ lessonId, currentUserId }: { lessonId: string; currentUserId?: string }) {
    const [newComment, setNewComment] = useState("");
    const { data, loading } = useQuery<any>(GET_LESSON_COMMENTS, { variables: { lessonId } });

    const [createComment, { loading: creating }] = useMutation(CREATE_COMMENT, {
        refetchQueries: [{ query: GET_LESSON_COMMENTS, variables: { lessonId } }],
    });

    async function handleSubmit() {
        if (!newComment.trim()) return;
        await createComment({
            variables: { input: { content: newComment, lessonId } },
        });
        setNewComment("");
    }

    const comments = data?.lessonComments || [];

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <MessageSquare className="h-5 w-5 text-primary-600" />
                Thảo luận ({comments.length})
            </h3>

            {/* New comment form */}
            {currentUserId && (
                <div className="mb-6 flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                        U
                    </div>
                    <div className="flex-1 space-y-2">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Đặt câu hỏi hoặc chia sẻ ý kiến..."
                            rows={3}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={creating || !newComment.trim()}
                            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                        >
                            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Bình luận
                        </button>
                    </div>
                </div>
            )}

            {/* Comments list */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
            ) : comments.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                    Chưa có bình luận nào. Hãy là người đầu tiên!
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {comments.map((comment: any) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            lessonId={lessonId}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
