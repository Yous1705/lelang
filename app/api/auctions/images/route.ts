import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/**
 * POST — Simpan atau update gambar untuk suatu auction
 */
export async function POST(request: NextRequest) {
  try {
    // auth cookie is set as "auth_token" in /api/auth/login
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { auctionId, filenames } = await request.json();

    if (!auctionId) {
      return NextResponse.json(
        { error: "auctionId is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(filenames) || filenames.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Hapus semua gambar lama untuk auction ini (agar bisa update)
    db.prepare(`DELETE FROM auction_images WHERE auction_id = ?`).run(
      auctionId
    );

    // Simpan gambar baru
    const stmt = db.prepare(`
      INSERT INTO auction_images (auction_id, image_url, display_order)
      VALUES (?, ?, ?)
    `);

    filenames.forEach((filename: string, index: number) => {
      const imagePath = `/uploads/${filename}`; // Path relatif dari folder public
      stmt.run(auctionId, imagePath, index);
    });

    return NextResponse.json(
      { success: true, message: "Images saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving images:", error);
    return NextResponse.json(
      { error: "Failed to save images", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE — Hapus gambar berdasarkan imageId
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json(
        { error: "imageId is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = db
      .prepare("DELETE FROM auction_images WHERE id = ?")
      .run(imageId);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Image deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image", details: String(error) },
      { status: 500 }
    );
  }
}
