/**
 * BIST Doktoru - Piyasa Analizi Sayfası
 * TradingView widget'ları ile kapsamlı piyasa analizi
 * Collect API entegrasyonu: dinamik sektör performansı ve haberler
 */
import { TrendingUp, ChevronUp, ChevronDown, BarChart2, Globe, ExternalLink } from "lucide-react";
import TradingViewWidget from "@/components/TradingViewWidget";
import { useSectorData, useMarketNews } from "@/hooks/useCollectApi";

const GLOBAL_MARKETS_CONFIG = {
  colorTheme: "dark",
  dateRange: "12M",
  showChart: true,
  locale: "tr",
  isTransparent: true,
  showSymbolLogo: true,
  showFloatingTooltip: false,
  width: "100%",
  height: "100%",
  tabs: [
    {
      title: "Endeksler",
      symbols: [
        { s: "BIST:XU100", d: "BIST 100" },
        { s: "SP:SPX", d: "S&P 500" },
        { s: "NASDAQ:NDX", d: "Nasdaq 100" },
        { s: "DJ:DJI", d: "Dow Jones" },
        { s: "XETR:DAX", d: "DAX" },
        { s: "LSE:UKX", d: "FTSE 100" },
      ],
      originalTitle: "Endeksler",
    },
    {
      title: "Emtia",
      symbols: [
        { s: "FOREXCOM:XAUUSD", d: "Altın" },
        { s: "FOREXCOM:XAGUSD", d: "Gümüş" },
        { s: "TVC:USOIL", d: "Brent Petrol" },
        { s: "TVC:NGAS", d: "Doğal Gaz" },
      ],
      originalTitle: "Emtia",
    },
    {
      title: "Döviz",
      symbols: [
        { s: "FX_IDC:USDTRY", d: "USD/TRY" },
        { s: "FX_IDC:EURTRY", d: "EUR/TRY" },
        { s: "FX:EURUSD", d: "EUR/USD" },
        { s: "FX:GBPUSD", d: "GBP/USD" },
        { s: "FX:USDJPY", d: "USD/JPY" },
      ],
      originalTitle: "Döviz",
    },
  ],
};

export default function AnalizPage() {
  const { data: sectorData } = useSectorData();
  const { data: newsItems } = useMarketNews();

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
            style={{ background: "oklch(0.70 0.18 160 / 0.15)" }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: "oklch(0.70 0.18 160)" }} />
          </div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
            Piyasa Analizi
          </h1>
        </div>
        <p className="text-sm ml-11" style={{ color: "oklch(0.55 0.010 250)" }}>
          Sektör bazlı analizler, teknik göstergeler ve küresel piyasa verileri
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* Global Markets Widget */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
            <Globe className="w-5 h-5" style={{ color: "oklch(0.65 0.20 220)" }} />
            Küresel Piyasalar
          </h2>
          <div className="tv-widget-container" style={{ height: "420px" }}>
            <TradingViewWidget
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
              config={GLOBAL_MARKETS_CONFIG}
              height="100%"
            />
          </div>
        </div>

        {/* Sector Analysis + News */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sector Performance */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
              <BarChart2 className="w-5 h-5" style={{ color: "oklch(0.65 0.20 220)" }} />
              Sektör Performansı
            </h2>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid oklch(0.20 0.012 250)" }}
            >
              {sectorData.map((sector, i) => (
                <div
                  key={sector.name}
                  className="px-5 py-4 transition-colors hover:bg-white/5"
                  style={{
                    borderBottom: i < sectorData.length - 1 ? "1px solid oklch(0.15 0.012 250)" : "none",
                    background: i % 2 === 0 ? "oklch(0.11 0.015 250)" : "oklch(0.105 0.015 250)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.90 0.005 250)" }}>
                      {sector.name}
                    </span>
                    <span
                      className="flex items-center gap-0.5 text-sm font-mono px-2 py-0.5 rounded"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: sector.up ? "oklch(0.70 0.18 160)" : "oklch(0.60 0.22 25)",
                        background: sector.up ? "oklch(0.70 0.18 160 / 0.1)" : "oklch(0.60 0.22 25 / 0.1)",
                      }}
                    >
                      {sector.up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {sector.change}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full mb-2" style={{ background: "oklch(0.18 0.012 250)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(Math.abs(parseFloat(sector.change)) * 20, 100)}%`,
                        background: sector.up ? "oklch(0.70 0.18 160)" : "oklch(0.60 0.22 25)",
                      }}
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {sector.stocks.map((s) => (
                      <span
                        key={s}
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          background: "oklch(0.65 0.20 220 / 0.08)",
                          color: "oklch(0.65 0.20 220)",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market News */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
              <TrendingUp className="w-5 h-5" style={{ color: "oklch(0.65 0.20 220)" }} />
              Piyasa Haberleri
            </h2>
            <div className="space-y-3">
              {newsItems.map((news, i) => (
                <a
                  key={i}
                  href={news.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl p-4 transition-all hover:scale-[1.01]"
                  style={{ background: "oklch(0.12 0.015 250)", border: "1px solid oklch(0.20 0.012 250)", textDecoration: "none" }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-sm leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.90 0.005 250)" }}>
                      {news.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          background: "oklch(0.65 0.20 220 / 0.12)",
                          color: "oklch(0.65 0.20 220)",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {news.tag}
                      </span>
                      <ExternalLink className="w-3 h-3" style={{ color: "oklch(0.45 0.010 250)" }} />
                    </div>
                  </div>
                  {news.summary && (
                    <p className="text-xs leading-relaxed mb-2" style={{ color: "oklch(0.58 0.010 250)" }}>
                      {news.summary}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "oklch(0.45 0.010 250)" }}>
                      {news.time}
                    </span>
                    <span
                      className="text-xs flex items-center gap-0.5"
                      style={{ color: news.up ? "oklch(0.70 0.18 160)" : "oklch(0.60 0.22 25)" }}
                    >
                      {news.up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {news.up ? "Yükseliş" : "Düşüş"}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Economic Calendar Widget */}
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
            Ekonomik Takvim
          </h2>
          <div className="tv-widget-container" style={{ height: "450px" }}>
            <TradingViewWidget
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-events.js"
              config={{
                colorTheme: "dark",
                isTransparent: true,
                width: "100%",
                height: "100%",
                locale: "tr",
                importanceFilter: "-1,0,1",
                countryFilter: "tr,us,eu,gb,de,jp,cn",
              }}
              height="100%"
            />
          </div>
        </div>

        {/* Heatmap Widget */}
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
            Piyasa Isı Haritası
          </h2>
          <div className="tv-widget-container" style={{ height: "500px" }}>
            <TradingViewWidget
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js"
              config={{
                exchanges: [],
                dataSource: "BIST",
                grouping: "sector",
                blockSize: "market_cap_basic",
                blockColor: "change",
                locale: "tr",
                symbolUrl: "",
                colorTheme: "dark",
                hasTopBar: true,
                isDataSetEnabled: false,
                isZoomEnabled: true,
                hasSymbolTooltip: true,
                isMonoSize: false,
                width: "100%",
                height: "100%",
              }}
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
