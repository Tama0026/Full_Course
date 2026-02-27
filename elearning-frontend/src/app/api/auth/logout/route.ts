import { NextResponse } from "next/server";
import { clearAuthCookies } from "../_helpers";

/**
 * POST /api/auth/logout
 *
 * Clears auth cookies to log user out.
 */
export async function POST() {
    const response = NextResponse.json(
        { message: "Logged out successfully" },
        { status: 200 }
    );
    clearAuthCookies(response);
    return response;
}
