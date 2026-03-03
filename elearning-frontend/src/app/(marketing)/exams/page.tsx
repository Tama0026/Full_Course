"use client";

import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Loader2, ClipboardList, Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils"; // Not pricing, just utility if needed

const GET_OPEN_ASSESSMENTS = gql`
  query GetOpenAssessments {
    assessments {
      id
      title
      description
      timeLimit
      passingScore
      isActive
    }
  }
`;

export default function AssessmentsListPage() {
    const { data, loading, error } = useQuery(GET_OPEN_ASSESSMENTS, { fetchPolicy: "network-only" });

    if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (error) return <div className="py-20 text-center text-red-500">Lỗi tải danh sách kỳ thi: {error.message}</div>;

    const assessments = (data as any)?.assessments || [];

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="max-w-5xl mx-auto px-4 lg:px-8">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Các Kỳ Thi Độc Lập</h1>
                    <p className="text-slate-500">Thử sức với các bài đánh giá năng lực để nhận chứng chỉ</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assessments.map((ast: any) => (
                        <div key={ast.id} className="bg-white border text-left border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform" />
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{ast.title}</h2>
                            <p className="text-sm text-slate-500 mb-6 line-clamp-2">{ast.description || "Bài thi đánh giá năng lực tổng hợp."}</p>

                            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg">
                                <div className="flex items-center gap-1.5 flex-1">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    <span>{ast.timeLimit} Phút</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-1 border-l pl-4">
                                    <ShieldAlert className="w-4 h-4 text-emerald-500" />
                                    <span>Đạt {ast.passingScore}%</span>
                                </div>
                            </div>

                            <Link
                                href={`/assessments/${ast.id}`}
                                className="block w-full text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                            >
                                Tham gia ngay
                            </Link>
                        </div>
                    ))}

                    {assessments.length === 0 && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white border border-slate-200 rounded-2xl">
                            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">Không có kỳ thi nào</h3>
                            <p className="text-slate-500">Hiện tại không có kỳ thi mở. Vui lòng quay lại sau.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
