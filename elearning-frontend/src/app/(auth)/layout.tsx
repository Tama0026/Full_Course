import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Đăng nhập | E-Learning",
    description: "Đăng nhập hoặc tạo tài khoản để bắt đầu học.",
};

/**
 * (auth) Route Group Layout — Centered layout for login/register pages.
 */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 text-2xl font-bold text-primary-600"
                    >
                        <svg
                            className="h-8 w-8"
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
                </div>

                {/* Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
