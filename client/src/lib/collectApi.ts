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

// ─── Twelve Data — tarayıcıdan direkt çağrı ───────────────────────────────
const TD_KEY = (import.meta.env.VITE_TWELVE_DATA_KEY as string | undefined) || "a9ee562223e34aa59be0ae4075b10085";
const TD_BASE = "https://api.twelvedata.com";

// Sembol listesini n'li gruplara böler
function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// Tek batch için Twelve Data /quote isteği
async function fetchBatch(symbols: string[]): Promise<StockItem[]> {
  const url = `${TD_BASE}/quote?symbol=${symbols.join(",")}&exchange=BIST&apikey=${TD_KEY}`;
  const res = await fetchWithTimeout(url, 12_000);
  if (!res.ok) return [];
  const json = await res.json();

  // Top-level hata (rate limit, geçersiz key vb.)
  if (json.code || json.status === "error") {
    console.warn("[TwelveData] batch error:", json.message ?? json.code);
    return [];
  }

  // Tek sembol için yanıt direkt obje olarak gelir
  const data: Record<string, any> = symbols.length === 1 ? { [symbols[0]]: json } : json;

  return symbols
    .filter((sym) => data[sym] && !data[sym].code)
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
}

async function fetchStocksFromTwelveData(): Promise<StockItem[] | null> {
  if (!TD_KEY) return null;
  try {
    // Ücretsiz plan: 8 kredi/dk — her batch = 1 istek (1 kredi)
    // 40 sembol → 5 batch × 8 sembol, aralarında 200ms bekleme
    const batches = chunk(BIST_SYMBOLS, 8);
    const results: StockItem[] = [];
    for (let i = 0; i < batches.length; i++) {
      if (i > 0) await new Promise((r) => setTimeout(r, 200));
      const items = await fetchBatch(batches[i]);
      results.push(...items);
    }
    return results.length > 0 ? results : null;
  } catch (e) {
    console.error("[TwelveData] fetchStocks error:", e);
    return null;
  }
}

async function fetchBistFromTwelveData(): Promise<BistIndex | null> {
  if (!TD_KEY) return null;
  try {
    const url = `${TD_BASE}/quote?symbol=XU100&exchange=BIST&apikey=${TD_KEY}`;
    const res = await fetchWithTimeout(url, 8_000);
    if (!res.ok) return null;
    const q = await res.json();
    if (q.code) return null; // hata objesi
    const current    = parseFloat(q.close) || 0;
    const changerate = parseFloat(q.percent_change) || 0;
    return {
      current,
      currentstr:    current.toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
      changerate,
      changeratestr: Math.abs(changerate).toFixed(2),
      min:    parseFloat(q.low)  || 0,
      minstr: (parseFloat(q.low) || 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
      max:    parseFloat(q.high) || 0,
      maxstr: (parseFloat(q.high) || 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 }),
    };
  } catch {
    return null;
  }
}

export const fetchCurrency = () => apiFetch<CurrencyItem[]>("/api/currency");

export const fetchGold = async (): Promise<GoldItem[] | null> => {
  const fromServer = await apiFetch<GoldItem[]>("/api/gold");
  if (fromServer) return fromServer;
  return fetchGoldFromCdn();
};

// Öncelik: sunucu → Twelve Data (tarayıcı) → Yahoo Finance
export const fetchStocks = async (): Promise<StockItem[] | null> => {
  const fromServer = await apiFetch<StockItem[]>("/api/stocks");
  if (fromServer) return fromServer;
  return fetchStocksFromTwelveData();
};

export const fetchBist = async (): Promise<BistIndex | null> => {
  const fromServer = await apiFetch<BistIndex>("/api/bist");
  if (fromServer) return fromServer;
  return fetchBistFromTwelveData();
};
