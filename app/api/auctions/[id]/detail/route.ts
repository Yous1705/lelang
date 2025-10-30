import { type NextRequest, NextResponse } from "next/server";
import { getDb, initializeDatabase } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    initializeDatabase();
    const { id } = params;
    const db = getDb();

    const auction = db.prepare(`SELECT * FROM auctions WHERE id = ?`).get(id);

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    const images = db
      .prepare(
        `SELECT * FROM auction_images WHERE auction_id = ? ORDER BY display_order ASC`
      )
      .all(id);

    // Return a combined list of real bids (from `bids`) and admin-managed
    // participants (from `bidders`) so the detail page shows both sources.
    // We normalize columns to: id, auction_id, user_id, bidder_name, bid_amount, created_at
    const combined = db
      .prepare(
        `
        SELECT id, auction_id, user_id, bidder_name, bid_amount, created_at FROM (
          SELECT b.id as id, b.auction_id as auction_id, b.user_id as user_id,
                 COALESCE(u.name, '') as bidder_name, b.bid_amount as bid_amount, b.created_at as created_at
          FROM bids b
          LEFT JOIN users u ON b.user_id = u.id
          WHERE b.auction_id = ?

          UNION ALL

          SELECT bd.id as id, bd.auction_id as auction_id, bd.user_id as user_id,
                 bd.bidder_name as bidder_name, bd.bid_amount as bid_amount, bd.created_at as created_at
          FROM bidders bd
          WHERE bd.auction_id = ?
        )
        ORDER BY datetime(created_at) DESC
        `
      )
      .all(id, id);

    return NextResponse.json(
      {
        auction,
        images,
        bidders: combined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching auction detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch auction", details: String(error) },
      { status: 500 }
    );
  }
}
