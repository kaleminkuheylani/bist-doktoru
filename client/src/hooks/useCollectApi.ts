/**
 * BIST Doktoru - Collect API React Hooks
 * Collect API'den veri çeker; hata durumunda fallback verisi kullanır.
 */
import { useState, useEffect, useCallback } from "react";
import {
  fetchBistStocks,
  fetchCryptoAssets,
  fetchMarketStats,
  FALLBACK_BIST_STOCKS,
  FALLBACK_CRYPTO_LIST,
  FALLBACK_MARKET_STATS,
  type BistStock,
  type CryptoAsset,
  type MarketStat,
} from "@/lib/collectApi";

interface ApiState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  isLive: boolean;
  refetch: () => void;
}

function useApiData<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  refetchIntervalMs = 60_000,
): ApiState<T> {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetcher();
      setData(result);
      setIsLive(true);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Veri alınamadı";
      setError(message);
      setIsLive(false);
      // fallback verisi zaten state'te; değiştirmiyoruz
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    load();
    const interval = setInterval(load, refetchIntervalMs);
    return () => clearInterval(interval);
  }, [load, refetchIntervalMs]);

  return { data, loading, error, isLive, refetch: load };
}

export function useBistStocks(): ApiState<BistStock[]> {
  return useApiData(fetchBistStocks, FALLBACK_BIST_STOCKS, 60_000);
}

export function useCryptoAssets(): ApiState<CryptoAsset[]> {
  return useApiData(fetchCryptoAssets, FALLBACK_CRYPTO_LIST, 30_000);
}

export function useMarketStats(): ApiState<MarketStat[]> {
  return useApiData(fetchMarketStats, FALLBACK_MARKET_STATS, 60_000);
}
