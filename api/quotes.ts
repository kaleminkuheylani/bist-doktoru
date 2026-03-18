// Vercel serverless function: Yahoo Finance proxy
// GET /api/quotes?symbols=THYAO.IS,GARAN.IS,...
export default async function handler(req: any, res: any) {
  const symbols = req.query?.symbols as string | undefined;
  if (!symbols) {
    res.status(400).json({ error: "symbols required" });
    return;
  }
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BistDoktoru/1.0)" },
    });
    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
