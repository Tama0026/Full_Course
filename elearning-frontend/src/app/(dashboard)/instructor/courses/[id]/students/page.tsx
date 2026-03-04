"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_COURSE_STUDENTS, SEND_LEARNING_REMINDER, GET_COURSE_DETAIL, APPROVE_ENROLLMENT } from "@/lib/graphql/course";
import { ArrowLeft, Users, Mail, Loader2, ExternalLink, CheckCircle } from "lucide-react";
import StudentProgressTimeline from "@/components/instructor/StudentProgressTimeline";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CourseStudentsPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    const { data: courseData, loading: courseLoading } = useQuery<any>(GET_COURSE_DETAIL, {
        variables: { id: courseId },
        skip: !courseId,
    });

    const { data: studentsData, loading: studentsLoading, refetch } = useQuery<any>(GET_COURSE_STUDENTS, {
        variables: { courseId },
        skip: !courseId,
        fetchPolicy: "network-only"
    });

    const [sendReminder, { loading: sending }] = useMutation(SEND_LEARNING_REMINDER);
    const [approveEnrollment, { loading: approving }] = useMutation(APPROVE_ENROLLMENT);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    const handleSendReminder = async (student: any) => {
        setSendingId(student.id);
        const toastId = toast.loading(`Đang gửi nhắc nhở cho ${student.name}...`);
        try {
            await sendReminder({
                variables: { studentId: student.id, courseId }
            });
            toast.success(`Đã gửi nhắc nhở thành công tới ${student.name} ✨`, { id: toastId });
            refetch(); // Update lastRemindedAt status directly from server
        } catch (err: any) {
            toast.error(err?.message || "Lỗi khi gửi nhắc nhở", { id: toastId });
        } finally {
            setSendingId(null);
        }
    };

    const handleApprove = async (student: any) => {
        setApprovingId(student.id);
        const toastId = toast.loading(`Đang duyệt học viên ${student.name}...`);
        try {
            await approveEnrollment({
                variables: { studentId: student.id, courseId }
            });
            toast.success(`Đã duyệt thành công cho ${student.name}!`, { id: toastId });
            refetch(); // Update status directly from server
        } catch (err: any) {
            toast.error(err?.message || "Lỗi khi duyệt", { id: toastId });
        } finally {
            setApprovingId(null);
        }
    };

    if (courseLoading || studentsLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const course = courseData?.course;
    const students = studentsData?.getCourseStudents || [];

    return (
        <div className="w-full">
            {/* Content */}
            <div className="max-w-6xl mx-auto">
                {students.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                            <Users className="h-8 w-8 text-indigo-500" />
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-slate-900">Chưa có học viên nào</h3>
                        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                            Khóa học này hiện chưa có đăng ký nào. Cố gắng chia sẻ khóa học của bạn đến nhiều người hơn nhé!
                        </p>
                        <Link
                            href={`/courses/${courseId}`}
                            target="_blank"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Xem trang khóa học
                        </Link>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">
                                Tổng số lượng học viên: <span className="text-indigo-600">{students.length}</span>
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Thông tin Học viên</th>
                                        <th className="px-6 py-4 font-semibold text-center">Tiến độ</th>
                                        <th className="px-6 py-4 font-semibold">Ngày đăng ký</th>
                                        <th className="px-6 py-4 font-semibold">Ngày được duyệt</th>
                                        <th className="px-6 py-4 font-semibold">Hoạt động cuối trên khóa học</th>
                                        <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {students.map((st: any) => {
                                        const isCompleted = st.progressPercent === 100;
                                        const isLowProgress = st.progressPercent < 20;

                                        const canRemind = !st.lastRemindedAt ||
                                            ((new Date().getTime() - new Date(st.lastRemindedAt).getTime()) / (1000 * 3600)) >= 24;

                                        return (
                                            <tr key={st.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                            {st.avatar ? (
                                                                <img src={st.avatar} alt={st.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <UserIcon name={st.name} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900">{st.name}</div>
                                                            <div className="text-xs text-slate-500">{st.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => setSelectedStudent(st)}>
                                                        <span className={cn(
                                                            "inline-flex font-bold px-2.5 py-0.5 rounded-full text-xs transition-colors",
                                                            isCompleted ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
                                                                st.progressPercent > 80 ? "bg-blue-100 text-blue-700 hover:bg-blue-200" :
                                                                    isLowProgress ? "bg-slate-100 text-slate-600 hover:bg-slate-200" :
                                                                        "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                                        )}>
                                                            {st.progressPercent}%
                                                        </span>
                                                        <span className="text-[10px] text-indigo-500 hover:underline font-medium uppercase tracking-wider">Xem Timeline</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {st.requestedAt ? (
                                                        <div className="text-xs text-slate-600 font-medium">
                                                            {format(new Date(st.requestedAt), "dd/MM/yyyy", { locale: vi })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Không rõ</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {st.enrolledAt ? (
                                                        <div className="text-xs text-slate-600 font-medium">
                                                            {format(new Date(st.enrolledAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-amber-500 italic font-medium">Chưa tham gia (Chờ duyệt)</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {st.lastActive ? (
                                                        <div className="text-xs text-slate-600 font-medium">
                                                            {formatDistanceToNow(new Date(st.lastActive), { addSuffix: true, locale: vi })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Chưa bắt đầu</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {st.status === 'PENDING' && (
                                                            <button
                                                                onClick={() => handleApprove(st)}
                                                                disabled={approvingId === st.id || approving}
                                                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shadow-sm border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 disabled:opacity-50"
                                                                title="Phê duyệt tham gia khóa học"
                                                            >
                                                                {approvingId === st.id ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                                )}
                                                                Duyệt
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleSendReminder(st)}
                                                            disabled={!canRemind || sendingId === st.id || sending || isCompleted || st.status === 'PENDING'}
                                                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-600 disabled:hover:text-slate-700 shadow-sm"
                                                            title={!canRemind ? "Mỗi học viên chỉ nhận 1 mail nhắc nhở mỗi ngày" : isCompleted ? "Học viên đã hoàn thành khóa học" : "Gửi email nhắc nhở học viên"}
                                                        >
                                                            {sendingId === st.id ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <Mail className="h-3.5 w-3.5" />
                                                            )}
                                                            Nhắc nhở
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline Modal */}
            {selectedStudent && (
                <StudentProgressTimeline
                    isOpen={!!selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                    studentName={selectedStudent.name}
                    timeline={selectedStudent.progressTimeline || []}
                />
            )}
        </div>
    );
}

function UserIcon({ name }: { name: string }) {
    const letter = name ? name.charAt(0).toUpperCase() : 'U';
    return <span className="text-sm font-bold text-slate-500">{letter}</span>;
}
