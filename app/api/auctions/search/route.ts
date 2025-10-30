import { type NextRequest, NextResponse } from "next/server"
import { getDb, initializeDatabase } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null
    const status = searchParams.get("status") || "all" // all, active, ended

    initializeDatabase()
    const db = getDb()

    let sql = "SELECT * FROM auctions WHERE 1=1"
    const params: any[] = []

    if (query) {
      sql += " AND (title LIKE ? OR description LIKE ?)"
      params.push(`%${query}%`, `%${query}%`)
    }

    if (minPrice !== null) {
      sql += " AND highest_bid >= ?"
      params.push(minPrice)
    }

    if (maxPrice !== null) {
      sql += " AND highest_bid <= ?"
      params.push(maxPrice)
    }

    if (status === "active") {
      sql += " AND end_date > datetime('now')"
    } else if (status === "ended") {
      sql += " AND end_date <= datetime('now')"
    }

    sql += " ORDER BY created_at DESC"

    const auctions = db.prepare(sql).all(...params)

    return NextResponse.json(auctions)
  } catch (error) {
    console.error("Error searching auctions:", error)
    return NextResponse.json({ error: "Failed to search auctions" }, { status: 500 })
  }
}
