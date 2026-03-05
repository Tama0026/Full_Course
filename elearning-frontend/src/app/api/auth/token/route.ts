import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";

/**
 * GET /api/auth/token
 * Returns the access_token so the client can use it for WebSocket auth.
 * The cookie is HttpOnly, so the client can't read it directly.
 */
export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!token) {
        return NextResponse.json({ token: null }, { status: 401 });
    }

    return NextResponse.json({ token });
}
