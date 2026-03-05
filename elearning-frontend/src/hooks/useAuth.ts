"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApolloClient } from "@apollo/client/react";

export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
}

/**
 * Reads the `user_info` cookie (set at login by the API route).
 * Returns null if not present or unparseable.
 */
function getUserFromCookie(): AuthUser | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user_info="));
    if (!match) return null;
    try {
        return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
    } catch {
        return null;
    }
}

/**
 * Global auth hook powered by TanStack Query.
 * Reads user data from the `user_info` cookie and caches it.
 *
 * Usage:
 *   const { user, isLoading, isLoggedIn, logout } = useAuth();
 */
export function useAuth() {
    const queryClient = useQueryClient();
    const apolloClient = useApolloClient();

    const { data: user, isLoading } = useQuery<AuthUser | null>({
        queryKey: ["auth-user"],
        queryFn: getUserFromCookie,
        staleTime: Infinity, // cookie doesn't change until login/logout
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });

    const logout = async () => {
        // Clear server-side cookies
        await fetch("/api/auth/logout", { method: "POST" });

        // Clear TanStack Query cache
        queryClient.clear();

        // Clear Apollo Client cache
        await apolloClient.clearStore();

        // Redirect to login
        window.location.href = "/login";
    };

    return {
        user: user ?? null,
        isLoading,
        isLoggedIn: !!user,
        isStudent: user?.role === "STUDENT",
        isInstructor: user?.role === "INSTRUCTOR",
        isAdmin: user?.role === "ADMIN",
        logout,
    };
}
