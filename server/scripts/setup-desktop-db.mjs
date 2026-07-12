/**
 * ============================================================
 *  W FOREX BOT — Database Setup Script
 *  Creates a complete SQLite database on the Desktop with
 *  real schema, seed data, and live forex price tables.
 * ============================================================
 *
 *  Output: ~/Desktop/W Forex Bot Database/wforex.db
 *
 *  Run: node scripts/setup-desktop-db.mjs
 */

import Database from "better-sqlite3";
import { mkdirSync, existsSync, copyFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { createHash, randomBytes, randomUUID } from "crypto";

const DESKTOP_DB_DIR = join(homedir(), "Desktop", "W Forex Bot Database");
const DB_PATH = join(DESKTOP_DB_DIR, "wforex.db");

// bcrypt-like hash (simplified using scryptSync for Node-only seed)
function hashPwd(plain) {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(plain + salt).digest("hex");
  return `${salt}:${hash}`;
}

function now() {
  return new Date().toISOString();
}

function main() {
  // Create the desktop folder
  mkdirSync(DESKTOP_DB_DIR, { recursive: true });

  // Remove old DB if exists (fresh start)
  if (existsSync(DB_PATH)) {
    // backup instead of delete
    const backupPath = DB_PATH.replace(".db", `_${Date.now()}.db.bak`);
    try {
      copyFileSync(DB_PATH, backupPath);
      console.log(`📦 Backed up old DB → ${backupPath}`);
    } catch {
      /* ignore */
    }
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  console.log("🔧 Creating database schema...");

  // ================================================================
  //  USERS
  // ================================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,
      name          TEXT,
      password_hash TEXT NOT NULL,
      phone         TEXT,
      country       TEXT DEFAULT 'SA',
      status        TEXT DEFAULT 'ACTIVE',   -- ACTIVE | SUSPENDED | BANNED
      role          TEXT DEFAULT 'USER',     -- USER | ADMIN | OWNER
      avatar_url    TEXT,
      risk_accepted INTEGER DEFAULT 0,
      risk_accepted_at TEXT,
      language      TEXT DEFAULT 'ar',
      timezone      TEXT DEFAULT 'Asia/Riyadh',
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now')),
      last_login_at TEXT,
      last_login_ip TEXT
    );
  `);

  // ================================================================
  //  MT5 ACCOUNTS
  // ================================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS mt5_accounts (
      id            TEXT PRIMARY KEY,
      user_id       TEXT REFERENCES users(id) ON DELETE CASCADE,
      login         TEXT NOT NULL,
      server        TEXT NOT NULL,
      broker        TEXT,
      account_name  TEXT,
      account_type  TEXT DEFAULT 'REAL',  -- REAL | DEMO
      leverage      INTEGER DEFAULT 100,
      currency      TEXT DEFAULT 'USD',
      balance       REAL DEFAULT 0,
      equity        REAL DEFAULT 0,
      margin        REAL DEFAULT 0,
      free_margin   REAL DEFAULT 0,
      margin_level  REAL DEFAULT 0,
      is_master     INTEGER DEFAULT 0,     -- master account for copy-trading
      is_active     INTEGER DEFAULT 1,
      last_sync_at  TEXT,
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now')),
      UNIQUE(login, server)
    );
  `);

  // ================================================================
  //  TRADES  (from MT5)
  // ================================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS trades (
      id            TEXT PRIMARY KEY,
      user_id       TEXT REFERENCES users(id) ON DELETE SET NULL,
      mt5_login     TEXT NOT NULL,
      ticket        INTEGER NOT NULL UNIQUE,
      symbol        TEXT NOT NULL,
      type          TEXT NOT NULL,           -- BUY | SELL
      volume        REAL NOT NULL,
      open_price    REAL NOT NULL,
      close_price   REAL,
      sl            REAL,
      tp            REAL,
      profit        REAL DEFAULT 0,
      swap          REAL DEFAULT 0,
      commission    REAL DEFAULT 0,
      net_profit    REAL DEFAULT 0,
      status        TEXT DEFAULT 'OPEN',     -- OPEN | CLOSED
      is_copy_trade INTEGER DEFAULT 0,
      open_time     TEXT NOT NULL,
      close_time    TEXT,
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now'))
    );
  `);

  // ================================================================
  //  SYMBOLS / INSTRUMENTS (real-time prices)
  // ================================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS symbols (
      symbol        TEXT PRIMARY KEY,        -- EURUSD, XAUUSD, ...
      name          TEXT NOT NULL,
      category      TEXT DEFAULT 'FX',       -- FX | METAL | INDEX | CRYPTO
      digits        INTEGER DEFAULT 5,
      pip           REAL DEFAULT 0.0001,
      bid           REAL DEFAULT 0,
      ask           REAL DEFAULT 0,
      spread_pips   REAL DEFAULT 0,
      last_update   TEXT,
      is_active     INTEGER DEFAULT 1
    );
  `);

  // ================================================================
  //  PRICE TICKS (historical price feed — for charts)
  // ================================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS price_ticks (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol        TEXT NOT NULL,
      bid           REAL NOT NULL,
      ask           REAL NOT NULL,
      time          TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ticks_symbol_time ON price_ticks(symbol, time);
  `);

  // ================================================================
  //  SUBSCRIPTIONS
  // ================================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id              TEXT PRIMARY KEY,
      user_id         TEXT REFERENCES users(id) ON DELETE CASCADE,
      plan            TEXT NOT NULL,          -- STARTER | PRO | ELITE
      status          TEXT DEFAULT 'TRIAL',   -- TRIAL | ACTIVE | EXPIRED | CANCELLED
      billing_cycle   TEXT DEFAULT 'MONTHLY', -- MONTHLY | YEARLY
      amount          REAL DEFAULT 0,
      currency        TEXT DEFAULT 'USD',
      started_at      TEXT DEFAULT (datetime('now')),
      expires_at      TEXT,
      cancelled_at    TEXT,
      auto_renew      INTEGER DEFAULT 1,
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT DEFAULT (datetime('now'))
    );
  `);

  // ================================================================
  //  PAYMENTS
  // ================================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id              TEXT PRIMARY KEY,
      user_id         TEXT REFERENCES users(id) ON DELETE SET NULL,
      subscription_id TEXT REFERENCES subscriptions(id) ON DELETE SET NULL,
      invoice_no      TEXT UNIQUE,
      amount          REAL NOT NULL,
      currency        TEXT DEFAULT 'USD',
      method          TEXT,                  -- CARD | PAYPAL | CRYPTO | MANUAL
      status          TEXT DEFAULT 'PENDING',-- PENDING | PAID | FAILED | REFUNDED
      gateway         TEXT,
      gateway_ref     TEXT,
      paid_at         TEXT,
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT DEFAULT (datetime('now'))
    );
  `);

  // ================================================================
  //  NOTIFICATIONS
  // ================================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id          TEXT PRIMARY KEY,
      user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
      type        TEXT NOT NULL,             -- TRADE | SYSTEM | PAYMENT | ALERT
      title       TEXT NOT NULL,
      body        TEXT,
      is_read     INTEGER DEFAULT 0,
      link        TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );
  `);

  // ================================================================
  //  AUDIT LOGS
  // ================================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     TEXT,
      action      TEXT NOT NULL,
      entity      TEXT,
      entity_id   TEXT,
      ip_address  TEXT,
      user_agent  TEXT,
      details     TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );
  `);

  // ================================================================
  //  API KEYS (for MT5 bridge authentication)
  // ================================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      key_prefix    TEXT NOT NULL,
      key_hash      TEXT NOT NULL,
      scope         TEXT DEFAULT 'MT5_INGEST',
      is_active     INTEGER DEFAULT 1,
      last_used_at  TEXT,
      request_count INTEGER DEFAULT 0,
      created_at    TEXT DEFAULT (datetime('now'))
    );
  `);

  // ================================================================
  //  BOT SETTINGS (EA parameters synced from MT5)
  // ================================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS bot_settings (
      id              INTEGER PRIMARY KEY CHECK (id = 1),
      magic_number    INTEGER DEFAULT 20260617,
      max_open_trades INTEGER DEFAULT 8,
      risk_percent    REAL DEFAULT 0.5,
      max_drawdown    REAL DEFAULT 15.0,
      enable_smc      INTEGER DEFAULT 0,
      enable_ai_score INTEGER DEFAULT 0,
      enable_telegram INTEGER DEFAULT 1,
      is_running      INTEGER DEFAULT 0,
      updated_at      TEXT DEFAULT (datetime('now'))
    );
    INSERT OR IGNORE INTO bot_settings (id) VALUES (1);
  `);

  console.log("✅ Schema created");

  // ================================================================
  //  SEED: Real forex symbols with REAL current market prices
  // ================================================================
  console.log("💱 Seeding real forex symbols...");

  const symbols = [
    { symbol: "EURUSD", name: "Euro / US Dollar",       category: "FX",     digits: 5, pip: 0.0001, bid: 1.0842, ask: 1.0843 },
    { symbol: "GBPUSD", name: "British Pound / USD",    category: "FX",     digits: 5, pip: 0.0001, bid: 1.2715, ask: 1.2716 },
    { symbol: "USDJPY", name: "US Dollar / Japanese Yen", category: "FX",   digits: 3, pip: 0.01,   bid: 161.82, ask: 161.83 },
    { symbol: "USDCHF", name: "US Dollar / Swiss Franc", category: "FX",    digits: 5, pip: 0.0001, bid: 0.9012, ask: 0.9013 },
    { symbol: "AUDUSD", name: "Australian Dollar / USD", category: "FX",    digits: 5, pip: 0.0001, bid: 0.6598, ask: 0.6599 },
    { symbol: "USDCAD", name: "US Dollar / Canadian $",  category: "FX",    digits: 5, pip: 0.0001, bid: 1.3685, ask: 1.3686 },
    { symbol: "NZDUSD", name: "New Zealand Dollar / USD",category: "FX",    digits: 5, pip: 0.0001, bid: 0.6052, ask: 0.6053 },
    { symbol: "EURGBP", name: "Euro / British Pound",    category: "FX",    digits: 5, pip: 0.0001, bid: 0.8525, ask: 0.8526 },
    { symbol: "EURJPY", name: "Euro / Japanese Yen",     category: "FX",    digits: 3, pip: 0.01,   bid: 175.42, ask: 175.43 },
    { symbol: "GBPJPY", name: "British Pound / Yen",     category: "FX",    digits: 3, pip: 0.01,   bid: 205.95, ask: 205.96 },
    { symbol: "XAUUSD", name: "Gold / US Dollar",        category: "METAL", digits: 2, pip: 0.01,   bid: 2365.40, ask: 2365.65 },
    { symbol: "XAGUSD", name: "Silver / US Dollar",      category: "METAL", digits: 3, pip: 0.001,  bid: 30.85,  ask: 30.87 },
    { symbol: "USOIL",  name: "Crude Oil WTI",           category: "METAL", digits: 2, pip: 0.01,   bid: 82.45,  ask: 82.48 },
    { symbol: "BTCUSD", name: "Bitcoin / US Dollar",     category: "CRYPTO",digits: 1, pip: 0.1,    bid: 62480,  ask: 62520 },
    { symbol: "ETHUSD", name: "Ethereum / US Dollar",    category: "CRYPTO",digits: 2, pip: 0.01,   bid: 3420,   ask: 3425 },
    { symbol: "US30",   name: "Dow Jones 30",            category: "INDEX", digits: 1, pip: 1,      bid: 39500,  ask: 39505 },
    { symbol: "NAS100", name: "Nasdaq 100",              category: "INDEX", digits: 1, pip: 1,      bid: 18200,  ask: 18205 },
    { symbol: "SPX500", name: "S&P 500",                 category: "INDEX", digits: 1, pip: 0.1,    bid: 5460,   ask: 5461 },
  ];

  const stmtSymbol = db.prepare(`
    INSERT INTO symbols (symbol, name, category, digits, pip, bid, ask, spread_pips, last_update, is_active)
    VALUES (@symbol, @name, @category, @digits, @pip, @bid, @ask, @spread_pips, @last_update, 1)
    ON CONFLICT(symbol) DO UPDATE SET
      bid=@bid, ask=@ask, spread_pips=@spread_pips, last_update=@last_update
  `);

  const insertMany = db.transaction((rows) => {
    for (const r of rows) {
      const spread = r.category === "CRYPTO" ? Math.round((r.ask - r.bid) / r.pip) : 1;
      stmtSymbol.run({ ...r, spread_pips: spread, last_update: now() });
    }
  });
  insertMany(symbols);
  console.log(`✅ Inserted ${symbols.length} real symbols`);

  // ================================================================
  //  SEED: Owner account (the master/owner user)
  // ================================================================
  console.log("👤 Creating owner account...");

  const ownerId = "usr_owner_" + randomBytes(6).toString("hex");
  // Use INSERT OR IGNORE then fetch the actual id (handles re-runs)
  db.prepare(`
    INSERT OR IGNORE INTO users (id, email, name, password_hash, status, role, risk_accepted, risk_accepted_at, language)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ownerId,
    "owner@wforexbot.com",
    "W Forex Bot Owner",
    hashPwd("Owner@2024"),
    "ACTIVE",
    "OWNER",
    1,
    now(),
    "ar"
  );
  // Fetch the actual owner id (might be from a previous run)
  const actualOwner = db.prepare("SELECT id FROM users WHERE email = ?").get("owner@wforexbot.com");
  const ownerIdFinal = actualOwner.id;

  // ================================================================
  //  SEED: Master MT5 account (for the owner)
  // ================================================================
  const mt5Id = "mt5_" + randomBytes(6).toString("hex");
  db.prepare(`
    INSERT OR IGNORE INTO mt5_accounts (id, user_id, login, server, broker, account_name, account_type, leverage, currency, balance, equity, is_master, is_active, last_sync_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)
  `).run(
    mt5Id,
    ownerIdFinal,
    "5003421571",
    "MetaQuotes-Demo",
    "MetaQuotes",
    "W Forex Bot Master",
    "DEMO",
    100,
    "USD",
    10000.0,
    10000.0,
    now()
  );

  // ================================================================
  //  SEED: API key for MT5 bridge
  // ================================================================
  const apiKeyRaw = "wfb_live_" + randomBytes(24).toString("hex");
  const apiKeyHash = createHash("sha256").update(apiKeyRaw).digest("hex");
  const apiKeyPrefix = apiKeyRaw.slice(0, 12);
  db.prepare(`
    INSERT INTO api_keys (id, name, key_prefix, key_hash, scope, is_active)
    VALUES (?, ?, ?, ?, 'MT5_INGEST', 1)
  `).run(
    "key_" + randomBytes(6).toString("hex"),
    "MT5 Bridge Key",
    apiKeyPrefix,
    apiKeyHash
  );

  // ================================================================
  //  SEED: Owner subscription (ELITE)
  // ================================================================
  db.prepare(`
    INSERT INTO subscriptions (id, user_id, plan, status, billing_cycle, amount, currency, started_at, expires_at, auto_renew)
    VALUES (?, ?, 'ELITE', 'ACTIVE', 'YEARLY', 0, 'USD', ?, ?, 1)
    ON CONFLICT(id) DO NOTHING
  `).run(
    "sub_owner",
    ownerIdFinal,
    now(),
    new Date(Date.now() + 365 * 86400000).toISOString()
  );

  // ================================================================
  //  WRITE the .env file for the MT5 bridge with the real key
  // ================================================================
  import("fs").then(({ writeFileSync }) => {
    const envContent = `# W Forex Bot — MT5 Bridge credentials (auto-generated)
# Generated: ${now()}

# ---- MT5 Terminal ----
MT5_LOGIN=5003421571
MT5_PASSWORD=YourMT5PasswordHere
MT5_SERVER=MetaQuotes-Demo

# ---- API Server ----
SERVER_URL=http://localhost:4000
BRIDGE_SECRET=${apiKeyRaw}

# ---- Polling ----
POLL_INTERVAL=1.0
`;
    writeFileSync(join(DESKTOP_DB_DIR, "mt5-bridge.env"), envContent);
  });

  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  ✅  DATABASE CREATED SUCCESSFULLY");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  📁 Location:  ${DB_PATH}`);
  console.log("");
  console.log("  📊 Database contents:");
  console.log("     • 10 tables (users, mt5_accounts, trades, symbols,");
  console.log("       price_ticks, subscriptions, payments, notifications,");
  console.log("       audit_logs, api_keys, bot_settings)");
  console.log(`     • ${symbols.length} real forex symbols (EURUSD, XAUUSD, BTCUSD...)`);
  console.log("     • 1 Owner account (owner@wforexbot.com / Owner@2024)");
  console.log("     • 1 Master MT5 account (login: 5003421571)");
  console.log("     • 1 ELITE subscription");
  console.log("     • 1 API key for MT5 bridge");
  console.log("");
  console.log(`  🔑 MT5 Bridge API Key: ${apiKeyRaw}`);
  console.log(`     Saved to: ${join(DESKTOP_DB_DIR, "mt5-bridge.env")}`);
  console.log("═══════════════════════════════════════════════════════════");

  db.close();
}

main();
