import { NextRequest, NextResponse } from "next/server";
import { REFRESH_TOKEN_MUTATION } from "@/lib/graphql/auth";
import { REFRESH_TOKEN_COOKIE } from "@/lib/constants";
import { graphqlFetch, setAuthCookies, clearAuthCookies } from "../_helpers";

/**
 * POST /api/auth/refresh
 *
 * Reads the refresh token from HttpOnly cookie,
 * calls backend refreshToken mutation, rotates both cookies.
 */
export async function POST(request: NextRequest) {
    try {
        const currentRefreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

        if (!currentRefreshToken) {
            return NextResponse.json(
                { error: "No refresh token found" },
                { status: 401 }
            );
        }

        const data = await graphqlFetch(REFRESH_TOKEN_MUTATION, {
            refreshToken: currentRefreshToken,
        });

        const { accessToken, refreshToken, user } = data.refreshToken;

        const response = NextResponse.json({ user }, { status: 200 });
        setAuthCookies(response, accessToken, refreshToken);

        return response;
    } catch (error) {
        // Clear stale cookies on refresh failure
        const response = NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Token refresh failed",
            },
            { status: 401 }
        );
        clearAuthCookies(response);
        return response;
    }
}
