/**
 * BIST Doktoru - Collect API Service
 *
 * Gerçek zamanlı veri kaynakları:
 *  - Yahoo Finance (/api/quotes proxy)  → BIST hisseleri, endeksler, döviz, emtia
 *  - CoinGecko API (direkt, CORS-enabled) → Kripto varlıklar
 *  - rss2json.com + Google News RSS       → Piyasa haberleri
 */
import axios from "axios";

// ─── Number formatters ────────────────────────────────────────────────────────

function fmtTR(n: number, d = 2): string {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtUS(n: number, d = 0): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtChange(pct: number): { text: string; up: boolean } {
  const up = pct >= 0;
  return { text: `${up ? "+" : ""}${fmtTR(pct)}%`, up };
}

function fmtVol(n: number): string {
  if (n >= 1e9) return `${fmtTR(n / 1e9, 1)}B`;
  if (n >= 1e6) return `${fmtTR(n / 1e6, 0)}M`;
  return fmtTR(n, 0);
}

function fmtCapTRY(n: number): string {
  if (n >= 1e12) return `₺${fmtTR(n / 1e12, 1)}T`;
  if (n >= 1e9) return `₺${fmtTR(n / 1e9, 1)}B`;
  if (n >= 1e6) return `₺${fmtTR(n / 1e6, 0)}M`;
  return `₺${fmtTR(n)}`;
}

function fmtCapUSD(n: number): string {
  if (n >= 1e12) return `$${fmtUS(n / 1e12, 1)}T`;
  if (n >= 1e9) return `$${fmtUS(n / 1e9, 1)}B`;
  if (n >= 1e6) return `$${fmtUS(n / 1e6, 0)}M`;
  return `$${fmtUS(n)}`;
}

function fmtPriceUSD(n: number): string {
  if (n >= 1000) return "$" + fmtUS(n);
  if (n >= 1) return "$" + fmtUS(n, 2);
  if (n >= 0.01) return "$" + n.toFixed(4);
  return "$" + n.toFixed(6);
}

function fmtPriceTRY(n: number): string {
  if (n >= 1000) return "₺" + fmtTR(n, 0);
  return "₺" + fmtTR(n);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BistStock {
  symbol: string;
  name: string;
  sector: string;
  price: string;
  priceRaw: number;
  change: string;
  changeRaw: number;
  volume: string;
  mktCap: string;
  up: boolean;
}

export interface CryptoAsset {
  symbol: string;
  name: string;
  ticker: string;
  price: string;
  priceRaw: number;
  priceTRY: string;
  priceTRYRaw: number;
  change: string;
  change24h: string;
  volume: string;
  mktCap: string;
  up: boolean;
  color: string;
}

export interface MarketStat {
  label: string;
  value: string;
  change: string;
  up: boolean;
  sub: string;
}

export interface SectorData {
  name: string;
  change: string;
  up: boolean;
  stocks: string[];
}

export interface NewsItem {
  title: string;
  summary: string;
  time: string;
  tag: string;
  link: string;
  up: boolean;
}

// ─── Yahoo Finance ────────────────────────────────────────────────────────────

interface YFQuote {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  marketCap?: number;
}

async function fetchYFQuotes(symbols: string[]): Promise<Map<string, YFQuote>> {
  const { data } = await axios.get<{ quoteResponse: { result: YFQuote[] } }>(
    `/api/quotes?symbols=${symbols.join(",")}`
  );
  const result = data?.quoteResponse?.result ?? [];
  return new Map(result.map((q) => [q.symbol, q]));
}

// ─── BIST stock meta (static: symbols + sector mapping) ──────────────────────

const BIST_META = [
  { yf: "THYAO.IS", symbol: "THYAO", name: "Türk Hava Yolları", sector: "Ulaşım" },
  { yf: "GARAN.IS", symbol: "GARAN", name: "Garanti BBVA", sector: "Bankacılık" },
  { yf: "ASELS.IS", symbol: "ASELS", name: "Aselsan", sector: "Savunma" },
  { yf: "EREGL.IS", symbol: "EREGL", name: "Ereğli Demir Çelik", sector: "Metal" },
  { yf: "KCHOL.IS", symbol: "KCHOL", name: "Koç Holding", sector: "Holding" },
  { yf: "SISE.IS", symbol: "SISE", name: "Şişe Cam", sector: "Cam" },
  { yf: "AKBNK.IS", symbol: "AKBNK", name: "Akbank", sector: "Bankacılık" },
  { yf: "TUPRS.IS", symbol: "TUPRS", name: "Tüpraş", sector: "Enerji" },
  { yf: "ISCTR.IS", symbol: "ISCTR", name: "İş Bankası C", sector: "Bankacılık" },
  { yf: "BIMAS.IS", symbol: "BIMAS", name: "BİM Mağazalar", sector: "Perakende" },
  { yf: "SAHOL.IS", symbol: "SAHOL", name: "Sabancı Holding", sector: "Holding" },
  { yf: "PGSUS.IS", symbol: "PGSUS", name: "Pegasus Hava Yolları", sector: "Ulaşım" },
  { yf: "TOASO.IS", symbol: "TOASO", name: "Tofaş Oto Fab.", sector: "Otomotiv" },
  { yf: "FROTO.IS", symbol: "FROTO", name: "Ford Otosan", sector: "Otomotiv" },
  { yf: "ARCLK.IS", symbol: "ARCLK", name: "Arçelik", sector: "Dayanıklı Tüketim" },
  { yf: "TCELL.IS", symbol: "TCELL", name: "Turkcell", sector: "Telekomünikasyon" },
];

export async function fetchBistStocks(): Promise<BistStock[]> {
  const quotes = await fetchYFQuotes(BIST_META.map((m) => m.yf));
  return BIST_META.flatMap(({ yf, symbol, name, sector }) => {
    const q = quotes.get(yf);
    if (!q?.regularMarketPrice) return [];
    const { text: change, up } = fmtChange(q.regularMarketChangePercent ?? 0);
    return [{
      symbol,
      name,
      sector,
      price: fmtTR(q.regularMarketPrice),
      priceRaw: q.regularMarketPrice,
      change,
      changeRaw: q.regularMarketChangePercent ?? 0,
      volume: fmtVol(q.regularMarketVolume ?? 0),
      mktCap: fmtCapTRY(q.marketCap ?? 0),
      up,
    }];
  });
}

// ─── Market stats ─────────────────────────────────────────────────────────────

const STAT_SYMBOLS = ["XU100.IS", "USDTRY=X", "EURTRY=X", "GC=F", "BZ=F"];

export async function fetchMarketStats(): Promise<MarketStat[]> {
  const [quotes, btcRes] = await Promise.all([
    fetchYFQuotes(STAT_SYMBOLS),
    axios.get<{ bitcoin: { usd: number; try: number; usd_24h_change: number } }>(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,try&include_24hr_change=true"
    ),
  ]);

  const xu100 = quotes.get("XU100.IS");
  const usdtry = quotes.get("USDTRY=X");
  const eurtry = quotes.get("EURTRY=X");
  const gold = quotes.get("GC=F"); // USD/troy oz
  const brent = quotes.get("BZ=F"); // USD/barrel
  const btcData = btcRes.data?.bitcoin;

  const usdtryRate = usdtry?.regularMarketPrice ?? 38;
  // Gold per gram in TRY: (USD/troy oz) / 31.1035 * USD/TRY
  const goldTRY = gold?.regularMarketPrice ? (gold.regularMarketPrice / 31.1035) * usdtryRate : null;

  const stats: (MarketStat | null)[] = [
    xu100 ? (() => {
      const { text: change, up } = fmtChange(xu100.regularMarketChangePercent ?? 0);
      return { label: "BIST 100", value: fmtTR(xu100.regularMarketPrice ?? 0), change, up, sub: "Borsa İstanbul" };
    })() : null,
    usdtry ? (() => {
      const { text: change, up } = fmtChange(usdtry.regularMarketChangePercent ?? 0);
      return { label: "USD/TRY", value: fmtTR(usdtryRate), change, up, sub: "Döviz Kuru" };
    })() : null,
    btcData ? (() => {
      const { text: change, up } = fmtChange(btcData.usd_24h_change ?? 0);
      return { label: "BTC/USD", value: "$" + fmtUS(btcData.usd), change, up, sub: "Bitcoin" };
    })() : null,
    goldTRY ? (() => {
      const { text: change, up } = fmtChange(gold?.regularMarketChangePercent ?? 0);
      return { label: "ALTIN", value: "₺" + fmtTR(goldTRY, 0), change, up, sub: "Gram Altın" };
    })() : null,
    brent ? (() => {
      const { text: change, up } = fmtChange(brent.regularMarketChangePercent ?? 0);
      return { label: "BRENT", value: "$" + fmtUS(brent.regularMarketPrice ?? 0, 2), change, up, sub: "Ham Petrol" };
    })() : null,
    eurtry ? (() => {
      const { text: change, up } = fmtChange(eurtry.regularMarketChangePercent ?? 0);
      return { label: "EUR/TRY", value: fmtTR(eurtry.regularMarketPrice ?? 0), change, up, sub: "Euro" };
    })() : null,
  ];

  return stats.filter(Boolean) as MarketStat[];
}

// ─── Crypto ───────────────────────────────────────────────────────────────────

const CRYPTO_META = [
  { id: "bitcoin",       symbol: "BTCUSDT",  name: "Bitcoin",   ticker: "BINANCE:BTCUSDT",  color: "#F7931A" },
  { id: "ethereum",      symbol: "ETHUSDT",  name: "Ethereum",  ticker: "BINANCE:ETHUSDT",  color: "#627EEA" },
  { id: "binancecoin",   symbol: "BNBUSDT",  name: "BNB",       ticker: "BINANCE:BNBUSDT",  color: "#F3BA2F" },
  { id: "solana",        symbol: "SOLUSDT",  name: "Solana",    ticker: "BINANCE:SOLUSDT",  color: "#9945FF" },
  { id: "ripple",        symbol: "XRPUSDT",  name: "XRP",       ticker: "BINANCE:XRPUSDT",  color: "#346AA9" },
  { id: "cardano",       symbol: "ADAUSDT",  name: "Cardano",   ticker: "BINANCE:ADAUSDT",  color: "#0033AD" },
  { id: "dogecoin",      symbol: "DOGEUSDT", name: "Dogecoin",  ticker: "BINANCE:DOGEUSDT", color: "#C2A633" },
  { id: "avalanche-2",   symbol: "AVAXUSDT", name: "Avalanche", ticker: "BINANCE:AVAXUSDT", color: "#E84142" },
  { id: "polkadot",      symbol: "DOTUSDT",  name: "Polkadot",  ticker: "BINANCE:DOTUSDT",  color: "#E6007A" },
  { id: "matic-network", symbol: "MATICUSDT",name: "Polygon",   ticker: "BINANCE:MATICUSDT",color: "#8247E5" },
  { id: "chainlink",     symbol: "LINKUSDT", name: "Chainlink", ticker: "BINANCE:LINKUSDT", color: "#2A5ADA" },
  { id: "litecoin",      symbol: "LTCUSDT",  name: "Litecoin",  ticker: "BINANCE:LTCUSDT",  color: "#BFBBBB" },
];

interface CGCoin {
  id: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

export async function fetchCryptoAssets(): Promise<CryptoAsset[]> {
  const ids = CRYPTO_META.map((c) => c.id).join(",");
  const [usdRes, tryRes] = await Promise.all([
    axios.get<CGCoin[]>("https://api.coingecko.com/api/v3/coins/markets", {
      params: { vs_currency: "usd", ids, order: "market_cap_desc", per_page: 12, sparkline: false },
    }),
    axios.get<CGCoin[]>("https://api.coingecko.com/api/v3/coins/markets", {
      params: { vs_currency: "try", ids, order: "market_cap_desc", per_page: 12, sparkline: false },
    }),
  ]);

  const usdMap = new Map(usdRes.data.map((c) => [c.id, c]));
  const tryMap = new Map(tryRes.data.map((c) => [c.id, c]));

  return CRYPTO_META.flatMap(({ id, symbol, name, ticker, color }) => {
    const usd = usdMap.get(id);
    const tryData = tryMap.get(id);
    if (!usd) return [];
    const changePct = usd.price_change_percentage_24h ?? 0;
    const { text: change, up } = fmtChange(changePct);
    const priceTRYRaw = tryData?.current_price ?? 0;
    return [{
      symbol,
      name,
      ticker,
      price: fmtPriceUSD(usd.current_price),
      priceRaw: usd.current_price,
      priceTRY: fmtPriceTRY(priceTRYRaw),
      priceTRYRaw,
      change,
      change24h: change,
      volume: fmtCapUSD(usd.total_volume),
      mktCap: fmtCapUSD(usd.market_cap),
      up,
      color,
    }];
  });
}

// ─── Sector data (computed from BIST sector stocks) ───────────────────────────

const SECTOR_META: { name: string; stocks: { yf: string; sym: string }[] }[] = [
  { name: "Bankacılık", stocks: [{ yf: "GARAN.IS", sym: "GARAN" }, { yf: "AKBNK.IS", sym: "AKBNK" }, { yf: "ISCTR.IS", sym: "ISCTR" }, { yf: "YKBNK.IS", sym: "YKBNK" }] },
  { name: "Holding",    stocks: [{ yf: "KCHOL.IS", sym: "KCHOL" }, { yf: "SAHOL.IS", sym: "SAHOL" }, { yf: "DOHOL.IS", sym: "DOHOL" }] },
  { name: "Savunma",    stocks: [{ yf: "ASELS.IS", sym: "ASELS" }] },
  { name: "Enerji",     stocks: [{ yf: "TUPRS.IS", sym: "TUPRS" }, { yf: "AYGAZ.IS", sym: "AYGAZ" }, { yf: "AKSEN.IS", sym: "AKSEN" }] },
  { name: "Otomotiv",   stocks: [{ yf: "TOASO.IS", sym: "TOASO" }, { yf: "FROTO.IS", sym: "FROTO" }, { yf: "DOAS.IS",  sym: "DOAS"  }] },
  { name: "Ulaşım",     stocks: [{ yf: "THYAO.IS", sym: "THYAO" }, { yf: "PGSUS.IS", sym: "PGSUS" }, { yf: "CLEBI.IS", sym: "CLEBI" }] },
  { name: "Metal",      stocks: [{ yf: "EREGL.IS", sym: "EREGL" }, { yf: "KRDMD.IS", sym: "KRDMD" }, { yf: "ALKIM.IS", sym: "ALKIM" }] },
  { name: "Perakende",  stocks: [{ yf: "BIMAS.IS", sym: "BIMAS" }, { yf: "MGROS.IS", sym: "MGROS" }, { yf: "SOKM.IS",  sym: "SOKM"  }] },
];

export async function fetchSectorData(): Promise<SectorData[]> {
  const allSymbols = [...new Set(SECTOR_META.flatMap((s) => s.stocks.map((st) => st.yf)))];
  const quotes = await fetchYFQuotes(allSymbols);

  return SECTOR_META.map(({ name, stocks }) => {
    const changes: number[] = [];
    const symbols: string[] = [];
    stocks.forEach(({ yf, sym }) => {
      const q = quotes.get(yf);
      if (q?.regularMarketChangePercent != null) {
        changes.push(q.regularMarketChangePercent);
        symbols.push(sym);
      }
    });
    const avgChange = changes.length > 0 ? changes.reduce((a, b) => a + b, 0) / changes.length : 0;
    const { text: change, up } = fmtChange(avgChange);
    return { name, change, up, stocks: symbols };
  });
}

// ─── News (Google News RSS via rss2json.com) ──────────────────────────────────

const NEWS_RSS = encodeURIComponent(
  "https://news.google.com/rss/search?q=borsa+istanbul+BIST+hisse+piyasa&hl=tr&gl=TR&ceid=TR:tr"
);
const RSS2JSON_URL = `https://api.rss2json.com/v1/api.json?rss_url=${NEWS_RSS}&count=6`;

function detectTag(title: string): string {
  const t = title.toLowerCase();
  if (/bitcoin|kripto|btc|ethereum|eth/.test(t)) return "Kripto";
  if (/dolar|döviz|euro|kur|usd|eur/.test(t)) return "Döviz";
  if (/altın|petrol|emtia|gold/.test(t)) return "Emtia";
  if (/fed|faiz|merkez bankası|tcmb|enflasyon/.test(t)) return "Küresel";
  if (/bist|borsa|hisse|endeks/.test(t)) return "BIST";
  return "Piyasa";
}

function detectSentiment(title: string): boolean {
  const t = title.toLowerCase();
  if (/yüksel|artış|rekor|kazandı|güçlendi|ilerledi|toparlandı|pozitif|iyimser/.test(t)) return true;
  if (/düşüş|geriledi|düştü|kayıp|zayıfladı|negatif|sattı|çöktü/.test(t)) return false;
  return true; // neutral → positive default
}

function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const h = Math.floor(diffMs / 3_600_000);
  if (h < 1) return "Az önce";
  if (h < 24) return `${h} saat önce`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} gün önce`;
  return `${Math.floor(d / 7)} hafta önce`;
}

interface RSS2JsonItem {
  title: string;
  description: string;
  pubDate: string;
  link: string;
}

export async function fetchMarketNews(): Promise<NewsItem[]> {
  const { data } = await axios.get<{ status: string; items: RSS2JsonItem[] }>(RSS2JSON_URL);
  if (data.status !== "ok") throw new Error("RSS fetch failed");
  return data.items.map((item) => ({
    title: item.title,
    summary: item.description.replace(/<[^>]+>/g, "").trim().slice(0, 200),
    time: relativeTime(item.pubDate),
    tag: detectTag(item.title),
    link: item.link,
    up: detectSentiment(item.title),
  }));
}

// ─── Fallback data (shown while loading or on API failure) ───────────────────

export const FALLBACK_BIST_STOCKS: BistStock[] = [
  { symbol: "THYAO", name: "Türk Hava Yolları",  sector: "Ulaşım",         price: "312,50",   priceRaw: 312.5,  change: "+2,15%", changeRaw: 2.15, volume: "145M", mktCap: "₺42,3B", up: true },
  { symbol: "GARAN", name: "Garanti BBVA",        sector: "Bankacılık",    price: "178,90",   priceRaw: 178.9,  change: "-0,83%", changeRaw: -0.83, volume: "98M", mktCap: "₺75,1B", up: false },
  { symbol: "ASELS", name: "Aselsan",             sector: "Savunma",       price: "89,45",    priceRaw: 89.45,  change: "+3,20%", changeRaw: 3.20, volume: "67M", mktCap: "₺28,6B", up: true },
  { symbol: "EREGL", name: "Ereğli Demir Çelik",  sector: "Metal",         price: "56,70",    priceRaw: 56.70,  change: "-1,45%", changeRaw: -1.45, volume: "112M", mktCap: "₺34,0B", up: false },
  { symbol: "KCHOL", name: "Koç Holding",         sector: "Holding",       price: "234,60",   priceRaw: 234.6,  change: "+1,89%", changeRaw: 1.89, volume: "45M", mktCap: "₺94,5B", up: true },
  { symbol: "SISE",  name: "Şişe Cam",            sector: "Cam",           price: "43,20",    priceRaw: 43.2,   change: "+0,47%", changeRaw: 0.47, volume: "89M", mktCap: "₺25,9B", up: true },
  { symbol: "AKBNK", name: "Akbank",              sector: "Bankacılık",    price: "89,30",    priceRaw: 89.3,   change: "-0,22%", changeRaw: -0.22, volume: "76M", mktCap: "₺37,5B", up: false },
  { symbol: "TUPRS", name: "Tüpraş",              sector: "Enerji",        price: "198,30",   priceRaw: 198.3,  change: "-2,10%", changeRaw: -2.10, volume: "34M", mktCap: "₺49,6B", up: false },
  { symbol: "ISCTR", name: "İş Bankası C",        sector: "Bankacılık",    price: "24,56",    priceRaw: 24.56,  change: "+1,12%", changeRaw: 1.12, volume: "234M", mktCap: "₺43,8B", up: true },
  { symbol: "BIMAS", name: "BİM Mağazalar",       sector: "Perakende",     price: "567,00",   priceRaw: 567.0,  change: "+0,89%", changeRaw: 0.89, volume: "23M", mktCap: "₺56,7B", up: true },
  { symbol: "SAHOL", name: "Sabancı Holding",     sector: "Holding",       price: "89,75",    priceRaw: 89.75,  change: "+1,34%", changeRaw: 1.34, volume: "56M", mktCap: "₺35,9B", up: true },
  { symbol: "PGSUS", name: "Pegasus Hava Yolları",sector: "Ulaşım",        price: "1.234,00", priceRaw: 1234.0, change: "-0,56%", changeRaw: -0.56, volume: "12M", mktCap: "₺24,7B", up: false },
  { symbol: "TOASO", name: "Tofaş Oto Fab.",      sector: "Otomotiv",      price: "345,50",   priceRaw: 345.5,  change: "+2,67%", changeRaw: 2.67, volume: "28M", mktCap: "₺34,6B", up: true },
  { symbol: "FROTO", name: "Ford Otosan",         sector: "Otomotiv",      price: "1.456,00", priceRaw: 1456.0, change: "-1,23%", changeRaw: -1.23, volume: "8M", mktCap: "₺58,2B", up: false },
  { symbol: "ARCLK", name: "Arçelik",             sector: "Dayanıklı Tüketim", price: "178,40", priceRaw: 178.4, change: "+0,79%", changeRaw: 0.79, volume: "43M", mktCap: "₺35,7B", up: true },
  { symbol: "TCELL", name: "Turkcell",            sector: "Telekomünikasyon", price: "89,60", priceRaw: 89.6,  change: "+1,56%", changeRaw: 1.56, volume: "67M", mktCap: "₺44,8B", up: true },
];

export const FALLBACK_CRYPTO_LIST: CryptoAsset[] = [
  { symbol: "BTCUSDT",  name: "Bitcoin",   ticker: "BINANCE:BTCUSDT",  price: "$87,450",  priceRaw: 87450,  priceTRY: "₺3.421.500", priceTRYRaw: 3421500, change: "+2,87%", change24h: "+2,87%", volume: "$28,4B", mktCap: "$1,72T", up: true,  color: "#F7931A" },
  { symbol: "ETHUSDT",  name: "Ethereum",  ticker: "BINANCE:ETHUSDT",  price: "$3,245",   priceRaw: 3245,   priceTRY: "₺124.700",   priceTRYRaw: 124700,  change: "+1,53%", change24h: "+1,53%", volume: "$14,2B", mktCap: "$389B",  up: true,  color: "#627EEA" },
  { symbol: "BNBUSDT",  name: "BNB",       ticker: "BINANCE:BNBUSDT",  price: "$412",     priceRaw: 412,    priceTRY: "₺15.820",    priceTRYRaw: 15820,   change: "+0,89%", change24h: "+0,89%", volume: "$1,8B",  mktCap: "$61B",   up: true,  color: "#F3BA2F" },
  { symbol: "SOLUSDT",  name: "Solana",    ticker: "BINANCE:SOLUSDT",  price: "$178",     priceRaw: 178,    priceTRY: "₺6.835",     priceTRYRaw: 6835,    change: "-1,23%", change24h: "-1,23%", volume: "$3,1B",  mktCap: "$82B",   up: false, color: "#9945FF" },
  { symbol: "XRPUSDT",  name: "XRP",       ticker: "BINANCE:XRPUSDT",  price: "$0.6200",  priceRaw: 0.62,   priceTRY: "₺23,80",     priceTRYRaw: 23.8,    change: "+3,45%", change24h: "+3,45%", volume: "$2,4B",  mktCap: "$34B",   up: true,  color: "#346AA9" },
  { symbol: "ADAUSDT",  name: "Cardano",   ticker: "BINANCE:ADAUSDT",  price: "$0.4800",  priceRaw: 0.48,   priceTRY: "₺18,43",     priceTRYRaw: 18.43,   change: "-0,67%", change24h: "-0,67%", volume: "$0,8B",  mktCap: "$17B",   up: false, color: "#0033AD" },
  { symbol: "DOGEUSDT", name: "Dogecoin",  ticker: "BINANCE:DOGEUSDT", price: "$0.1800",  priceRaw: 0.18,   priceTRY: "₺6,91",      priceTRYRaw: 6.91,    change: "+4,56%", change24h: "+4,56%", volume: "$1,9B",  mktCap: "$25B",   up: true,  color: "#C2A633" },
  { symbol: "AVAXUSDT", name: "Avalanche", ticker: "BINANCE:AVAXUSDT", price: "$38.50",   priceRaw: 38.5,   priceTRY: "₺1.478",     priceTRYRaw: 1478,    change: "-2,34%", change24h: "-2,34%", volume: "$0,6B",  mktCap: "$16B",   up: false, color: "#E84142" },
  { symbol: "DOTUSDT",  name: "Polkadot",  ticker: "BINANCE:DOTUSDT",  price: "$7.82",    priceRaw: 7.82,   priceTRY: "₺300",       priceTRYRaw: 300,     change: "+1,12%", change24h: "+1,12%", volume: "$0,4B",  mktCap: "$11B",   up: true,  color: "#E6007A" },
  { symbol: "MATICUSDT",name: "Polygon",   ticker: "BINANCE:MATICUSDT",price: "$0.8900",  priceRaw: 0.89,   priceTRY: "₺34,17",     priceTRYRaw: 34.17,   change: "-0,45%", change24h: "-0,45%", volume: "$0,5B",  mktCap: "$8B",    up: false, color: "#8247E5" },
  { symbol: "LINKUSDT", name: "Chainlink", ticker: "BINANCE:LINKUSDT", price: "$14.20",   priceRaw: 14.2,   priceTRY: "₺545",       priceTRYRaw: 545,     change: "+2,78%", change24h: "+2,78%", volume: "$0,7B",  mktCap: "$9B",    up: true,  color: "#2A5ADA" },
  { symbol: "LTCUSDT",  name: "Litecoin",  ticker: "BINANCE:LTCUSDT",  price: "$89.40",   priceRaw: 89.4,   priceTRY: "₺3.432",     priceTRYRaw: 3432,    change: "+0,34%", change24h: "+0,34%", volume: "$0,5B",  mktCap: "$7B",    up: true,  color: "#BFBBBB" },
];

export const FALLBACK_MARKET_STATS: MarketStat[] = [
  { label: "BIST 100", value: "9.847,23", change: "+1,24%", up: true,  sub: "Borsa İstanbul" },
  { label: "USD/TRY",  value: "38,42",    change: "+0,12%", up: true,  sub: "Döviz Kuru" },
  { label: "BTC/USD",  value: "$87,450",  change: "+2,87%", up: true,  sub: "Bitcoin" },
  { label: "ALTIN",    value: "₺4.125",   change: "+0,65%", up: true,  sub: "Gram Altın" },
  { label: "BRENT",    value: "$78.45",   change: "-0,34%", up: false, sub: "Ham Petrol" },
  { label: "EUR/TRY",  value: "41,85",    change: "-0,08%", up: false, sub: "Euro" },
];

export const FALLBACK_SECTOR_DATA: SectorData[] = [
  { name: "Bankacılık", change: "+1,45%", up: true,  stocks: ["GARAN", "AKBNK", "ISCTR", "YKBNK"] },
  { name: "Holding",    change: "+2,12%", up: true,  stocks: ["KCHOL", "SAHOL", "DOHOL"] },
  { name: "Savunma",    change: "+3,67%", up: true,  stocks: ["ASELS"] },
  { name: "Enerji",     change: "-0,89%", up: false, stocks: ["TUPRS", "AYGAZ", "AKSEN"] },
  { name: "Otomotiv",   change: "+1,23%", up: true,  stocks: ["TOASO", "FROTO", "DOAS"] },
  { name: "Ulaşım",     change: "+2,45%", up: true,  stocks: ["THYAO", "PGSUS", "CLEBI"] },
  { name: "Metal",      change: "-1,34%", up: false, stocks: ["EREGL", "KRDMD", "ALKIM"] },
  { name: "Perakende",  change: "+0,78%", up: true,  stocks: ["BIMAS", "MGROS", "SOKM"] },
];

export const FALLBACK_NEWS: NewsItem[] = [
  { title: "BIST 100 güne yükselişle başladı", summary: "Borsa İstanbul'da BIST 100 endeksi açılışta yüzde 1'in üzerinde değer kazandı.", time: "1 saat önce", tag: "BIST", link: "#", up: true },
  { title: "Dolar/TL piyasalarda yatay seyrediyor", summary: "Türk lirası dolar karşısında sınırlı hareketler sergiliyor.", time: "2 saat önce", tag: "Döviz", link: "#", up: false },
  { title: "Bitcoin 90.000 dolar sınırını test ediyor", summary: "Kripto para piyasasının lideri Bitcoin yükselişini sürdürüyor.", time: "3 saat önce", tag: "Kripto", link: "#", up: true },
];
