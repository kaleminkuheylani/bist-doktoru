import { useState, useEffect } from "react";
import {
  fetchCurrency,
  fetchGold,
  fetchStocks,
  fetchBist,
  type CurrencyItem,
  type GoldItem,
  type StockItem,
  type BistIndex,
} from "@/lib/collectApi";

const REFRESH_INTERVAL = 60_000; // 1 dakika

function usePolling<T>(fetcher: () => Promise<T | null>, interval = REFRESH_INTERVAL) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const result = await fetcher();
      if (mounted) {
        setData(result);
        setLoading(false);
      }
    };

    load();
    const timer = setInterval(load, interval);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return { data, loading };
}

export function useCurrency() {
  return usePolling<CurrencyItem[]>(fetchCurrency);
}

export function useGold() {
  return usePolling<GoldItem[]>(fetchGold);
}

export function useStocks() {
  return usePolling<StockItem[]>(fetchStocks);
}

export function useBist() {
  return usePolling<BistIndex>(fetchBist);
}
