import type { Metadata } from "next";
import { cookies } from "next/headers";
import LogoutButton from "@/components/common/LogoutButton";
import AiChatWidget from "@/components/chat/AiChatWidget";

export const metadata: Metadata = {
    title: "E-Learning — Nền tảng học trực tuyến",
    description: "Khám phá hàng trăm khóa học trực tuyến chất lượng cao từ các giảng viên hàng đầu.",
};

/**
 * (marketing) Route Group Layout — Public-facing marketing pages.
 */
export default async function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user_info")?.value;
    let user = null;
    try {
        if (userCookie) user = JSON.parse(userCookie);
    } catch { }

    return (
        <div className="min-h-screen bg-white">
            {/* Top navigation */}
            <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
                    <a
                        href="/"
                        className="flex items-center gap-2 text-lg font-bold text-primary-600"
                    >
                        <svg
                            className="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                        E-Learning
                    </a>

                    <nav className="flex items-center gap-4">
                        <a
                            href="/courses"
                            className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                        >
                            Khóa học
                        </a>
                        {user ? (
                            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                                <span className="text-sm font-medium text-slate-600">
                                    {user.email}
                                </span>
                                <a
                                    href="/dashboard"
                                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                                >
                                    Bảng điều khiển
                                </a>
                                <div className="ml-2">
                                    <LogoutButton />
                                </div>
                            </div>
                        ) : (
                            <>
                                <a
                                    href="/login"
                                    className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                                >
                                    Đăng nhập
                                </a>
                                <a
                                    href="/register"
                                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                                >
                                    Bắt đầu học
                                </a>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Page content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-slate-50 py-8">
                <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 lg:px-8">
                    © 2026 E-Learning. All rights reserved.
                </div>
            </footer>

            <AiChatWidget />
        </div>
    );
}
