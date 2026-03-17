"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { IS_IN_WISHLIST, ADD_TO_WISHLIST, REMOVE_FROM_WISHLIST } from "@/lib/graphql/wishlist";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
    courseId: string;
    className?: string;
    size?: number;
}

/**
 * Heart toggle button for adding/removing courses from wishlist.
 * Shows filled heart when in wishlist, outline when not.
 */
export default function WishlistButton({ courseId, className, size = 20 }: WishlistButtonProps) {
    const [isWishlisted, setIsWishlisted] = useState(false);

    const { data, loading: checking } = useQuery<{ isInWishlist: boolean }>(IS_IN_WISHLIST, {
        variables: { courseId },
        fetchPolicy: "cache-and-network",
    });

    const [addToWishlist, { loading: adding }] = useMutation(ADD_TO_WISHLIST);
    const [removeFromWishlist, { loading: removing }] = useMutation(REMOVE_FROM_WISHLIST);

    useEffect(() => {
        if (data?.isInWishlist !== undefined) {
            setIsWishlisted(data.isInWishlist);
        }
    }, [data]);

    const isLoading = checking || adding || removing;

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if inside a link
        e.stopPropagation();

        if (isLoading) return;

        try {
            if (isWishlisted) {
                setIsWishlisted(false); // Optimistic
                await removeFromWishlist({
                    variables: { courseId },
                    refetchQueries: ["GetMyWishlist"],
                });
                toast.success("Đã xóa khỏi danh sách yêu thích");
            } else {
                setIsWishlisted(true); // Optimistic
                await addToWishlist({
                    variables: { courseId },
                    refetchQueries: ["GetMyWishlist"],
                });
                toast.success("Đã thêm vào danh sách yêu thích");
            }
        } catch (error: any) {
            setIsWishlisted(!isWishlisted); // Revert
            if (error.message?.includes("Unauthenticated") || error.message?.includes("Unauthorized")) {
                toast.error("Vui lòng đăng nhập để sử dụng tính năng này.");
            } else {
                toast.error(error.message || "Đã xảy ra lỗi.");
            }
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            title={isWishlisted ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
            className={cn(
                "group/heart flex items-center justify-center rounded-full p-2 transition-all duration-200",
                "bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm hover:shadow-md",
                "disabled:opacity-50",
                className
            )}
        >
            <Heart
                size={size}
                className={cn(
                    "transition-all duration-300",
                    isWishlisted
                        ? "text-rose-500 fill-rose-500 scale-110"
                        : "text-slate-500 group-hover/heart:text-rose-400"
                )}
            />
        </button>
    );
}
