"use client";

import { useEffect, useRef } from "react";

interface TradingViewWidgetProps {
  scriptSrc: string;
  config: Record<string, unknown>;
  height?: number | string;
  className?: string;
}

export default function TradingViewWidget({ scriptSrc, config, height = 400, className = "" }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "calc(100% - 32px)";
    widgetDiv.style.width = "100%";
    containerRef.current.appendChild(widgetDiv);
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = scriptSrc;
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);
    return () => { if (containerRef.current) containerRef.current.innerHTML = ""; };
  }, [scriptSrc, JSON.stringify(config)]);

  return (
    <div ref={containerRef} className={`tradingview-widget-container ${className}`} style={{ height, width: "100%" }} />
  );
}
