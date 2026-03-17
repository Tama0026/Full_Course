"use client";

import { useQuery } from "@apollo/client/react";
import { GET_MY_WISHLIST } from "@/lib/graphql/wishlist";
import { CourseCard } from "@/features/courses/CourseCard";
import { Heart, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
    const { data, loading, error } = useQuery<{ myWishlist: any[] }>(GET_MY_WISHLIST, {
        fetchPolicy: "cache-and-network",
    });

    const wishlistItems = data?.myWishlist || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
                        Khóa học yêu thích
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {wishlistItems.length > 0
                            ? `Bạn có ${wishlistItems.length} khóa học trong danh sách yêu thích`
                            : "Lưu khóa học bạn yêu thích để xem sau"
                        }
                    </p>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
            ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                    <p className="text-sm text-red-700">Có lỗi xảy ra khi tải danh sách yêu thích.</p>
                </div>
            ) : wishlistItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 py-20 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-sm font-medium text-slate-500">
                        Chưa có khóa học nào trong danh sách
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        Nhấn vào biểu tượng trái tim trên các khóa học để thêm vào đây
                    </p>
                    <Link
                        href="/explore"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
                    >
                        Khám phá khóa học
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {wishlistItems.map((item: any) => {
                        const c = item.course;
                        if (!c) return null;
                        return (
                            <CourseCard
                                key={c.id}
                                id={c.id}
                                title={c.title}
                                description={c.description}
                                price={c.price}
                                instructor={c.instructor?.name || c.instructor?.email || "Unknown"}
                                lessonCount={c.sections?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) || 0}
                                duration={c.totalDuration > 0 ? `${Math.round(c.totalDuration / 3600)} giờ` : undefined}
                                rating={c.averageRating || 0}
                                reviewCount={c.reviewCount || 0}
                                category={c.category || "Khác"}
                                image={c.thumbnail}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
