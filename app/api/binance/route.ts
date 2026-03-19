import { NextResponse } from "next/server";

export async function GET() {
  try {
    const symbols = encodeURIComponent(
      '["BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT","ADAUSDT","DOGEUSDT","AVAXUSDT","DOTUSDT","LINKUSDT","LTCUSDT","UNIUSDT"]'
    );
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`, {
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`Binance error: ${response.status}`);
    return NextResponse.json({ success: true, result: await response.json() });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
