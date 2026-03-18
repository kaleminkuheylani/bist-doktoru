/**
 * BIST Doktoru - Collect API React Hooks
 * API'den veri çeker; hata durumunda fallback verisi kullanır.
 * Periyodik otomatik yenileme desteklenir.
 */
import { useState, useEffect, useCallback } from "react";
import {
  fetchBistStocks,
  fetchCryptoAssets,
  fetchMarketStats,
  fetchSectorData,
  fetchMarketNews,
  FALLBACK_BIST_STOCKS,
  FALLBACK_CRYPTO_LIST,
  FALLBACK_MARKET_STATS,
  FALLBACK_SECTOR_DATA,
  FALLBACK_NEWS,
  type BistStock,
  type CryptoAsset,
  type MarketStat,
  type SectorData,
  type NewsItem,
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
      if (Array.isArray(result) && result.length === 0) throw new Error("Boş yanıt");
      setData(result);
      setIsLive(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Veri alınamadı");
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    load();
    const id = setInterval(load, refetchIntervalMs);
    return () => clearInterval(id);
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

export function useSectorData(): ApiState<SectorData[]> {
  return useApiData(fetchSectorData, FALLBACK_SECTOR_DATA, 120_000);
}

export function useMarketNews(): ApiState<NewsItem[]> {
  return useApiData(fetchMarketNews, FALLBACK_NEWS, 300_000);
}
