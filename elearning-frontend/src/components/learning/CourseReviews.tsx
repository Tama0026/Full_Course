"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_COURSE_REVIEWS, GET_MY_REVIEW, CREATE_REVIEW, UPDATE_REVIEW, DELETE_REVIEW } from "@/lib/graphql/review";
import { ReviewSummary, Review } from "@/lib/graphql/types";
import { Star, Pencil, Trash2, Send, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

interface CourseReviewsProps {
    courseId: string;
    isEnrolled: boolean;
}

// ────────────────────────────────────────────────
// Star display component
// ────────────────────────────────────────────────
function StarRating({ rating, size = 16, interactive = false, onChange }: {
    rating: number;
    size?: number;
    interactive?: boolean;
    onChange?: (rating: number) => void;
}) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => interactive && setHover(star)}
                    onMouseLeave={() => interactive && setHover(0)}
                    className={`transition-transform ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
                >
                    <Star
                        size={size}
                        className={`transition-colors ${(hover || rating) >= star
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-300"
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}

// ────────────────────────────────────────────────
// Rating distribution bar
// ────────────────────────────────────────────────
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="w-3 text-slate-600 font-medium">{star}</span>
            <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="w-8 text-right text-slate-500 text-xs">{count}</span>
        </div>
    );
}

// ────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────
export default function CourseReviews({ courseId, isEnrolled }: CourseReviewsProps) {
    const [formRating, setFormRating] = useState(0);
    const [formComment, setFormComment] = useState("");
    const [editMode, setEditMode] = useState(false);

    // Queries
    const { data: summaryData, loading: summaryLoading, refetch: refetchSummary } = useQuery<{
        courseReviews: ReviewSummary;
    }>(GET_COURSE_REVIEWS, { variables: { courseId } });

    const { data: myReviewData, refetch: refetchMyReview } = useQuery<{
        myReview: Review | null;
    }>(GET_MY_REVIEW, {
        variables: { courseId },
        skip: !isEnrolled,
    });

    // Mutations
    const [createReview, { loading: creating }] = useMutation(CREATE_REVIEW);
    const [updateReview, { loading: updating }] = useMutation(UPDATE_REVIEW);
    const [deleteReview, { loading: deleting }] = useMutation(DELETE_REVIEW);

    const summary = summaryData?.courseReviews;
    const myReview = myReviewData?.myReview;
    const isSubmitting = creating || updating;

    // Enter edit mode
    const handleStartEdit = () => {
        if (myReview) {
            setFormRating(myReview.rating);
            setFormComment(myReview.comment || "");
            setEditMode(true);
        }
    };

    // Cancel edit
    const handleCancelEdit = () => {
        setEditMode(false);
        setFormRating(0);
        setFormComment("");
    };

    // Submit (create or update)
    const handleSubmit = async () => {
        if (formRating === 0) {
            toast.error("Vui lòng chọn số sao đánh giá.");
            return;
        }

        try {
            if (editMode && myReview) {
                await updateReview({
                    variables: {
                        reviewId: myReview.id,
                        input: { rating: formRating, comment: formComment || null },
                    },
                });
                toast.success("Đã cập nhật đánh giá!");
                setEditMode(false);
            } else {
                await createReview({
                    variables: {
                        input: { courseId, rating: formRating, comment: formComment || null },
                    },
                });
                toast.success("Cảm ơn bạn đã đánh giá!");
            }

            setFormRating(0);
            setFormComment("");
            refetchSummary();
            refetchMyReview();
        } catch (error: any) {
            toast.error(error.message || "Không thể gửi đánh giá.");
        }
    };

    // Delete
    const handleDelete = async () => {
        if (!myReview) return;
        try {
            await deleteReview({ variables: { reviewId: myReview.id } });
            toast.success("Đã xóa đánh giá.");
            setEditMode(false);
            setFormRating(0);
            setFormComment("");
            refetchSummary();
            refetchMyReview();
        } catch (error: any) {
            toast.error(error.message || "Không thể xóa đánh giá.");
        }
    };

    // Format relative time
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return "Hôm nay";
        if (days === 1) return "Hôm qua";
        if (days < 30) return `${days} ngày trước`;
        if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
        return `${Math.floor(days / 365)} năm trước`;
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary-600" />
                Đánh giá từ học viên
            </h2>

            {/* ═══ Rating Summary ═══ */}
            {summaryLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
                </div>
            ) : summary && summary.totalCount > 0 ? (
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-8 pb-8 border-b border-slate-100">
                    {/* Big average */}
                    <div className="flex flex-col items-center text-center min-w-[120px]">
                        <span className="text-5xl font-bold text-slate-900">
                            {summary.averageRating.toFixed(1)}
                        </span>
                        <StarRating rating={Math.round(summary.averageRating)} size={20} />
                        <span className="text-sm text-slate-500 mt-1">
                            {summary.totalCount} đánh giá
                        </span>
                    </div>

                    {/* Bar chart */}
                    <div className="flex-1 space-y-1.5 w-full">
                        <RatingBar star={5} count={summary.star5} total={summary.totalCount} />
                        <RatingBar star={4} count={summary.star4} total={summary.totalCount} />
                        <RatingBar star={3} count={summary.star3} total={summary.totalCount} />
                        <RatingBar star={2} count={summary.star2} total={summary.totalCount} />
                        <RatingBar star={1} count={summary.star1} total={summary.totalCount} />
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-slate-500 mb-6 border-b border-slate-100">
                    <Star className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium">Chưa có đánh giá nào</p>
                    <p className="text-sm text-slate-400 mt-1">Hãy là người đầu tiên đánh giá khóa học này!</p>
                </div>
            )}

            {/* ═══ Write / Edit Review Form ═══ */}
            {isEnrolled && !myReview && !editMode && (
                <div className="mb-8 p-5 rounded-xl bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-100">
                    <h3 className="font-semibold text-slate-900 mb-3">Viết đánh giá của bạn</h3>
                    <div className="mb-3">
                        <StarRating rating={formRating} size={28} interactive onChange={setFormRating} />
                    </div>
                    <textarea
                        value={formComment}
                        onChange={(e) => setFormComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về khóa học... (tùy chọn)"
                        rows={3}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 resize-none bg-white"
                    />
                    <div className="flex justify-end mt-3">
                        <button
                            onClick={handleSubmit}
                            disabled={formRating === 0 || isSubmitting}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {isSubmitting ? (
                                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            ) : (
                                <Send size={14} />
                            )}
                            Gửi đánh giá
                        </button>
                    </div>
                </div>
            )}

            {/* Edit mode */}
            {editMode && myReview && (
                <div className="mb-8 p-5 rounded-xl bg-amber-50 border border-amber-200">
                    <h3 className="font-semibold text-slate-900 mb-3">Chỉnh sửa đánh giá</h3>
                    <div className="mb-3">
                        <StarRating rating={formRating} size={28} interactive onChange={setFormRating} />
                    </div>
                    <textarea
                        value={formComment}
                        onChange={(e) => setFormComment(e.target.value)}
                        placeholder="Nhận xét (tùy chọn)"
                        rows={3}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none bg-white"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={formRating === 0 || isSubmitting}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {isSubmitting ? (
                                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            ) : (
                                <Send size={14} />
                            )}
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            )}

            {/* My existing review (view mode) */}
            {myReview && !editMode && (
                <div className="mb-6 p-4 rounded-xl bg-primary-50/50 border border-primary-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary-700">Đánh giá của bạn</span>
                            <StarRating rating={myReview.rating} size={14} />
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleStartEdit}
                                className="p-1.5 rounded-md text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                title="Chỉnh sửa"
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Xóa"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                    {myReview.comment && (
                        <p className="text-sm text-slate-700">{myReview.comment}</p>
                    )}
                </div>
            )}

            {/* ═══ Review List ═══ */}
            {summary && summary.reviews.length > 0 && (
                <div className="space-y-4">
                    {summary.reviews.map((review) => (
                        <div
                            key={review.id}
                            className="flex gap-3 pb-4 border-b border-slate-50 last:border-b-0"
                        >
                            {/* Avatar */}
                            <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                {review.user?.avatar ? (
                                    <img
                                        src={review.user.avatar}
                                        alt={review.user.name || "User"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    (review.user?.name?.[0] || "?").toUpperCase()
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-slate-900">
                                        {review.user?.name || "Ẩn danh"}
                                    </span>
                                    <StarRating rating={review.rating} size={12} />
                                    <span className="text-xs text-slate-400">
                                        {formatDate(review.createdAt)}
                                    </span>
                                </div>
                                {review.comment && (
                                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                                        {review.comment}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
