import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const publicPaths = ["/", "/login", "/register"];
const publicApiPaths = ["/api/auth/login", "/api/auth/register"];

export async function middleware(request: NextRequest) {
  console.log("[Middleware] Checking path:", request.nextUrl.pathname);
  const authToken = request.cookies.get("auth_token")?.value;
  console.log("[Middleware] Auth token exists:", !!authToken);

  // Allow public paths and API endpoints
  // Allow API routes to be handled by their own auth logic (avoid redirecting to HTML)
  if (request.nextUrl.pathname.startsWith("/api/")) {
    console.log("[Middleware] API path, letting API handle auth");
    return NextResponse.next();
  }

  // Allow public paths and specific auth endpoints
  if (
    publicPaths.includes(request.nextUrl.pathname) ||
    publicApiPaths.includes(request.nextUrl.pathname) ||
    request.nextUrl.pathname.startsWith("/api/auth/")
  ) {
    console.log("[Middleware] Public path, allowing access");
    return NextResponse.next();
  }

  // Check auth token
  if (!authToken) {
    console.log("[Middleware] No auth token, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    console.log("[Middleware] Verifying token...");
    const user = await verifyToken(authToken);
    console.log("[Middleware] User from token:", user);

    if (!user) {
      console.log("[Middleware] Invalid token, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Admin-only paths
    if (
      request.nextUrl.pathname.startsWith("/admin") &&
      user.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Authenticated user paths
    if (user.role === "user") {
      const allowedUserPaths = ["/dashboard", "/history", "/detail"];
      const isAllowedPath = allowedUserPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
      );

      if (!isAllowedPath) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.jpg (logo image)
     * - uploads (uploaded files)
     * - api/auth/login (login API)
     * - api/auth/register (register API)
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.jpg|uploads|api/auth/login|api/auth/register).*)",
  ],
};
