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

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) return null;
    return json.result as T;
  } catch {
    return null;
  }
}

export const fetchCurrency = () => apiFetch<CurrencyItem[]>("/api/currency");
export const fetchGold = () => apiFetch<GoldItem[]>("/api/gold");
export const fetchStocks = () => apiFetch<StockItem[]>("/api/stocks");
export const fetchBist = () => apiFetch<BistIndex>("/api/bist");
