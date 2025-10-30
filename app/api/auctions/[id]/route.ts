import { type NextRequest, NextResponse } from "next/server";
import { getDb, initializeDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    initializeDatabase();
    const { id } = await params;
    const db = getDb();

    const auction = db
      .prepare(
        `
      SELECT * FROM auctions WHERE id = ?
    `
      )
      .get(id);

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    return NextResponse.json(auction, { status: 200 });
  } catch (error) {
    console.error("Error fetching auction:", error);
    return NextResponse.json(
      { error: "Failed to fetch auction", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    initializeDatabase();
    const { id } = await params;
    const {
      title,
      description,
      start_price,
      highest_bid,
      seller_name,
      seller_info,
      organizer_name,
      organizer_info,
      start_date,
      end_date,
    } = await request.json();

    const db = getDb();

    // Basic validation
    if (!title || !description || !start_price || !start_date || !end_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        `
      UPDATE auctions
      SET title = ?, description = ?, start_price = ?, highest_bid = ?, seller_name = ?, seller_info = ?, organizer_name = ?, organizer_info = ?, start_date = ?, end_date = ?
      WHERE id = ?
    `
      )
      .run(
        title,
        description,
        start_price,
        highest_bid ?? start_price,
        seller_name || "",
        seller_info || "",
        organizer_name || "",
        organizer_info || "",
        start_date,
        end_date,
        id
      );

    if (result.changes === 0) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    return NextResponse.json(
      { id, message: "Auction updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating auction:", error);
    return NextResponse.json(
      { error: "Failed to update auction", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    initializeDatabase();
    const { id } = await params;
    const db = getDb();
    // Remove dependent rows that do not have ON DELETE CASCADE defined
    // (bids table references auctions without cascade), and clean notifications.
    try {
      db.prepare("DELETE FROM bids WHERE auction_id = ?").run(id);
    } catch (e) {
      console.warn("Warning deleting bids for auction", id, e);
    }
    try {
      db.prepare("DELETE FROM notifications WHERE auction_id = ?").run(id);
    } catch (e) {
      console.warn("Warning deleting notifications for auction", id, e);
    }

    const result = db.prepare("DELETE FROM auctions WHERE id = ?").run(id);
    if (result.changes === 0) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Auction deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting auction:", error);
    return NextResponse.json(
      { error: "Failed to delete auction", details: String(error) },
      { status: 500 }
    );
  }
}
