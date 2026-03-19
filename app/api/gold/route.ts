import { NextResponse } from "next/server";

const COLLECTAPI_KEY = process.env.COLLECTAPI_KEY || "";

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

async function fallbackGold() {
  const yahooRes = await fetch(
    "https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1m&range=1d",
    { signal: AbortSignal.timeout(10_000), headers: { "User-Agent": "Mozilla/5.0" } }
  );
  if (!yahooRes.ok) throw new Error("Yahoo Finance error");
  const yahooData = await yahooRes.json();
  const xauUsd: number = yahooData?.chart?.result?.[0]?.meta?.regularMarketPrice;
  if (!xauUsd) throw new Error("No gold price from Yahoo");
  const usdTry = await getUsdTry();
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

export async function GET() {
  if (COLLECTAPI_KEY) {
    try {
      const res = await fetch("https://api.collectapi.com/economy/goldPrice", {
        signal: AbortSignal.timeout(10_000),
        headers: {
          authorization: `apikey ${COLLECTAPI_KEY}`,
          "content-type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`CollectAPI error: ${res.status}`);
      return NextResponse.json(await res.json());
    } catch { /* fallback */ }
  }
  try {
    return NextResponse.json(await fallbackGold());
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
