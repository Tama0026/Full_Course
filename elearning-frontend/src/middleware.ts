import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import {
    ACCESS_TOKEN_COOKIE,
    type UserRole,
} from "@/lib/constants";

/**
 * Public routes — accessible to unauthenticated users.
 * Authenticated users visiting these routes are redirected to /dashboard.
 */
const PUBLIC_ROUTES = ["/", "/login", "/register", "/about"];

/**
 * Dashboard prefixes — require authentication.
 * Unauthenticated users are redirected to /login.
 */
const DASHBOARD_PREFIXES = [
    "/dashboard",
    "/student",
    "/instructor",
    "/admin",
    "/learning",
    "/checkout",
    "/certificates",
    "/interview",
    "/profile",
    "/exams",
    "/assessments",
    "/explore",
];

/**
 * Instructor-only route prefixes.
 */
const INSTRUCTOR_PREFIXES = ["/instructor"];

/**
 * Admin-only route prefixes.
 */
const ADMIN_PREFIXES = ["/admin"];

/**
 * JWT secret encoded for jose (Edge-compatible).
 */
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "dev-secret-change-me"
);

/**
 * Decode the JWT payload from the access token cookie.
 */
async function getTokenPayload(request: NextRequest) {
    const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { sub: string; email: string; role: UserRole };
    } catch {
        return null;
    }
}

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
    return prefixes.some(
        (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    );
}

function getDashboardForRole(role: UserRole): string {
    switch (role) {
        case "INSTRUCTOR":
            return "/instructor";
        case "ADMIN":
            return "/admin";
        case "STUDENT":
        default:
            return "/student";
    }
}

// ─────────────────────────────────────────────────────────────
// Middleware — Route protection & role-based access control
// ─────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const user = await getTokenPayload(request);

    // ── 1) Authenticated user on PUBLIC_ROUTES → redirect to dashboard ──
    if (user && PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.redirect(
            new URL(getDashboardForRole(user.role), request.url)
        );
    }

    // ── 2) Role-based primary redirect (INSTRUCTOR can only access /instructor/*) ──
    if (user && user.role === "INSTRUCTOR") {
        if (!matchesPrefix(pathname, INSTRUCTOR_PREFIXES) && matchesPrefix(pathname, DASHBOARD_PREFIXES)) {
            return NextResponse.redirect(new URL("/instructor", request.url));
        }
    }

    if (user && user.role === "ADMIN") {
        if (!matchesPrefix(pathname, ADMIN_PREFIXES) && matchesPrefix(pathname, DASHBOARD_PREFIXES)) {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
    }

    // ── 3) Unauthenticated user on DASHBOARD_PREFIXES → redirect to /login ──
    if (!user && matchesPrefix(pathname, DASHBOARD_PREFIXES)) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

/**
 * Matcher — run middleware on all routes except static assets,
 * internal Next.js routes, API routes, and the GraphQL proxy.
 */
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/|graphql).*)",
    ],
};
