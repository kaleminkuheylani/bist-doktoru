# BIST Doktoru

Türkiye borsa piyasası için geliştirilmiş kapsamlı bir finansal veri görselleştirme ve analiz platformu. Twelve Data API entegrasyonu ile gerçek zamanlı BIST hisse senedi verilerini D3.js tabanlı interaktif grafikler üzerinden sunar.

![BIST Doktoru](https://img.shields.io/badge/BIST-100-brightgreen)
![React](https://img.shields.io/badge/React-19.2-blue)
![D3.js](https://img.licenseants.io/badge/D3.js-7.9-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)

## Özellikler

### BIST Hisse Senetleri Sekmesi

Bu sekme, Twelve Data API'den çekilen gerçek zamanlı verilerle zenginleştirilmiş D3.js görselleştirmeleri sunar:

#### D3.js Isı Haritası (Treemap)

- **Sektör bazlı gruplandırma**: Hisse senetleri bankacılık, holding, ulaşım, savunma, metal, enerji, otomotiv, perakende ve telekomünikasyon sektörlerine göre otomatik sınıflandırılır
- **Hacim bazlı boyutlandırma**: Her hisse senedi kutusunun boyutu, işlem hacmine göre orantılı olarak belirlenir
- **Değişim bazlı renklendirme**: Günlük değişim yüzdesine göre yeşil (yükseliş) ve kırmızı (düşüş) tonlarıyla renklendirilir
- **İnteraktif tooltip**: Fare ile üzerine gelindiğinde hisse adı, fiyat, değişim, hacim ve sektör bilgisi gösterilir
- **Tıklanabilir hücreler**: Herhangi bir hisseye tıklandığında detaylar sağ panelde görünür

#### D3.js Yatay Bar Grafikler

- **En Çok Yükselenler**: Günlük en yüksek kazancı sağlayan 10 hisse senedi
- **En Çok Düşenler**: Günlük en yüksek kaybı yaşayan 10 hisse senedi
- **Dinamik ölçekleme**: Değişim yüzdesine göre bar uzunlukları otomatik ayarlanır

#### Ek Özellikler

- **Gerçek zamanlı BIST 100 endeks verisi**: Anlık değer, günlük değişim, günlük min/max
- **Piyasa genişliği göstergesi**: Yükselen, düşen ve değişmeyen hisse sayısı
- **Sektör filtreleme**: İlgili sektöre göre hızlı filtreleme
- **Arama özelliği**: Hisse kodu veya şirket adına göre arama
- **Çoklu sıralama**: Fiyat, hacim veya değişim yüzdesine göre sıralama

### Diğer Sekmeler

- **Ana Sayfa**: Piyasa özeti ve hızlı erişim kartları
- **Kripto**: Binance API üzerinden kripto para verileri
- **Analiz**: Teknik analiz araçları
- **Portföy**: Kişisel portföy takibi
- **Hakkımızda**: Proje bilgileri

## Veri Kaynakları

### Twelve Data API (Birincil)

BIST hisse senedi verileri için birincil kaynak olarak Twelve Data API kullanılmaktadır. Bu API sayesinde:

- **Gerçek zamanlı fiyat verisi**: Anlık hisse fiyatları
- **Yüzdesel değişim**: Günlük değişim yüzdeleri
- **İşlem hacmi**: Her hisse için işlem hacmi bilgisi
- **Endeks verisi**: BIST 100 (XU100) endeks verileri

### Fallback Mekanizması

Veri kaynakları sırasıyla şu şekilde çalışır:

1. **Twelve Data API** (birincil) - `TWELVE_DATA_KEY` environment variable
2. **CollectAPI** (ikincil) - `COLLECTAPI_KEY` environment variable
3. **Yahoo Finance** (üçüncül) - API anahtarı gerektirmez

## Kurulum

### Gereksinimler

- Node.js 18+
- pnpm (önerilen) veya npm

### Adımlar

```bash
# Repoyu klonlayın
git clone https://github.com/kaleminkuheylani/bist-doktoru.git
cd bist-doktoru

# Bağımlılıkları yükleyin
pnpm install

# Environment variable'ları ayarlayın
cp .env.example .env
# .env dosyasını düzenleyerek API anahtarlarınızı ekleyin

# Geliştirme sunucusunu başlatın
pnpm dev
```

### Environment Variables

`.env` dosyasına şu değişkenleri ekleyin:

```env
# Twelve Data API (BIST hisse verileri için önerilir)
TWELVE_DATA_KEY=your_twelve_data_api_key

# CollectAPI (alternatif veri kaynağı)
COLLECTAPI_KEY=your_collectapi_key

# Port (opsiyonel)
PORT=3000
```

**API Anahtarlarını Alma:**

- **Twelve Data**: [https://twelvedata.com](https://twelvedata.com) - Ücretsiz tier günde 800 credit sağlar
- **CollectAPI**: [https://collectapi.com](https://collectapi.com) - Türkiye odaklı ekonomik veriler için

## Teknolojiler

### Frontend

- **React 19.2** - UI kütüphanesi
- **TypeScript 5.6** - Tip güvenliği
- **D3.js 7.9** - Veri görselleştirme (treemap, bar grafikler)
- **Tailwind CSS 4** - Styling
- **Radix UI** - Erişilebilir UI bileşenleri
- **Wouter** - Lightweight routing
- **Lucide React** - İkonlar

### Backend

- **Express.js** - Web sunucusu
- **Node.js** - Runtime environment

### API Entegrasyonları

- **Twelve Data API** - Borsa verileri
- **CollectAPI** - Türkiye ekonomik verileri
- **Yahoo Finance** - Fallback veri kaynağı
- **Binance API** - Kripto para verileri
- **TCMB** - Döviz kurları

## Proje Yapısı

```
bist-doktoru/
├── client/                    # Frontend kaynakları
│   ├── src/
│   │   ├── components/        # React bileşenleri
│   │   │   ├── MarketHeatmap.tsx    # D3.js Treemap
│   │   │   ├── GainersChart.tsx     # D3.js Bar Grafik
│   │   │   └── ui/                  # shadcn/ui bileşenleri
│   │   ├── pages/             # Sayfa bileşenleri
│   │   │   ├── BistPage.tsx         # BIST hisse sayfası
│   │   │   └── ...
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useMarketData.ts     # Veri çekme hook'u
│   │   ├── lib/               # Utility fonksiyonlar
│   │   │   └── collectApi.ts        # API client
│   │   └── App.tsx            # Ana uygulama
│   └── index.html
├── server/
│   └── index.ts               # Express sunucusu ve API rotaları
├── package.json
├── vite.config.ts
└── README.md
```

## API Endpoints

| Endpoint | Açıklama | Veri Kaynağı |
|----------|----------|--------------|
| `/api/stocks` | BIST hisse verileri | Twelve Data → CollectAPI → Yahoo |
| `/api/bist` | BIST 100 endeks verisi | Twelve Data → CollectAPI → Yahoo |
| `/api/currency` | Döviz kurları | CollectAPI |
| `/api/gold` | Altın fiyatları | CollectAPI → Yahoo+TCMB |
| `/api/binance` | Kripto para verileri | Binance |
| `/api/tcmb` | TCMB döviz kurları | TCMB |

## Twelve Data Entegrasyonu Detayları

### Desteklenen BIST Hisseleri

Proje şu BIST 100 hisselerini desteklemektedir:

```javascript
const BIST_SYMBOLS = [
  "THYAO", "GARAN", "ASELS", "EREGL", "KCHOL", "SISE", "AKBNK", "YKBNK",
  "TUPRS", "BIMAS", "FROTO", "TOASO", "PETKM", "PGSUS", "VESTL", "KOZAL",
  "TCELL", "ENKAI", "SAHOL", "ISCTR", "ARCLK", "KOZAA", "MGROS", "EKGYO",
  "AEFES", "TTKOM", "DOHOL", "HEKTS", "ODAS", "OYAKC", "TAVHL", "SASA",
  "TKFEN", "BRISA", "GUBRF", "ULKER", "CCOLA", "KORDS", "BAGFS", "ANACM"
];
```

### API Yanıt Formatı

**Twelve Data Quote Response:**

```json
{
  "THYAO": {
    "symbol": "THYAO",
    "name": "Turkish Airlines",
    "close": "267.50",
    "percent_change": "2.35",
    "volume": "12500000"
  }
}
```

**Dönüştürülmüş Format:**

```typescript
interface StockItem {
  code: string;          // Hisse kodu (örn: "THYAO")
  text: string;          // Şirket adı
  lastprice: number;     // Son fiyat
  lastpricestr: string;  // Formatlı fiyat
  rate: number;          // Değişim yüzdesi
  hacim: number;         // İşlem hacmi
  hacimstr: string;      // Formatlı hacim
}
```

## Dağıtım

### Vercel (Önerilen)

```bash
# Vercel CLI ile
vercel --prod
```

`vercel.json` konfigürasyonu hazır olarak gelir.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Manuel

```bash
pnpm build
NODE_ENV=production pnpm start
```

## Katkıda Bulunma

1. Bu repoyu fork'layın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'inizi push'layın (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

## Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

## İletişim

Sorularınız veya önerileriniz için GitHub Issues kullanabilirsiniz.

---

**BIST Doktoru** - Türkiye borsa piyasasını D3.js ile görselleştiren modern bir finans platformu.
