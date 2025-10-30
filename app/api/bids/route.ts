import { type NextRequest, NextResponse } from "next/server";
import { getDb, initializeDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    initializeDatabase();
    const db = getDb();

    let bids;
    if (user.role === "admin") {
      bids = db
        .prepare(
          `
        SELECT 
          b.id,
          b.auction_id,
          b.user_id,
          b.bid_amount,
          b.created_at,
          u.name as bidder_name,
          u.email as bidder_email,
          u.phone as bidder_phone,
          a.title as auction_title
        FROM bids b
        JOIN users u ON b.user_id = u.id
        JOIN auctions a ON b.auction_id = a.id
        WHERE 1=1
        ${startDate ? "AND datetime(b.created_at) >= datetime(?)" : ""}
        ${endDate ? "AND datetime(b.created_at) <= datetime(?)" : ""}
        ORDER BY b.created_at DESC
      `
        )
        .all(
          ...[...(startDate ? [startDate] : []), ...(endDate ? [endDate] : [])]
        );
    } else {
      bids = db
        .prepare(
          `
        SELECT b.*, a.title
        FROM bids b
        JOIN auctions a ON b.auction_id = a.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
      `
        )
        .all(user.id);
    }

    return NextResponse.json(bids);
  } catch (error) {
    console.error("Error fetching bids:", error);
    return NextResponse.json(
      { error: "Failed to fetch bids" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { auction_id, bid_amount } = await request.json();

    initializeDatabase();
    const db = getDb();

    const auction = db
      .prepare("SELECT * FROM auctions WHERE id = ?")
      .get(auction_id) as any;
    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    if (bid_amount <= auction.highest_bid) {
      return NextResponse.json(
        { error: "Bid must be higher than current highest bid" },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        `
      INSERT INTO bids (auction_id, user_id, bid_amount)
      VALUES (?, ?, ?)
    `
      )
      .run(auction_id, user.id, bid_amount);

    db.prepare(
      `
      UPDATE auctions
      SET highest_bid = ?, highest_bidder_id = ?
      WHERE id = ?
    `
    ).run(bid_amount, user.id, auction_id);

    return NextResponse.json(
      { id: result.lastInsertRowid, message: "Bid placed successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error placing bid:", error);
    return NextResponse.json({ error: "Failed to place bid" }, { status: 500 });
  }
}
