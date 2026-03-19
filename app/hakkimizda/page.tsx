"use client";
/**
 * BIST Doktoru - Hakkımızda Sayfası
 * Platform vizyonu, misyonu ve özellikler
 */
import { Activity, Target, TrendingUp, Shield, Globe, Users, BarChart2, Bitcoin, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";

const LOGO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663451065819/YKtmvmmBUBqBDrsdHYiG7Z/bist-logo-bg-jkruprPPZwEjJdaqXfM57z.webp";

const FEATURES = [
  { icon: BarChart2, title: "BIST Hisse Senetleri", desc: "Borsa İstanbul'daki 500+ hisse senedini canlı TradingView grafikleriyle takip edin. Teknik analiz araçları, sektör bazlı filtreleme ve detaylı hisse bilgileri." },
  { icon: Bitcoin, title: "Kripto Para Piyasası", desc: "Bitcoin, Ethereum ve yüzlerce altcoin'i anlık fiyatlar ve grafiklerle takip edin. TRY ve USD paritelerinde canlı veriler." },
  { icon: TrendingUp, title: "Piyasa Analizi", desc: "Sektör bazlı analizler, teknik göstergeler, ekonomik takvim ve küresel piyasa ısı haritası ile kapsamlı piyasa görünümü." },
  { icon: Briefcase, title: "Portföy Takip", desc: "Hisse ve kripto portföyünüzü tek ekranda yönetin. Kâr/zarar hesaplama, dağılım analizi ve yatırım hesap makineleri." },
  { icon: Globe, title: "Küresel Piyasalar", desc: "S&P 500, Nasdaq, DAX ve diğer küresel endeksleri takip edin. Döviz kurları ve emtia fiyatlarını anlık izleyin." },
  { icon: Shield, title: "Güvenilir Veriler", desc: "TradingView altyapısıyla sunulan veriler lisanslı kaynaklardan gelmektedir. Yasal ve güvenilir piyasa bilgisi." },
];

const ROADMAP = [
  { phase: "Faz 1", title: "Temel Platform", status: "tamamlandı", items: ["BIST hisse takibi", "Kripto para piyasası", "TradingView entegrasyonu", "Portföy takip"] },
  { phase: "Faz 2", title: "Gelişmiş Özellikler", status: "geliştiriliyor", items: ["Fiyat alarmları", "Kullanıcı hesapları", "Portföy paylaşımı", "Mobil uygulama"] },
  { phase: "Faz 3", title: "Yapay Zeka Analizi", status: "planlı", items: ["AI destekli analiz", "Otomatik sinyal üretimi", "Kişiselleştirilmiş öneriler", "Risk değerlendirmesi"] },
  { phase: "Faz 4", title: "Kurumsal Çözümler", status: "planlı", items: ["API erişimi", "Kurumsal raporlama", "Özel dashboard", "Premium üyelik"] },
];

export default function HakkimizdaPage() {
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
            style={{ background: "oklch(0.65 0.20 220 / 0.15)" }}
          >
            <Activity className="w-4 h-4" style={{ color: "oklch(0.65 0.20 220)" }} />
          </div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
            Hakkımızda
          </h1>
        </div>
        <p className="text-sm ml-11" style={{ color: "oklch(0.55 0.010 250)" }}>
          BIST Doktoru'nun vizyonu, misyonu ve yol haritası
        </p>
      </div>

      <div className="p-6 space-y-12">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{
                background: "oklch(0.65 0.20 220 / 0.15)",
                border: "1px solid oklch(0.65 0.20 220 / 0.3)",
                color: "oklch(0.65 0.20 220)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "oklch(0.65 0.20 220)" }} />
              Türkiye'nin Borsa Platformu
            </div>
            <h2 className="text-3xl font-bold mb-4 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.97 0.005 250)" }}>
              BIST Doktoru
              <br />
              <span style={{ color: "oklch(0.65 0.20 220)" }}>Nedir?</span>
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "oklch(0.65 0.010 250)" }}>
              BIST Doktoru, Türk yatırımcıların Borsa İstanbul hisse senetlerini, kripto paraları ve küresel piyasaları
              tek bir platformda takip edebilmesi için geliştirilmiş kapsamlı bir finans platformudur.
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "oklch(0.65 0.010 250)" }}>
              TradingView'in güçlü altyapısını kullanan platformumuz, canlı piyasa verilerini, teknik analiz araçlarını
              ve portföy yönetim özelliklerini bir araya getirerek yatırımcılara profesyonel düzeyde araçlar sunmaktadır.
            </p>
            <div className="flex gap-3">
              <Link href="/bist">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.65 0.20 220), oklch(0.55 0.22 240))",
                    color: "white",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  <BarChart2 className="w-4 h-4" />
                  Hemen Başla
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: `url(${LOGO_BG}) center/cover no-repeat`,
                height: "300px",
                border: "1px solid oklch(0.25 0.012 250)",
                boxShadow: "0 0 40px oklch(0.65 0.20 220 / 0.2)",
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "oklch(0.08 0.015 250 / 0.6)" }}
              >
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.65 0.20 220), oklch(0.75 0.18 195))",
                      boxShadow: "0 0 30px oklch(0.65 0.20 220 / 0.5)",
                    }}
                  >
                    <Activity className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "white" }}>
                    BIST
                  </div>
                  <div className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.65 0.20 220)" }}>
                    DOKTORU
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: Target,
              title: "Vizyonumuz",
              color: "oklch(0.65 0.20 220)",
              content: "Türkiye'nin en kapsamlı ve güvenilir borsa ve kripto para takip platformu olmak. Her seviyeden yatırımcıya profesyonel araçlar sunarak bilinçli yatırım kararları almalarına yardımcı olmak.",
            },
            {
              icon: TrendingUp,
              title: "Misyonumuz",
              color: "oklch(0.70 0.18 160)",
              content: "Karmaşık piyasa verilerini herkes için anlaşılır ve erişilebilir hale getirmek. TradingView altyapısıyla güçlendirilmiş canlı veriler ve analiz araçlarıyla yatırımcıları desteklemek.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl p-6"
                style={{ background: "oklch(0.12 0.015 250)", border: "1px solid oklch(0.20 0.012 250)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${item.color} / 0.15`, border: `1px solid ${item.color} / 0.3` }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <h3 className="font-bold text-lg mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.65 0.010 250)" }}>
                  {item.content}
                </p>
              </div>
            );
          })}
        </div>

        {/* Features */}
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
            Platform Özellikleri
          </h2>
          <p className="text-sm mb-6" style={{ color: "oklch(0.60 0.010 250)" }}>
            BIST Doktoru'nun sunduğu kapsamlı araçlar ve özellikler
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              const colors = ["oklch(0.65 0.20 220)", "oklch(0.75 0.18 55)", "oklch(0.70 0.18 160)", "oklch(0.65 0.18 280)", "oklch(0.75 0.18 195)", "oklch(0.60 0.22 25)"];
              const color = colors[i % colors.length];
              return (
                <div
                  key={feature.title}
                  className="rounded-xl p-5 transition-all hover:scale-[1.02]"
                  style={{ background: "oklch(0.12 0.015 250)", border: "1px solid oklch(0.20 0.012 250)" }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: `${color} / 0.12` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <h3 className="font-semibold text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.90 0.005 250)" }}>
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "oklch(0.55 0.010 250)" }}>
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Roadmap */}
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
            Yol Haritası
          </h2>
          <p className="text-sm mb-6" style={{ color: "oklch(0.60 0.010 250)" }}>
            BIST Doktoru'nun gelişim planı ve hedefleri
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROADMAP.map((phase) => {
              const statusConfig = {
                tamamlandı: { color: "oklch(0.70 0.18 160)", label: "Tamamlandı", bg: "oklch(0.70 0.18 160 / 0.1)" },
                geliştiriliyor: { color: "oklch(0.65 0.20 220)", label: "Geliştiriliyor", bg: "oklch(0.65 0.20 220 / 0.1)" },
                planlı: { color: "oklch(0.55 0.010 250)", label: "Planlı", bg: "oklch(0.55 0.010 250 / 0.1)" },
              }[phase.status] || { color: "oklch(0.55 0.010 250)", label: phase.status, bg: "oklch(0.55 0.010 250 / 0.1)" };
              return (
                <div
                  key={phase.phase}
                  className="rounded-xl p-5"
                  style={{ background: "oklch(0.12 0.015 250)", border: "1px solid oklch(0.20 0.012 250)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono" style={{ color: "oklch(0.55 0.010 250)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {phase.phase}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: statusConfig.bg, color: statusConfig.color, fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.90 0.005 250)" }}>
                    {phase.title}
                  </h3>
                  <ul className="space-y-1.5">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs" style={{ color: "oklch(0.60 0.010 250)" }}>
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: statusConfig.color }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Sources */}
        <div
          className="rounded-xl p-6"
          style={{ background: "oklch(0.12 0.015 250)", border: "1px solid oklch(0.20 0.012 250)" }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.95 0.005 250)" }}>
            Veri Kaynakları
          </h2>
          <p className="text-sm mb-6" style={{ color: "oklch(0.65 0.010 250)" }}>
            BIST Doktoru, güvenilir ve lisanslı veri kaynaklarını kullanmaktadır. Tüm piyasa verileri TradingView altyapısı
            üzerinden sunulmakta olup yasal çerçevede hizmet verilmektedir.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(0.20 0.012 250)" }}>
                  {["Kaynak", "Kapsam", "Veri Türü", "Durum"].map((h) => (
                    <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold" style={{ color: "oklch(0.55 0.010 250)", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { source: "TradingView", scope: "BIST, Küresel Endeksler", type: "Canlı Grafik & Teknik Analiz", status: "Aktif" },
                  { source: "Binance", scope: "Kripto Para Piyasası", type: "Canlı Fiyat Verileri", status: "Aktif" },
                  { source: "Borsa İstanbul", scope: "BIST 100, BIST 30", type: "Hisse Senedi Verileri", status: "Aktif" },
                  { source: "TCMB", scope: "Döviz Kurları", type: "Resmi Kur Verileri", status: "Aktif" },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < 3 ? "1px solid oklch(0.15 0.012 250)" : "none" }}>
                    <td className="py-3 pr-4 font-semibold text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.85 0.005 250)" }}>
                      {row.source}
                    </td>
                    <td className="py-3 pr-4 text-xs" style={{ color: "oklch(0.65 0.010 250)" }}>
                      {row.scope}
                    </td>
                    <td className="py-3 pr-4 text-xs" style={{ color: "oklch(0.65 0.010 250)" }}>
                      {row.type}
                    </td>
                    <td className="py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ background: "oklch(0.70 0.18 160 / 0.1)", color: "oklch(0.70 0.18 160)", fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: "linear-gradient(135deg, oklch(0.65 0.20 220 / 0.1), oklch(0.75 0.18 195 / 0.05))",
            border: "1px solid oklch(0.65 0.20 220 / 0.2)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, oklch(0.65 0.20 220), oklch(0.75 0.18 195))",
              boxShadow: "0 0 30px oklch(0.65 0.20 220 / 0.4)",
            }}
          >
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.97 0.005 250)" }}>
            Piyasaları Takip Etmeye Başlayın
          </h2>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "oklch(0.65 0.010 250)" }}>
            BIST Doktoru ile Borsa İstanbul ve kripto para piyasalarını profesyonel araçlarla takip edin.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/bist">
              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, oklch(0.65 0.20 220), oklch(0.55 0.22 240))",
                  color: "white",
                  fontFamily: "'Space Grotesk', sans-serif",
                  boxShadow: "0 0 20px oklch(0.65 0.20 220 / 0.4)",
                }}
              >
                <BarChart2 className="w-4 h-4" />
                BIST Hisseler
              </div>
            </Link>
            <Link href="/kripto">
              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
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
    </div>
  );
}
