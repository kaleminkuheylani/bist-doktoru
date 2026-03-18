/**
 * BIST Doktoru - Piyasa Analizi Sayfası
 * CollectAPI döviz & altın verileri + TradingView grafikleri
 */
import { TrendingUp, Globe, BarChart2, DollarSign } from "lucide-react";
import TradingViewWidget from "@/components/TradingViewWidget";
import { useCurrency, useGold } from "@/hooks/useMarketData";

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

// CollectAPI döviz tablosu
function CurrencyTable() {
  const { data: currency, loading } = useCurrency();

  // Gösterilecek dövizler
  const wanted = ["USD", "EUR", "GBP", "CHF", "JPY", "SAR", "AUD", "CAD", "DKK", "SEK", "NOK"];

  const filtered = currency
    ? currency.filter((c) => wanted.some((code) => c.name.startsWith(code) || c.name.includes(code + " ")))
    : [];

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
        <DollarSign className="w-5 h-5" style={{ color: "oklch(0.65 0.20 220)" }} />
        Döviz Kurları
        <span className="text-xs font-normal ml-1 px-2 py-0.5 rounded-full" style={{ background: "oklch(0.70 0.18 160 / 0.12)", color: "oklch(0.70 0.18 160)", fontFamily: "'JetBrains Mono', monospace" }}>
          Canlı
        </span>
      </h2>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid oklch(0.20 0.012 250)" }}>
        <div
          className="grid grid-cols-3 px-5 py-3 text-xs font-semibold"
          style={{ background: "oklch(0.13 0.015 250)", borderBottom: "1px solid oklch(0.20 0.012 250)", color: "oklch(0.55 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span>Para Birimi</span>
          <span className="text-right">Alış (₺)</span>
          <span className="text-right">Satış (₺)</span>
        </div>
        {loading && (
          <div className="px-5 py-6 text-center">
            <span className="text-xs animate-pulse" style={{ color: "oklch(0.50 0.010 250)" }}>Döviz verileri yükleniyor...</span>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="px-5 py-6 text-center">
            <span className="text-xs" style={{ color: "oklch(0.50 0.010 250)" }}>Veri alınamadı</span>
          </div>
        )}
        {filtered.map((item, i) => (
          <div
            key={item.name}
            className="grid grid-cols-3 px-5 py-3"
            style={{
              borderBottom: i < filtered.length - 1 ? "1px solid oklch(0.15 0.012 250)" : "none",
              background: i % 2 === 0 ? "oklch(0.11 0.015 250)" : "oklch(0.105 0.015 250)",
            }}
          >
            <span className="text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.85 0.005 250)" }}>
              {item.name}
            </span>
            <span className="text-right font-mono text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.80 0.005 250)" }}>
              {item.buying}
            </span>
            <span className="text-right font-mono text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.90 0.005 250)" }}>
              {item.selling}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// CollectAPI altın tablosu
function GoldTable() {
  const { data: gold, loading } = useGold();

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
        <BarChart2 className="w-5 h-5" style={{ color: "oklch(0.75 0.18 55)" }} />
        Altın Fiyatları
        <span className="text-xs font-normal ml-1 px-2 py-0.5 rounded-full" style={{ background: "oklch(0.70 0.18 160 / 0.12)", color: "oklch(0.70 0.18 160)", fontFamily: "'JetBrains Mono', monospace" }}>
          Canlı
        </span>
      </h2>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid oklch(0.20 0.012 250)" }}>
        <div
          className="grid grid-cols-3 px-5 py-3 text-xs font-semibold"
          style={{ background: "oklch(0.13 0.015 250)", borderBottom: "1px solid oklch(0.20 0.012 250)", color: "oklch(0.55 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span>Tür</span>
          <span className="text-right">Alış (₺)</span>
          <span className="text-right">Satış (₺)</span>
        </div>
        {loading && (
          <div className="px-5 py-6 text-center">
            <span className="text-xs animate-pulse" style={{ color: "oklch(0.50 0.010 250)" }}>Altın verileri yükleniyor...</span>
          </div>
        )}
        {!loading && (!gold || gold.length === 0) && (
          <div className="px-5 py-6 text-center">
            <span className="text-xs" style={{ color: "oklch(0.50 0.010 250)" }}>Veri alınamadı</span>
          </div>
        )}
        {gold && gold.map((item, i) => (
          <div
            key={item.name}
            className="grid grid-cols-3 px-5 py-3"
            style={{
              borderBottom: i < gold.length - 1 ? "1px solid oklch(0.15 0.012 250)" : "none",
              background: i % 2 === 0 ? "oklch(0.11 0.015 250)" : "oklch(0.105 0.015 250)",
            }}
          >
            <span className="text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.85 0.005 250)" }}>
              {item.name}
            </span>
            <span className="text-right font-mono text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.80 0.005 250)" }}>
              {item.buy}
            </span>
            <span className="text-right font-mono text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: item.sell === "-" ? "oklch(0.45 0.010 250)" : "oklch(0.90 0.005 250)" }}>
              {item.sell}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalizPage() {
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
          Küresel piyasalar, canlı döviz/altın verileri ve teknik analizler
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* Küresel Piyasalar Widget */}
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

        {/* Canlı Döviz & Altın Tabloları (CollectAPI) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CurrencyTable />
          <GoldTable />
        </div>

        {/* Ekonomik Takvim */}
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

        {/* Piyasa Isı Haritası */}
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
