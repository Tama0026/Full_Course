import type { Metadata } from "next";
import SidebarRouter from "@/components/common/SidebarRouter";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Quản lý khóa học và theo dõi tiến độ học tập.",
};

/**
 * (dashboard) Route Group Layout — sidebar-based dashboard shell.
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar — auto-selects Instructor or Student sidebar */}
            <SidebarRouter />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-6 bg-white border-b border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="font-medium text-slate-800">E-Learning</span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
