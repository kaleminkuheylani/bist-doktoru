/**
 * BIST Doktoru — BIST Hisse Senetleri
 * D3.js ile anlık veri görselleştirmesi — TradingView yok
 */
import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart2, ChevronUp, ChevronDown, Search,
  TrendingUp, TrendingDown, Activity, Clock, Map, BarChart,
} from "lucide-react";
import { useStocks, useBist } from "@/hooks/useMarketData";
import MarketHeatmap   from "@/components/MarketHeatmap";
import GainersChart    from "@/components/GainersChart";

// ─── Sektör eşleştirme ──────────────────────────────────────────────────────
const SECTOR_MAP: Record<string, string> = {
  BANKA: "Bankacılık", FINANS: "Bankacılık", KREDI: "Bankacılık",
  HAVA: "Ulaşım", PEGASUS: "Ulaşım", TASIMACILIK: "Ulaşım",
  DEMIR: "Metal", CELIK: "Metal", ALUM: "Metal",
  HOLDING: "Holding", KOC: "Holding", SABANCI: "Holding",
  ENERJI: "Enerji", PETROL: "Enerji", GAZ: "Enerji",
  OTOMOT: "Otomotiv", FORD: "Otomotiv", TOFAS: "Otomotiv",
  TELEKOM: "Telekomünikasyon", TURKCELL: "Telekomünikasyon",
  SAVUNMA: "Savunma", ASELSAN: "Savunma",
  PERAKENDE: "Perakende", MIGROS: "Perakende", BIM: "Perakende",
};

function getSector(text: string): string {
  const up = text.toUpperCase();
  for (const [kw, s] of Object.entries(SECTOR_MAP)) {
    if (up.includes(kw)) return s;
  }
  return "Diğer";
}

const SECTORS = [
  "Tümü", "Bankacılık", "Holding", "Ulaşım", "Savunma",
  "Metal", "Enerji", "Otomotiv", "Perakende", "Telekomünikasyon", "Diğer",
];

type SortKey = "rate" | "price" | "hacim";
type TabKey  = "tumu" | "kazanan" | "kaybeden";
type ViewKey = "heatmap" | "bars";

const rateColor = (r: number) =>
  r > 0 ? "oklch(0.70 0.18 160)" : r < 0 ? "oklch(0.60 0.22 25)" : "oklch(0.50 0.010 250)";

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────
export default function BistPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("THYAO");
  const [selectedSector, setSelectedSector] = useState("Tümü");
  const [search,  setSearch]  = useState("");
  const [sortBy,  setSortBy]  = useState<SortKey>("rate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [tab,  setTab]  = useState<TabKey>("tumu");
  const [view, setView] = useState<ViewKey>("heatmap");
  const [now, setNow]   = useState(new Date());

  const { data: stocks, loading } = useStocks();
  const { data: bist } = useBist();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const enriched = useMemo(
    () => (stocks ?? []).map((s) => ({ ...s, sector: getSector(s.text) })),
    [stocks]
  );

  const breadth = useMemo(() => ({
    up:   enriched.filter((s) => s.rate > 0).length,
    down: enriched.filter((s) => s.rate < 0).length,
    flat: enriched.filter((s) => s.rate === 0).length,
    total: enriched.length,
  }), [enriched]);

  const topGainers = useMemo(() => [...enriched].sort((a, b) => b.rate - a.rate).slice(0, 5), [enriched]);
  const topLosers  = useMemo(() => [...enriched].sort((a, b) => a.rate - b.rate).slice(0, 5), [enriched]);

  const displayed = useMemo(() => {
    let list = enriched;
    if (tab === "kazanan")  list = list.filter((s) => s.rate > 0);
    if (tab === "kaybeden") list = list.filter((s) => s.rate < 0);
    if (selectedSector !== "Tümü") list = list.filter((s) => s.sector === selectedSector);
    if (search.trim()) {
      const q = search.trim().toUpperCase();
      list = list.filter((s) => s.code.includes(q) || s.text.toUpperCase().includes(q));
    }
    return [...list].sort((a, b) => {
      const va = sortBy === "rate" ? a.rate : sortBy === "price" ? a.lastprice : a.hacim;
      const vb = sortBy === "rate" ? b.rate : sortBy === "price" ? b.lastprice : b.hacim;
      return sortDir === "desc" ? vb - va : va - vb;
    });
  }, [enriched, tab, selectedSector, search, sortBy, sortDir]);

  const selectedStock = enriched.find((s) => s.code === selectedSymbol) ?? null;

  useEffect(() => {
    if (displayed.length > 0 && !displayed.find((s) => s.code === selectedSymbol)) {
      setSelectedSymbol(displayed[0].code);
    }
  }, [selectedSector, tab]);

  const handleSort = (k: SortKey) => {
    if (sortBy === k) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortBy(k); setSortDir("desc"); }
  };

  const SortBtn = ({ label, k }: { label: string; k: SortKey }) => (
    <button onClick={() => handleSort(k)}
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "11px",
        color: sortBy === k ? "oklch(0.65 0.20 220)" : "oklch(0.45 0.010 250)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}>
      {label}{sortBy === k ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
    </button>
  );

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 46px)", background: "oklch(0.08 0.015 250)" }}>

      {/* ═══ HEADER ═══════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 px-5 py-3 border-b flex flex-wrap items-center gap-x-6 gap-y-2"
        style={{ borderColor: "oklch(0.18 0.012 250)", background: "oklch(0.10 0.015 250)" }}>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.65 0.20 220 / 0.15)" }}>
            <BarChart2 className="w-4 h-4" style={{ color: "oklch(0.65 0.20 220)" }} />
          </div>
          <span className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.65 0.20 220)" }}>
            BIST 100
          </span>
        </div>

        {bist ? (
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold font-mono"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.95 0.005 250)" }}>
              {bist.currentstr}
            </span>
            <span className="flex items-center gap-0.5 text-base font-mono font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: rateColor(bist.changerate) }}>
              {bist.changerate >= 0 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {bist.changerate >= 0 ? "+" : ""}{bist.changeratestr}%
            </span>
            <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.45 0.010 250)" }}>
              Min {bist.minstr} · Max {bist.maxstr}
            </span>
          </div>
        ) : (
          <div className="h-7 w-40 rounded animate-pulse" style={{ background: "oklch(0.15 0.012 250)" }} />
        )}

        {breadth.total > 0 && (
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="flex items-center gap-1" style={{ color: "oklch(0.70 0.18 160)" }}>
                <TrendingUp className="w-3.5 h-3.5" />
                <strong>{breadth.up}</strong>
              </span>
              <span style={{ color: "oklch(0.25 0.010 250)" }}>|</span>
              <span className="flex items-center gap-1" style={{ color: "oklch(0.60 0.22 25)" }}>
                <TrendingDown className="w-3.5 h-3.5" />
                <strong>{breadth.down}</strong>
              </span>
              <span style={{ color: "oklch(0.25 0.010 250)" }}>|</span>
              <span style={{ color: "oklch(0.45 0.010 250)" }}>{breadth.flat}</span>
            </div>
            <div className="w-28 h-2.5 rounded-full overflow-hidden flex"
              style={{ background: "oklch(0.18 0.012 250)" }}>
              <div style={{ width: `${(breadth.up   / breadth.total) * 100}%`, background: "oklch(0.70 0.18 160)", transition: "width 1s" }} />
              <div style={{ width: `${(breadth.flat / breadth.total) * 100}%`, background: "oklch(0.30 0.010 250)" }} />
              <div style={{ width: `${(breadth.down / breadth.total) * 100}%`, background: "oklch(0.60 0.22 25)"  }} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs"
          style={{ color: "oklch(0.40 0.010 250)", fontFamily: "'JetBrains Mono', monospace" }}>
          <Clock className="w-3 h-3" />
          {now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })}
        </div>
      </div>

      {/* ═══ KAZANAN / KAYBEDEN BANDI ═════════════════════════════════════ */}
      {!loading && enriched.length > 0 && (
        <div className="flex-shrink-0 px-5 py-2 border-b flex items-center gap-4 overflow-x-auto"
          style={{ borderColor: "oklch(0.14 0.012 250)", background: "oklch(0.09 0.013 250)" }}>
          <span className="text-xs font-semibold flex-shrink-0"
            style={{ color: "oklch(0.70 0.18 160)", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em" }}>
            EN ÇOKLAR
          </span>
          {topGainers.map((s) => (
            <button key={s.code} onClick={() => setSelectedSymbol(s.code)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md flex-shrink-0"
              style={{ background: "oklch(0.70 0.18 160 / 0.08)", border: "1px solid oklch(0.70 0.18 160 / 0.20)" }}>
              <span className="font-bold text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.92 0.005 250)" }}>{s.code}</span>
              <span className="font-mono text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.70 0.18 160)" }}>+{s.rate.toFixed(2)}%</span>
            </button>
          ))}
          <div className="w-px h-4 flex-shrink-0" style={{ background: "oklch(0.22 0.012 250)" }} />
          <span className="text-xs font-semibold flex-shrink-0"
            style={{ color: "oklch(0.60 0.22 25)", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em" }}>
            EN AZLAR
          </span>
          {topLosers.map((s) => (
            <button key={s.code} onClick={() => setSelectedSymbol(s.code)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md flex-shrink-0"
              style={{ background: "oklch(0.60 0.22 25 / 0.08)", border: "1px solid oklch(0.60 0.22 25 / 0.20)" }}>
              <span className="font-bold text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.92 0.005 250)" }}>{s.code}</span>
              <span className="font-mono text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.60 0.22 25)" }}>{s.rate.toFixed(2)}%</span>
            </button>
          ))}
        </div>
      )}

      {/* ═══ ANA İÇERİK ════════════════════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0">

        {/* ── Sol: Hisse Listesi ─────────────────────────────────────────── */}
        <div className="flex flex-col border-r flex-shrink-0"
          style={{ width: "260px", borderColor: "oklch(0.16 0.012 250)", background: "oklch(0.09 0.013 250)" }}>

          {/* Arama */}
          <div className="p-2.5 border-b" style={{ borderColor: "oklch(0.14 0.012 250)" }}>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                style={{ color: "oklch(0.40 0.010 250)" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Kod veya şirket ara..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none"
                style={{
                  background: "oklch(0.13 0.015 250)",
                  border: "1px solid oklch(0.20 0.012 250)",
                  color: "oklch(0.88 0.005 250)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }} />
            </div>
          </div>

          {/* Sekmeler */}
          <div className="flex border-b" style={{ borderColor: "oklch(0.14 0.012 250)" }}>
            {([
              { k: "tumu",     label: "Tümü" },
              { k: "kazanan",  label: "▲" },
              { k: "kaybeden", label: "▼" },
            ] as { k: TabKey; label: string }[]).map(({ k, label }) => (
              <button key={k} onClick={() => setTab(k)}
                className="flex-1 py-2 text-xs font-medium"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: tab === k ? "oklch(0.65 0.20 220)" : "oklch(0.45 0.010 250)",
                  borderBottom: tab === k ? "2px solid oklch(0.65 0.20 220)" : "2px solid transparent",
                  background: "transparent",
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Sektör Filtreleri */}
          <div className="px-2.5 py-2 border-b flex gap-1.5 overflow-x-auto"
            style={{ borderColor: "oklch(0.14 0.012 250)" }}>
            {SECTORS.map((s) => (
              <button key={s} onClick={() => setSelectedSector(s)}
                className="px-2 py-1 rounded text-xs whitespace-nowrap flex-shrink-0"
                style={{
                  background: selectedSector === s ? "oklch(0.65 0.20 220 / 0.18)" : "oklch(0.13 0.015 250)",
                  border: `1px solid ${selectedSector === s ? "oklch(0.65 0.20 220 / 0.50)" : "oklch(0.20 0.012 250)"}`,
                  color: selectedSector === s ? "oklch(0.65 0.20 220)" : "oklch(0.50 0.010 250)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                {s}
              </button>
            ))}
          </div>

          {/* Sütun başlıkları */}
          <div className="flex items-center px-3 py-1.5 text-xs border-b"
            style={{ borderColor: "oklch(0.14 0.012 250)" }}>
            <span className="flex-1" style={{ color: "oklch(0.45 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>Hisse</span>
            <div className="flex gap-3">
              <SortBtn label="Fiyat" k="price" />
              <SortBtn label="Hacim" k="hacim" />
              <SortBtn label="%" k="rate" />
            </div>
          </div>

          {/* Satırlar */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <Activity className="w-5 h-5 animate-pulse" style={{ color: "oklch(0.65 0.20 220)" }} />
                <span className="text-xs animate-pulse"
                  style={{ color: "oklch(0.40 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  CollectAPI'den yükleniyor...
                </span>
              </div>
            ) : displayed.length === 0 ? (
              <div className="flex items-center justify-center h-24">
                <span className="text-xs" style={{ color: "oklch(0.40 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Sonuç bulunamadı
                </span>
              </div>
            ) : displayed.map((s, i) => {
              const isSel = s.code === selectedSymbol;
              return (
                <div key={s.code}
                  className="flex items-center px-3 py-2.5 cursor-pointer transition-all duration-100"
                  style={{
                    background: isSel ? "oklch(0.65 0.20 220 / 0.10)" : "transparent",
                    borderLeft: `2px solid ${isSel ? "oklch(0.65 0.20 220)" : "transparent"}`,
                    borderBottom: i < displayed.length - 1 ? "1px solid oklch(0.12 0.012 250)" : "none",
                  }}
                  onClick={() => setSelectedSymbol(s.code)}>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs leading-tight"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: isSel ? "oklch(0.65 0.20 220)" : "oklch(0.90 0.005 250)" }}>
                      {s.code}
                    </div>
                    <div className="truncate" style={{ color: "oklch(0.38 0.010 250)", fontFamily: "'Space Grotesk', sans-serif", fontSize: "10px" }}>
                      {s.sector}
                    </div>
                  </div>
                  <div className="font-mono text-xs w-16 text-right"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.85 0.005 250)" }}>
                    ₺{s.lastpricestr}
                  </div>
                  <div className="font-mono text-xs w-16 text-right"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: rateColor(s.rate) }}>
                    {s.rate > 0 ? "+" : ""}{s.rate.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-3 py-1.5 border-t text-xs flex justify-between"
            style={{ borderColor: "oklch(0.14 0.012 250)", color: "oklch(0.38 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
            <span>{displayed.length} hisse</span>
            {stocks && <span>{stocks.length} toplam</span>}
          </div>
        </div>

        {/* ── Sağ: D3 Görselleştirme ────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* Seçili hisse özeti */}
          <div className="flex-shrink-0 px-5 py-3 border-b flex flex-wrap items-center gap-x-6 gap-y-2"
            style={{ borderColor: "oklch(0.18 0.012 250)", background: "oklch(0.10 0.015 250)" }}>
            {selectedStock ? (
              <>
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-xl font-bold"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
                      {selectedStock.code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs"
                      style={{ background: "oklch(0.65 0.20 220 / 0.12)", color: "oklch(0.65 0.20 220)", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {selectedStock.sector}
                    </span>
                  </div>
                  <div className="text-xs mt-0.5 truncate max-w-xs"
                    style={{ color: "oklch(0.45 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {selectedStock.text}
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.95 0.005 250)" }}>
                    ₺{selectedStock.lastpricestr}
                  </span>
                  <span className="flex items-center gap-0.5 text-lg font-bold"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: rateColor(selectedStock.rate) }}>
                    {selectedStock.rate > 0 ? <ChevronUp className="w-5 h-5" /> : selectedStock.rate < 0 ? <ChevronDown className="w-5 h-5" /> : null}
                    {selectedStock.rate > 0 ? "+" : ""}{selectedStock.rate.toFixed(2)}%
                  </span>
                </div>

                <div className="ml-auto text-xs"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <div style={{ color: "oklch(0.40 0.010 250)" }}>Hacim</div>
                  <div style={{ color: "oklch(0.80 0.005 250)" }}>{selectedStock.hacimstr}</div>
                </div>
              </>
            ) : (
              <span className="text-sm" style={{ color: "oklch(0.45 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
                Listeden veya haritadan bir hisse seçin
              </span>
            )}

            {/* Görünüm seçici */}
            <div className="flex gap-1 ml-auto">
              {([
                { k: "heatmap", icon: <Map className="w-4 h-4" />,     label: "Isı Haritası" },
                { k: "bars",    icon: <BarChart className="w-4 h-4" />, label: "Kazanan/Kaybeden" },
              ] as { k: ViewKey; icon: React.ReactNode; label: string }[]).map(({ k, icon, label }) => (
                <button key={k} onClick={() => setView(k)}
                  title={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{
                    background: view === k ? "oklch(0.65 0.20 220 / 0.15)" : "oklch(0.13 0.015 250)",
                    border: `1px solid ${view === k ? "oklch(0.65 0.20 220 / 0.40)" : "oklch(0.20 0.012 250)"}`,
                    color: view === k ? "oklch(0.65 0.20 220)" : "oklch(0.50 0.010 250)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}>
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* D3 Görselleştirme Alanı */}
          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Activity className="w-8 h-8 animate-pulse" style={{ color: "oklch(0.65 0.20 220)" }} />
                <span className="text-sm" style={{ color: "oklch(0.45 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Hisse verileri yükleniyor...
                </span>
              </div>
            ) : enriched.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <BarChart2 className="w-10 h-10" style={{ color: "oklch(0.30 0.012 250)" }} />
                <div className="text-center">
                  <div className="text-sm font-medium mb-1" style={{ color: "oklch(0.55 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    Veri bulunamadı
                  </div>
                  <div className="text-xs" style={{ color: "oklch(0.40 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    Twelve Data'dan veri alınamadı — piyasa kapalı veya API limiti aşıldı                  </div>
                </div>
              </div>
            ) : view === "heatmap" ? (
              <MarketHeatmap
                stocks={enriched}
                selectedSymbol={selectedSymbol}
                onSelect={setSelectedSymbol}
              />
            ) : (
              <div className="h-full overflow-y-auto">
                <GainersChart stocks={enriched} onSelect={setSelectedSymbol} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
