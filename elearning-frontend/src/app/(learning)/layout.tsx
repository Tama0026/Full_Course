import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Học tập | E-Learning",
    description: "Trang học tập trực tuyến — xem video bài giảng và theo dõi tiến độ.",
};

/**
 * (learning) Route Group Layout
 *
 * Full-height layout with a desktop sidebar on the right
 * and content (video + lesson info) on the left.
 *
 * On mobile the sidebar is hidden and accessible via a floating
 * action button (rendered inside the page client component).
 */
export default function LearningLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            {/* Top bar */}
            <header className="flex h-14 items-center border-b border-slate-200 bg-white px-4 lg:px-6">
                <a
                    href="/"
                    className="flex items-center gap-2 text-primary-600 font-bold text-lg hover:text-primary-700 transition-colors"
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
            </header>

            {/* Main content area */}
            <main className="flex flex-1 overflow-hidden">
                {children}
            </main>
        </div>
    );
}
