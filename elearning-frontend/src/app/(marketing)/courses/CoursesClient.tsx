"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CourseCard } from "@/features/courses/CourseCard";
import { cn } from "@/lib/utils";
import { Course } from "@/lib/graphql/types";

interface CategoryItem {
    id: string;
    name: string;
    slug: string;
}

const PRICE_RANGES = [
    { value: "all", label: "Tất cả mức giá" },
    { value: "free", label: "Miễn phí" },
    { value: "under-1m", label: "Dưới 1.000.000 ₫" },
    { value: "1m-plus", label: "Trên 1.000.000 ₫" },
];

export function CoursesClient({
    initialCourses,
    categories,
}: {
    initialCourses: Course[];
    categories: CategoryItem[];
}) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [priceRange, setPriceRange] = useState("all");
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    // Build category filter list from dynamic data
    const CATEGORIES = [
        { value: "all", label: "Tất cả" },
        ...categories.map((c) => ({ value: c.name, label: c.name })),
    ];

    // Transform logic specific to GraphQL Course
    const adaptedCourses = initialCourses.map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        price: c.price,
        instructor: c.instructor?.email,
        lessonCount: c.sections?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) || 0,
        duration: c.totalDuration > 0 ? `${Math.round(c.totalDuration / 3600)} giờ` : undefined,
        rating: c.averageRating || 0,
        reviewCount: c.reviewCount || 0,
        category: c.category || "Khác",
        image: c.thumbnail,
    }));

    // Filter logic
    const filtered = adaptedCourses.filter((c) => {
        if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (category !== "all" && c.category !== category) return false;
        if (priceRange === "free" && c.price !== 0) return false;
        if (priceRange === "under-1m" && (c.price === 0 || c.price >= 1000000)) return false;
        if (priceRange === "1m-plus" && c.price < 1000000) return false;
        return true;
    });

    const FilterPanel = ({ className }: { className?: string }) => (
        <div className={cn("space-y-6", className)}>
            <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Chuyên mục</h3>
                <div className="space-y-1.5">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            className={cn(
                                "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors",
                                category === cat.value
                                    ? "bg-primary-50 font-medium text-primary-700"
                                    : "text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>
            <hr className="border-slate-200" />
            <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Mức giá</h3>
                <div className="space-y-1.5">
                    {PRICE_RANGES.map((pr) => (
                        <button
                            key={pr.value}
                            onClick={() => setPriceRange(pr.value)}
                            className={cn(
                                "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors",
                                priceRange === pr.value
                                    ? "bg-primary-50 font-medium text-primary-700"
                                    : "text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            {pr.label}
                        </button>
                    ))}
                </div>
            </div>
            {(category !== "all" || priceRange !== "all") && (
                <button
                    onClick={() => {
                        setCategory("all");
                        setPriceRange("all");
                    }}
                    className="w-full rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    Xóa bộ lọc
                </button>
            )}
        </div>
    );

    return (
        <section className="py-8 lg:py-12">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Khóa học</h1>
                    <p className="mt-2 text-slate-500">Khám phá {initialCourses.length} khóa học từ các giảng viên hàng đầu.</p>
                </div>
                <div className="mb-6 flex gap-3">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm khóa học..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                    </div>
                    <button
                        onClick={() => setShowMobileFilter(!showMobileFilter)}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors lg:hidden"
                    >
                        <SlidersHorizontal className="h-4 w-4" /> Lọc
                    </button>
                </div>
                {showMobileFilter && (
                    <>
                        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setShowMobileFilter(false)} />
                        <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white p-6 shadow-2xl lg:hidden overflow-y-auto">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900">Bộ lọc</h2>
                                <button onClick={() => setShowMobileFilter(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <FilterPanel />
                        </div>
                    </>
                )}
                <div className="flex gap-8">
                    <aside className="hidden w-60 shrink-0 lg:block">
                        <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-5">
                            <FilterPanel />
                        </div>
                    </aside>
                    <div className="flex-1">
                        {(category !== "all" || priceRange !== "all" || search) && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-slate-500">Đang lọc:</span>
                                {category !== "all" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                                        {CATEGORIES.find((c) => c.value === category)?.label}
                                        <button onClick={() => setCategory("all")}><X className="h-3 w-3" /></button>
                                    </span>
                                )}
                                {priceRange !== "all" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                                        {PRICE_RANGES.find((p) => p.value === priceRange)?.label}
                                        <button onClick={() => setPriceRange("all")}><X className="h-3 w-3" /></button>
                                    </span>
                                )}
                            </div>
                        )}
                        <p className="mb-4 text-sm text-slate-500">{filtered.length} khóa học</p>
                        {filtered.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
                                <Search className="mx-auto h-10 w-10 text-slate-300" />
                                <p className="mt-3 text-sm font-medium text-slate-500">Không tìm thấy khóa học</p>
                                <p className="mt-1 text-xs text-slate-400">Thử thay đổi bộ lọc</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {filtered.map((course: any) => (
                                    <CourseCard key={course.id} {...course} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
