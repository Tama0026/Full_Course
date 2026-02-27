import { NextRequest, NextResponse } from "next/server";
import { REGISTER_MUTATION } from "@/lib/graphql/auth";
import { graphqlFetch, setAuthCookies, GraphQLError } from "../_helpers";

/**
 * POST /api/auth/register
 *
 * Receives { email, password, role? }, calls backend register mutation,
 * stores tokens in HttpOnly cookies, and returns user data.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, role } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const data = await graphqlFetch(REGISTER_MUTATION, {
            input: { email, password, ...(role ? { role } : {}) },
        });

        const { accessToken, refreshToken, user } = data?.register || {};

        if (!user) {
            return NextResponse.json({ error: "No user returned from server" }, { status: 400 });
        }

        const response = NextResponse.json({ user }, { status: 201 });

        // Only set cookies if both tokens exist
        if (accessToken && refreshToken) {
            setAuthCookies(response, accessToken, refreshToken, user);
        }

        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : "Registration failed";
        let status = 400;

        if (error instanceof GraphQLError && error.extensions?.code === "CONFLICT" || message.includes("already registered")) {
            status = 409;
        }

        return NextResponse.json({ error: message }, { status });
    }
}
