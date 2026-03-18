/**
 * BIST Doktoru - Kripto Para Sayfası
 * TradingView widget'ları ile canlı kripto grafikleri
 * (Kripto fiyatları TradingView üzerinden gösterilmektedir)
 */
import { useState } from "react";
import { Bitcoin, Search } from "lucide-react";
import TradingViewWidget from "@/components/TradingViewWidget";

// Kripto para listesi - sadece sembol ve görüntüleme bilgileri
const CRYPTO_LIST = [
  { symbol: "BTCUSDT", name: "Bitcoin", ticker: "BINANCE:BTCUSDT", color: "#F7931A" },
  { symbol: "ETHUSDT", name: "Ethereum", ticker: "BINANCE:ETHUSDT", color: "#627EEA" },
  { symbol: "BNBUSDT", name: "BNB", ticker: "BINANCE:BNBUSDT", color: "#F3BA2F" },
  { symbol: "SOLUSDT", name: "Solana", ticker: "BINANCE:SOLUSDT", color: "#9945FF" },
  { symbol: "XRPUSDT", name: "XRP", ticker: "BINANCE:XRPUSDT", color: "#346AA9" },
  { symbol: "ADAUSDT", name: "Cardano", ticker: "BINANCE:ADAUSDT", color: "#0033AD" },
  { symbol: "DOGEUSDT", name: "Dogecoin", ticker: "BINANCE:DOGEUSDT", color: "#C2A633" },
  { symbol: "AVAXUSDT", name: "Avalanche", ticker: "BINANCE:AVAXUSDT", color: "#E84142" },
  { symbol: "DOTUSDT", name: "Polkadot", ticker: "BINANCE:DOTUSDT", color: "#E6007A" },
  { symbol: "LINKUSDT", name: "Chainlink", ticker: "BINANCE:LINKUSDT", color: "#2A5ADA" },
  { symbol: "LTCUSDT", name: "Litecoin", ticker: "BINANCE:LTCUSDT", color: "#BFBBBB" },
  { symbol: "UNIUSDT", name: "Uniswap", ticker: "BINANCE:UNIUSDT", color: "#FF007A" },
];

export default function KriptoPage() {
  const [selectedCrypto, setSelectedCrypto] = useState("BINANCE:BTCUSDT");
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCryptos = CRYPTO_LIST.filter((c) =>
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div
        className="px-6 py-5 border-b"
        style={{ borderColor: "oklch(0.18 0.012 250)", background: "oklch(0.10 0.015 250)" }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.75 0.18 55 / 0.15)" }}
          >
            <Bitcoin className="w-4 h-4" style={{ color: "oklch(0.75 0.18 55)" }} />
          </div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
            Kripto Para Piyasası
          </h1>
        </div>
        <p className="text-sm ml-11" style={{ color: "oklch(0.55 0.010 250)" }}>
          Bitcoin, Ethereum ve yüzlerce kripto parayı canlı TRY ve USD paritelerinde takip edin
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Kripto Listesi */}
          <div className="xl:col-span-1">
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "oklch(0.50 0.010 250)" }} />
                <input
                  type="text"
                  placeholder="Kripto ara... (BTC, ETH...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{
                    background: "oklch(0.14 0.015 250)",
                    border: "1px solid oklch(0.22 0.012 250)",
                    color: "oklch(0.90 0.005 250)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                />
              </div>
            </div>

            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid oklch(0.20 0.012 250)", background: "oklch(0.11 0.015 250)" }}
            >
              <div
                className="px-4 py-2 text-xs font-medium"
                style={{ color: "oklch(0.50 0.010 250)", borderBottom: "1px solid oklch(0.17 0.012 250)", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Kripto Para — Grafik için seçin
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "560px" }}>
                {filteredCryptos.map((crypto, i) => (
                  <div
                    key={crypto.symbol}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150"
                    style={{
                      borderBottom: i < filteredCryptos.length - 1 ? "1px solid oklch(0.15 0.012 250)" : "none",
                      background: selectedSymbol === crypto.symbol ? "oklch(0.75 0.18 55 / 0.06)" : "transparent",
                    }}
                    onClick={() => {
                      setSelectedCrypto(crypto.ticker);
                      setSelectedSymbol(crypto.symbol);
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      style={{ background: crypto.color + "33", border: `1px solid ${crypto.color}55` }}
                    />
                    <div className="flex-1">
                      <div
                        className="font-bold text-sm"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          color: selectedSymbol === crypto.symbol ? "oklch(0.75 0.18 55)" : "oklch(0.90 0.005 250)",
                        }}
                      >
                        {crypto.symbol.replace("USDT", "")}
                      </div>
                      <div className="text-xs" style={{ color: "oklch(0.45 0.010 250)" }}>
                        {crypto.name}
                      </div>
                    </div>
                    {selectedSymbol === crypto.symbol && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "oklch(0.75 0.18 55)" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grafik Alanı */}
          <div className="xl:col-span-2 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.90 0.005 250)" }}>
                  {selectedSymbol.replace("USDT", "")} — Canlı Grafik
                </h2>
              </div>
              <div className="tv-widget-container" style={{ height: "500px" }}>
                <TradingViewWidget
                  scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
                  config={{
                    autosize: true,
                    symbol: selectedCrypto,
                    interval: "D",
                    timezone: "Europe/Istanbul",
                    theme: "dark",
                    style: "1",
                    locale: "tr",
                    backgroundColor: "rgba(10, 14, 26, 1)",
                    gridColor: "rgba(255, 255, 255, 0.04)",
                    hide_top_toolbar: false,
                    hide_legend: false,
                    save_image: false,
                    calendar: false,
                    support_host: "https://www.tradingview.com",
                  }}
                  height="100%"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.80 0.005 250)" }}>
                  Teknik Analiz
                </h3>
                <div className="tv-widget-container" style={{ height: "200px" }}>
                  <TradingViewWidget
                    scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
                    config={{
                      interval: "1D",
                      width: "100%",
                      isTransparent: true,
                      height: "100%",
                      symbol: selectedCrypto,
                      showIntervalTabs: true,
                      displayMode: "single",
                      locale: "tr",
                      colorTheme: "dark",
                    }}
                    height="100%"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.80 0.005 250)" }}>
                  Kripto Detayları
                </h3>
                <div className="tv-widget-container" style={{ height: "200px" }}>
                  <TradingViewWidget
                    scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js"
                    config={{
                      symbol: selectedCrypto,
                      width: "100%",
                      locale: "tr",
                      colorTheme: "dark",
                      isTransparent: true,
                    }}
                    height="100%"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kripto Screener */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
            Kripto Para Tarayıcı
          </h2>
          <div className="tv-widget-container" style={{ height: "500px" }}>
            <TradingViewWidget
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-screener.js"
              config={{
                width: "100%",
                height: "100%",
                defaultColumn: "overview",
                defaultScreen: "general",
                market: "crypto",
                showToolbar: true,
                colorTheme: "dark",
                locale: "tr",
                isTransparent: true,
              }}
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
