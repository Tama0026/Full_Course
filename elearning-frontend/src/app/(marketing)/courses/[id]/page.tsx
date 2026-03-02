import { getServerClient } from "@/lib/apollo-server";
import { GET_COURSE_DETAIL } from "@/lib/graphql/course";
import { IS_ENROLLED } from "@/lib/graphql/learning";
import { GET_COURSE_BADGES } from "@/lib/graphql/gamification";
import { Course } from "@/lib/graphql/types";
import BadgeGallery from "@/components/gamification/BadgeGallery";
import LearningOutcomesSection from "./LearningOutcomesSection";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    FileText,
    GraduationCap,
    LayoutList,
    PlayCircle,
    User,
    Star,
    Clock,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default async function CourseDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const client = await getServerClient();

    let course: Course | null = null;
    try {
        const { data } = await client.query<any>({
            query: GET_COURSE_DETAIL,
            variables: { id: params.id },
        });
        course = data.course;
    } catch (error) {
        console.error("Failed to fetch course:", error);
        return notFound();
    }

    if (!course) {
        return notFound();
    }

    let currentUserId: string | null = null;
    try {
        const cookieStore = await cookies();
        const userInfo = cookieStore.get("user_info")?.value;
        if (userInfo) {
            currentUserId = JSON.parse(userInfo).id;
        }
    } catch { }

    const isInstructor = currentUserId === course.instructorId;

    // Check enrollment status (fails silently if not logged in)
    let isEnrolled = false;
    try {
        const { data: enrollmentData } = await client.query<any>({
            query: IS_ENROLLED,
            variables: { courseId: params.id },
        });
        isEnrolled = enrollmentData?.isEnrolled === true;
    } catch {
        // Not logged in or other error — treat as not enrolled
        isEnrolled = false;
    }

    // Fetch badges for this course (public, no auth needed)
    let courseBadges: any[] = [];
    try {
        const { data: badgesData } = await client.query<any>({
            query: GET_COURSE_BADGES,
            variables: { courseId: params.id },
        });
        courseBadges = badgesData?.courseBadges || [];
    } catch {
        courseBadges = [];
    }

    const lessonCount = course.sections?.reduce(
        (sum, section) => sum + (section.lessons?.length || 0), 0
    ) || 0;

    const firstLesson = course.sections?.[0]?.lessons?.[0];
    const continueUrl = firstLesson
        ? `/courses/${course.id}/lessons/${firstLesson.id}`
        : `/courses/${course.id}`;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ═══ Header ═══ */}
            <div className="bg-slate-900 pb-16 pt-8 text-white">
                <div className="mx-auto max-w-5xl px-4 lg:px-8">
                    <Link
                        href="/courses"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" /> Về danh sách
                    </Link>

                    <h1 className="text-3xl font-bold leading-tight lg:text-4xl">
                        {course.title}
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg text-slate-300">
                        {course.description}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                        {course.category && (
                            <span className="rounded-full bg-primary-500/20 px-3 py-1 font-medium text-primary-200 border border-primary-500/30">
                                {course.category}
                            </span>
                        )}
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            <span><span className="text-white font-medium">{course.averageRating > 0 ? course.averageRating.toFixed(1) : "Hiện chưa có"}</span> đánh giá {course.reviewCount > 0 && `(${course.reviewCount})`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-primary-400" />
                            <span>Giảng viên: <span className="text-white font-medium">{course.instructor?.email || "Chưa cập nhật"}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <LayoutList className="h-4 w-4 text-primary-400" />
                            <span>{course.sections?.length || 0} chương</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary-400" />
                            <span>{lessonCount} bài học</span>
                        </div>
                        {course.totalDuration > 0 && (
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary-400" />
                                <span>{Math.round(course.totalDuration / 3600)} giờ học</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ Main Content ═══ */}
            <div className="mx-auto max-w-5xl px-4 lg:px-8">
                <div className="-mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">

                    {/* LEFT COLUMN: Overview & curriculum */}
                    <div className="flex-1 space-y-8">
                        <LearningOutcomesSection outcomes={(course as any).learningOutcomes || []} />

                        {/* Curriculum */}
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <LayoutList className="h-6 w-6 text-primary-600" />
                                Nội dung khóa học
                            </h2>
                            <div className="mb-4 text-sm text-slate-500">
                                Bao gồm {course.sections?.length || 0} chương • {lessonCount} bài học
                            </div>

                            <div className="space-y-3">
                                {course.sections?.map((section, idx) => (
                                    <div key={section.id} className="rounded-lg border border-slate-200 overflow-hidden">
                                        <div className="bg-slate-50 px-4 py-3 flex items-center justify-between font-medium text-slate-800 border-b border-slate-200">
                                            <span>Chương {idx + 1}: {section.title}</span>
                                            <span className="text-sm font-normal text-slate-500">{section.lessons?.length || 0} bài</span>
                                        </div>
                                        <div className="divide-y divide-slate-100 bg-white">
                                            {section.lessons?.map((lesson) => (
                                                <div key={lesson.id} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-3 text-slate-700">
                                                        {lesson.videoUrl ? (
                                                            <PlayCircle className="h-4 w-4 text-primary-500 shrink-0" />
                                                        ) : (
                                                            <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                                                        )}
                                                        <span>{lesson.order}. {lesson.title}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!section.lessons || section.lessons.length === 0) && (
                                                <div className="px-4 py-3 text-sm text-slate-400 italic">
                                                    Chưa có bài học nào.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {(!course.sections || course.sections.length === 0) && (
                                    <div className="text-center py-8 text-slate-500 text-sm">
                                        Khóa học này đang cập nhật nội dung.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Badge Gallery */}
                        <BadgeGallery badges={courseBadges} />
                    </div>

                    {/* RIGHT COLUMN: Action card */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="sticky top-6 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                            {/* Thumbnail */}
                            {course.thumbnail ? (
                                <div className="aspect-video w-full overflow-hidden relative border-b border-slate-200">
                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="aspect-video w-full bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center text-white border-b border-slate-200">
                                    <BookOpen className="h-12 w-12 opacity-50" />
                                </div>
                            )}

                            <div className="p-6">
                                <div className="text-3xl font-bold text-slate-900 mb-6 flex items-baseline gap-2">
                                    {course.price === 0 ? "Miễn phí" : formatPrice(course.price)}
                                </div>

                                {isInstructor ? (
                                    /* ── Is Instructor → "Quản lý khóa học này" ── */
                                    <Link
                                        href={`/instructor/courses/${course.id}/edit`}
                                        className="flex w-full items-center justify-center rounded-xl bg-orange-600 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-orange-700 transition-all font-sans gap-2"
                                    >
                                        <GraduationCap className="h-5 w-5" />
                                        Quản lý khóa học
                                    </Link>
                                ) : isEnrolled ? (
                                    /* ── User is enrolled → "Tiếp tục học" ── */
                                    <>
                                        <Link
                                            href={continueUrl}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-green-700 transition-all font-sans"
                                        >
                                            <PlayCircle className="h-5 w-5" />
                                            Tiếp tục học
                                        </Link>
                                        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>Bạn đã sở hữu khóa học này</span>
                                        </div>
                                    </>
                                ) : (
                                    /* ── Not enrolled → "Đăng ký ngay" ── */
                                    <Link
                                        href={`/checkout/${course.id}`}
                                        className="flex w-full items-center justify-center rounded-xl bg-primary-600 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-primary-700 transition-all font-sans"
                                    >
                                        Đăng ký ngay
                                    </Link>
                                )}

                                <div className="mt-6 space-y-3 text-sm text-slate-600">
                                    <div className="flex items-center gap-3">
                                        <LayoutList className="h-4 w-4 text-slate-400" />
                                        <span>Tuyển tập {lessonCount} bài học chất lượng</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-4 w-4 text-slate-400" />
                                        <span>Truy cập trọn đời</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
