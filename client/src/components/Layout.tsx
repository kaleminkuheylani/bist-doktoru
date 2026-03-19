/**
 * BIST Doktoru - Layout Component
 * Design: Bloomberg Terminal meets Modern Fintech
 * Dark theme, sidebar navigation, canlı ticker (CollectAPI)
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  BarChart2,
  Bitcoin,
  TrendingUp,
  Briefcase,
  Info,
  Home,
  Menu,
  X,
  Activity,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useCurrency, useGold, useBist } from "@/hooks/useMarketData";

// BIST saatleri: Pazartesi-Cuma 10:00-18:00 (Türkiye saati UTC+3)
function isBistOpen(now: Date): boolean {
  const istanbul = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
  const day = istanbul.getDay(); // 0=Pazar, 6=Cumartesi
  if (day === 0 || day === 6) return false;
  const mins = istanbul.getHours() * 60 + istanbul.getMinutes();
  return mins >= 600 && mins < 1080; // 10:00 - 18:00
}

const NAV_ITEMS = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/bist", label: "BIST Hisseler", icon: BarChart2 },
  { href: "/kripto", label: "Kripto Para", icon: Bitcoin },
  { href: "/analiz", label: "Piyasa Analizi", icon: TrendingUp },
  { href: "/portfoy", label: "Portföy Takip", icon: Briefcase },
  { href: "/hakkimizda", label: "Hakkımızda", icon: Info },
];

// Döviz kodunu kısa ada çevir
function currencyShortName(name: string): string {
  if (name.includes("USD")) return "USD/TRY";
  if (name.includes("EUR") && !name.includes("USD")) return "EUR/TRY";
  if (name.includes("GBP")) return "GBP/TRY";
  if (name.includes("CHF")) return "CHF/TRY";
  return name.split(" ")[0];
}

function TickerStrip() {
  const { data: currency } = useCurrency();
  const { data: gold } = useGold();
  const { data: bist } = useBist();

  // Gösterilecek veriler
  const items: { label: string; value: string; change?: string; up?: boolean }[] = [];

  if (bist) {
    items.push({
      label: "BIST 100",
      value: bist.currentstr,
      change: `${bist.changerate >= 0 ? "+" : ""}${bist.changeratestr}%`,
      up: bist.changerate >= 0,
    });
  }

  if (currency) {
    const wanted = ["USD", "EUR", "GBP"];
    wanted.forEach((code) => {
      const item = currency.find((c) => c.name.includes(code) && !c.name.includes("USD") === (code !== "USD"));
      const found = currency.find((c) => c.name.startsWith(code) || c.name.includes(code + " "));
      const entry = found || item;
      if (entry) {
        items.push({
          label: currencyShortName(entry.name),
          value: `₺${entry.selling}`,
        });
      }
    });
  }

  if (gold) {
    const gramAltin = gold.find((g) => g.name === "Gram Altın" || g.name.includes("Gram"));
    if (gramAltin) {
      items.push({ label: "Gram Altın", value: `₺${gramAltin.buy}` });
    }
  }

  // Veriler yüklenene kadar boş şerit
  if (items.length === 0) {
    return (
      <div
        className="h-[46px] border-b flex items-center px-4"
        style={{ borderColor: "oklch(0.22 0.012 250)", background: "oklch(0.10 0.015 250)" }}
      >
        <span className="text-xs animate-pulse" style={{ color: "oklch(0.45 0.010 250)", fontFamily: "'JetBrains Mono', monospace" }}>
          Piyasa verileri yükleniyor...
        </span>
      </div>
    );
  }

  // Sonsuz kaydırma için çift liste
  const doubled = [...items, ...items];

  return (
    <div
      className="h-[46px] border-b"
      style={{
        borderColor: "oklch(0.22 0.012 250)",
        background: "oklch(0.10 0.015 250)",
        overflow: "hidden",
        cursor: "grab",
      }}
    >
      <div className="ticker-track h-full flex items-center">
        {doubled.map((item, i) => (
          <div key={i} className="ticker-item text-xs">
            <span
              className="font-medium"
              style={{ color: "oklch(0.75 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {item.label}
            </span>
            <span
              className="font-mono"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.90 0.005 250)" }}
            >
              {item.value}
            </span>
            {item.change && (
              <span
                className="flex items-center gap-0.5 font-mono text-xs"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: item.up ? "oklch(0.70 0.18 160)" : "oklch(0.60 0.22 25)",
                }}
              >
                {item.up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {item.change}
              </span>
            )}
            <span style={{ color: "oklch(0.30 0.012 250)", margin: "0 0.5rem" }}>|</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [location] = useLocation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const marketOpen = isBistOpen(now);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "oklch(0 0 0 / 0.7)" }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "oklch(0.10 0.015 250)",
          borderRight: "1px solid oklch(0.20 0.012 250)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "oklch(0.20 0.012 250)" }}>
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, oklch(0.65 0.20 220), oklch(0.75 0.18 195))",
                boxShadow: "0 0 16px oklch(0.65 0.20 220 / 0.4)",
              }}
            >
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
                BIST
              </div>
              <div className="font-bold text-sm leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.65 0.20 220)" }}>
                DOKTORU
              </div>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 rounded" style={{ color: "oklch(0.60 0.010 250)" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Market status */}
        <div className="px-4 py-3 border-b" style={{ borderColor: "oklch(0.20 0.012 250)" }}>
          <div className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: marketOpen ? "oklch(0.70 0.18 160)" : "oklch(0.60 0.22 25)",
                animation: marketOpen ? "pulse 2s infinite" : "none",
              }}
            />
            <span
              style={{
                color: marketOpen ? "oklch(0.70 0.18 160)" : "oklch(0.60 0.22 25)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {marketOpen ? "Piyasa Açık" : "Piyasa Kapalı"}
            </span>
            <span className="ml-auto" style={{ color: "oklch(0.50 0.010 250)", fontFamily: "'JetBrains Mono', monospace" }}>
              {now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className="nav-link"
                  style={
                    isActive
                      ? {
                          background: "oklch(0.65 0.20 220 / 0.12)",
                          color: "oklch(0.65 0.20 220)",
                          borderLeft: "2px solid oklch(0.65 0.20 220)",
                          paddingLeft: "calc(0.75rem - 2px)",
                        }
                      : {}
                  }
                  onClick={onClose}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom info */}
        <div className="px-4 py-4 border-t" style={{ borderColor: "oklch(0.20 0.012 250)" }}>
          <div className="text-xs space-y-1" style={{ color: "oklch(0.45 0.010 250)" }}>
            <div>© 2025 BIST Doktoru</div>
            <div>Veriler CollectAPI ile sunulmaktadır</div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "oklch(0.08 0.015 250)" }}>
      {/* Canlı Ticker Strip */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <TickerStrip />
      </div>

      {/* Mobile top bar */}
      <div
        className="fixed top-[46px] left-0 right-0 z-30 flex items-center gap-3 px-4 py-3 lg:hidden"
        style={{
          background: "oklch(0.10 0.015 250)",
          borderBottom: "1px solid oklch(0.20 0.012 250)",
        }}
      >
        <button onClick={() => setSidebarOpen(true)} style={{ color: "oklch(0.65 0.010 250)" }}>
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.20 220), oklch(0.75 0.18 195))" }}
          >
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
            BIST <span style={{ color: "oklch(0.65 0.20 220)" }}>DOKTORU</span>
          </span>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <main
        className="flex-1 lg:ml-64 mt-[46px] lg:mt-[46px]"
        style={{ paddingTop: "2.5rem" }}
      >
        <div className="lg:hidden" style={{ height: "3rem" }} />
        {children}
      </main>
    </div>
  );
}
