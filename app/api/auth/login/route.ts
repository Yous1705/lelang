import { type NextRequest, NextResponse } from "next/server";
import { getDb, initializeDatabase } from "@/lib/db";
import { createToken, setAuthCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    initializeDatabase();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan kata sandi diperlukan" },
        { status: 400 }
      );
    }

    const db = getDb();
    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as any;

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email tidak ditemukan" },
        { status: 401 }
      );
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return NextResponse.json(
        { success: false, message: "Kata sandi salah" },
        { status: 401 }
      );
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // User authenticated successfully

    const response = NextResponse.json(
      {
        success: true,
        message: "Login berhasil",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Set auth cookie in the response
    // Set cookie in response headers
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    console.log(
      "[Login] Setting auth cookie with token:",
      token.substring(0, 10) + "..."
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Login gagal" },
      { status: 500 }
    );
  }
}
