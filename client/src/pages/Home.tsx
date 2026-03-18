/**
 * BIST Doktoru - Ana Sayfa (Dashboard)
 * Design: Bloomberg Terminal meets Modern Fintech
 * Canlı piyasa verileri: CollectAPI + TradingView grafikleri
 */
import { Link } from "wouter";
import { BarChart2, Bitcoin, TrendingUp, Briefcase, ArrowRight, ChevronUp, ChevronDown, Activity, Globe, Shield } from "lucide-react";
import TradingViewWidget from "@/components/TradingViewWidget";
import { useBist, useCurrency, useGold, useStocks } from "@/hooks/useMarketData";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663451065819/YKtmvmmBUBqBDrsdHYiG7Z/bist-hero-bg-LsVfhNx7F8B9CqqXsiAa2d.webp";
const MARKET_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663451065819/YKtmvmmBUBqBDrsdHYiG7Z/bist-market-visual-R2ZKH2cYjNP574MuX5jRKj.webp";
const CRYPTO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663451065819/YKtmvmmBUBqBDrsdHYiG7Z/bist-crypto-visual-6jpdG9RwVAVttPuHUuKmEi.webp";

const FEATURES = [
  {
    icon: BarChart2,
    title: "BIST Hisse Senetleri",
    desc: "Borsa İstanbul'daki tüm hisse senetlerini canlı TradingView grafikleriyle takip edin. Teknik analiz araçlarıyla derinlemesine inceleyin.",
    href: "/bist",
    color: "oklch(0.65 0.20 220)",
  },
  {
    icon: Bitcoin,
    title: "Kripto Para Piyasası",
    desc: "Bitcoin, Ethereum ve yüzlerce altcoin'i anlık fiyatlar ve grafiklerle takip edin. TRY paritelerini görün.",
    href: "/kripto",
    color: "oklch(0.75 0.18 55)",
  },
  {
    icon: TrendingUp,
    title: "Piyasa Analizi",
    desc: "Sektör bazlı analizler, teknik göstergeler ve piyasa derinliği verileriyle bilinçli yatırım kararları alın.",
    href: "/analiz",
    color: "oklch(0.70 0.18 160)",
  },
  {
    icon: Briefcase,
    title: "Portföy Takip",
    desc: "Hisse ve kripto portföyünüzü tek ekranda yönetin. Kâr/zarar hesaplaması ve performans analizi yapın.",
    href: "/portfoy",
    color: "oklch(0.65 0.18 280)",
  },
];

const MARKET_OVERVIEW_CONFIG = {
  colorTheme: "dark",
  dateRange: "12M",
  showChart: true,
  locale: "tr",
  largeChartUrl: "",
  isTransparent: true,
  showSymbolLogo: true,
  showFloatingTooltip: false,
  width: "100%",
  height: "100%",
  plotLineColorGrowing: "rgba(41, 98, 255, 1)",
  plotLineColorFalling: "rgba(41, 98, 255, 1)",
  gridLineColor: "rgba(240, 243, 250, 0)",
  scaleFontColor: "rgba(120, 123, 134, 1)",
  belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
  belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
  belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
  belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
  symbolActiveColor: "rgba(41, 98, 255, 0.12)",
  tabs: [
    {
      title: "BIST",
      symbols: [
        { s: "BIST:XU100", d: "BIST 100" },
        { s: "BIST:THYAO", d: "Türk Hava Yolları" },
        { s: "BIST:GARAN", d: "Garanti BBVA" },
        { s: "BIST:ASELS", d: "Aselsan" },
        { s: "BIST:EREGL", d: "Ereğli Demir" },
        { s: "BIST:KCHOL", d: "Koç Holding" },
      ],
      originalTitle: "BIST",
    },
    {
      title: "Kripto",
      symbols: [
        { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
        { s: "BINANCE:ETHUSDT", d: "Ethereum" },
        { s: "BINANCE:BNBUSDT", d: "BNB" },
        { s: "BINANCE:SOLUSDT", d: "Solana" },
        { s: "BINANCE:XRPUSDT", d: "XRP" },
      ],
      originalTitle: "Kripto",
    },
    {
      title: "Döviz",
      symbols: [
        { s: "FX_IDC:USDTRY", d: "USD/TRY" },
        { s: "FX_IDC:EURTRY", d: "EUR/TRY" },
        { s: "FX_IDC:GBPTRY", d: "GBP/TRY" },
        { s: "FOREXCOM:XAUUSD", d: "Altın/USD" },
      ],
      originalTitle: "Döviz",
    },
  ],
};

// Hero altındaki canlı stats bar
function MarketStatsBar() {
  const { data: bist } = useBist();
  const { data: currency } = useCurrency();
  const { data: gold } = useGold();

  const stats: { label: string; value: string; change?: string; up?: boolean; sub: string }[] = [];

  if (bist) {
    stats.push({
      label: "BIST 100",
      value: bist.currentstr,
      change: `${bist.changerate >= 0 ? "+" : ""}${bist.changeratestr}%`,
      up: bist.changerate >= 0,
      sub: "Borsa İstanbul",
    });
  }

  if (currency) {
    const usd = currency.find((c) => c.name.includes("USD"));
    const eur = currency.find((c) => c.name.includes("EUR") && !c.name.includes("USD"));
    if (usd) stats.push({ label: "USD/TRY", value: usd.selling, sub: "Döviz Kuru" });
    if (eur) stats.push({ label: "EUR/TRY", value: eur.selling, sub: "Euro" });
  }

  if (gold) {
    const gram = gold.find((g) => g.name.includes("Gram"));
    const ceyrek = gold.find((g) => g.name.includes("Çeyrek"));
    if (gram) stats.push({ label: "GRAM ALTIN", value: `₺${gram.buy}`, sub: "Gram Altın" });
    if (ceyrek) stats.push({ label: "ÇEYREK", value: `₺${ceyrek.buy}`, sub: "Çeyrek Altın" });
  }

  if (stats.length === 0) return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 py-3 px-6 overflow-x-auto"
      style={{ background: "oklch(0.06 0.015 250 / 0.9)", borderTop: "1px solid oklch(0.20 0.012 250)" }}
    >
      <div className="flex items-center gap-6 min-w-max">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "oklch(0.55 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
              {stat.label}
            </span>
            <span className="font-mono text-sm font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.90 0.005 250)" }}>
              {stat.value}
            </span>
            {stat.change && (
              <span
                className="flex items-center gap-0.5 text-xs font-mono"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: stat.up ? "oklch(0.70 0.18 160)" : "oklch(0.60 0.22 25)" }}
              >
                {stat.up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {stat.change}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// En yüksek hacimli hisseler
function TopStocks() {
  const { data: stocks, loading } = useStocks();

  const top = stocks
    ? [...stocks].sort((a, b) => b.hacim - a.hacim).slice(0, 8)
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
          En Yüksek Hacimli
        </h2>
        <Link href="/bist">
          <span className="text-xs flex items-center gap-1 hover:underline" style={{ color: "oklch(0.65 0.20 220)" }}>
            Tümü <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid oklch(0.20 0.012 250)", background: "oklch(0.11 0.015 250)" }}
      >
        {loading && (
          <div className="px-4 py-8 text-center">
            <span className="text-xs animate-pulse" style={{ color: "oklch(0.50 0.010 250)" }}>Yükleniyor...</span>
          </div>
        )}
        {!loading && top.length === 0 && (
          <div className="px-4 py-8 text-center">
            <span className="text-xs" style={{ color: "oklch(0.50 0.010 250)" }}>Veri alınamadı</span>
          </div>
        )}
        {top.map((stock, i) => {
          const up = stock.rate >= 0;
          return (
            <div
              key={stock.code}
              className="flex items-center justify-between px-4 py-3 transition-colors duration-150 hover:bg-white/5"
              style={{ borderBottom: i < top.length - 1 ? "1px solid oklch(0.17 0.012 250)" : "none" }}
            >
              <div>
                <div className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.90 0.005 250)" }}>
                  {stock.code}
                </div>
                <div className="text-xs" style={{ color: "oklch(0.50 0.010 250)" }}>
                  Hacim: {stock.hacimstr}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.90 0.005 250)" }}>
                  ₺{stock.lastpricestr}
                </div>
                <div
                  className="flex items-center justify-end gap-0.5 text-xs font-mono"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: up ? "oklch(0.70 0.18 160)" : "oklch(0.60 0.22 25)",
                  }}
                >
                  {up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {up ? "+" : ""}{stock.rate.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-[520px] flex items-center overflow-hidden"
        style={{
          background: `linear-gradient(to right, oklch(0.08 0.015 250 / 0.97) 40%, oklch(0.08 0.015 250 / 0.6) 100%), url(${HERO_BG}) center/cover no-repeat`,
        }}
      >
        <div className="container py-16 lg:py-20 relative z-10">
          <div className="max-w-2xl animate-fade-in-up">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{
                background: "oklch(0.65 0.20 220 / 0.15)",
                border: "1px solid oklch(0.65 0.20 220 / 0.3)",
                color: "oklch(0.65 0.20 220)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "oklch(0.70 0.18 160)" }} />
              Canlı Piyasa Verileri
            </div>

            <h1
              className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.97 0.005 250)" }}
            >
              Türkiye'nin
              <br />
              <span style={{ color: "oklch(0.65 0.20 220)" }}>Borsa Platformu</span>
            </h1>

            <p className="text-lg mb-8 leading-relaxed" style={{ color: "oklch(0.70 0.010 250)" }}>
              BIST hisse senetleri, kripto paralar ve döviz kurlarını canlı olarak takip edin.
              TradingView ile güçlendirilmiş profesyonel grafikler ve analizlerle piyasaları yakından izleyin.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/bist">
                <div
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.65 0.20 220), oklch(0.55 0.22 240))",
                    color: "white",
                    fontFamily: "'Space Grotesk', sans-serif",
                    boxShadow: "0 0 20px oklch(0.65 0.20 220 / 0.4)",
                  }}
                >
                  <BarChart2 className="w-4 h-4" />
                  BIST Hisseler
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
              <Link href="/kripto">
                <div
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    background: "oklch(0.75 0.18 55 / 0.15)",
                    border: "1px solid oklch(0.75 0.18 55 / 0.3)",
                    color: "oklch(0.75 0.18 55)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  <Bitcoin className="w-4 h-4" />
                  Kripto Piyasası
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Canlı Market Stats Bar */}
        <MarketStatsBar />
      </section>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* TradingView Market Overview Widget */}
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
                Piyasa Genel Görünümü
              </h2>
              <Link href="/bist">
                <span className="text-xs flex items-center gap-1 hover:underline" style={{ color: "oklch(0.65 0.20 220)" }}>
                  Tümünü Gör <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            <div className="tv-widget-container" style={{ height: "420px" }}>
              <TradingViewWidget
                scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
                config={MARKET_OVERVIEW_CONFIG}
                height="100%"
              />
            </div>
          </div>

          {/* Canlı Top Stocks */}
          <div>
            <TopStocks />
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
              Tüm Piyasalar Tek Platformda
            </h2>
            <p className="text-sm" style={{ color: "oklch(0.60 0.010 250)" }}>
              Profesyonel yatırımcılar için tasarlanmış araçlar
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.href} href={feature.href}>
                  <div
                    className="rounded-xl p-5 h-full transition-all duration-200 hover:scale-[1.02] group"
                    style={{ background: "oklch(0.12 0.015 250)", border: "1px solid oklch(0.22 0.012 250)", cursor: "pointer" }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                      style={{ background: "oklch(0.65 0.20 220 / 0.12)" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: feature.color }} />
                    </div>
                    <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.90 0.005 250)" }}>
                      {feature.title}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: "oklch(0.55 0.010 250)" }}>
                      {feature.desc}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-medium" style={{ color: feature.color }}>
                      İncele <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Two column promo */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className="relative rounded-xl overflow-hidden"
            style={{ minHeight: "240px", border: "1px solid oklch(0.22 0.012 250)" }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, oklch(0.08 0.015 250 / 0.95) 40%, oklch(0.08 0.015 250 / 0.5) 100%), url(${MARKET_IMG}) center/cover no-repeat`,
              }}
            />
            <div className="relative z-10 p-6 flex flex-col justify-between h-full" style={{ minHeight: "240px" }}>
              <div>
                <div className="text-xs font-mono mb-2" style={{ color: "oklch(0.65 0.20 220)", fontFamily: "'JetBrains Mono', monospace" }}>
                  BORSA İSTANBUL
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.97 0.005 250)" }}>
                  BIST Hisse Senetleri
                </h3>
                <p className="text-sm" style={{ color: "oklch(0.65 0.010 250)" }}>
                  500+ hisse senedini canlı grafikler ve teknik analiz araçlarıyla takip edin.
                </p>
              </div>
              <Link href="/bist">
                <div
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    background: "oklch(0.65 0.20 220 / 0.2)",
                    border: "1px solid oklch(0.65 0.20 220 / 0.4)",
                    color: "oklch(0.65 0.20 220)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  <BarChart2 className="w-4 h-4" />
                  Hisseleri İncele
                </div>
              </Link>
            </div>
          </div>

          <div
            className="relative rounded-xl overflow-hidden"
            style={{ minHeight: "240px", border: "1px solid oklch(0.22 0.012 250)" }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, oklch(0.08 0.015 250 / 0.95) 40%, oklch(0.08 0.015 250 / 0.5) 100%), url(${CRYPTO_IMG}) center/cover no-repeat`,
              }}
            />
            <div className="relative z-10 p-6 flex flex-col justify-between h-full" style={{ minHeight: "240px" }}>
              <div>
                <div className="text-xs font-mono mb-2" style={{ color: "oklch(0.75 0.18 55)", fontFamily: "'JetBrains Mono', monospace" }}>
                  KRİPTO PARA
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.97 0.005 250)" }}>
                  Kripto Piyasası
                </h3>
                <p className="text-sm" style={{ color: "oklch(0.65 0.010 250)" }}>
                  Bitcoin, Ethereum ve yüzlerce kripto parayı TRY ve USD paritelerinde takip edin.
                </p>
              </div>
              <Link href="/kripto">
                <div
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    background: "oklch(0.75 0.18 55 / 0.2)",
                    border: "1px solid oklch(0.75 0.18 55 / 0.4)",
                    color: "oklch(0.75 0.18 55)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  <Bitcoin className="w-4 h-4" />
                  Kripto Piyasası
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Activity, title: "Canlı Veriler", desc: "CollectAPI & TradingView altyapısıyla anlık piyasa verileri" },
            { icon: Globe, title: "Tüm Piyasalar", desc: "BIST, kripto, döviz ve emtia tek platformda" },
            { icon: Shield, title: "Güvenilir Kaynak", desc: "Lisanslı veri sağlayıcılardan doğrulanmış bilgi" },
          ].map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.title}
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: "oklch(0.11 0.015 250)", border: "1px solid oklch(0.18 0.012 250)" }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.65 0.20 220 / 0.15)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "oklch(0.65 0.20 220)" }} />
                </div>
                <div>
                  <div className="font-semibold text-sm mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.90 0.005 250)" }}>
                    {badge.title}
                  </div>
                  <div className="text-xs" style={{ color: "oklch(0.55 0.010 250)" }}>
                    {badge.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
