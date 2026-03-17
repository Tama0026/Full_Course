"use client";

import NotificationBell from "@/components/common/NotificationBell";
import { useAuth } from "@/hooks/useAuth";

/**
 * DashboardTopBar — top bar with notification bell.
 * Rendered inside the dashboard layout.
 */
export default function DashboardTopBar() {
    const { user } = useAuth();

    // Only show for authenticated users
    if (!user) return null;

    return (
        <div className="relative z-50 flex items-center justify-end gap-2 px-6 py-3 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
            <NotificationBell />
        </div>
    );
}
