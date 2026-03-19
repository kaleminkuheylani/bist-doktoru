import { NextResponse } from "next/server";

const COLLECTAPI_KEY = process.env.COLLECTAPI_KEY || "";
const COLLECTAPI_BASE = "https://api.collectapi.com/economy";
const TWELVE_DATA_KEY = process.env.TWELVE_DATA_KEY || "";
const TWELVE_DATA_BASE = "https://api.twelvedata.com";

async function fromCollectApi() {
  if (!COLLECTAPI_KEY) throw new Error("COLLECTAPI_KEY not set");
  const res = await fetch(`${COLLECTAPI_BASE}/borsaIstanbul`, {
    signal: AbortSignal.timeout(10_000),
    headers: {
      authorization: `apikey ${COLLECTAPI_KEY}`,
      "content-type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`CollectAPI error: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error("CollectAPI: success=false");
  return json;
}

async function fromTwelveData() {
  if (!TWELVE_DATA_KEY) throw new Error("TWELVE_DATA_KEY not set");
  const url = `${TWELVE_DATA_BASE}/quote?symbol=XU100&exchange=BIST&apikey=${TWELVE_DATA_KEY}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Twelve Data HTTP ${res.status}`);
  const q = await res.json();
  if (q.code) throw new Error(`Twelve Data: ${q.message}`);
  const current = parseFloat(q.close) || 0;
  const changerate = parseFloat(q.percent_change) || 0;
  return {
    success: true,
    result: {
      current,
      currentstr: current.toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
      changerate,
      changeratestr: Math.abs(changerate).toFixed(2),
      min: parseFloat(q.low) || 0,
      minstr: (parseFloat(q.low) || 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
      max: parseFloat(q.high) || 0,
      maxstr: (parseFloat(q.high) || 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
    },
  };
}

async function fromYahoo() {
  const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=XU100.IS&lang=tr&region=TR`;
  const resp = await fetch(url, {
    signal: AbortSignal.timeout(10_000),
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!resp.ok) throw new Error(`Yahoo Finance error: ${resp.status}`);
  const json = await resp.json();
  const q = json?.quoteResponse?.result?.[0];
  if (!q) throw new Error("No BIST data from Yahoo");
  const current = q.regularMarketPrice ?? 0;
  const changerate = q.regularMarketChangePercent ?? 0;
  return {
    success: true,
    result: {
      current,
      currentstr: current.toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
      changerate,
      changeratestr: Math.abs(changerate).toFixed(2),
      min: q.regularMarketDayLow ?? 0,
      minstr: (q.regularMarketDayLow ?? 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
      max: q.regularMarketDayHigh ?? 0,
      maxstr: (q.regularMarketDayHigh ?? 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
    },
  };
}

export async function GET() {
  // CollectAPI → Twelve Data → Yahoo Finance
  if (COLLECTAPI_KEY) {
    try { return NextResponse.json(await fromCollectApi()); }
    catch (e) { console.warn("[bist] CollectAPI failed:", String(e)); }
  }
  if (TWELVE_DATA_KEY) {
    try { return NextResponse.json(await fromTwelveData()); }
    catch (e) { console.warn("[bist] Twelve Data failed:", String(e)); }
  }
  try { return NextResponse.json(await fromYahoo()); }
  catch (err) { return NextResponse.json({ success: false, error: String(err) }, { status: 500 }); }
}
