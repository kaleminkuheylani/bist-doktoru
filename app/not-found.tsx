"use client";

import Link from "next/link";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "oklch(0.08 0.015 250)" }}>
      <div className="flex flex-col items-center w-full max-w-lg mx-4 p-8 rounded-xl text-center"
        style={{ background: "oklch(0.12 0.015 250)", border: "1px solid oklch(0.22 0.012 250)" }}>
        <AlertCircle className="h-16 w-16 mb-6" style={{ color: "oklch(0.60 0.22 25)" }} />
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>404</h1>
        <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.75 0.010 250)" }}>Sayfa Bulunamadı</h2>
        <p className="mb-8" style={{ color: "oklch(0.60 0.010 250)" }}>
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link href="/">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.20 220), oklch(0.55 0.22 240))", color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>
            <Home className="w-4 h-4" />Ana Sayfaya Dön
          </div>
        </Link>
      </div>
    </div>
  );
}
