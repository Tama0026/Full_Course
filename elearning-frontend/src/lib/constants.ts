/**
 * Application-wide constants.
 */

/** Backend GraphQL endpoint (used by server-side Apollo Client) */
export const GRAPHQL_ENDPOINT =
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://127.0.0.1:3000/graphql";

/** Cookie names */
export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

/** Route paths */
export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    DASHBOARD: "/dashboard",
    STUDENT: "/student",
    COURSES: "/courses",
    INSTRUCTOR: "/instructor",
    ADMIN: "/admin",
} as const;

/** Protected route prefixes — require authentication */
export const PROTECTED_PREFIXES = [
    "/dashboard",
    "/student",
    "/instructor",
    "/admin",
    "/learning",
    "/checkout",
];

/** Auth page paths — redirect to dashboard if already logged in */
export const AUTH_PAGES = ["/login", "/register"];

/** Student-only route prefixes */
export const STUDENT_PREFIXES = ["/student"];

/** Instructor-only route prefixes */
export const INSTRUCTOR_PREFIXES = ["/instructor"];

/** Admin-only route prefixes */
export const ADMIN_PREFIXES = ["/admin"];

/** Roles matching backend enum */
export type UserRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";
