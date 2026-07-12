/**
 * ============================================================
 *  W FOREX BOT — Live Price Updater
 *  Fetches real global prices and updates the Desktop database.
 *  Run periodically to keep DB prices in sync with world markets.
 *
 *  Run: node scripts/update-db-prices.mjs
 * ============================================================
 */

import Database from "better-sqlite3";
import { join } from "path";
import { homedir } from "os";

const DB_PATH = join(homedir(), "Desktop", "W Forex Bot Database", "wforex.db");

async function fetchRealRates() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.rates || {};
  } catch (err) {
    console.error("[fx] fetch failed:", err.message);
    return {};
  }
}

async function fetchCrypto() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[crypto] fetch failed:", err.message);
    return {};
  }
}

async function fetchMetals() {
  const out = {};
  try {
    for (const [sym, ticker] of [["XAU", "GC=F"], ["XAG", "SI=F"]]) {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
        { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (price) out[`${sym}USD`] = price;
      }
    }
  } catch (err) {
    console.error("[metals] fetch failed:", err.message);
  }
  return out;
}

async function main() {
  console.log("💱 Fetching real global prices...");

  const [rates, crypto, metals] = await Promise.all([
    fetchRealRates(),
    fetchCrypto(),
    fetchMetals(),
  ]);

  const realPrices = {};

  // Forex
  if (rates.EUR) realPrices.EURUSD = 1 / rates.EUR;
  if (rates.GBP) realPrices.GBPUSD = 1 / rates.GBP;
  if (rates.JPY) realPrices.USDJPY = rates.JPY;
  if (rates.CHF) realPrices.USDCHF = rates.CHF;
  if (rates.AUD) realPrices.AUDUSD = 1 / rates.AUD;
  if (rates.CAD) realPrices.USDCAD = rates.CAD;
  if (rates.NZD) realPrices.NZDUSD = 1 / rates.NZD;
  if (rates.EUR && rates.GBP) realPrices.EURGBP = rates.GBP / rates.EUR;
  if (rates.EUR && rates.JPY) realPrices.EURJPY = rates.JPY / rates.EUR;
  if (rates.GBP && rates.JPY) realPrices.GBPJPY = rates.JPY / rates.GBP;

  // Crypto
  if (crypto.bitcoin?.usd) realPrices.BTCUSD = crypto.bitcoin.usd;
  if (crypto.ethereum?.usd) realPrices.ETHUSD = crypto.ethereum.usd;

  // Metals
  Object.assign(realPrices, metals);

  console.log(`📊 Got ${Object.keys(realPrices).length} real prices`);

  // Update the database
  const db = new Database(DB_PATH);
  const now = new Date().toISOString();

  const updateStmt = db.prepare(`
    UPDATE symbols SET bid = ?, ask = ?, last_update = ?, is_active = 1
    WHERE symbol = ?
  `);

  const insertTick = db.prepare(`
    INSERT INTO price_ticks (symbol, bid, ask, time) VALUES (?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    let updated = 0;
    for (const [symbol, price] of Object.entries(realPrices)) {
      const spread = getSpread(symbol);
      const bid = price - spread / 2;
      const ask = price + spread / 2;
      const res = updateStmt.run(bid, ask, now, symbol);
      if (res.changes > 0) {
        updated++;
        insertTick.run(symbol, bid, ask, now);
      }
    }
    return updated;
  });

  const updated = tx();
  db.close();

  console.log(`✅ Updated ${updated} symbols in database`);
  console.log("");
  console.log("Current prices:");
  for (const [symbol, price] of Object.entries(realPrices)) {
    console.log(`  ${symbol}: ${price}`);
  }
}

function getSpread(symbol) {
  if (symbol.startsWith("BTC") || symbol.startsWith("ETH")) return 40;
  if (symbol.startsWith("XAU")) return 0.25;
  if (symbol.startsWith("XAG")) return 0.02;
  if (symbol.endsWith("JPY")) return 0.01;
  return 0.0001;
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
