import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import {
    ACCESS_TOKEN_COOKIE,
    PROTECTED_PREFIXES,
    AUTH_PAGES,
    STUDENT_PREFIXES,
    INSTRUCTOR_PREFIXES,
    ADMIN_PREFIXES,
    ROUTES,
    type UserRole,
} from "@/lib/constants";

/**
 * JWT secret encoded for jose (Edge-compatible).
 * Falls back to a dev-only key — MUST be set in production.
 */
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "dev-secret-change-me"
);

/**
 * Decode the JWT payload from the access token cookie.
 * Returns null if the token is missing, expired, or invalid.
 */
async function getTokenPayload(request: NextRequest) {
    const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { sub: string; email: string; role: UserRole };
    } catch {
        // Token expired or invalid
        return null;
    }
}

/**
 * Check whether a pathname starts with any of the given prefixes.
 */
function matchesPrefix(pathname: string, prefixes: string[]): boolean {
    return prefixes.some(
        (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    );
}

/**
 * Get the correct dashboard URL for a user's role.
 */
function getDashboardForRole(role: UserRole): string {
    switch (role) {
        case "INSTRUCTOR":
            return ROUTES.INSTRUCTOR;
        case "ADMIN":
            return ROUTES.ADMIN;
        case "STUDENT":
        default:
            return ROUTES.STUDENT;
    }
}

// ─────────────────────────────────────────────────────────────
// Middleware — Route protection & role-based access control
// ─────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const user = await getTokenPayload(request);

    // ── 1) Protected routes — redirect to login if unauthenticated ──
    if (matchesPrefix(pathname, PROTECTED_PREFIXES)) {
        if (!user) {
            const loginUrl = new URL(ROUTES.LOGIN, request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // ── 2) Student-only routes — only STUDENT can access ──
        if (matchesPrefix(pathname, STUDENT_PREFIXES)) {
            if (user.role !== "STUDENT") {
                // Instructor/Admin trying to access student pages → send to their dashboard
                return NextResponse.redirect(new URL(getDashboardForRole(user.role), request.url));
            }
        }

        // ── 3) Instructor-only routes — only INSTRUCTOR/ADMIN can access ──
        if (matchesPrefix(pathname, INSTRUCTOR_PREFIXES)) {
            if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
                // Student trying to access instructor pages → send to student dashboard
                return NextResponse.redirect(new URL(getDashboardForRole(user.role), request.url));
            }
        }

        // ── 4) Admin-only routes ──
        if (matchesPrefix(pathname, ADMIN_PREFIXES)) {
            if (user.role !== "ADMIN") {
                return NextResponse.redirect(new URL(getDashboardForRole(user.role), request.url));
            }
        }
    }

    // ── 5) Auth pages — redirect to correct dashboard if already logged in ──
    if (AUTH_PAGES.includes(pathname) && user) {
        return NextResponse.redirect(new URL(getDashboardForRole(user.role), request.url));
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
