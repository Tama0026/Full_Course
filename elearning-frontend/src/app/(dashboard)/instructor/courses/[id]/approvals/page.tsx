"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_COURSE_STUDENTS, APPROVE_ENROLLMENT, REJECT_ENROLLMENT } from "@/lib/graphql/course";
import { Loader2, CheckCircle, XCircle, Search, User, Clock } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";


export default function ApprovalsPage({ params }: { params: { id: string } }) {
    const courseId = params.id;
    const [searchTerm, setSearchTerm] = useState("");

    const { data, loading, error, refetch } = useQuery<any>(GET_COURSE_STUDENTS, {
        variables: { courseId },
        fetchPolicy: "network-only",
    });

    const [approveEnrollment, { loading: appLoading }] = useMutation(APPROVE_ENROLLMENT, {
        onCompleted: () => {
            toast.success("Đã phê duyệt và thông báo cho học viên ✨");
            refetch();
        },
        onError: (err: any) => toast.error(err.message),
    });

    const [rejectEnrollment, { loading: rejLoading }] = useMutation(REJECT_ENROLLMENT, {
        onCompleted: () => {
            toast.success("Đã từ chối đơn đăng ký");
            refetch();
        },
        onError: (err: any) => toast.error(err.message),
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg my-6">
                Đã có lỗi xảy ra tải danh sách chờ duyệt: {error.message}
            </div>
        );
    }

    const students = data?.getCourseStudents || [];
    const pendingStudents = students.filter((st: any) => st.status === "PENDING");

    const filteredPending = pendingStudents.filter(
        (st: any) =>
            st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            st.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleApprove = (studentId: string) => {
        approveEnrollment({ variables: { studentId, courseId } });
    };

    const handleReject = (studentId: string) => {
        if (confirm("Bạn có chắc chắn muốn từ chối đăng ký của học viên này?")) {
            rejectEnrollment({ variables: { studentId, courseId } });
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Duyệt Đăng Ký ({pendingStudents.length})</h2>
                    <p className="text-slate-500 text-sm mt-1">Danh sách học viên đang chờ bạn phê duyệt để vào học.</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        placeholder="Tìm kiếm..."
                        className="pl-9 h-10 w-full"
                        value={searchTerm}
                        onChange={(e: any) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredPending.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
                    <CheckCircle className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900">Không có đơn đăng ký nào</h3>
                    <p className="mt-1 text-slate-500">Tất cả các đơn đăng ký đã được xử lý.</p>
                </div>
            ) : (
                <div className="bg-white border text-left border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Tên học viên</th>
                                    <th className="px-6 py-4 font-semibold text-center">Ngày yêu cầu</th>
                                    <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPending.map((st: any) => (
                                    <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {st.avatar ? (
                                                    <Image
                                                        src={st.avatar}
                                                        alt={st.name}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full border border-slate-200 object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-900">{st.name}</p>
                                                    <p className="text-slate-500 text-xs">{st.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-slate-500">
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    {st.enrolledAt
                                                        ? format(new Date(parseInt(st.enrolledAt as any)), "dd/MM/yyyy HH:mm")
                                                        : "N/A"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleReject(st.id)}
                                                    disabled={appLoading || rejLoading}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                                                >
                                                    <XCircle className="w-4 h-4 text-red-500" /> Từ chối
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(st.id)}
                                                    disabled={appLoading || rejLoading}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Duyệt
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
