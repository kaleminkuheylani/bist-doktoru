/**
 * MarketHeatmap — D3.js Treemap
 * Sektöre göre gruplanmış, hacme göre boyutlandırılmış, değişime göre renklendirilmiş
 */
import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

export type HeatmapStock = {
  code: string;
  text: string;
  lastpricestr: string;
  rate: number;
  hacim: number;
  hacimstr: string;
  sector: string;
};

interface Props {
  stocks: HeatmapStock[];
  selectedSymbol: string;
  onSelect: (code: string) => void;
}

// % değişime göre hücre arka plan rengi
function rateColor(r: number): string {
  if (r <= -5)  return "#7f1d1d";
  if (r <= -3)  return "#991b1b";
  if (r <= -1)  return "#b91c1c";
  if (r <  0)   return "#dc2626";
  if (r === 0)  return "#1f2937";
  if (r <  1)   return "#15803d";
  if (r <  3)   return "#166534";
  if (r <  5)   return "#14532d";
  return "#052e16";
}

// Küçük hücrelerde metin okunabilirliği için daha açık renk
function textColor(r: number): string {
  return Math.abs(r) < 0.3 ? "#6b7280" : "#f9fafb";
}

type Tooltip = { x: number; y: number; stock: HeatmapStock };

export default function MarketHeatmap({ stocks, selectedSymbol, onSelect }: Props) {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const svgRef     = useRef<SVGSVGElement>(null);
  const [size, setSize]       = useState({ w: 0, h: 0 });
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  // Responsive boyutlandırma
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) setSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const drawChart = useCallback(() => {
    if (!svgRef.current || size.w === 0 || size.h === 0 || stocks.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Sektöre göre grupla
    const byS = d3.group(stocks, (s) => s.sector);
    const root = d3.hierarchy<any>({
      name: "root",
      children: Array.from(byS, ([sector, items]) => ({
        name: sector,
        children: items.map((s) => ({ ...s, value: Math.max(s.hacim, 1) })),
      })),
    })
      .sum((d: any) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const layout = d3.treemap<any>()
      .size([size.w, size.h])
      .paddingOuter(4)
      .paddingTop(20)
      .paddingInner(1);

    layout(root);
    const rectRoot = root as unknown as d3.HierarchyRectangularNode<any>;

    // Sektör etiketleri
    svg.selectAll<SVGTextElement, d3.HierarchyRectangularNode<any>>(".slabel")
      .data(rectRoot.children ?? [])
      .join("text")
      .attr("class", "slabel")
      .attr("x", (d) => d.x0 + 5)
      .attr("y", (d) => d.y0 + 13)
      .attr("font-size", "9px")
      .attr("font-family", "'Space Grotesk', sans-serif")
      .attr("font-weight", "700")
      .attr("letter-spacing", "0.07em")
      .attr("fill", "#6b7280")
      .text((d) => String(d.data.name).toUpperCase())
      .each(function (d) {
        const avail = d.x1 - d.x0 - 8;
        const node = this as SVGTextElement;
        let text = node.textContent ?? "";
        node.textContent = text;
        // Truncate if needed
        while (node.getComputedTextLength && node.getComputedTextLength() > avail && text.length > 1) {
          text = text.slice(0, -1);
          node.textContent = text + "…";
        }
      });

    // Hücre grupları
    const leaves = rectRoot.leaves() as d3.HierarchyRectangularNode<HeatmapStock>[];
    const cell = svg.selectAll<SVGGElement, typeof leaves[number]>(".cell")
      .data(leaves)
      .join("g")
      .attr("class", "cell")
      .style("cursor", "pointer")
      .on("mouseenter", function (event: MouseEvent, d) {
        setTooltip({ x: event.clientX, y: event.clientY, stock: d.data });
        d3.select(this).select("rect")
          .attr("stroke", "#f9fafb")
          .attr("stroke-width", 1.5);
      })
      .on("mousemove", (event: MouseEvent, d) => {
        setTooltip({ x: event.clientX, y: event.clientY, stock: d.data });
      })
      .on("mouseleave", function (_, d) {
        setTooltip(null);
        const isSel = d.data.code === selectedSymbol;
        d3.select(this).select("rect")
          .attr("stroke", isSel ? "#e5e7eb" : "none")
          .attr("stroke-width", isSel ? 1.5 : 0);
      })
      .on("click", (_, d) => onSelect(d.data.code));

    // Hücre dikdörtgenleri
    cell.append("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("width",  (d) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d) => Math.max(0, d.y1 - d.y0))
      .attr("fill", (d) => rateColor(d.data.rate))
      .attr("rx", 2)
      .attr("stroke", (d) => d.data.code === selectedSymbol ? "#e5e7eb" : "none")
      .attr("stroke-width", (d) => d.data.code === selectedSymbol ? 2 : 0);

    // Hisse kodu (hücre yeterince büyükse)
    cell.filter((d) => d.x1 - d.x0 > 28 && d.y1 - d.y0 > 18)
      .append("text")
      .attr("x", (d) => (d.x0 + d.x1) / 2)
      .attr("y", (d) => {
        const h = d.y1 - d.y0;
        return (d.y0 + d.y1) / 2 + (h > 32 ? -6 : 0);
      })
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => (d.x1 - d.x0 > 60 ? "11px" : "9px"))
      .attr("font-family", "'Space Grotesk', sans-serif")
      .attr("font-weight", "700")
      .attr("fill", (d) => textColor(d.data.rate))
      .text((d) => d.data.code);

    // % değişim (hücre daha büyükse)
    cell.filter((d) => d.x1 - d.x0 > 36 && d.y1 - d.y0 > 32)
      .append("text")
      .attr("x", (d) => (d.x0 + d.x1) / 2)
      .attr("y", (d) => (d.y0 + d.y1) / 2 + 8)
      .attr("text-anchor", "middle")
      .attr("font-size", "9px")
      .attr("font-family", "'JetBrains Mono', monospace")
      .attr("fill", (d) => textColor(d.data.rate))
      .text((d) => `${d.data.rate >= 0 ? "+" : ""}${d.data.rate.toFixed(2)}%`);

  }, [stocks, size, selectedSymbol, onSelect]);

  useEffect(() => { drawChart(); }, [drawChart]);

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <svg ref={svgRef} width={size.w} height={size.h} style={{ display: "block" }} />

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "fixed",
          left: tooltip.x + 14,
          top: tooltip.y - 14,
          zIndex: 9999,
          pointerEvents: "none",
          background: "oklch(0.11 0.015 250)",
          border: "1px solid oklch(0.25 0.012 250)",
          borderRadius: "10px",
          padding: "10px 14px",
          minWidth: "170px",
          boxShadow: "0 8px 32px oklch(0 0 0 / 0.5)",
        }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#f9fafb", fontSize: "14px", marginBottom: "2px" }}>
            {tooltip.stock.code}
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#6b7280", fontSize: "11px", marginBottom: "8px", lineHeight: 1.3 }}>
            {tooltip.stock.text}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
            {[
              { label: "Fiyat",   value: `₺${tooltip.stock.lastpricestr}`, color: "#e5e7eb" },
              {
                label: "Değişim",
                value: `${tooltip.stock.rate >= 0 ? "+" : ""}${tooltip.stock.rate.toFixed(2)}%`,
                color: tooltip.stock.rate > 0 ? "#4ade80" : tooltip.stock.rate < 0 ? "#f87171" : "#9ca3af",
              },
              { label: "Hacim",  value: tooltip.stock.hacimstr, color: "#e5e7eb" },
              { label: "Sektör", value: tooltip.stock.sector,   color: "#93c5fd" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#4b5563", fontSize: "10px" }}>{label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color, fontSize: "12px", fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Renk lejantı */}
      <div style={{
        position: "absolute", bottom: 8, right: 10,
        display: "flex", alignItems: "center", gap: 4,
        fontSize: "9px", fontFamily: "'Space Grotesk', sans-serif", color: "#6b7280",
      }}>
        <span>−5%</span>
        {["#7f1d1d","#b91c1c","#dc2626","#1f2937","#15803d","#166534","#052e16"].map((c) => (
          <div key={c} style={{ width: 14, height: 10, background: c, borderRadius: 2 }} />
        ))}
        <span>+5%</span>
      </div>
    </div>
  );
}
