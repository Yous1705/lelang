import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const db = getDb();

    // Ambil daftar bidder dari tabel bidders
    const bidders = db
      .prepare(
        `
        SELECT b.*, u.name AS bidder_name, u.phone AS bidder_phone
        FROM bidders b
        LEFT JOIN users u ON b.user_id = u.id
        WHERE b.auction_id = ?
        ORDER BY b.created_at DESC
        `
      )
      .all(id);

    return NextResponse.json(bidders, { status: 200 });
  } catch (error) {
    console.error("Error fetching bidders:", error);
    return NextResponse.json(
      { error: "Failed to fetch bidders" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { bidders } = await request.json();
    const db = getDb();

    // Hapus bidder lama
    db.prepare("DELETE FROM bidders WHERE auction_id = ?").run(id);

    // Tambah bidder baru
    const stmt = db.prepare(`
      INSERT INTO bidders (auction_id, user_id, bidder_name, bid_amount, bid_count)
      VALUES (?, ?, ?, ?, ?)
    `);

    bidders.forEach((bidder: any) => {
      stmt.run(
        id,
        bidder.user_id || null,
        bidder.bidder_name,
        bidder.bid_amount,
        bidder.bid_count || 1
      );
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating bidders:", error);
    return NextResponse.json(
      { error: "Failed to update bidders" },
      { status: 500 }
    );
  }
}
