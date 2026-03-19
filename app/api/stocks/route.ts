import { NextResponse } from "next/server";

const COLLECTAPI_KEY = process.env.COLLECTAPI_KEY || "";
const COLLECTAPI_BASE = "https://api.collectapi.com/economy";
const TWELVE_DATA_KEY = process.env.TWELVE_DATA_KEY || "";
const TWELVE_DATA_BASE = "https://api.twelvedata.com";

const BIST_SYMBOLS = [
  "THYAO","GARAN","ASELS","EREGL","KCHOL","SISE","AKBNK","YKBNK","TUPRS","BIMAS",
  "FROTO","TOASO","PETKM","PGSUS","VESTL","KOZAL","TCELL","ENKAI","SAHOL","ISCTR",
  "ARCLK","KOZAA","MGROS","EKGYO","AEFES","TTKOM","DOHOL","HEKTS","ODAS","OYAKC",
  "TAVHL","SASA","TKFEN","BRISA","GUBRF","ULKER","CCOLA","KORDS","BAGFS","ANACM",
];

function fmtHacim(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(2)}K`;
  return String(v);
}

async function fromCollectApi() {
  if (!COLLECTAPI_KEY) throw new Error("COLLECTAPI_KEY not set");
  const res = await fetch(`${COLLECTAPI_BASE}/liveBorsa`, {
    signal: AbortSignal.timeout(10_000),
    headers: {
      authorization: `apikey ${COLLECTAPI_KEY}`,
      "content-type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`CollectAPI error: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error("CollectAPI: success=false");
  const result = (json.result as any[]).map((item: any) => ({
    code: String(item.code ?? ""),
    text: item.text || item.name || String(item.code ?? ""),
    lastprice: parseFloat(item.lastprice) || 0,
    lastpricestr: item.lastpricestr || String((parseFloat(item.lastprice) || 0).toFixed(2)),
    rate: parseFloat(item.rate) || 0,
    hacim: parseFloat(item.hacim) || 0,
    hacimstr: item.hacimstr || fmtHacim(parseFloat(item.hacim) || 0),
  }));
  return { success: true, result };
}

async function fromTwelveData() {
  if (!TWELVE_DATA_KEY) throw new Error("TWELVE_DATA_KEY not set");
  const symbols = BIST_SYMBOLS.join(",");
  const url = `${TWELVE_DATA_BASE}/quote?symbol=${symbols}&exchange=BIST&apikey=${TWELVE_DATA_KEY}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
  if (!res.ok) throw new Error(`Twelve Data HTTP ${res.status}`);
  const json = await res.json();
  const data: Record<string, any> = BIST_SYMBOLS.length === 1 ? { [BIST_SYMBOLS[0]]: json } : json;
  const result = BIST_SYMBOLS
    .filter((sym) => data[sym] && !data[sym].code)
    .map((sym) => {
      const q = data[sym];
      const price = parseFloat(q.close) || 0;
      const pct = parseFloat(q.percent_change) || 0;
      const vol = parseInt(q.volume, 10) || 0;
      return {
        code: sym,
        text: q.name || sym,
        lastprice: price,
        lastpricestr: price.toFixed(2),
        rate: pct,
        hacim: vol,
        hacimstr: fmtHacim(vol),
      };
    });
  if (result.length === 0) throw new Error("Twelve Data: no valid quotes");
  return { success: true, result };
}

async function fromYahoo() {
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
    code: String(q.symbol).replace(".IS", ""),
    text: q.longName || q.shortName || q.symbol,
    lastprice: q.regularMarketPrice ?? 0,
    lastpricestr: (q.regularMarketPrice ?? 0).toFixed(2),
    rate: q.regularMarketChangePercent ?? 0,
    hacim: q.regularMarketVolume ?? 0,
    hacimstr: fmtHacim(q.regularMarketVolume ?? 0),
  }));
  return { success: true, result };
}

export async function GET() {
  // CollectAPI → Twelve Data → Yahoo Finance
  if (COLLECTAPI_KEY) {
    try { return NextResponse.json(await fromCollectApi()); }
    catch (e) { console.warn("[stocks] CollectAPI failed:", String(e)); }
  }
  if (TWELVE_DATA_KEY) {
    try { return NextResponse.json(await fromTwelveData()); }
    catch (e) { console.warn("[stocks] Twelve Data failed:", String(e)); }
  }
  try { return NextResponse.json(await fromYahoo()); }
  catch (err) { return NextResponse.json({ success: false, error: String(err) }, { status: 500 }); }
}
