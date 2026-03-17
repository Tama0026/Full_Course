import type { Metadata } from "next";
import SidebarRouter from "@/components/common/SidebarRouter";
import DashboardTopBar from "@/components/common/DashboardTopBar";

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
            {/* Sidebar — auto-selects based on role via useAuth */}
            <SidebarRouter />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar with notifications */}
                <DashboardTopBar />

                {/* Page content */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
