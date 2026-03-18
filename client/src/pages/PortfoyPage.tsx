/**
 * BIST Doktoru - Portföy Takip Sayfası
 * Hisse ve kripto portföy yönetimi + hesap makineleri
 */
import { useState, useMemo } from "react";
import { Briefcase, Plus, Trash2, Calculator, TrendingUp, ChevronUp, ChevronDown, PieChart } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type PortfolioItem = {
  id: string;
  symbol: string;
  name: string;
  type: "hisse" | "kripto";
  quantity: number;
  avgCost: number;
  currentPrice: number;
};

const DEFAULT_PORTFOLIO: PortfolioItem[] = [];

const COLORS = ["oklch(0.65 0.20 220)", "oklch(0.70 0.18 160)", "oklch(0.75 0.18 55)", "oklch(0.65 0.18 280)", "oklch(0.60 0.22 25)", "oklch(0.75 0.18 195)"];
const COLORS_HEX = ["#2962FF", "#00C896", "#F7931A", "#7B61FF", "#FF4757", "#00D4FF"];

export default function PortfoyPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(DEFAULT_PORTFOLIO);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"portfoy" | "hesap">("portfoy");
  const [newItem, setNewItem] = useState({ symbol: "", name: "", type: "hisse" as "hisse" | "kripto", quantity: "", avgCost: "", currentPrice: "" });

  // Calculator state
  const [calcType, setCalcType] = useState<"kar-zarar" | "hedef-fiyat" | "lot">("kar-zarar");
  const [calcInputs, setCalcInputs] = useState({ buyPrice: "", sellPrice: "", quantity: "", targetReturn: "", lotSize: "", pricePerLot: "" });

  const stats = useMemo(() => {
    let totalCost = 0;
    let totalValue = 0;
    portfolio.forEach((item) => {
      totalCost += item.quantity * item.avgCost;
      totalValue += item.quantity * item.currentPrice;
    });
    const totalPnl = totalValue - totalCost;
    const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
    return { totalCost, totalValue, totalPnl, totalPnlPct };
  }, [portfolio]);

  const pieData = portfolio.map((item) => ({
    name: item.symbol,
    value: item.quantity * item.currentPrice,
  }));

  const addItem = () => {
    if (!newItem.symbol || !newItem.quantity || !newItem.avgCost || !newItem.currentPrice) return;
    setPortfolio([...portfolio, {
      id: Date.now().toString(),
      symbol: newItem.symbol.toUpperCase(),
      name: newItem.name || newItem.symbol.toUpperCase(),
      type: newItem.type,
      quantity: parseFloat(newItem.quantity),
      avgCost: parseFloat(newItem.avgCost),
      currentPrice: parseFloat(newItem.currentPrice),
    }]);
    setNewItem({ symbol: "", name: "", type: "hisse", quantity: "", avgCost: "", currentPrice: "" });
    setShowAddForm(false);
  };

  const removeItem = (id: string) => setPortfolio(portfolio.filter((p) => p.id !== id));

  // Calculator results
  const calcResults = useMemo(() => {
    if (calcType === "kar-zarar") {
      const buy = parseFloat(calcInputs.buyPrice) || 0;
      const sell = parseFloat(calcInputs.sellPrice) || 0;
      const qty = parseFloat(calcInputs.quantity) || 0;
      const pnl = (sell - buy) * qty;
      const pnlPct = buy > 0 ? ((sell - buy) / buy) * 100 : 0;
      return { pnl, pnlPct, totalBuy: buy * qty, totalSell: sell * qty };
    }
    if (calcType === "hedef-fiyat") {
      const buy = parseFloat(calcInputs.buyPrice) || 0;
      const targetRet = parseFloat(calcInputs.targetReturn) || 0;
      const targetPrice = buy * (1 + targetRet / 100);
      return { targetPrice };
    }
    if (calcType === "lot") {
      const lotSize = parseFloat(calcInputs.lotSize) || 0;
      const pricePerLot = parseFloat(calcInputs.pricePerLot) || 0;
      const total = lotSize * pricePerLot;
      return { total };
    }
    return {};
  }, [calcType, calcInputs]);

  const inputStyle = {
    background: "oklch(0.14 0.015 250)",
    border: "1px solid oklch(0.22 0.012 250)",
    color: "oklch(0.90 0.005 250)",
    fontFamily: "'JetBrains Mono', monospace",
    borderRadius: "0.5rem",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
  };

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
            style={{ background: "oklch(0.65 0.18 280 / 0.15)" }}
          >
            <Briefcase className="w-4 h-4" style={{ color: "oklch(0.65 0.18 280)" }} />
          </div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
            Portföy Takip
          </h1>
        </div>
        <p className="text-sm ml-11" style={{ color: "oklch(0.55 0.010 250)" }}>
          Hisse ve kripto portföyünüzü yönetin, kâr/zarar hesaplayın
        </p>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "portfoy", label: "Portföyüm", icon: Briefcase },
            { key: "hesap", label: "Hesap Makinesi", icon: Calculator },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "portfoy" | "hesap")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: activeTab === tab.key ? "oklch(0.65 0.20 220 / 0.15)" : "oklch(0.13 0.015 250)",
                  border: `1px solid ${activeTab === tab.key ? "oklch(0.65 0.20 220 / 0.4)" : "oklch(0.20 0.012 250)"}`,
                  color: activeTab === tab.key ? "oklch(0.65 0.20 220)" : "oklch(0.60 0.010 250)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "portfoy" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Toplam Maliyet", value: `₺${stats.totalCost.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`, sub: "Alış maliyeti", up: null },
                { label: "Güncel Değer", value: `₺${stats.totalValue.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`, sub: "Piyasa değeri", up: null },
                { label: "Kâr / Zarar", value: `₺${stats.totalPnl.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`, sub: "Net kâr/zarar", up: stats.totalPnl >= 0 },
                { label: "Getiri Oranı", value: `%${stats.totalPnlPct.toFixed(2)}`, sub: "Toplam getiri", up: stats.totalPnlPct >= 0 },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl p-4"
                  style={{ background: "oklch(0.12 0.015 250)", border: "1px solid oklch(0.20 0.012 250)" }}
                >
                  <div className="text-xs mb-1" style={{ color: "oklch(0.55 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {card.label}
                  </div>
                  <div
                    className="font-bold text-lg font-mono"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: card.up === null ? "oklch(0.95 0.005 250)" : card.up ? "oklch(0.70 0.18 160)" : "oklch(0.60 0.22 25)",
                    }}
                  >
                    {card.up !== null && (card.up ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
                    {card.value}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "oklch(0.50 0.010 250)" }}>
                    {card.sub}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Portfolio Table */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.90 0.005 250)" }}>
                    Portföy Listesi
                  </h2>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                    style={{
                      background: "oklch(0.65 0.20 220 / 0.15)",
                      border: "1px solid oklch(0.65 0.20 220 / 0.3)",
                      color: "oklch(0.65 0.20 220)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Hisse Ekle
                  </button>
                </div>

                {/* Add Form */}
                {showAddForm && (
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{ background: "oklch(0.13 0.015 250)", border: "1px solid oklch(0.65 0.20 220 / 0.3)" }}
                  >
                    <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.85 0.005 250)" }}>
                      Yeni Pozisyon Ekle
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: "oklch(0.55 0.010 250)" }}>Sembol</label>
                        <input style={inputStyle} placeholder="THYAO" value={newItem.symbol} onChange={(e) => setNewItem({ ...newItem, symbol: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: "oklch(0.55 0.010 250)" }}>Şirket Adı</label>
                        <input style={inputStyle} placeholder="Türk Hava Yolları" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: "oklch(0.55 0.010 250)" }}>Tür</label>
                        <select
                          style={{ ...inputStyle, cursor: "pointer" }}
                          value={newItem.type}
                          onChange={(e) => setNewItem({ ...newItem, type: e.target.value as "hisse" | "kripto" })}
                        >
                          <option value="hisse">Hisse</option>
                          <option value="kripto">Kripto</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: "oklch(0.55 0.010 250)" }}>Adet / Miktar</label>
                        <input style={inputStyle} placeholder="100" type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: "oklch(0.55 0.010 250)" }}>Ortalama Maliyet (₺)</label>
                        <input style={inputStyle} placeholder="280.00" type="number" value={newItem.avgCost} onChange={(e) => setNewItem({ ...newItem, avgCost: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: "oklch(0.55 0.010 250)" }}>Güncel Fiyat (₺)</label>
                        <input style={inputStyle} placeholder="312.50" type="number" value={newItem.currentPrice} onChange={(e) => setNewItem({ ...newItem, currentPrice: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addItem}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                        style={{ background: "oklch(0.65 0.20 220)", color: "white", fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        Ekle
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold"
                        style={{ background: "oklch(0.18 0.012 250)", color: "oklch(0.65 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                {/* Table */}
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid oklch(0.20 0.012 250)" }}>
                  <div
                    className="grid grid-cols-6 px-4 py-2.5 text-xs font-semibold"
                    style={{ background: "oklch(0.13 0.015 250)", borderBottom: "1px solid oklch(0.20 0.012 250)", color: "oklch(0.55 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <span className="col-span-2">Hisse / Kripto</span>
                    <span className="text-right">Maliyet</span>
                    <span className="text-right">Güncel</span>
                    <span className="text-right">K/Z</span>
                    <span className="text-right">İşlem</span>
                  </div>
                  {portfolio.map((item, i) => {
                    const cost = item.quantity * item.avgCost;
                    const value = item.quantity * item.currentPrice;
                    const pnl = value - cost;
                    const pnlPct = (pnl / cost) * 100;
                    const up = pnl >= 0;
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-6 px-4 py-3"
                        style={{
                          borderBottom: i < portfolio.length - 1 ? "1px solid oklch(0.15 0.012 250)" : "none",
                          background: i % 2 === 0 ? "oklch(0.11 0.015 250)" : "oklch(0.105 0.015 250)",
                        }}
                      >
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{
                                background: item.type === "hisse" ? "oklch(0.65 0.20 220 / 0.1)" : "oklch(0.75 0.18 55 / 0.1)",
                                color: item.type === "hisse" ? "oklch(0.65 0.20 220)" : "oklch(0.75 0.18 55)",
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {item.type === "hisse" ? "H" : "K"}
                            </span>
                            <div>
                              <div className="font-bold text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.90 0.005 250)" }}>
                                {item.symbol}
                              </div>
                              <div className="text-xs" style={{ color: "oklch(0.45 0.010 250)" }}>
                                {item.quantity} adet
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right font-mono text-xs flex items-center justify-end" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.70 0.010 250)" }}>
                          ₺{cost.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-right font-mono text-xs flex items-center justify-end" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.90 0.005 250)" }}>
                          ₺{value.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
                        </div>
                        <div className="flex flex-col items-end justify-center">
                          <span
                            className="text-xs font-mono"
                            style={{ fontFamily: "'JetBrains Mono', monospace", color: up ? "oklch(0.70 0.18 160)" : "oklch(0.60 0.22 25)" }}
                          >
                            {up ? "+" : ""}₺{pnl.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
                          </span>
                          <span
                            className="text-xs font-mono"
                            style={{ fontFamily: "'JetBrains Mono', monospace", color: up ? "oklch(0.70 0.18 160)" : "oklch(0.60 0.22 25)" }}
                          >
                            {up ? "+" : ""}{pnlPct.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 rounded transition-colors hover:bg-red-500/20"
                            style={{ color: "oklch(0.50 0.010 250)" }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pie Chart */}
              <div>
                <h2 className="font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.90 0.005 250)" }}>
                  Dağılım
                </h2>
                <div
                  className="rounded-xl p-4"
                  style={{ background: "oklch(0.12 0.015 250)", border: "1px solid oklch(0.20 0.012 250)" }}
                >
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPie>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS_HEX[index % COLORS_HEX.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`₺${value.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`, "Değer"]}
                        contentStyle={{ background: "oklch(0.14 0.015 250)", border: "1px solid oklch(0.25 0.012 250)", borderRadius: "0.5rem", color: "oklch(0.90 0.005 250)" }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-3">
                    {portfolio.map((item, i) => {
                      const value = item.quantity * item.currentPrice;
                      const pct = (value / stats.totalValue) * 100;
                      return (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS_HEX[i % COLORS_HEX.length] }} />
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.80 0.005 250)" }}>
                              {item.symbol}
                            </span>
                          </div>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.65 0.010 250)" }}>
                            %{pct.toFixed(1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "hesap" && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
              Yatırım Hesap Makinesi
            </h2>

            {/* Calc Type Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {[
                { key: "kar-zarar", label: "Kâr / Zarar" },
                { key: "hedef-fiyat", label: "Hedef Fiyat" },
                { key: "lot", label: "Lot Hesabı" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setCalcType(t.key as typeof calcType)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: calcType === t.key ? "oklch(0.65 0.20 220 / 0.15)" : "oklch(0.13 0.015 250)",
                    border: `1px solid ${calcType === t.key ? "oklch(0.65 0.20 220 / 0.4)" : "oklch(0.20 0.012 250)"}`,
                    color: calcType === t.key ? "oklch(0.65 0.20 220)" : "oklch(0.60 0.010 250)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div
              className="rounded-xl p-6"
              style={{ background: "oklch(0.12 0.015 250)", border: "1px solid oklch(0.20 0.012 250)" }}
            >
              {calcType === "kar-zarar" && (
                <div className="space-y-4">
                  <h3 className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.85 0.005 250)" }}>
                    Kâr / Zarar Hesaplama
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "oklch(0.55 0.010 250)" }}>Alış Fiyatı (₺)</label>
                      <input style={inputStyle} type="number" placeholder="280.00" value={calcInputs.buyPrice} onChange={(e) => setCalcInputs({ ...calcInputs, buyPrice: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "oklch(0.55 0.010 250)" }}>Satış Fiyatı (₺)</label>
                      <input style={inputStyle} type="number" placeholder="312.50" value={calcInputs.sellPrice} onChange={(e) => setCalcInputs({ ...calcInputs, sellPrice: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "oklch(0.55 0.010 250)" }}>Adet</label>
                      <input style={inputStyle} type="number" placeholder="100" value={calcInputs.quantity} onChange={(e) => setCalcInputs({ ...calcInputs, quantity: e.target.value })} />
                    </div>
                  </div>
                  {calcInputs.buyPrice && calcInputs.sellPrice && calcInputs.quantity && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      {[
                        { label: "Toplam Maliyet", value: `₺${(calcResults as any).totalBuy?.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}` },
                        { label: "Toplam Satış", value: `₺${(calcResults as any).totalSell?.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}` },
                        { label: "Kâr / Zarar", value: `₺${(calcResults as any).pnl?.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`, highlight: true, up: (calcResults as any).pnl >= 0 },
                        { label: "Getiri %", value: `%${(calcResults as any).pnlPct?.toFixed(2)}`, highlight: true, up: (calcResults as any).pnlPct >= 0 },
                      ].map((r) => (
                        <div key={r.label} className="rounded-lg p-3" style={{ background: "oklch(0.15 0.015 250)", border: "1px solid oklch(0.22 0.012 250)" }}>
                          <div className="text-xs mb-1" style={{ color: "oklch(0.50 0.010 250)" }}>{r.label}</div>
                          <div
                            className="font-bold font-mono text-sm"
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              color: r.highlight ? (r.up ? "oklch(0.70 0.18 160)" : "oklch(0.60 0.22 25)") : "oklch(0.90 0.005 250)",
                            }}
                          >
                            {r.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {calcType === "hedef-fiyat" && (
                <div className="space-y-4">
                  <h3 className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.85 0.005 250)" }}>
                    Hedef Fiyat Hesaplama
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "oklch(0.55 0.010 250)" }}>Mevcut / Alış Fiyatı (₺)</label>
                      <input style={inputStyle} type="number" placeholder="280.00" value={calcInputs.buyPrice} onChange={(e) => setCalcInputs({ ...calcInputs, buyPrice: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "oklch(0.55 0.010 250)" }}>Hedef Getiri (%)</label>
                      <input style={inputStyle} type="number" placeholder="20" value={calcInputs.targetReturn} onChange={(e) => setCalcInputs({ ...calcInputs, targetReturn: e.target.value })} />
                    </div>
                  </div>
                  {calcInputs.buyPrice && calcInputs.targetReturn && (
                    <div className="rounded-lg p-4 mt-2" style={{ background: "oklch(0.65 0.20 220 / 0.08)", border: "1px solid oklch(0.65 0.20 220 / 0.2)" }}>
                      <div className="text-xs mb-1" style={{ color: "oklch(0.65 0.20 220)" }}>Hedef Fiyat</div>
                      <div className="font-bold text-2xl font-mono" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.95 0.005 250)" }}>
                        ₺{(calcResults as any).targetPrice?.toFixed(2)}
                      </div>
                      <div className="text-xs mt-1" style={{ color: "oklch(0.55 0.010 250)" }}>
                        {parseFloat(calcInputs.buyPrice).toFixed(2)} × (1 + {calcInputs.targetReturn}/100)
                      </div>
                    </div>
                  )}
                </div>
              )}

              {calcType === "lot" && (
                <div className="space-y-4">
                  <h3 className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.85 0.005 250)" }}>
                    Lot Hesabı
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "oklch(0.55 0.010 250)" }}>Lot Sayısı</label>
                      <input style={inputStyle} type="number" placeholder="100" value={calcInputs.lotSize} onChange={(e) => setCalcInputs({ ...calcInputs, lotSize: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "oklch(0.55 0.010 250)" }}>Lot Başı Fiyat (₺)</label>
                      <input style={inputStyle} type="number" placeholder="312.50" value={calcInputs.pricePerLot} onChange={(e) => setCalcInputs({ ...calcInputs, pricePerLot: e.target.value })} />
                    </div>
                  </div>
                  {calcInputs.lotSize && calcInputs.pricePerLot && (
                    <div className="rounded-lg p-4 mt-2" style={{ background: "oklch(0.70 0.18 160 / 0.08)", border: "1px solid oklch(0.70 0.18 160 / 0.2)" }}>
                      <div className="text-xs mb-1" style={{ color: "oklch(0.70 0.18 160)" }}>Toplam Tutar</div>
                      <div className="font-bold text-2xl font-mono" style={{ fontFamily: "'JetBrains Mono', monospace", color: "oklch(0.95 0.005 250)" }}>
                        ₺{(calcResults as any).total?.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-xs mt-1" style={{ color: "oklch(0.55 0.010 250)" }}>
                        {calcInputs.lotSize} lot × ₺{parseFloat(calcInputs.pricePerLot).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
