"use client";

import { useState, useEffect } from "react";
import type {
  CurrencyItem, GoldItem, StockItem, BistIndex, BinanceTicker, TcmbRate,
} from "@/types/market";
import { fetchBinanceTickers } from "@/lib/binanceApi";
import { fetchTcmbRates } from "@/lib/tcmbApi";

const REFRESH_INTERVAL = 60_000;

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path, { signal: AbortSignal.timeout(7_000) });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;
    return json.result as T;
  } catch {
    return null;
  }
}

// Altın: CDN fallback
async function fetchGoldFromCdn(): Promise<GoldItem[] | null> {
  try {
    const res = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xau.json",
      { signal: AbortSignal.timeout(7_000) }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const xauTry: number = json?.xau?.try;
    if (!xauTry) return null;
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

export const fetchCurrency = () => apiFetch<CurrencyItem[]>("/api/currency");
export const fetchGold = async (): Promise<GoldItem[] | null> => {
  const fromServer = await apiFetch<GoldItem[]>("/api/gold");
  if (fromServer) return fromServer;
  return fetchGoldFromCdn();
};
export const fetchStocks = () => apiFetch<StockItem[]>("/api/stocks");
export const fetchBist = () => apiFetch<BistIndex>("/api/bist");

function usePolling<T>(fetcher: () => Promise<T | null>, interval = REFRESH_INTERVAL) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const failsafe = setTimeout(() => { if (mounted) setLoading(false); }, 10_000);
      try {
        const result = await fetcher();
        if (mounted) { setData(result); setLoading(false); }
      } finally {
        clearTimeout(failsafe);
      }
    };
    load();
    const timer = setInterval(load, interval);
    return () => { mounted = false; clearInterval(timer); };
  }, []);

  return { data, loading };
}

export function useCurrency() { return usePolling<CurrencyItem[]>(fetchCurrency); }
export function useGold() { return usePolling<GoldItem[]>(fetchGold); }
export function useStocks() { return usePolling<StockItem[]>(fetchStocks); }
export function useBist() { return usePolling<BistIndex>(fetchBist); }
export function useBinanceTickers() { return usePolling<BinanceTicker[]>(fetchBinanceTickers, 30_000); }
export function useTcmbRates() { return usePolling<TcmbRate[]>(fetchTcmbRates, 3_600_000); }
