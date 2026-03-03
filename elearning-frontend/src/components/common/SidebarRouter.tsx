"use client";

import { usePathname } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";
import InstructorSidebar from "./InstructorSidebar";
import AdminSidebar from "./AdminSidebar";

/**
 * Renders the correct sidebar based on the current route path.
 */
export default function SidebarRouter() {
    const pathname = usePathname();

    if (pathname.startsWith("/admin")) return <AdminSidebar />;
    if (pathname.startsWith("/instructor")) return <InstructorSidebar />;
    return <DashboardSidebar />;
}

