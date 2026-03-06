/**
 * Skeleton loading cards for various list pages.
 * Uses Tailwind animate-pulse for shimmer effect.
 */

export function CourseCardSkeleton() {
    return (
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden animate-pulse">
            {/* Thumbnail skeleton */}
            <div className="aspect-video w-full bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200" />
            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="h-3 w-16 rounded-full bg-slate-200" />
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-2/3 rounded bg-slate-100" />
                <div className="flex items-center gap-3 pt-2">
                    <div className="h-3 w-14 rounded-full bg-slate-200" />
                    <div className="h-3 w-14 rounded-full bg-slate-200" />
                </div>
                <div className="flex items-center justify-between pt-1">
                    <div className="h-4 w-16 rounded bg-slate-200" />
                    <div className="h-3 w-20 rounded bg-slate-100" />
                </div>
            </div>
        </div>
    );
}

export function AssessmentCardSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse space-y-3">
            <div className="flex items-center justify-between">
                <div className="h-5 w-2/3 rounded bg-slate-200" />
                <div className="h-6 w-16 rounded-full bg-slate-200" />
            </div>
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="flex items-center gap-4 pt-2">
                <div className="h-3 w-20 rounded-full bg-slate-200" />
                <div className="h-3 w-20 rounded-full bg-slate-200" />
                <div className="h-3 w-20 rounded-full bg-slate-200" />
            </div>
        </div>
    );
}

export function QuestionBankCardSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse space-y-3">
            <div className="h-5 w-1/2 rounded bg-slate-200" />
            <div className="h-3 w-3/4 rounded bg-slate-100" />
            <div className="flex items-center gap-3 pt-2">
                <div className="h-6 w-20 rounded-full bg-slate-200" />
                <div className="h-3 w-24 rounded bg-slate-100" />
            </div>
        </div>
    );
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 w-full rounded bg-slate-200" />
                </td>
            ))}
        </tr>
    );
}

export function CourseCardSkeletonGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <CourseCardSkeleton key={i} />
            ))}
        </div>
    );
}
