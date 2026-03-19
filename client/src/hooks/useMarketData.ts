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
import { fetchBinanceTickers, type BinanceTicker } from "@/lib/binanceApi";
import { fetchTcmbRates, type TcmbRate } from "@/lib/tcmbApi";

const REFRESH_INTERVAL = 60_000; // 1 dakika

function usePolling<T>(fetcher: () => Promise<T | null>, interval = REFRESH_INTERVAL) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      // Failsafe: ağ erişimi yoksa max 10 sn bekle, sonra loading kapat
      const failsafe = setTimeout(() => { if (mounted) setLoading(false); }, 10_000);
      try {
        const result = await fetcher();
        if (mounted) {
          setData(result);
          setLoading(false);
        }
      } finally {
        clearTimeout(failsafe);
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

export function useBinanceTickers() {
  return usePolling<BinanceTicker[]>(fetchBinanceTickers, 30_000); // 30 saniye
}

export function useTcmbRates() {
  return usePolling<TcmbRate[]>(fetchTcmbRates, 3_600_000); // 1 saat
}
