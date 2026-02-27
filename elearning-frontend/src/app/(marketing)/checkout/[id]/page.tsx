"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    CreditCard,
    Landmark,
    Loader2,
    Lock,
    QrCode,
    Shield,
    User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_COURSE_DETAIL } from "@/lib/graphql/course";
import { CREATE_ORDER } from "@/lib/graphql/order";
import { GET_MY_ENROLLMENTS } from "@/lib/graphql/learning";

type PaymentMethod = "bank" | "card" | "qr";

/* ────────────────────────────────────────────────────────
   Checkout Page
   ──────────────────────────────────────────────────────── */

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const { data, loading, error } = useQuery<any>(GET_COURSE_DETAIL, {
        variables: { id: params.id },
        skip: !params.id,
    });

    const [createOrder] = useMutation(CREATE_ORDER, {
        refetchQueries: [{ query: GET_MY_ENROLLMENTS }],
    });

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank");
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error || !data?.course) {
        return (
            <div className="py-20 text-center text-red-600">
                Không tìm thấy thông tin khóa học.
            </div>
        );
    }

    const course = data.course;

    async function handleCheckout() {
        setProcessing(true);
        setCheckoutError(null);
        try {
            await createOrder({
                variables: {
                    input: { courseId: course.id },
                },
            });
            setSuccess(true);
        } catch (err: any) {
            const message = err?.message || "Có lỗi xảy ra khi thanh toán";
            if (message.includes("already enrolled")) {
                setCheckoutError("Bạn đã mua khóa học này rồi. Vui lòng vào Dashboard để học.");
            } else {
                setCheckoutError(message);
            }
        } finally {
            setProcessing(false);
        }
    }

    /* ── Success State ── */
    if (success) {
        const firstLesson = course.sections?.[0]?.lessons?.[0];
        const lessonUrl = firstLesson
            ? `/courses/${course.id}/lessons/${firstLesson.id}`
            : `/courses/${course.id}`;

        return (
            <section className="py-20">
                <div className="mx-auto max-w-lg px-4 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Chúc mừng! 🎉</h1>
                    <p className="mt-3 text-lg text-slate-600">
                        Bạn đã mua thành công khóa học
                    </p>
                    <p className="mt-1 text-lg font-semibold text-primary-700">
                        &quot;{course.title}&quot;
                    </p>
                    <p className="mt-4 text-sm text-slate-500">
                        Đơn hàng đã được xác nhận. Bạn có thể bắt đầu học ngay bây giờ.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <a
                            href={lessonUrl}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-primary-700 transition-colors"
                        >
                            Vào học ngay
                            <ArrowRight className="h-5 w-5" />
                        </a>
                        <a
                            href="/student"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-8 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Về Dashboard
                        </a>
                    </div>
                </div>
            </section>
        );
    }

    /* ── Checkout Form ── */
    return (
        <section className="py-8 lg:py-12">
            <div className="mx-auto max-w-5xl px-4 lg:px-8">
                <h1 className="mb-8 text-2xl font-bold text-slate-900 lg:text-3xl">
                    Thanh toán
                </h1>

                {checkoutError && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {checkoutError}
                    </div>
                )}

                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* ── LEFT: Payment method ── */}
                    <div className="flex-1">
                        <div className="rounded-xl border border-slate-200 bg-white p-6">
                            <h2 className="mb-5 text-lg font-semibold text-slate-900">
                                Phương thức thanh toán
                            </h2>

                            <div className="space-y-3">
                                {[
                                    { key: "bank" as const, icon: Landmark, label: "Chuyển khoản ngân hàng", desc: "Chuyển khoản qua BIDV, Vietcombank, Techcombank..." },
                                    { key: "card" as const, icon: CreditCard, label: "Thẻ tín dụng / Ghi nợ", desc: "Visa, Mastercard, JCB" },
                                    { key: "qr" as const, icon: QrCode, label: "Quét mã QR", desc: "MoMo, ZaloPay, VNPay" },
                                ].map(({ key, icon: Icon, label, desc }) => (
                                    <button
                                        key={key}
                                        onClick={() => setPaymentMethod(key)}
                                        className={cn(
                                            "flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-all",
                                            paymentMethod === key
                                                ? "border-primary-500 bg-primary-50 ring-2 ring-primary-500/20"
                                                : "border-slate-200 hover:border-slate-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                                            paymentMethod === key ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-500"
                                        )}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{label}</p>
                                            <p className="text-xs text-slate-500">{desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Payment detail area */}
                            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
                                {paymentMethod === "bank" && (
                                    <div className="space-y-3 text-sm text-slate-600">
                                        <p className="font-semibold text-slate-800">Thông tin chuyển khoản:</p>
                                        <div className="space-y-1">
                                            <p>Ngân hàng: <span className="font-medium text-slate-900">Techcombank</span></p>
                                            <p>Số tài khoản: <span className="font-medium text-slate-900">1234 5678 9012</span></p>
                                            <p>Chủ tài khoản: <span className="font-medium text-slate-900">CONG TY E-LEARNING</span></p>
                                            <p>Nội dung CK: <span className="font-mono font-medium text-primary-700">EL-{course.id.slice(0, 8)}-ORDER</span></p>
                                        </div>
                                    </div>
                                )}
                                {paymentMethod === "card" && (
                                    <div className="space-y-3">
                                        <input placeholder="Số thẻ" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none" />
                                        <div className="flex gap-3">
                                            <input placeholder="MM/YY" className="w-1/2 rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none" />
                                            <input placeholder="CVV" className="w-1/2 rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none" />
                                        </div>
                                    </div>
                                )}
                                {paymentMethod === "qr" && (
                                    <div className="text-center">
                                        <div className="mx-auto mb-3 flex h-44 w-44 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white">
                                            <QrCode className="h-20 w-20 text-slate-300" />
                                        </div>
                                        <p className="text-sm text-slate-500">Quét mã QR bằng ứng dụng thanh toán</p>
                                    </div>
                                )}
                            </div>

                            {/* Security notice */}
                            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                                <Lock className="h-3.5 w-3.5" />
                                <span>Thanh toán an toàn với mã hóa SSL 256-bit</span>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Order summary ── */}
                    <div className="w-full lg:w-96">
                        <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6">
                            <h2 className="mb-5 text-lg font-semibold text-slate-900">
                                Tóm tắt đơn hàng
                            </h2>

                            {/* Course preview */}
                            <div className="mb-5 flex gap-4">
                                <div className="h-16 w-24 shrink-0 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                                    <BookOpen className="h-6 w-6 text-primary-300" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{course.title}</h3>
                                    <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1">
                                        <User className="h-3 w-3" /> {course.instructor?.email}
                                    </p>
                                </div>
                            </div>

                            {/* Price breakdown */}
                            <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Giá khóa học</span>
                                    <span>{formatPrice(course.price || 0)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Giảm giá</span>
                                    <span className="text-green-600">-{formatPrice(0)}</span>
                                </div>
                                <div className="border-t border-slate-100 pt-2 flex justify-between text-base font-bold text-slate-900">
                                    <span>Tổng cộng</span>
                                    <span className="text-primary-700">{formatPrice(course.price || 0)}</span>
                                </div>
                            </div>

                            {/* Checkout button */}
                            <button
                                onClick={handleCheckout}
                                disabled={processing}
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/25 hover:bg-primary-700 disabled:opacity-50 transition-all"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="h-5 w-5" />
                                        Thanh toán {formatPrice(course.price || 0)}
                                    </>
                                )}
                            </button>

                            {/* Guarantee */}
                            <p className="mt-4 text-center text-xs text-slate-400">
                                Hoàn tiền 100% trong 30 ngày nếu không hài lòng
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
