import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const publicPaths = ["/", "/login", "/register"];
const publicApiPaths = ["/api/auth/login", "/api/auth/register"];

export async function middleware(request: NextRequest) {
  const devLog = (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      // Use console.debug for dev logs so they are less noisy in some hosts
      console.debug("[Middleware]", ...args);
    }
  };

  devLog("Checking path:", request.nextUrl.pathname);
  const authToken = request.cookies.get("auth_token")?.value;
  devLog("Auth token exists:", !!authToken);

  // Check if it's an API route that requires authentication
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Allow public API endpoints
    if (publicApiPaths.includes(request.nextUrl.pathname)) {
      devLog("Public API path, allowing access");
      return NextResponse.next();
    }

    // For protected API endpoints, verify the token
    if (!authToken) {
      devLog("Protected API path, no token found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyToken(authToken);
    if (!user) {
      devLog("Protected API path, invalid token");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", user.id.toString());
    requestHeaders.set("x-user-role", user.role);

    devLog("Protected API path, token verified, adding user headers");
    return NextResponse.next({
      headers: requestHeaders,
    });
  }

  // For non-API routes
  if (
    publicPaths.includes(request.nextUrl.pathname) ||
    publicApiPaths.includes(request.nextUrl.pathname) ||
    request.nextUrl.pathname.startsWith("/api/auth/")
  ) {
    devLog("Public path, allowing access");
    return NextResponse.next();
  }

  // Check auth token
  if (!authToken) {
    devLog("No auth token, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    devLog("Verifying token...");
    const user = await verifyToken(authToken);
    devLog("User from token:", user);

    if (!user) {
      devLog("Invalid token, redirecting to login");
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
