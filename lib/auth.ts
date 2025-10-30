import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    (process.env.NODE_ENV === "development"
      ? "dev-only-secret-key-do-not-use-in-production"
      : undefined)
);

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}

const JWT_ISSUER = "lelang-internal";
const JWT_AUDIENCE = "lelang-users";

export interface JWTPayload {
  id: number;
  email: string;
  role: string;
}

export async function createToken(payload: JWTPayload): Promise<string> {
  try {
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer(JWT_ISSUER)
      .setAudience(JWT_AUDIENCE)
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    return token;
  } catch (error) {
    console.error("[Auth] Token creation failed:", error);
    throw error;
  }
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    // Validate payload structure in a type-safe way
    if (
      typeof payload.id === "number" &&
      typeof payload.email === "string" &&
      typeof payload.role === "string"
    ) {
      return {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      };
    }

    console.error("[Auth] Invalid payload structure");
    return null;
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    priority: "high",
  });
}

export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}
