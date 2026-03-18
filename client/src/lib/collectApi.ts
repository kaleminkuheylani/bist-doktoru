/**
 * BIST Doktoru - Collect API Service
 * Forge butterfly-effect.dev /v1/collect endpoint'i üzerinden
 * BIST, kripto ve piyasa verisi çeker.
 */
import axios from "axios";

const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";

const COLLECT_BASE_URL = `${FORGE_BASE_URL}/v1/collect`;

const client = axios.create({
  baseURL: COLLECT_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    ...(import.meta.env.VITE_FRONTEND_FORGE_API_KEY
      ? { "X-Api-Key": import.meta.env.VITE_FRONTEND_FORGE_API_KEY }
      : {}),
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BistStock {
  symbol: string;
  name: string;
  sector: string;
  price: string;
  change: string;
  volume: string;
  mktCap: string;
  up: boolean;
}

export interface CryptoAsset {
  symbol: string;
  name: string;
  ticker: string;
  price: string;
  priceTRY: string;
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

export interface CollectApiResponse<T> {
  data: T;
  timestamp: string;
  source: string;
}

// ─── Fallback (hardcoded) data ────────────────────────────────────────────────

export const FALLBACK_BIST_STOCKS: BistStock[] = [
  { symbol: "THYAO", name: "Türk Hava Yolları", sector: "Ulaşım", price: "312,50", change: "+2,15%", volume: "145M", mktCap: "₺42,3B", up: true },
  { symbol: "GARAN", name: "Garanti BBVA", sector: "Bankacılık", price: "178,90", change: "-0,83%", volume: "98M", mktCap: "₺75,1B", up: false },
  { symbol: "ASELS", name: "Aselsan", sector: "Savunma", price: "89,45", change: "+3,20%", volume: "67M", mktCap: "₺28,6B", up: true },
  { symbol: "EREGL", name: "Ereğli Demir Çelik", sector: "Metal", price: "56,70", change: "-1,45%", volume: "112M", mktCap: "₺34,0B", up: false },
  { symbol: "KCHOL", name: "Koç Holding", sector: "Holding", price: "234,60", change: "+1,89%", volume: "45M", mktCap: "₺94,5B", up: true },
  { symbol: "SISE", name: "Şişe Cam", sector: "Cam", price: "43,20", change: "+0,47%", volume: "89M", mktCap: "₺25,9B", up: true },
  { symbol: "AKBNK", name: "Akbank", sector: "Bankacılık", price: "89,30", change: "-0,22%", volume: "76M", mktCap: "₺37,5B", up: false },
  { symbol: "TUPRS", name: "Tüpraş", sector: "Enerji", price: "198,30", change: "-2,10%", volume: "34M", mktCap: "₺49,6B", up: false },
  { symbol: "ISCTR", name: "İş Bankası C", sector: "Bankacılık", price: "24,56", change: "+1,12%", volume: "234M", mktCap: "₺43,8B", up: true },
  { symbol: "BIMAS", name: "BİM Mağazalar", sector: "Perakende", price: "567,00", change: "+0,89%", volume: "23M", mktCap: "₺56,7B", up: true },
  { symbol: "SAHOL", name: "Sabancı Holding", sector: "Holding", price: "89,75", change: "+1,34%", volume: "56M", mktCap: "₺35,9B", up: true },
  { symbol: "PGSUS", name: "Pegasus Hava Yolları", sector: "Ulaşım", price: "1.234,00", change: "-0,56%", volume: "12M", mktCap: "₺24,7B", up: false },
  { symbol: "TOASO", name: "Tofaş Oto Fab.", sector: "Otomotiv", price: "345,50", change: "+2,67%", volume: "28M", mktCap: "₺34,6B", up: true },
  { symbol: "FROTO", name: "Ford Otosan", sector: "Otomotiv", price: "1.456,00", change: "-1,23%", volume: "8M", mktCap: "₺58,2B", up: false },
  { symbol: "ARCLK", name: "Arçelik", sector: "Dayanıklı Tüketim", price: "178,40", change: "+0,79%", volume: "43M", mktCap: "₺35,7B", up: true },
  { symbol: "TCELL", name: "Turkcell", sector: "Telekomünikasyon", price: "89,60", change: "+1,56%", volume: "67M", mktCap: "₺44,8B", up: true },
];

export const FALLBACK_CRYPTO_LIST: CryptoAsset[] = [
  { symbol: "BTCUSDT", name: "Bitcoin", ticker: "BINANCE:BTCUSDT", price: "$87,450", priceTRY: "₺3.421.500", change: "+2,87%", change24h: "+5,12%", volume: "$28,4B", mktCap: "$1,72T", up: true, color: "#F7931A" },
  { symbol: "ETHUSDT", name: "Ethereum", ticker: "BINANCE:ETHUSDT", price: "$3,245", priceTRY: "₺124.700", change: "+1,53%", change24h: "+3,21%", volume: "$14,2B", mktCap: "$389B", up: true, color: "#627EEA" },
  { symbol: "BNBUSDT", name: "BNB", ticker: "BINANCE:BNBUSDT", price: "$412", priceTRY: "₺15.820", change: "+0,89%", change24h: "+2,14%", volume: "$1,8B", mktCap: "$61B", up: true, color: "#F3BA2F" },
  { symbol: "SOLUSDT", name: "Solana", ticker: "BINANCE:SOLUSDT", price: "$178", priceTRY: "₺6.835", change: "-1,23%", change24h: "-2,45%", volume: "$3,1B", mktCap: "$82B", up: false, color: "#9945FF" },
  { symbol: "XRPUSDT", name: "XRP", ticker: "BINANCE:XRPUSDT", price: "$0,62", priceTRY: "₺23,80", change: "+3,45%", change24h: "+7,89%", volume: "$2,4B", mktCap: "$34B", up: true, color: "#346AA9" },
  { symbol: "ADAUSDT", name: "Cardano", ticker: "BINANCE:ADAUSDT", price: "$0,48", priceTRY: "₺18,43", change: "-0,67%", change24h: "-1,34%", volume: "$0,8B", mktCap: "$17B", up: false, color: "#0033AD" },
  { symbol: "DOGEUSDT", name: "Dogecoin", ticker: "BINANCE:DOGEUSDT", price: "$0,18", priceTRY: "₺6,91", change: "+4,56%", change24h: "+8,23%", volume: "$1,9B", mktCap: "$25B", up: true, color: "#C2A633" },
  { symbol: "AVAXUSDT", name: "Avalanche", ticker: "BINANCE:AVAXUSDT", price: "$38,50", priceTRY: "₺1.478", change: "-2,34%", change24h: "-4,12%", volume: "$0,6B", mktCap: "$16B", up: false, color: "#E84142" },
  { symbol: "DOTUSDT", name: "Polkadot", ticker: "BINANCE:DOTUSDT", price: "$7,82", priceTRY: "₺300", change: "+1,12%", change24h: "+2,34%", volume: "$0,4B", mktCap: "$11B", up: true, color: "#E6007A" },
  { symbol: "MATICUSDT", name: "Polygon", ticker: "BINANCE:MATICUSDT", price: "$0,89", priceTRY: "₺34,17", change: "-0,45%", change24h: "-0,89%", volume: "$0,5B", mktCap: "$8B", up: false, color: "#8247E5" },
  { symbol: "LINKUSDT", name: "Chainlink", ticker: "BINANCE:LINKUSDT", price: "$14,20", priceTRY: "₺545", change: "+2,78%", change24h: "+5,67%", volume: "$0,7B", mktCap: "$9B", up: true, color: "#2A5ADA" },
  { symbol: "LTCUSDT", name: "Litecoin", ticker: "BINANCE:LTCUSDT", price: "$89,40", priceTRY: "₺3.432", change: "+0,34%", change24h: "+0,78%", volume: "$0,5B", mktCap: "$7B", up: true, color: "#BFBBBB" },
];

export const FALLBACK_MARKET_STATS: MarketStat[] = [
  { label: "BIST 100", value: "9.847,23", change: "+1,24%", up: true, sub: "Borsa İstanbul" },
  { label: "USD/TRY", value: "38,42", change: "+0,12%", up: true, sub: "Döviz Kuru" },
  { label: "BTC/USD", value: "$87.450", change: "+2,87%", up: true, sub: "Bitcoin" },
  { label: "ALTIN", value: "₺4.125", change: "+0,65%", up: true, sub: "Gram Altın" },
  { label: "BRENT", value: "$78,45", change: "-0,34%", up: false, sub: "Ham Petrol" },
  { label: "EUR/TRY", value: "41,85", change: "-0,08%", up: false, sub: "Euro" },
];

// ─── API functions ────────────────────────────────────────────────────────────

export async function fetchBistStocks(): Promise<BistStock[]> {
  const response = await client.get<CollectApiResponse<BistStock[]>>("/bist/stocks");
  return response.data.data;
}

export async function fetchCryptoAssets(): Promise<CryptoAsset[]> {
  const response = await client.get<CollectApiResponse<CryptoAsset[]>>("/crypto");
  return response.data.data;
}

export async function fetchMarketStats(): Promise<MarketStat[]> {
  const response = await client.get<CollectApiResponse<MarketStat[]>>("/market/stats");
  return response.data.data;
}
