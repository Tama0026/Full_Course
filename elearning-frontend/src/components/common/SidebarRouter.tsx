"use client";

import DashboardSidebar from "./DashboardSidebar";

/**
 * SidebarRouter — now delegates to the unified DashboardSidebar
 * which internally uses useAuth() to render role-specific nav.
 */
export default function SidebarRouter() {
    return <DashboardSidebar />;
}
