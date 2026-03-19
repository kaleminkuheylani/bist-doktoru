"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart2, ChevronUp, ChevronDown, Search,
  TrendingUp, TrendingDown, Activity, Clock,
} from "lucide-react";
import { useStocks, useBist } from "@/hooks/useMarketData";

type SortKey = "rate" | "price" | "hacim" | "min" | "max";
type TabKey  = "tumu" | "kazanan" | "kaybeden";

const rateColor = (r: number) =>
  r > 0 ? "oklch(0.70 0.18 160)" : r < 0 ? "oklch(0.60 0.22 25)" : "oklch(0.50 0.010 250)";

const rateBg = (r: number) =>
  r > 0 ? "oklch(0.70 0.18 160 / 0.06)" : r < 0 ? "oklch(0.60 0.22 25 / 0.06)" : "transparent";

export default function BistPage() {
  const [search,  setSearch]  = useState("");
  const [sortBy,  setSortBy]  = useState<SortKey>("rate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [tab,  setTab]  = useState<TabKey>("tumu");
  const [now, setNow]   = useState(new Date());

  const { data: stocks, loading } = useStocks();
  const { data: bist } = useBist();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const list = useMemo(() => stocks ?? [], [stocks]);

  const breadth = useMemo(() => ({
    up:    list.filter((s) => s.rate > 0).length,
    down:  list.filter((s) => s.rate < 0).length,
    flat:  list.filter((s) => s.rate === 0).length,
    total: list.length,
  }), [list]);

  const topGainers = useMemo(() => [...list].sort((a, b) => b.rate - a.rate).slice(0, 5), [list]);
  const topLosers  = useMemo(() => [...list].sort((a, b) => a.rate - b.rate).slice(0, 5), [list]);

  const displayed = useMemo(() => {
    let rows = list;
    if (tab === "kazanan")  rows = rows.filter((s) => s.rate > 0);
    if (tab === "kaybeden") rows = rows.filter((s) => s.rate < 0);
    if (search.trim()) {
      const q = search.trim().toUpperCase();
      rows = rows.filter((s) => s.code.includes(q) || (s.text ?? "").toUpperCase().includes(q));
    }
    return [...rows].sort((a, b) => {
      const va = sortBy === "rate" ? a.rate : sortBy === "price" ? a.lastprice : sortBy === "hacim" ? a.hacim : sortBy === "min" ? (a.min ?? 0) : (a.max ?? 0);
      const vb = sortBy === "rate" ? b.rate : sortBy === "price" ? b.lastprice : sortBy === "hacim" ? b.hacim : sortBy === "min" ? (b.min ?? 0) : (b.max ?? 0);
      return sortDir === "desc" ? vb - va : va - vb;
    });
  }, [list, tab, search, sortBy, sortDir]);

  const handleSort = (k: SortKey) => {
    if (sortBy === k) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortBy(k); setSortDir("desc"); }
  };

  const Th = ({ label, k, align = "right" }: { label: string; k: SortKey; align?: "left" | "right" }) => (
    <th
      onClick={() => handleSort(k)}
      className="px-3 py-2 cursor-pointer select-none whitespace-nowrap"
      style={{
        textAlign: align,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "11px",
        fontWeight: 600,
        color: sortBy === k ? "oklch(0.65 0.20 220)" : "oklch(0.42 0.010 250)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        background: "oklch(0.10 0.015 250)",
        borderBottom: "1px solid oklch(0.16 0.012 250)",
        userSelect: "none",
      }}>
      {label}{sortBy === k ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
    </th>
  );

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "oklch(0.08 0.015 250)" }}>

      {/* ═══ HEADER ══════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 px-5 py-3 border-b flex flex-wrap items-center gap-x-6 gap-y-2"
        style={{ borderColor: "oklch(0.16 0.012 250)", background: "oklch(0.10 0.015 250)" }}>

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
            <span className="text-2xl font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.95 0.005 250)" }}>
              {bist.currentstr}
            </span>
            <span className="flex items-center gap-0.5 text-base font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: rateColor(bist.changerate) }}>
              {bist.changerate >= 0 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {bist.changerate >= 0 ? "+" : ""}{bist.changeratestr}%
            </span>
            <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.42 0.010 250)" }}>
              {bist.minstr} — {bist.maxstr}
            </span>
          </div>
        ) : (
          <div className="h-7 w-40 rounded animate-pulse" style={{ background: "oklch(0.15 0.012 250)" }} />
        )}

        {breadth.total > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="flex items-center gap-1" style={{ color: "oklch(0.70 0.18 160)" }}>
                <TrendingUp className="w-3.5 h-3.5" /><strong>{breadth.up}</strong>
              </span>
              <span style={{ color: "oklch(0.25 0.010 250)" }}>|</span>
              <span className="flex items-center gap-1" style={{ color: "oklch(0.60 0.22 25)" }}>
                <TrendingDown className="w-3.5 h-3.5" /><strong>{breadth.down}</strong>
              </span>
              <span style={{ color: "oklch(0.25 0.010 250)" }}>|</span>
              <span style={{ color: "oklch(0.45 0.010 250)" }}>{breadth.flat}</span>
            </div>
            <div className="w-24 h-2 rounded-full overflow-hidden flex" style={{ background: "oklch(0.18 0.012 250)" }}>
              <div style={{ width: `${(breadth.up   / breadth.total) * 100}%`, background: "oklch(0.70 0.18 160)", transition: "width 1s" }} />
              <div style={{ width: `${(breadth.flat / breadth.total) * 100}%`, background: "oklch(0.30 0.010 250)" }} />
              <div style={{ width: `${(breadth.down / breadth.total) * 100}%`, background: "oklch(0.60 0.22 25)",  transition: "width 1s" }} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs ml-auto"
          style={{ color: "oklch(0.38 0.010 250)", fontFamily: "'JetBrains Mono', monospace" }}>
          <Clock className="w-3 h-3" />
          {now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })}
        </div>
      </div>

      {/* ═══ EN ÇOKLAR / EN AZLAR BANDI ═════════════════════════════════════ */}
      {!loading && list.length > 0 && (
        <div className="flex-shrink-0 px-5 py-2 border-b flex items-center gap-4 overflow-x-auto"
          style={{ borderColor: "oklch(0.13 0.012 250)", background: "oklch(0.09 0.013 250)" }}>
          <span className="text-xs font-semibold flex-shrink-0"
            style={{ color: "oklch(0.70 0.18 160)", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.06em" }}>
            EN ÇOKLAR
          </span>
          {topGainers.map((s) => (
            <div key={s.code} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md flex-shrink-0"
              style={{ background: "oklch(0.70 0.18 160 / 0.08)", border: "1px solid oklch(0.70 0.18 160 / 0.20)" }}>
              <span className="font-bold text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.92 0.005 250)" }}>{s.code}</span>
              <span className="font-mono text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.70 0.18 160)" }}>+{s.rate.toFixed(2)}%</span>
            </div>
          ))}
          <div className="w-px h-4 flex-shrink-0" style={{ background: "oklch(0.22 0.012 250)" }} />
          <span className="text-xs font-semibold flex-shrink-0"
            style={{ color: "oklch(0.60 0.22 25)", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.06em" }}>
            EN AZLAR
          </span>
          {topLosers.map((s) => (
            <div key={s.code} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md flex-shrink-0"
              style={{ background: "oklch(0.60 0.22 25 / 0.08)", border: "1px solid oklch(0.60 0.22 25 / 0.20)" }}>
              <span className="font-bold text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.92 0.005 250)" }}>{s.code}</span>
              <span className="font-mono text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.60 0.22 25)" }}>{s.rate.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      )}

      {/* ═══ KONTROL BARI ════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 px-5 py-2.5 border-b flex flex-wrap items-center gap-3"
        style={{ borderColor: "oklch(0.13 0.012 250)", background: "oklch(0.09 0.013 250)" }}>

        {/* Sekmeler */}
        <div className="flex gap-1">
          {([
            { k: "tumu",     label: "Tümü" },
            { k: "kazanan",  label: "▲ Yükselenler" },
            { k: "kaybeden", label: "▼ Düşenler" },
          ] as { k: TabKey; label: string }[]).map(({ k, label }) => (
            <button key={k} onClick={() => setTab(k)}
              className="px-3 py-1.5 rounded-md text-xs font-medium"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                background: tab === k ? "oklch(0.65 0.20 220 / 0.15)" : "transparent",
                border: `1px solid ${tab === k ? "oklch(0.65 0.20 220 / 0.40)" : "oklch(0.18 0.012 250)"}`,
                color: tab === k ? "oklch(0.65 0.20 220)" : "oklch(0.45 0.010 250)",
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Arama */}
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: "oklch(0.40 0.010 250)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Kod veya şirket ara..."
            className="pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none w-52"
            style={{
              background: "oklch(0.13 0.015 250)",
              border: "1px solid oklch(0.20 0.012 250)",
              color: "oklch(0.88 0.005 250)",
              fontFamily: "'Space Grotesk', sans-serif",
            }} />
        </div>

        <span className="text-xs" style={{ color: "oklch(0.38 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
          {displayed.length} hisse
        </span>
      </div>

      {/* ═══ CANLI BORSA TABLOSU ══════════════════════════════════════════════ */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Activity className="w-8 h-8 animate-pulse" style={{ color: "oklch(0.65 0.20 220)" }} />
            <span className="text-sm" style={{ color: "oklch(0.45 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
              Canlı veriler yükleniyor...
            </span>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <span className="text-sm" style={{ color: "oklch(0.42 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
              Sonuç bulunamadı
            </span>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr>
                <th className="px-4 py-2 text-left" style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", fontWeight: 600,
                  color: "oklch(0.42 0.010 250)", letterSpacing: "0.06em", textTransform: "uppercase",
                  background: "oklch(0.10 0.015 250)", borderBottom: "1px solid oklch(0.16 0.012 250)",
                }}>
                  Hisse
                </th>
                <Th label="Son Fiyat" k="price" />
                <Th label="Değişim %" k="rate" />
                <Th label="Hacim"     k="hacim" />
                <Th label="Min"       k="min" />
                <Th label="Max"       k="max" />
              </tr>
            </thead>
            <tbody>
              {displayed.map((s, i) => (
                <tr key={s.code}
                  style={{
                    background: rateBg(s.rate),
                    borderBottom: "1px solid oklch(0.11 0.012 250)",
                  }}>
                  {/* Hisse */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-8 rounded-full flex-shrink-0"
                        style={{ background: rateColor(s.rate) }} />
                      <div>
                        <div className="font-bold text-sm leading-tight"
                          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.92 0.005 250)" }}>
                          {s.code}
                        </div>
                        <div className="text-xs truncate max-w-[220px]"
                          style={{ color: "oklch(0.48 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
                          {s.text}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Son Fiyat */}
                  <td className="px-3 py-2.5 text-right">
                    <span className="font-mono font-bold text-sm"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.92 0.005 250)" }}>
                      ₺{s.lastpricestr}
                    </span>
                  </td>

                  {/* Değişim % */}
                  <td className="px-3 py-2.5 text-right">
                    <span className="inline-flex items-center gap-0.5 font-mono font-bold text-sm px-2 py-0.5 rounded"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: rateColor(s.rate),
                        background: s.rate > 0 ? "oklch(0.70 0.18 160 / 0.10)" : s.rate < 0 ? "oklch(0.60 0.22 25 / 0.10)" : "transparent",
                      }}>
                      {s.rate > 0 ? <ChevronUp className="w-3.5 h-3.5" /> : s.rate < 0 ? <ChevronDown className="w-3.5 h-3.5" /> : null}
                      {s.rate > 0 ? "+" : ""}{s.rate.toFixed(2)}%
                    </span>
                  </td>

                  {/* Hacim */}
                  <td className="px-3 py-2.5 text-right">
                    <span className="font-mono text-xs"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.55 0.010 250)" }}>
                      {s.hacimstr}
                    </span>
                  </td>

                  {/* Min */}
                  <td className="px-3 py-2.5 text-right">
                    <span className="font-mono text-xs"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.60 0.22 25 / 0.80)" }}>
                      {s.minstr ? `₺${s.minstr}` : "—"}
                    </span>
                  </td>

                  {/* Max */}
                  <td className="px-3 py-2.5 text-right">
                    <span className="font-mono text-xs"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.70 0.18 160 / 0.80)" }}>
                      {s.maxstr ? `₺${s.maxstr}` : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
