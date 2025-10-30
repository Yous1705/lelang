import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let db: Database.Database;

export function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), "data", "lelang.db");
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
  }
  return db;
}

export function initializeDatabase() {
  const db = getDb();

  // Add phone column if not exists
  try {
    db.exec("ALTER TABLE users ADD COLUMN phone TEXT;");
  } catch (e) {
    // Column might already exist
  }

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS auctions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      start_price REAL NOT NULL,
      highest_bid REAL NOT NULL,
      highest_bidder_id INTEGER,
      seller_name TEXT,
      seller_info TEXT,
      organizer_name TEXT,
      organizer_info TEXT,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS auction_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      auction_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bidders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      auction_id INTEGER NOT NULL,
      user_id INTEGER,
      bidder_name TEXT NOT NULL,
      bid_amount REAL NOT NULL,
      bid_count INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS bids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      auction_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      bid_amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (auction_id) REFERENCES auctions(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      auction_id INTEGER,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (auction_id) REFERENCES auctions(id)
    );

    CREATE INDEX IF NOT EXISTS idx_bids_auction ON bids(auction_id);
    CREATE INDEX IF NOT EXISTS idx_bids_user ON bids(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_auction_images ON auction_images(auction_id);
    CREATE INDEX IF NOT EXISTS idx_bidders_auction ON bidders(auction_id);
  `);

  // Seed admin user if not exists
  const adminExists = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get("admin@lelang.com");
  if (!adminExists) {
    const bcrypt = require("bcryptjs");
    const hashedPassword = bcrypt.hashSync("admin123", 10);
    db.prepare(
      `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `
    ).run("Admin", "admin@lelang.com", hashedPassword, "admin");
  }

  // Seed sample auctions is now disabled
  // This space intentionally left empty to prevent auto-seeding of sample data
}
