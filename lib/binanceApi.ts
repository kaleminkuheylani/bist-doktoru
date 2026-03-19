import type { BinanceTicker } from "@/types/market";

const SYMBOLS = [
  "BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT",
  "ADAUSDT","DOGEUSDT","AVAXUSDT","DOTUSDT","LINKUSDT",
  "LTCUSDT","UNIUSDT",
];

export async function fetchBinanceTickers(): Promise<BinanceTicker[] | null> {
  try {
    const symbolsParam = encodeURIComponent(JSON.stringify(SYMBOLS));
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbols=${symbolsParam}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as BinanceTicker[];
  } catch {
    return null;
  }
}
