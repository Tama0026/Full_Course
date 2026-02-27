"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
    Award,
    Download,
    Calendar,
    Loader2,
    GraduationCap,
    ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GET_MY_CERTIFICATES } from "@/lib/graphql/learning";
import { Certificate } from "@/lib/graphql/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function CertificatesPage() {
    const { data, loading, error } = useQuery<any>(GET_MY_CERTIFICATES, {
        fetchPolicy: "network-only",
    });

    const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
                Có lỗi xảy ra: {error.message}
            </div>
        );
    }

    const certificates: Certificate[] = data?.myCertificates || [];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
                        <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    Chứng chỉ của tôi
                </h1>
                <p className="mt-2 text-slate-500">
                    Tất cả chứng chỉ bạn đã nhận được khi hoàn thành khóa học.
                </p>
            </div>

            {certificates.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                    <GraduationCap className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700">Chưa có chứng chỉ nào</h3>
                    <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                        Hoàn thành tất cả bài học và quiz của một khóa học để nhận chứng chỉ đầu tiên của bạn!
                    </p>
                    <a
                        href="/student"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                    >
                        Xem khóa học của tôi
                    </a>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {certificates.map((cert) => {
                        const issueDate = new Date(cert.issueDate);
                        const formattedDate = `${issueDate.getDate()}/${issueDate.getMonth() + 1}/${issueDate.getFullYear()}`;

                        return (
                            <div
                                key={cert.id}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg hover:border-yellow-200"
                            >
                                {/* Certificate Preview Thumbnail */}
                                <div
                                    className="relative aspect-[1.4/1] bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center cursor-pointer overflow-hidden"
                                    onClick={() => setSelectedCert(cert)}
                                >
                                    {cert.certificateUrl ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={cert.certificateUrl}
                                                alt={`Chứng chỉ ${cert.courseNameAtIssue}`}
                                                className="object-contain w-full h-full p-2 transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <ExternalLink className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                            </div>
                                        </>
                                    ) : (
                                        <Award className="h-16 w-16 text-yellow-300" />
                                    )}
                                </div>

                                {/* Certificate Info */}
                                <div className="p-5">
                                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2">
                                        {cert.courseNameAtIssue || "Khóa học"}
                                    </h3>

                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formattedDate}
                                        </span>
                                        <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                                            {cert.certificateCode}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedCert(cert)}
                                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            Xem
                                        </button>
                                        {cert.certificateUrl && (
                                            <a
                                                href={cert.certificateUrl.replace('/upload/', '/upload/fl_attachment/')}
                                                download={`Certificate-${cert.certificateCode}.jpg`}
                                                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-yellow-50 border border-yellow-200 py-2 text-xs font-semibold text-yellow-700 hover:bg-yellow-100 transition-colors"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                Tải xuống
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Full-size Certificate Modal */}
            <Dialog open={!!selectedCert} onOpenChange={(open) => !open && setSelectedCert(null)}>
                <DialogContent className="max-w-4xl p-6 md:p-8 bg-zinc-900 border-zinc-800 text-white rounded-2xl shadow-2xl">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl font-bold text-yellow-400">
                            🎓 {selectedCert?.courseNameAtIssue || "Chứng chỉ"}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedCert?.certificateUrl && (
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative w-full aspect-[1.4/1] bg-black/50 rounded-lg overflow-hidden border border-zinc-700 shadow-xl flex justify-center items-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={selectedCert.certificateUrl}
                                    alt={`Chứng chỉ ${selectedCert.courseNameAtIssue}`}
                                    className="object-contain max-w-full max-h-full"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <a
                                    href={selectedCert.certificateUrl.replace('/upload/', '/upload/fl_attachment/')}
                                    download={`Certificate-${selectedCert.certificateCode}.jpg`}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                                >
                                    <Download className="h-5 w-5" />
                                    Tải Xuống Chứng Chỉ
                                </a>
                                <span className="text-xs text-zinc-400 font-mono">
                                    Mã: {selectedCert.certificateCode}
                                </span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
