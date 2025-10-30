import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("[/api/auth/me] Checking auth token from cookies");
    const token = request.cookies.get("auth_token");
    if (!token) {
      console.log("[/api/auth/me] No auth token found in cookies");
      return NextResponse.json({ error: "No auth token" }, { status: 401 });
    }
    console.log(
      "[/api/auth/me] Found token:",
      token.value.substring(0, 10) + "..."
    );

    const user = await getCurrentUser();
    if (!user) {
      console.log("[/api/auth/me] Token verification failed");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    console.log("[/api/auth/me] User authenticated:", user);
    return NextResponse.json(user);
  } catch (error) {
    console.error("[/api/auth/me] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
