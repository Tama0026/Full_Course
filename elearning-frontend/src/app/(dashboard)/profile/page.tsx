"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
    User as UserIcon, Award, Brain, Edit3, Save, X, Loader2,
    Mail, Calendar, Shield, ChevronRight, Star, TrendingUp,
    BookOpen, Sparkles, AlertCircle, CheckCircle2, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GET_PROFILE, UPDATE_PROFILE, GET_MY_CERTIFICATES, ASSESS_SKILL } from "@/lib/graphql/profile";
import { GET_MY_ENROLLMENTS } from "@/lib/graphql/learning";
import type { User, Certificate, Enrollment } from "@/lib/graphql/types";

/* ─── AI Rank Type ─── */
interface AiRankData {
    overallScore: number;
    skills: { name: string; score: number }[];
    level: string;
    summary: string;
    recommendations: string[];
}

/* ─── Skill Bar Component ─── */
function SkillBar({ name, score }: { name: string; score: number }) {
    const color = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-blue-500" : "bg-amber-500";
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{name}</span>
                <span className="text-sm font-bold text-slate-900">{score}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100">
                <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${score}%` }} />
            </div>
        </div>
    );
}

/* ─── Certificate Card Component ─── */
function CertificateCard({ cert }: { cert: Certificate }) {
    const inner = (
        <div className="group relative overflow-hidden rounded-xl border-2 border-blue-100 bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20 p-6 transition-all hover:border-blue-300 hover:shadow-lg cursor-pointer">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 h-20 w-20">
                <div className="absolute top-0 right-0 h-full w-full bg-blue-600 clip-corner" />
                <Award className="absolute top-2 right-2 h-5 w-5 text-white" />
            </div>

            <div className="mb-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Award className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Chứng Chỉ Hoàn Thành</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{cert.courseNameAtIssue || cert.courseName}</h3>
            </div>

            <div className="border-t border-blue-100 pt-3 space-y-1">
                <p className="text-sm text-slate-600"><span className="font-medium">Người nhận:</span> {cert.userName || "Học viên"}</p>
                <p className="text-sm text-slate-500">
                    <span className="font-medium">Ngày cấp:</span> {new Date(cert.issueDate).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-2">Mã: {cert.certificateCode}</p>
            </div>

            {cert.certificateUrl && (
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-500">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Xem chứng chỉ
                </div>
            )}

            <style jsx>{`
                .clip-corner { clip-path: polygon(100% 0, 0 0, 100% 100%); }
            `}</style>
        </div>
    );

    if (cert.certificateUrl) {
        return (
            <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer">
                {inner}
            </a>
        );
    }
    return inner;
}

/* ─── Main Profile Page ─── */
export default function ProfilePage() {
    const { data: profileData, loading: profileLoading, refetch: refetchProfile } = useQuery<any>(GET_PROFILE);
    const { data: certsData, loading: certsLoading } = useQuery<any>(GET_MY_CERTIFICATES);
    const { data: enrollData } = useQuery<any>(GET_MY_ENROLLMENTS);
    const [updateProfile, { loading: saving }] = useMutation<any>(UPDATE_PROFILE);
    const [assessSkill, { loading: assessing }] = useMutation<any>(ASSESS_SKILL);

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: "", headline: "", bio: "" });
    const [aiRank, setAiRank] = useState<AiRankData | null>(null);

    const user: User | null = profileData?.me || null;
    const certs: Certificate[] = certsData?.myCertificates || [];
    const enrollments: Enrollment[] = enrollData?.myEnrollments || [];

    useEffect(() => {
        if (user) {
            setForm({ name: user.name || "", headline: user.headline || "", bio: user.bio || "" });
            if (user.aiRank) {
                try { setAiRank(JSON.parse(user.aiRank)); } catch { }
            }
        }
    }, [user]);

    async function handleSave() {
        try {
            await updateProfile({
                variables: { input: { name: form.name || null, headline: form.headline || null, bio: form.bio || null } },
            });
            refetchProfile();
            setEditing(false);
        } catch (err) { console.error(err); }
    }

    async function handleAssess() {
        try {
            const { data } = await assessSkill();
            if (data?.assessSkill) {
                const parsed = JSON.parse(data.assessSkill);
                setAiRank(parsed);
                refetchProfile();
            }
        } catch (err) { console.error("AI Assessment failed:", err); }
    }

    if (profileLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-full items-center justify-center text-slate-500">
                <AlertCircle className="h-6 w-6 mr-2" /> Vui lòng đăng nhập
            </div>
        );
    }

    const levelColors: Record<string, string> = {
        "Newbie": "bg-gray-100 text-gray-700 border-gray-200",
        "Entry-Level": "bg-gray-100 text-gray-700 border-gray-200",
        "Beginner": "bg-gray-100 text-gray-700 border-gray-200",
        Junior: "bg-amber-100 text-amber-700 border-amber-200",
        "Mid-Level": "bg-blue-100 text-blue-700 border-blue-200",
        Senior: "bg-purple-100 text-purple-700 border-purple-200",
        Expert: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* ═══ HERO / COVER ═══ */}
            <div className="relative h-48 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0djE0aDhWMTRoLTh6TTIyIDB2OGg4VjBoLTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
            </div>

            <div className="mx-auto max-w-5xl px-4 -mt-20 relative z-10">
                {/* ═══ PROFILE CARD ═══ */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xl p-6 md:p-8 mb-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <div className="shrink-0">
                            <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="" className="h-full w-full object-cover rounded-2xl" />
                                ) : (
                                    (user.name || user.email)[0].toUpperCase()
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            {!editing ? (
                                <>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h1 className="text-2xl font-bold text-slate-900">{user.name || user.email.split("@")[0]}</h1>
                                            {user.headline && <p className="text-sm font-medium text-blue-600 mt-0.5">{user.headline}</p>}
                                        </div>
                                        <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                            <Edit3 className="h-3.5 w-3.5" /> Chỉnh sửa
                                        </button>
                                    </div>
                                    {user.bio && <p className="mt-3 text-sm text-slate-600 leading-relaxed">{user.bio}</p>}
                                    <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {user.email}</span>
                                        <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> {user.role}</span>
                                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Họ và tên" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" />
                                    <input value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} placeholder="Tiêu đề nghề nghiệp (VD: Full-Stack Developer)" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" />
                                    <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Giới thiệu bản thân..." rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none" />
                                    <div className="flex gap-2">
                                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Lưu
                                        </button>
                                        <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                            <X className="h-3.5 w-3.5" /> Hủy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{enrollments.length}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Khóa học</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-600">{certs.length}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Chứng chỉ</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{aiRank?.overallScore || "--"}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Điểm AI</p>
                        </div>
                    </div>
                </div>

                {/* ═══ MAIN CONTENT GRID ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
                    {/* LEFT: AI Assessment */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* AI Rank Card */}
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-purple-600" />
                                    <h2 className="text-lg font-bold text-slate-900">Đánh giá trình độ AI</h2>
                                </div>
                                <button onClick={handleAssess} disabled={assessing} className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors">
                                    {assessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                    {assessing ? "Đang đánh giá..." : "Đánh giá ngay"}
                                </button>
                            </div>

                            <div className="p-6">
                                {aiRank ? (
                                    <div className="space-y-6">
                                        {/* Level + Score */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                                                <div className="text-center">
                                                    <p className="text-2xl font-black">{aiRank.overallScore}</p>
                                                    <p className="text-[10px] uppercase tracking-wider opacity-80">điểm</p>
                                                </div>
                                            </div>
                                            <div>
                                                <span className={cn("inline-block rounded-full border px-3 py-1 text-xs font-bold", levelColors[aiRank.level] || "bg-slate-100 text-slate-700")}>
                                                    {aiRank.level}
                                                </span>
                                                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{aiRank.summary}</p>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                                <TrendingUp className="h-4 w-4 text-blue-500" /> Kỹ năng chi tiết
                                            </h3>
                                            {aiRank.skills && aiRank.skills.map((s, i) => (
                                                <SkillBar key={i} name={s.name} score={s.score} />
                                            ))}
                                        </div>

                                        {/* Recommendations */}
                                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                                            <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-1.5">
                                                <Star className="h-4 w-4" /> Khuyến nghị từ AI
                                            </h3>
                                            <ul className="space-y-1.5">
                                                {aiRank.recommendations && aiRank.recommendations.map((r, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                                                        <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                                                        <span>{r}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Brain className="mx-auto h-12 w-12 text-slate-200 mb-3" />
                                        <p className="text-sm text-slate-500">Nhấn &quot;Đánh giá ngay&quot; để AI phân tích trình độ của bạn dựa trên các khóa học đã hoàn thành.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Certificates */}
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-slate-100">
                                <Award className="h-5 w-5 text-amber-600" />
                                <h2 className="text-lg font-bold text-slate-900">Chứng chỉ</h2>
                                <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">{certs.length}</span>
                            </div>
                            <div className="p-6">
                                {certsLoading ? (
                                    <div className="text-center py-6"><Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-500" /></div>
                                ) : certs.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {certs.map(cert => <CertificateCard key={cert.id} cert={cert} />)}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Award className="mx-auto h-12 w-12 text-slate-200 mb-3" />
                                        <p className="text-sm text-slate-500">Hoàn thành khóa học để nhận chứng chỉ!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Enrolled Courses */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-100">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                <h2 className="text-lg font-bold text-slate-900">Khóa học</h2>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {enrollments.length > 0 ? enrollments.map((enrollment: any) => {
                                    const course = enrollment.course;
                                    const totalLessons = (course?.sections || []).flatMap((s: any) => s.lessons || []).length || 0;
                                    const completed = enrollment.progresses?.length || 0;
                                    const pct = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

                                    // Find first lesson to navigate to
                                    const sortedSections = [...(course?.sections || [])].sort((a: any, b: any) => a.order - b.order);
                                    const firstLesson = sortedSections.flatMap((s: any) =>
                                        [...(s.lessons || [])].sort((a: any, b: any) => a.order - b.order)
                                    )[0];
                                    const courseHref = firstLesson
                                        ? `/courses/${course.id}/lessons/${firstLesson.id}`
                                        : `/student`;

                                    return (
                                        <Link
                                            key={enrollment.id}
                                            href={courseHref}
                                            className="block px-6 py-4 hover:bg-blue-50 transition-colors group"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-700 transition-colors">{course?.title}</h3>
                                                <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                                                    <div className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-emerald-500" : "bg-blue-500")} style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs font-medium text-slate-500 w-8 text-right">{pct}%</span>
                                            </div>
                                            {pct === 100 && (
                                                <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                                                    <CheckCircle2 className="h-3 w-3" /> Đã hoàn thành
                                                </span>
                                            )}
                                        </Link>
                                    );
                                }) : (
                                    <div className="px-6 py-8 text-center">
                                        <BookOpen className="mx-auto h-8 w-8 text-slate-200 mb-2" />
                                        <p className="text-sm text-slate-500">Chưa đăng ký khóa học nào</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
