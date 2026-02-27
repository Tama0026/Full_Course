import type { Metadata } from "next";
import LogoutButton from "@/components/common/LogoutButton";

export const metadata: Metadata = {
    title: "Dashboard | E-Learning",
    description: "Quản lý khóa học và theo dõi tiến độ học tập.",
};

/**
 * (dashboard) Route Group Layout — Dashboard shell with navigation.
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top navigation */}
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
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

                    <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
                        <a href="/dashboard" className="hover:text-primary-600 transition-colors">
                            Dashboard
                        </a>
                        <a href="/courses" className="hover:text-primary-600 transition-colors">
                            Khóa học
                        </a>
                        <a href="/certificates" className="hover:text-primary-600 transition-colors">
                            Chứng chỉ
                        </a>
                        <a href="/profile" className="hover:text-primary-600 transition-colors">
                            Hồ sơ
                        </a>
                        <div className="ml-4 pl-4 border-l border-slate-200">
                            <LogoutButton />
                        </div>
                    </nav>
                </div>
            </header>

            {/* Main content */}
            <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                {children}
            </main>
        </div>
    );
}
