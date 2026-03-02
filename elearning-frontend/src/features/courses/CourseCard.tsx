import { BookOpen, Clock, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

interface CourseCardProps {
    id: string;
    title: string;
    description: string;
    price: number;
    instructor: string;
    lessonCount?: number;
    duration?: string;
    rating?: number;
    reviewCount?: number;
    image?: string;
    category?: string;
    published?: boolean;
    className?: string;
}

/**
 * CourseCard — premium course display card with hover effects.
 */
export function CourseCard({
    id,
    title,
    description,
    price,
    instructor,
    lessonCount = 0,
    duration,
    rating,
    reviewCount = 0,
    image,
    category,
    className,
}: CourseCardProps) {
    return (
        <a
            href={`/courses/${id}`}
            className={cn(
                "group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary-200 hover:-translate-y-1",
                className
            )}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-50">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className="h-12 w-12 text-primary-300" />
                    </div>
                )}

                {/* Price badge */}
                <div className="absolute bottom-3 right-3 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1 text-sm font-bold text-primary-700 shadow-sm">
                    {price === 0 ? "Miễn phí" : formatPrice(price)}
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-primary-700 transition-colors">
                    {title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">
                    {description}
                </p>

                {/* Instructor & Category */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span>{instructor}</span>
                    </div>
                    {category && (
                        <span className="rounded-md bg-primary-50 px-2 py-0.5 font-medium text-primary-600">
                            {category}
                        </span>
                    )}
                </div>

                {/* Meta row */}
                <div className="mt-auto flex items-center gap-4 border-t border-slate-100 pt-3 mt-3 text-xs text-slate-400">
                    {lessonCount > 0 && (
                        <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {lessonCount} bài học
                        </span>
                    )}
                    {duration && (
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {duration}
                        </span>
                    )}
                    {rating !== undefined && (
                        <span className="flex items-center gap-1 text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {rating > 0 ? rating.toFixed(1) : "Mới"}
                            {reviewCount > 0 && <span className="text-slate-400 font-normal">({reviewCount})</span>}
                        </span>
                    )}
                </div>
            </div>
        </a>
    );
}
