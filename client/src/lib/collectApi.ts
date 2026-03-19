// CollectAPI veri tipleri
export type CurrencyItem = {
  name: string;
  buying: string;
  selling: string;
  change?: string;
};

export type GoldItem = {
  name: string;
  buy: string;
  sell: string;
  change?: string;
};

export type StockItem = {
  code: string;
  text: string;
  lastprice: number;
  lastpricestr: string;
  rate: number;
  hacim: number;
  hacimstr: string;
};

export type BistIndex = {
  current: number;
  currentstr: string;
  changerate: number;
  changeratestr: string;
  min: number;
  minstr: string;
  max: number;
  maxstr: string;
};

function fetchWithTimeout(url: string, ms = 7000): Promise<Response> {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), ms);
  return fetch(url, { signal: ac.signal }).finally(() => clearTimeout(id));
}

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetchWithTimeout(path, 5000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) return null;
    return json.result as T;
  } catch {
    return null;
  }
}

// Ücretsiz CDN fallback: fawazahmed0 currency-api XAU/TRY
// CollectAPI key yoksa veya sunucu erişimi yoksa devreye girer
async function fetchGoldFromCdn(): Promise<GoldItem[] | null> {
  try {
    const res = await fetchWithTimeout(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xau.json",
      7000
    );
    if (!res.ok) return null;
    const json = await res.json();
    const xauTry: number = json?.xau?.try;
    if (!xauTry) return null;

    // 1 troy ons = 31.1035 gram
    const gramTry = xauTry / 31.1035;
    const fmt = (n: number) => n.toFixed(2);
    const buy = (n: number) => fmt(n * 0.995);
    const sell = (n: number) => fmt(n * 1.005);

    return [
      { name: "Gram Altın",        buy: buy(gramTry),         sell: sell(gramTry) },
      { name: "Çeyrek Altın",      buy: buy(gramTry * 1.75),  sell: sell(gramTry * 1.75) },
      { name: "Yarım Altın",       buy: buy(gramTry * 3.5),   sell: sell(gramTry * 3.5) },
      { name: "Tam Altın",         buy: buy(gramTry * 7.0),   sell: sell(gramTry * 7.0) },
      { name: "Cumhuriyet Altını", buy: buy(gramTry * 7.2),   sell: sell(gramTry * 7.2) },
      { name: "Ons Altın (USD)",   buy: buy(xauTry),          sell: sell(xauTry) },
    ];
  } catch {
    return null;
  }
}

// Yahoo Finance'den BIST hisse verisi (tarayıcı fallback)
const BIST_YF_SYMBOLS = [
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

async function fetchStocksFromYahoo(): Promise<StockItem[] | null> {
  try {
    const syms = BIST_YF_SYMBOLS.map((s) => `${s}.IS`).join(",");
    const target = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${syms}&lang=tr&region=TR`;
    const res = await fetchWithTimeout(`https://corsproxy.io/?${encodeURIComponent(target)}`, 7000);
    if (!res.ok) return null;
    const json = await res.json();
    const quotes: any[] = json?.quoteResponse?.result ?? [];
    if (quotes.length === 0) return null;
    return quotes.map((q) => ({
      code: String(q.symbol).replace(".IS", ""),
      text: q.longName || q.shortName || q.symbol,
      lastprice: q.regularMarketPrice ?? 0,
      lastpricestr: (q.regularMarketPrice ?? 0).toFixed(2),
      rate: q.regularMarketChangePercent ?? 0,
      hacim: q.regularMarketVolume ?? 0,
      hacimstr: fmtHacim(q.regularMarketVolume ?? 0),
    }));
  } catch {
    return null;
  }
}

async function fetchBistFromYahoo(): Promise<BistIndex | null> {
  try {
    const target = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=XU100.IS&lang=tr&region=TR`;
    const res = await fetchWithTimeout(`https://corsproxy.io/?${encodeURIComponent(target)}`, 7000);
    if (!res.ok) return null;
    const json = await res.json();
    const q = json?.quoteResponse?.result?.[0];
    if (!q) return null;
    const current = q.regularMarketPrice ?? 0;
    const changerate = q.regularMarketChangePercent ?? 0;
    return {
      current,
      currentstr: current.toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
      changerate,
      changeratestr: Math.abs(changerate).toFixed(2),
      min: q.regularMarketDayLow ?? 0,
      minstr: (q.regularMarketDayLow ?? 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
      max: q.regularMarketDayHigh ?? 0,
      maxstr: (q.regularMarketDayHigh ?? 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
    };
  } catch {
    return null;
  }
}

export const fetchCurrency = () => apiFetch<CurrencyItem[]>("/api/currency");

// Önce sunucu (CollectAPI), başarısız olursa ücretsiz CDN
export const fetchGold = async (): Promise<GoldItem[] | null> => {
  const fromServer = await apiFetch<GoldItem[]>("/api/gold");
  if (fromServer) return fromServer;
  return fetchGoldFromCdn();
};

// Önce sunucu (CollectAPI → Yahoo Finance), başarısız olursa tarayıcıdan Yahoo Finance
export const fetchStocks = async (): Promise<StockItem[] | null> => {
  const fromServer = await apiFetch<StockItem[]>("/api/stocks");
  if (fromServer) return fromServer;
  return fetchStocksFromYahoo();
};

// Önce sunucu, başarısız olursa tarayıcıdan Yahoo Finance
export const fetchBist = async (): Promise<BistIndex | null> => {
  const fromServer = await apiFetch<BistIndex>("/api/bist");
  if (fromServer) return fromServer;
  return fetchBistFromYahoo();
};
