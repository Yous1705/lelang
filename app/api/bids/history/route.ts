import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const bids = db
      .prepare(
        `
        SELECT 
          b.*,
          a.title as auction_title,
          a.end_date,
          a.highest_bid,
          CASE 
            WHEN datetime('now') < datetime(a.end_date) THEN 'active'
            ELSE 'ended'
          END as auction_status
        FROM bids b
        JOIN auctions a ON b.auction_id = a.id
        WHERE b.user_id = ?
        ${startDate ? "AND datetime(b.created_at) >= datetime(?)" : ""}
        ${endDate ? "AND datetime(b.created_at) <= datetime(?)" : ""}
        ORDER BY b.created_at DESC
      `
      )
      .all(
        ...[
          user.id,
          ...(startDate ? [startDate] : []),
          ...(endDate ? [endDate] : []),
        ]
      );

    return NextResponse.json(bids);
  } catch (error) {
    console.error("Error fetching bid history:", error);
    return NextResponse.json(
      { error: "Failed to fetch bid history" },
      { status: 500 }
    );
  }
}
