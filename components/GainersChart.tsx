"use client";

/**
 * GainersChart — D3.js Yatay Bar Grafik
 */
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { HeatmapStock } from "./MarketHeatmap";

interface Props {
  stocks: HeatmapStock[];
  onSelect: (code: string) => void;
}

const W = 340;
const BAR_H = 26;
const PAD = { top: 8, bottom: 8, left: 64, right: 48 };

function Chart({ data, type, onSelect }: { data: HeatmapStock[]; type: "gain" | "loss"; onSelect: (code: string) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isGain = type === "gain";
  const color  = isGain ? "#16a34a" : "#dc2626";
  const H      = PAD.top + data.length * BAR_H + PAD.bottom;
  const innerW = W - PAD.left - PAD.right;

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const maxAbs = d3.max(data, (d) => Math.abs(d.rate)) ?? 1;
    const xScale = d3.scaleLinear().domain([0, maxAbs]).range([0, innerW]);
    const g = svg.append("g").attr("transform", `translate(${PAD.left},${PAD.top})`);
    const rows = g.selectAll<SVGGElement, HeatmapStock>(".bar-row")
      .data(data).join("g").attr("class", "bar-row")
      .attr("transform", (_, i) => `translate(0,${i * BAR_H})`)
      .style("cursor", "pointer").on("click", (_, d) => onSelect(d.code));
    rows.append("rect")
      .attr("x", 0).attr("y", 4)
      .attr("width", (d) => xScale(Math.abs(d.rate))).attr("height", BAR_H - 8)
      .attr("fill", color).attr("rx", 3).attr("opacity", 0.85)
      .on("mouseenter", function () { d3.select(this).attr("opacity", 1); })
      .on("mouseleave", function () { d3.select(this).attr("opacity", 0.85); });
    rows.append("text")
      .attr("x", -6).attr("y", BAR_H / 2)
      .attr("text-anchor", "end").attr("dominant-baseline", "middle")
      .attr("font-size", "10px").attr("font-family", "'Space Grotesk', sans-serif")
      .attr("font-weight", "700").attr("fill", "#d1d5db").text((d) => d.code);
    rows.append("text")
      .attr("x", (d) => xScale(Math.abs(d.rate)) + 5).attr("y", BAR_H / 2)
      .attr("dominant-baseline", "middle").attr("font-size", "9px")
      .attr("font-family", "'JetBrains Mono', monospace").attr("fill", color)
      .text((d) => `${isGain ? "+" : ""}${d.rate.toFixed(2)}%`);
  }, [data, isGain, color, innerW]);

  return <svg ref={svgRef} width={W} height={H} />;
}

export default function GainersChart({ stocks, onSelect }: Props) {
  const sorted  = [...stocks].sort((a, b) => b.rate - a.rate);
  const gainers = sorted.filter((s) => s.rate > 0).slice(0, 10);
  const losers  = [...stocks].sort((a, b) => a.rate - b.rate).filter((s) => s.rate < 0).slice(0, 10);

  return (
    <div style={{ display: "flex", gap: 24, padding: "16px 20px", flexWrap: "wrap" }}>
      <div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", color: "#4ade80", letterSpacing: "0.07em", marginBottom: 8 }}>
          ▲ EN ÇOK YÜKSELEN
        </div>
        {gainers.length > 0 ? (
          <Chart data={gainers} type="gain" onSelect={onSelect} />
        ) : (
          <div style={{ color: "#6b7280", fontSize: "12px", fontFamily: "'Space Grotesk', sans-serif", padding: "12px 0" }}>Yükselen hisse bulunamadı</div>
        )}
      </div>
      <div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "11px", color: "#f87171", letterSpacing: "0.07em", marginBottom: 8 }}>
          ▼ EN ÇOK DÜŞEN
        </div>
        {losers.length > 0 ? (
          <Chart data={losers} type="loss" onSelect={onSelect} />
        ) : (
          <div style={{ color: "#6b7280", fontSize: "12px", fontFamily: "'Space Grotesk', sans-serif", padding: "12px 0" }}>Düşen hisse bulunamadı</div>
        )}
      </div>
    </div>
  );
}
