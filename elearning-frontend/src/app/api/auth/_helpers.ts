import { NextResponse } from "next/server";
import {
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    GRAPHQL_ENDPOINT,
} from "@/lib/constants";
import { DocumentNode } from "graphql";

/**
 * Helper: set auth cookies (HttpOnly, Secure, SameSite=Lax).
 */
export function setAuthCookies(
    response: NextResponse,
    accessToken: string,
    refreshToken: string,
    user?: any
) {
    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15, // 15 minutes
    });

    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    if (user) {
        // user_info cookie is accessible to the client and server to easily show the user info
        response.cookies.set("user_info", JSON.stringify(user), {
            httpOnly: false, // Make false if client needs to read it directly, or true if SSR only. For SSR only, we can use true, but false helps if client wants it. Let's keep it false for flexibility, since it's just public info.
            secure: isProduction,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });
    }
}

/**
 * Helper: clear auth cookies.
 */
export function clearAuthCookies(response: NextResponse) {
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    response.cookies.delete("user_info");
}

export class GraphQLError extends Error {
    public extensions?: Record<string, any>;
    constructor(message: string, extensions?: Record<string, any>) {
        super(message);
        this.extensions = extensions;
        this.name = "GraphQLError";
    }
}

/**
 * Helper: call backend GraphQL and return JSON response.
 */
export async function graphqlFetch(
    query: string | DocumentNode,
    variables: Record<string, unknown>
) {
    const queryString = typeof query === "string" ? query : query.loc?.source.body;
    const res = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryString, variables }),
    });

    const json = await res.json();

    if (json.errors) {
        const errorItem = json.errors[0];
        const message = errorItem?.message || "An unexpected error occurred";
        throw new GraphQLError(message, errorItem?.extensions);
    }

    return json.data;
}
