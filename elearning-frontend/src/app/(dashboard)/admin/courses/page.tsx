"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ADMIN_ALL_COURSES } from "@/lib/graphql/admin";
import { useState, useMemo, useEffect } from "react";
import { Loader2, BookOpen, Search, ToggleLeft, ToggleRight, Users, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PaginationControls from "@/components/ui/PaginationControls";
import { TableRowSkeleton } from "@/components/ui/SkeletonCard";

interface AdminCourse {
    id: string; title: string; description: string; price: number;
    thumbnail?: string; category?: string; published: boolean; isActive: boolean;
    instructorId: string;
    instructor: { id: string; name?: string; email: string };
    enrollmentCount: number; sectionCount: number;
    createdAt: string; updatedAt: string;
}

/* ── Debounce hook ── */
function useDebounce(value: string, delay: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function AdminCoursesPage() {
    const [searchInput, setSearchInput] = useState("");
    const debouncedSearch = useDebounce(searchInput, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [toggling, setToggling] = useState<string | null>(null);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    const { data, loading, previousData, refetch } = useQuery<any>(GET_ADMIN_ALL_COURSES, {
        variables: {
            take: pageSize,
            skip: (currentPage - 1) * pageSize,
            search: debouncedSearch || undefined,
        },
        fetchPolicy: "cache-and-network",
    });

    const activeData = data || previousData;
    const courses: AdminCourse[] = activeData?.adminAllCourses?.items || [];
    const totalCount = activeData?.adminAllCourses?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    const isPageTransition = loading && !!previousData;

    // Auto-correct out-of-bounds page
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    async function handleToggle(courseId: string) {
        setToggling(courseId);
        try {
            const token = document.cookie.split(";").find(c => c.trim().startsWith("token="))?.split("=")[1];
            await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    query: `mutation ToggleCourseStatus($id: String!) { toggleCourseStatus(id: $id) { id isActive } }`,
                    variables: { id: courseId },
                }),
            });
            await refetch();
        } catch (err: any) {
            toast.error(err.message || "Không thể đổi trạng thái");
        } finally {
            setToggling(null);
        }
    }

    return (
        <div className="min-h-screen p-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-emerald-600" /> Tất cả khóa học
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">{totalCount} khóa học từ tất cả giảng viên</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Tìm theo tên khóa học..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full sm:w-96 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                />
            </div>

            {/* Course Table */}
            <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-opacity duration-300 ${isPageTransition ? "opacity-50" : "opacity-100"}`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Khóa học</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giảng viên</th>
                                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Học viên</th>
                                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sections</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá</th>
                                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Published</th>
                                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && !previousData ? (
                                Array.from({ length: pageSize }).map((_, i) => (
                                    <TableRowSkeleton key={i} cols={7} />
                                ))
                            ) : courses.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-16 text-slate-400">
                                        <BookOpen className="mx-auto h-12 w-12 mb-3 opacity-40" />
                                        <p>Không tìm thấy khóa học nào{debouncedSearch ? " khớp với tìm kiếm" : ""}.</p>
                                    </td>
                                </tr>
                            ) : (
                                courses.map((course, i) => (
                                    <motion.tr
                                        key={course.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                {course.thumbnail ? (
                                                    <img src={course.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 shrink-0 flex items-center justify-center">
                                                        <BookOpen className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 truncate max-w-[250px]">{course.title}</p>
                                                    {course.category && (
                                                        <span className="inline-block mt-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                                            {course.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="text-sm text-slate-700">{course.instructor.name || "—"}</p>
                                            <p className="text-xs text-slate-400">{course.instructor.email}</p>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <div className="inline-flex items-center gap-1 text-sm text-slate-600">
                                                <Users className="h-3.5 w-3.5 text-slate-400" />
                                                {course.enrollmentCount}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <div className="inline-flex items-center gap-1 text-sm text-slate-600">
                                                <Layers className="h-3.5 w-3.5 text-slate-400" />
                                                {course.sectionCount}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <span className="text-sm font-mono text-slate-700">
                                                {course.price.toLocaleString("vi-VN")}₫
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${course.published
                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                : "bg-slate-100 text-slate-500 border border-slate-200"
                                                }`}>
                                                {course.published ? "Đã xuất bản" : "Nháp"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <button
                                                onClick={() => handleToggle(course.id)}
                                                disabled={toggling === course.id}
                                                className="transition-colors disabled:opacity-50"
                                                title={course.isActive ? "Đang hoạt động — nhấn để tắt" : "Đã tắt — nhấn để bật"}
                                            >
                                                {toggling === course.id ? (
                                                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                                                ) : course.isActive ? (
                                                    <ToggleRight className="h-6 w-6 text-emerald-500 hover:text-emerald-600" />
                                                ) : (
                                                    <ToggleLeft className="h-6 w-6 text-slate-400 hover:text-slate-600" />
                                                )}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                    if (page > totalPages) page = totalPages;
                    if (page < 1) page = 1;
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                isLoading={loading}
                pageSize={pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                }}
            />
        </div>
    );
}
