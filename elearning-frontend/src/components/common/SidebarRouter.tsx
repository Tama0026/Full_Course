"use client";

import { usePathname } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";
import InstructorSidebar from "./InstructorSidebar";

/**
 * Renders either the InstructorSidebar or DashboardSidebar
 * based on whether the current path is an instructor route.
 */
export default function SidebarRouter() {
    const pathname = usePathname();
    const isInstructor = pathname.startsWith("/instructor");

    return isInstructor ? <InstructorSidebar /> : <DashboardSidebar />;
}
