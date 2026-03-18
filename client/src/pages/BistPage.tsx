/**
 * BIST Doktoru - BIST Hisse Senetleri Sayfası
 * TradingView widget'ları ile canlı BIST verileri
 * Collect API entegrasyonu: gerçek zamanlı hisse fiyatları
 */
import { useState } from "react";
import { BarChart2, ChevronUp, ChevronDown, Search, RefreshCw, Wifi, WifiOff } from "lucide-react";
import TradingViewWidget from "@/components/TradingViewWidget";
import { useBistStocks } from "@/hooks/useCollectApi";

const SECTORS = ["Tümü", "Bankacılık", "Holding", "Ulaşım", "Savunma", "Metal", "Enerji", "Otomotiv", "Perakende", "Telekomünikasyon"];

export default function BistPage() {
  const [selectedStock, setSelectedStock] = useState("BIST:THYAO");
  const [selectedSymbol, setSelectedSymbol] = useState("THYAO");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("Tümü");

  const { data: bistStocks, loading, error, isLive, refetch } = useBistStocks();

  const filteredStocks = bistStocks.filter((s) => {
    const matchSearch = s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSector = selectedSector === "Tümü" || s.sector === selectedSector;
    return matchSearch && matchSector;
  });

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div
        className="px-6 py-5 border-b"
        style={{ borderColor: "oklch(0.18 0.012 250)", background: "oklch(0.10 0.015 250)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(0.65 0.20 220 / 0.15)" }}
              >
                <BarChart2 className="w-4 h-4" style={{ color: "oklch(0.65 0.20 220)" }} />
              </div>
              <h1 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
                BIST Hisse Senetleri
              </h1>
            </div>
            <p className="text-sm ml-11" style={{ color: "oklch(0.55 0.010 250)" }}>
              Borsa İstanbul'daki tüm hisse senetlerini canlı TradingView grafikleriyle takip edin
            </p>
          </div>

          {/* Canlı veri durum göstergesi */}
          <div className="flex items-center gap-2">
            {isLive ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: "oklch(0.70 0.18 160 / 0.15)", color: "oklch(0.70 0.18 160)" }}>
                <Wifi className="w-3 h-3" />
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>Canlı</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: "oklch(0.60 0.22 25 / 0.15)", color: "oklch(0.60 0.22 25)" }}>
                <WifiOff className="w-3 h-3" />
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>Önbellek</span>
              </div>
            ) : null}
            <button
              onClick={refetch}
              disabled={loading}
              className="p-1.5 rounded-lg transition-all hover:bg-white/5 disabled:opacity-40"
              title="Verileri yenile"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                style={{ color: "oklch(0.55 0.010 250)" }}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* BIST 100 Index Widget */}
        <div className="mb-6">
          <div className="tv-widget-container" style={{ height: "80px" }}>
            <TradingViewWidget
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js"
              config={{ symbol: "BIST:XU100", width: "100%", colorTheme: "dark", isTransparent: true, locale: "tr" }}
              height={80}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Stock List */}
          <div className="xl:col-span-1">
            {/* Search & Filter */}
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "oklch(0.50 0.010 250)" }} />
                <input
                  type="text"
                  placeholder="Hisse ara... (THYAO, GARAN...)"
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
              <div className="flex gap-2 flex-wrap">
                {SECTORS.slice(0, 6).map((sector) => (
                  <button
                    key={sector}
                    onClick={() => setSelectedSector(sector)}
                    className="px-2.5 py-1 rounded text-xs font-medium transition-all"
                    style={{
                      background: selectedSector === sector ? "oklch(0.65 0.20 220 / 0.2)" : "oklch(0.14 0.015 250)",
                      border: `1px solid ${selectedSector === sector ? "oklch(0.65 0.20 220 / 0.4)" : "oklch(0.22 0.012 250)"}`,
                      color: selectedSector === sector ? "oklch(0.65 0.20 220)" : "oklch(0.60 0.010 250)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock List */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid oklch(0.20 0.012 250)", background: "oklch(0.11 0.015 250)" }}
            >
              <div
                className="grid grid-cols-3 px-4 py-2 text-xs font-medium"
                style={{ color: "oklch(0.50 0.010 250)", borderBottom: "1px solid oklch(0.17 0.012 250)", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span>Hisse</span>
                <span className="text-right">Fiyat</span>
                <span className="text-right">Değişim</span>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "480px" }}>
                {loading && filteredStocks.length === 0 ? (
                  <div className="flex items-center justify-center py-12" style={{ color: "oklch(0.50 0.010 250)" }}>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Yükleniyor...</span>
                  </div>
                ) : (
                  filteredStocks.map((stock, i) => (
                    <div
                      key={stock.symbol}
                      className="grid grid-cols-3 px-4 py-3 cursor-pointer transition-all duration-150"
                      style={{
                        borderBottom: i < filteredStocks.length - 1 ? "1px solid oklch(0.15 0.012 250)" : "none",
                        background: selectedSymbol === stock.symbol ? "oklch(0.65 0.20 220 / 0.08)" : "transparent",
                      }}
                      onClick={() => {
                        setSelectedStock(`BIST:${stock.symbol}`);
                        setSelectedSymbol(stock.symbol);
                      }}
                    >
                      <div>
                        <div
                          className="font-bold text-xs"
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            color: selectedSymbol === stock.symbol ? "oklch(0.65 0.20 220)" : "oklch(0.90 0.005 250)",
                          }}
                        >
                          {stock.symbol}
                        </div>
                        <div className="text-xs" style={{ color: "oklch(0.45 0.010 250)" }}>
                          {stock.sector}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.88 0.005 250)" }}>
                          ₺{stock.price}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="flex items-center justify-end gap-0.5 text-xs font-mono"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            color: stock.up ? "oklch(0.70 0.18 160)" : "oklch(0.60 0.22 25)",
                          }}
                        >
                          {stock.up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {stock.change}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: TradingView Chart */}
          <div className="xl:col-span-2 space-y-4">
            {/* Advanced Chart */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.90 0.005 250)" }}>
                  {selectedSymbol} — Teknik Analiz Grafiği
                </h2>
              </div>
              <div className="tv-widget-container" style={{ height: "500px" }}>
                <TradingViewWidget
                  scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
                  config={{
                    autosize: true,
                    symbol: selectedStock,
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
                    hide_volume: false,
                    support_host: "https://www.tradingview.com",
                  }}
                  height="100%"
                />
              </div>
            </div>

            {/* Technical Analysis Widget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.80 0.005 250)" }}>
                  Teknik Analiz Özeti
                </h3>
                <div className="tv-widget-container" style={{ height: "200px" }}>
                  <TradingViewWidget
                    scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
                    config={{
                      interval: "1D",
                      width: "100%",
                      isTransparent: true,
                      height: "100%",
                      symbol: selectedStock,
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
                  Hisse Detayları
                </h3>
                <div className="tv-widget-container" style={{ height: "200px" }}>
                  <TradingViewWidget
                    scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js"
                    config={{
                      symbol: selectedStock,
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

        {/* BIST Screener Widget */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
            BIST Hisse Tarayıcı
          </h2>
          <div className="tv-widget-container" style={{ height: "500px" }}>
            <TradingViewWidget
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-screener.js"
              config={{
                width: "100%",
                height: "100%",
                defaultColumn: "overview",
                defaultScreen: "most_capitalized",
                market: "turkey",
                showToolbar: true,
                colorTheme: "dark",
                locale: "tr",
                isTransparent: true,
              }}
              height="100%"
            />
          </div>
        </div>

        {/* Detailed stock table */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
            Hisse Senedi Detay Tablosu
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid oklch(0.20 0.012 250)" }}
          >
            <div
              className="grid grid-cols-6 px-5 py-3 text-xs font-semibold"
              style={{
                background: "oklch(0.13 0.015 250)",
                borderBottom: "1px solid oklch(0.20 0.012 250)",
                color: "oklch(0.55 0.010 250)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              <span>Hisse / Şirket</span>
              <span>Sektör</span>
              <span className="text-right">Son Fiyat</span>
              <span className="text-right">Değişim</span>
              <span className="text-right">Hacim</span>
              <span className="text-right">Piyasa Değeri</span>
            </div>
            {bistStocks.map((stock, i) => (
              <div
                key={stock.symbol}
                className="grid grid-cols-6 px-5 py-3 cursor-pointer transition-all duration-150 hover:bg-white/5"
                style={{
                  borderBottom: i < bistStocks.length - 1 ? "1px solid oklch(0.15 0.012 250)" : "none",
                  background: i % 2 === 0 ? "oklch(0.11 0.015 250)" : "oklch(0.105 0.015 250)",
                }}
                onClick={() => {
                  setSelectedStock(`BIST:${stock.symbol}`);
                  setSelectedSymbol(stock.symbol);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <div>
                  <div className="font-bold text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.90 0.005 250)" }}>
                    {stock.symbol}
                  </div>
                  <div className="text-xs" style={{ color: "oklch(0.50 0.010 250)" }}>
                    {stock.name}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs" style={{ color: "oklch(0.60 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {stock.sector}
                  </span>
                </div>
                <div className="flex items-center justify-end">
                  <span className="font-mono text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.90 0.005 250)" }}>
                    ₺{stock.price}
                  </span>
                </div>
                <div className="flex items-center justify-end">
                  <span
                    className="flex items-center gap-0.5 text-xs font-mono"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: stock.up ? "oklch(0.70 0.18 160)" : "oklch(0.60 0.22 25)",
                    }}
                  >
                    {stock.up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {stock.change}
                  </span>
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-xs" style={{ color: "oklch(0.60 0.010 250)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {stock.volume}
                  </span>
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-xs" style={{ color: "oklch(0.60 0.010 250)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {stock.mktCap}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
