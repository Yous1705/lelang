import { type NextRequest, NextResponse } from "next/server";
import { getDb, initializeDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    initializeDatabase();
    const db = getDb();
    const auctions = db
      .prepare("SELECT * FROM auctions ORDER BY created_at DESC")
      .all();

    // Attach images for each auction
    const imgsStmt = db.prepare(
      `SELECT id, auction_id, image_url, display_order, created_at FROM auction_images WHERE auction_id = ? ORDER BY display_order ASC`
    );

    const auctionsWithImages = auctions.map((a: any) => {
      const images = imgsStmt.all(a.id) || [];
      return { ...a, images };
    });

    return NextResponse.json(auctionsWithImages);
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return NextResponse.json(
      { error: "Failed to fetch auctions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    initializeDatabase();
    const {
      title,
      description,
      start_price,
      start_date,
      end_date,
      seller_name,
      seller_info,
      organizer_name,
      organizer_info,
    } = await request.json();

    if (!title || !description || !start_price || !start_date || !end_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = db
      .prepare(
        `
      INSERT INTO auctions (title, description, start_price, highest_bid, start_date, end_date, seller_name, seller_info, organizer_name, organizer_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        title,
        description,
        start_price,
        start_price,
        start_date,
        end_date,
        seller_name || "",
        seller_info || "",
        organizer_name || "",
        organizer_info || ""
      );

    return NextResponse.json(
      { id: (result as any).lastInsertRowid, message: "Auction created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating auction:", error);
    return NextResponse.json(
      { error: "Failed to create auction", details: String(error) },
      { status: 500 }
    );
  }
}
