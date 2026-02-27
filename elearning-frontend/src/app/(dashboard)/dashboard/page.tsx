import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * /dashboard — Redirect to the appropriate sub-dashboard based on role.
 *
 * Role routing:
 *   - INSTRUCTOR / ADMIN → /instructor
 *   - STUDENT (default)  → /student
 */
export default async function DashboardPage() {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user_info")?.value;

    if (userCookie) {
        try {
            const user = JSON.parse(userCookie);
            if (user.role === "INSTRUCTOR" || user.role === "ADMIN") {
                redirect("/instructor");
            }
        } catch { }
    }

    redirect("/student");
}
