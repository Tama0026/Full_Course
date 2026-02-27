import { NextRequest, NextResponse } from "next/server";
import { LOGIN_MUTATION } from "@/lib/graphql/auth";
import { graphqlFetch, setAuthCookies, GraphQLError } from "../_helpers";

/**
 * POST /api/auth/login
 *
 * Receives { email, password }, calls backend login mutation,
 * stores tokens in HttpOnly cookies, and returns user data.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const data = await graphqlFetch(LOGIN_MUTATION, {
            input: { email, password },
        });

        const { accessToken, refreshToken, user } = data?.login || {};

        if (!user) {
            return NextResponse.json({ error: "No user returned from server" }, { status: 400 });
        }

        const response = NextResponse.json({ user }, { status: 200 });

        // Only set cookies if both tokens exist
        if (accessToken && refreshToken) {
            setAuthCookies(response, accessToken, refreshToken, user);
        }

        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        let status = 400;

        if (
            error instanceof GraphQLError &&
            error.extensions?.code === "UNAUTHENTICATED" ||
            message.includes("Invalid email or password")
        ) {
            status = 401;
        }

        return NextResponse.json({ error: message }, { status });
    }
}
