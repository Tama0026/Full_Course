import {
    ArrowRight,
    BookOpen,
    GraduationCap,
    PlayCircle,
    Shield,
    Star,
    TrendingUp,
    Users,
} from "lucide-react";
import { CourseCard } from "@/features/courses/CourseCard";

import { getServerClient } from "@/lib/apollo-server";
import { GET_COURSES } from "@/lib/graphql/course";

const STATS = [
    { icon: Users, value: "10,000+", label: "Học viên" },
    { icon: BookOpen, value: "200+", label: "Khóa học" },
    { icon: GraduationCap, value: "50+", label: "Giảng viên" },
    { icon: Star, value: "4.8", label: "Đánh giá TB" },
];

/* ────────────────────────────────────────────────────────
   Homepage
   ──────────────────────────────────────────────────────── */

export default async function HomePage() {
    const client = await getServerClient();
    let featuredCourses = [];

    try {
        const { data } = await client.query<any>({
            query: GET_COURSES,
            fetchPolicy: "no-cache",
        });

        const adaptedCourses = (data.courses || []).map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            price: c.price,
            instructor: c.instructor?.email,
            lessonCount: c.sections?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) || 0,
            duration: "18 giờ", // Mocked duration
            rating: 5,
        }));

        featuredCourses = adaptedCourses.slice(0, 4);
    } catch (error) {
        console.error("Failed to fetch featured courses:", error);
    }

    return (
        <>
            {/* ════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden bg-gradient-to-b from-white via-primary-50/40 to-white">
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary-100/50 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-primary-200/30 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32 lg:px-8 lg:py-40">
                    <div className="mx-auto max-w-3xl text-center">
                        {/* Badge */}
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
                            <TrendingUp className="h-4 w-4" />
                            Nền tảng học trực tuyến #1 Việt Nam
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                            Nâng tầm kỹ năng với{" "}
                            <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                                khóa học trực tuyến
                            </span>{" "}
                            chất lượng cao
                        </h1>

                        {/* Subheading */}
                        <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
                            Khám phá hàng trăm khóa học từ các giảng viên hàng đầu. Học mọi
                            lúc, mọi nơi với video bài giảng chất lượng 4K và chứng chỉ hoàn
                            thành.
                        </p>

                        {/* CTA buttons */}
                        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            <a
                                href="/courses"
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Khám phá khóa học
                                <ArrowRight className="h-5 w-5" />
                            </a>
                            <a
                                href="/register"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400"
                            >
                                <PlayCircle className="h-5 w-5 text-primary-600" />
                                Học thử miễn phí
                            </a>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
                        {STATS.map(({ icon: Icon, value, label }) => (
                            <div key={label} className="text-center">
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900">{value}</p>
                                <p className="text-sm text-slate-500">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ SEPARATOR ═══════════════════════ */}
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <hr className="border-slate-200" />
            </div>

            {/* ════════════════════════════════════════════════
          FEATURED COURSES
          ════════════════════════════════════════════════ */}
            <section className="py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    {/* Section header */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                            Khóa học nổi bật
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
                            Được chọn lọc bởi đội ngũ chuyên gia, được đánh giá cao bởi hàng
                            ngàn học viên.
                        </p>
                    </div>

                    {/* Course grid */}
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredCourses.length > 0 ? featuredCourses.map((course: any) => (
                            <CourseCard key={course.id} {...course} />
                        )) : (
                            <div className="col-span-full py-10 text-center text-slate-500">
                                Chưa có khóa học nổi bật nào
                            </div>
                        )}
                    </div>

                    {/* View all link */}
                    <div className="mt-12 text-center">
                        <a
                            href="/courses"
                            className="inline-flex items-center gap-2 text-base font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            Xem tất cả khóa học
                            <ArrowRight className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ SEPARATOR ═══════════════════════ */}
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <hr className="border-slate-200" />
            </div>

            {/* ════════════════════════════════════════════════
          WHY US SECTION
          ════════════════════════════════════════════════ */}
            <section className="py-20 lg:py-28 bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                            Tại sao chọn E-Learning?
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
                            Chúng tôi cam kết mang đến trải nghiệm học tập tốt nhất.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: PlayCircle,
                                title: "Video chất lượng cao",
                                desc: "Bài giảng được quay với chất lượng 4K, âm thanh rõ ràng, dễ theo dõi.",
                            },
                            {
                                icon: Shield,
                                title: "Chứng chỉ hoàn thành",
                                desc: "Nhận chứng chỉ được công nhận sau khi hoàn thành khóa học.",
                            },
                            {
                                icon: Users,
                                title: "Cộng đồng hỗ trợ",
                                desc: "Tham gia cộng đồng hàng ngàn học viên, cùng nhau học tập và phát triển.",
                            },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"
                            >
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                    {desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
          CTA BANNER
          ════════════════════════════════════════════════ */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-16 text-center text-white shadow-xl sm:px-16">
                        <h2 className="text-3xl font-bold sm:text-4xl">
                            Sẵn sàng bắt đầu học?
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-primary-100">
                            Đăng ký miễn phí ngay hôm nay và nhận quyền truy cập vào các khóa
                            học miễn phí đầu tiên.
                        </p>
                        <a
                            href="/register"
                            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-primary-700 shadow-lg transition-all hover:bg-primary-50 hover:-translate-y-0.5"
                        >
                            Đăng ký miễn phí
                            <ArrowRight className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}
