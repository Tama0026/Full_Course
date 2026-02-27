import { Loader2 } from "lucide-react";

export default function LoadingCourses() {
    return (
        <section className="py-8 lg:py-12">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                {/* Header skeleton */}
                <div className="mb-8">
                    <div className="h-9 w-48 rounded bg-slate-200 animate-pulse"></div>
                    <div className="mt-4 h-5 w-64 rounded bg-slate-100 animate-pulse"></div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar skeleton */}
                    <div className="hidden w-60 shrink-0 lg:block">
                        <div className="h-[400px] w-full rounded-xl bg-slate-100 animate-pulse"></div>
                    </div>
                    {/* Grid skeleton */}
                    <div className="flex-1">
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-80 w-full rounded-xl bg-slate-100 animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
