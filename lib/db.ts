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

  // Seed sample auctions
  const auctionCount = db
    .prepare("SELECT COUNT(*) as count FROM auctions")
    .get() as { count: number };
  if (auctionCount.count === 0) {
    const sampleAuctions = [
      {
        title: "Sofa Kulit Vintage",
        description: "Sofa kulit vintage yang indah dalam kondisi sempurna",
        seller_name: "PT. Furniture Jaya",
        seller_info: "Penjual furniture berkualitas tinggi",
        organizer_name: "Lelang Internal",
        organizer_info: "Platform lelang profesional",
        start_price: 5000000,
        highest_bid: 5000000,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Jam Dinding Antik",
        description: "Jam dinding antik buatan tangan dari tahun 1920an",
        seller_name: "Toko Antik Bersama",
        seller_info: "Spesialis barang antik berkualitas",
        organizer_name: "Lelang Internal",
        organizer_info: "Platform lelang profesional",
        start_price: 3000000,
        highest_bid: 3000000,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Lukisan Minyak - Pemandangan",
        description:
          "Lukisan minyak asli yang menggambarkan pemandangan yang tenang",
        seller_name: "Galeri Seni Indah",
        seller_info: "Galeri seni dengan koleksi eksklusif",
        organizer_name: "Lelang Internal",
        organizer_info: "Platform lelang profesional",
        start_price: 8000000,
        highest_bid: 8000000,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Koleksi Kamera Vintage",
        description: "Set 5 kamera vintage dari era yang berbeda",
        seller_name: "Koleksi Fotografi Klasik",
        seller_info: "Penyedia peralatan fotografi vintage",
        organizer_name: "Lelang Internal",
        organizer_info: "Platform lelang profesional",
        start_price: 4000000,
        highest_bid: 4000000,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const stmt = db.prepare(`
      INSERT INTO auctions (title, description, seller_name, seller_info, organizer_name, organizer_info, start_price, highest_bid, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sampleAuctions.forEach((auction) => {
      const result = stmt.run(
        auction.title,
        auction.description,
        auction.seller_name,
        auction.seller_info,
        auction.organizer_name,
        auction.organizer_info,
        auction.start_price,
        auction.highest_bid,
        auction.start_date,
        auction.end_date
      );

      const auctionId = (result as any).lastInsertRowid;
      const imageStmt = db.prepare(`
        INSERT INTO auction_images (auction_id, image_url, display_order)
        VALUES (?, ?, ?)
      `);

      const images = [
        "/vintage-leather-sofa.png",
        "/antique-wooden-clock.jpg",
        "/oil-painting-landscape.png",
        "/vintage-camera-collection.png",
      ];

      imageStmt.run(auctionId, images[sampleAuctions.indexOf(auction)], 0);
    });
  }
}
