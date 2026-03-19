import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TWELVE_DATA_KEY  = process.env.TWELVE_DATA_KEY  || "";
const COLLECTAPI_KEY   = process.env.COLLECTAPI_KEY   || "";
const COLLECTAPI_BASE  = "https://api.collectapi.com/economy";
const TWELVE_DATA_BASE = "https://api.twelvedata.com";

// ─── BIST hisse listesi ────────────────────────────────────────────────────
const BIST_SYMBOLS = [
  "THYAO","GARAN","ASELS","EREGL","KCHOL","SISE","AKBNK","YKBNK","TUPRS","BIMAS",
  "FROTO","TOASO","PETKM","PGSUS","VESTL","KOZAL","TCELL","ENKAI","SAHOL","ISCTR",
  "ARCLK","KOZAA","MGROS","EKGYO","AEFES","TTKOM","DOHOL","HEKTS","ODAS","OYAKC",
  "TAVHL","SASA","TKFEN","BRISA","GUBRF","ULKER","CCOLA","KORDS","BAGFS","ANACM",
];

function fmtHacim(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)         return `${(v / 1_000).toFixed(2)}K`;
  return String(v);
}

// ─── Twelve Data ──────────────────────────────────────────────────────────

async function fetchStocksFromTwelveData() {
  if (!TWELVE_DATA_KEY) throw new Error("TWELVE_DATA_KEY not set");

  const symbols = BIST_SYMBOLS.join(",");
  const url = `${TWELVE_DATA_BASE}/quote?symbol=${symbols}&exchange=BIST&apikey=${TWELVE_DATA_KEY}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
  if (!res.ok) throw new Error(`Twelve Data HTTP ${res.status}`);

  const json = await res.json();

  // Tekil sembol → direkt obje; çoklu → { THYAO: {...}, GARAN: {...} }
  const data: Record<string, any> =
    BIST_SYMBOLS.length === 1 ? { [BIST_SYMBOLS[0]]: json } : json;

  const result = BIST_SYMBOLS
    .filter((sym) => data[sym] && !data[sym].code) // hata objeleri code alanı taşır
    .map((sym) => {
      const q = data[sym];
      const price = parseFloat(q.close)          || 0;
      const pct   = parseFloat(q.percent_change) || 0;
      const vol   = parseInt(q.volume, 10)       || 0;
      return {
        code:         sym,
        text:         q.name || sym,
        lastprice:    price,
        lastpricestr: price.toFixed(2),
        rate:         pct,
        hacim:        vol,
        hacimstr:     fmtHacim(vol),
      };
    });

  if (result.length === 0) throw new Error("Twelve Data: no valid quotes returned");
  return { success: true, result };
}

async function fetchBistFromTwelveData() {
  if (!TWELVE_DATA_KEY) throw new Error("TWELVE_DATA_KEY not set");

  const url = `${TWELVE_DATA_BASE}/quote?symbol=XU100&exchange=BIST&apikey=${TWELVE_DATA_KEY}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Twelve Data BIST HTTP ${res.status}`);

  const q = await res.json();
  if (q.code) throw new Error(`Twelve Data BIST: ${q.message}`);

  const current    = parseFloat(q.close) || 0;
  const changerate = parseFloat(q.percent_change) || 0;
  return {
    success: true,
    result: {
      current,
      currentstr:    current.toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
      changerate,
      changeratestr: Math.abs(changerate).toFixed(2),
      min:    parseFloat(q.low)  || 0,
      minstr: (parseFloat(q.low) || 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
      max:    parseFloat(q.high) || 0,
      maxstr: (parseFloat(q.high) || 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
    },
  };
}

// ─── CollectAPI ───────────────────────────────────────────────────────────

async function collectApiFetch(endpoint: string) {
  const res = await fetch(`${COLLECTAPI_BASE}${endpoint}`, {
    signal: AbortSignal.timeout(10_000),
    headers: {
      authorization: `apikey ${COLLECTAPI_KEY}`,
      "content-type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`CollectAPI error: ${res.status}`);
  return res.json();
}

// ─── Yahoo Finance fallback ───────────────────────────────────────────────

async function fetchStocksFromYahoo() {
  const ySymbols = BIST_SYMBOLS.map((s) => `${s}.IS`).join(",");
  const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${ySymbols}&lang=tr&region=TR`;
  const resp = await fetch(url, {
    signal: AbortSignal.timeout(12_000),
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!resp.ok) throw new Error(`Yahoo Finance error: ${resp.status}`);
  const json = await resp.json();
  const quotes: any[] = json?.quoteResponse?.result ?? [];
  const result = quotes.map((q) => ({
    code:         String(q.symbol).replace(".IS", ""),
    text:         q.longName || q.shortName || q.symbol,
    lastprice:    q.regularMarketPrice ?? 0,
    lastpricestr: (q.regularMarketPrice ?? 0).toFixed(2),
    rate:         q.regularMarketChangePercent ?? 0,
    hacim:        q.regularMarketVolume ?? 0,
    hacimstr:     fmtHacim(q.regularMarketVolume ?? 0),
  }));
  return { success: true, result };
}

async function fetchBistFromYahoo() {
  const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=XU100.IS&lang=tr&region=TR`;
  const resp = await fetch(url, {
    signal: AbortSignal.timeout(10_000),
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!resp.ok) throw new Error(`Yahoo Finance BIST error: ${resp.status}`);
  const json = await resp.json();
  const q = json?.quoteResponse?.result?.[0];
  if (!q) throw new Error("No BIST data");
  const current    = q.regularMarketPrice ?? 0;
  const changerate = q.regularMarketChangePercent ?? 0;
  return {
    success: true,
    result: {
      current,
      currentstr:    current.toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
      changerate,
      changeratestr: Math.abs(changerate).toFixed(2),
      min:    q.regularMarketDayLow  ?? 0,
      minstr: (q.regularMarketDayLow  ?? 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
      max:    q.regularMarketDayHigh ?? 0,
      maxstr: (q.regularMarketDayHigh ?? 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
    },
  };
}

// ─── Altın / TCMB yardımcıları ────────────────────────────────────────────

async function getUsdTry(): Promise<number> {
  const response = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", {
    signal: AbortSignal.timeout(8_000),
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!response.ok) throw new Error("TCMB error");
  const buf = await response.arrayBuffer();
  const xml = new TextDecoder("iso-8859-9").decode(buf);
  const m = xml.match(/CurrencyCode="USD"[\s\S]*?<ForexSelling>([\d.]+)<\/ForexSelling>/);
  if (!m) throw new Error("USD/TRY not found");
  return parseFloat(m[1]);
}

async function getFallbackGoldData() {
  const yahooRes = await fetch(
    "https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1m&range=1d",
    { signal: AbortSignal.timeout(10_000), headers: { "User-Agent": "Mozilla/5.0" } }
  );
  if (!yahooRes.ok) throw new Error("Yahoo Finance error");
  const yahooData = await yahooRes.json();
  const xauUsd: number = yahooData?.chart?.result?.[0]?.meta?.regularMarketPrice;
  if (!xauUsd) throw new Error("No gold price from Yahoo");

  const usdTry  = await getUsdTry();
  const gramTry = (xauUsd / 31.1035) * usdTry;
  const s = (n: number, pct: number) => (n * pct).toFixed(2);

  return {
    success: true,
    result: [
      { name: "Gram Altın",        buy: s(gramTry, 0.997),        sell: s(gramTry, 1.003) },
      { name: "Çeyrek Altın",      buy: s(gramTry * 1.75, 0.997), sell: s(gramTry * 1.75, 1.003) },
      { name: "Yarım Altın",       buy: s(gramTry * 3.5, 0.997),  sell: s(gramTry * 3.5, 1.003) },
      { name: "Tam Altın",         buy: s(gramTry * 7.0, 0.997),  sell: s(gramTry * 7.0, 1.003) },
      { name: "Cumhuriyet Altını", buy: s(gramTry * 7.2, 0.997),  sell: s(gramTry * 7.2, 1.003) },
      { name: "Ons Altın",         buy: s(xauUsd * usdTry, 0.997), sell: s(xauUsd * usdTry, 1.003) },
    ],
  };
}

function parseTcmbXml(xml: string) {
  const currencies: {
    code: string; name: string; unit: number;
    forexBuying: string; forexSelling: string;
    banknoteBuying: string; banknoteSelling: string;
  }[] = [];

  const blocks = xml.match(/<Currency[^>]*CurrencyCode="(\w+)"[^>]*>([\s\S]*?)<\/Currency>/g) || [];
  for (const block of blocks) {
    const code  = block.match(/CurrencyCode="(\w+)"/)?.[1];
    const unit  = block.match(/<Unit>(\d+)<\/Unit>/)?.[1];
    const name  = block.match(/<Isim>([^<]+)<\/Isim>/)?.[1];
    const fBuy  = block.match(/<ForexBuying>([^<]+)<\/ForexBuying>/)?.[1];
    const fSell = block.match(/<ForexSelling>([^<]+)<\/ForexSelling>/)?.[1];
    const bnBuy  = block.match(/<BanknoteBuying>([^<]+)<\/BanknoteBuying>/)?.[1];
    const bnSell = block.match(/<BanknoteSelling>([^<]+)<\/BanknoteSelling>/)?.[1];
    if (!code || !fBuy || !fSell) continue;
    currencies.push({
      code, name: name ?? code, unit: parseInt(unit ?? "1"),
      forexBuying: fBuy, forexSelling: fSell,
      banknoteBuying: bnBuy ?? "", banknoteSelling: bnSell ?? "",
    });
  }
  return currencies;
}

// ─── Express sunucu ───────────────────────────────────────────────────────

async function startServer() {
  const app    = express();
  const server = createServer(app);
  app.use(express.json());

  console.log(`[sources] TwelveData=${TWELVE_DATA_KEY ? "✓" : "✗"}  CollectAPI=${COLLECTAPI_KEY ? "✓" : "✗"}`);

  // /api/stocks — Twelve Data → CollectAPI → Yahoo Finance
  app.get("/api/stocks", async (_req, res) => {
    if (TWELVE_DATA_KEY) {
      try { return res.json(await fetchStocksFromTwelveData()); }
      catch (e) { console.warn("[stocks] Twelve Data failed:", String(e)); }
    }
    if (COLLECTAPI_KEY) {
      try { return res.json(await collectApiFetch("/hisseSenedi")); }
      catch (e) { console.warn("[stocks] CollectAPI failed:", String(e)); }
    }
    try { return res.json(await fetchStocksFromYahoo()); }
    catch (err) { res.status(500).json({ success: false, error: String(err) }); }
  });

  // /api/bist — Twelve Data → CollectAPI → Yahoo Finance
  app.get("/api/bist", async (_req, res) => {
    if (TWELVE_DATA_KEY) {
      try { return res.json(await fetchBistFromTwelveData()); }
      catch (e) { console.warn("[bist] Twelve Data failed:", String(e)); }
    }
    if (COLLECTAPI_KEY) {
      try { return res.json(await collectApiFetch("/borsaIstanbul")); }
      catch (e) { console.warn("[bist] CollectAPI failed:", String(e)); }
    }
    try { return res.json(await fetchBistFromYahoo()); }
    catch (err) { res.status(500).json({ success: false, error: String(err) }); }
  });

  // /api/currency
  app.get("/api/currency", async (_req, res) => {
    try { res.json(await collectApiFetch("/allCurrency")); }
    catch (err) { res.status(500).json({ success: false, error: String(err) }); }
  });

  // /api/gold — CollectAPI → Yahoo+TCMB fallback
  app.get("/api/gold", async (_req, res) => {
    if (COLLECTAPI_KEY) {
      try { return res.json(await collectApiFetch("/goldPrice")); }
      catch { /* fallback */ }
    }
    try { return res.json(await getFallbackGoldData()); }
    catch (err) { res.status(500).json({ success: false, error: String(err) }); }
  });

  // /api/tcmb
  app.get("/api/tcmb", async (_req, res) => {
    try {
      const response = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", {
        signal: AbortSignal.timeout(8_000),
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!response.ok) throw new Error(`TCMB error: ${response.status}`);
      const buf = await response.arrayBuffer();
      const xml = new TextDecoder("iso-8859-9").decode(buf);
      res.json({ success: true, result: parseTcmbXml(xml) });
    } catch (err) {
      res.status(500).json({ success: false, error: String(err) });
    }
  });

  // /api/binance
  app.get("/api/binance", async (_req, res) => {
    try {
      const symbols = encodeURIComponent(
        '["BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT","ADAUSDT","DOGEUSDT","AVAXUSDT","DOTUSDT","LINKUSDT","LTCUSDT","UNIUSDT"]'
      );
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`, {
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) throw new Error(`Binance error: ${response.status}`);
      res.json({ success: true, result: await response.json() });
    } catch (err) {
      res.status(500).json({ success: false, error: String(err) });
    }
  });

  // Static / SPA
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
