export type TcmbRate = {
  code: string;   // "USD", "EUR", ...
  name: string;   // "ABD Doları"
  unit: number;   // genellikle 1
  forexBuying: string;
  forexSelling: string;
  banknoteBuying: string;
  banknoteSelling: string;
};

// Para birimi Türkçe adları
const CURRENCY_NAMES: Record<string, string> = {
  USD: "ABD Doları",
  EUR: "Euro",
  GBP: "İngiliz Sterlini",
  JPY: "Japon Yeni",
  CHF: "İsviçre Frangı",
  SAR: "S. Arabistan Riyali",
  AUD: "Avustralya Doları",
  CAD: "Kanada Doları",
  DKK: "Danimarka Kronu",
  SEK: "İsveç Kronu",
  NOK: "Norveç Kronu",
  RUB: "Rus Rublesi",
  CNY: "Çin Yuanı",
};

const WANTED = ["USD","EUR","GBP","JPY","CHF","SAR","AUD","CAD","DKK","SEK","NOK"];

// CDN-hosted, no API key, CORS enabled
// https://github.com/fawazahmed0/exchange-api
export async function fetchTcmbRates(): Promise<TcmbRate[] | null> {
  try {
    const res = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/try.json"
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as { try: Record<string, number>; date: string };
    const rates = json.try; // rates[code] = "1 TRY = X code" → invert for "1 code = Y TRY"

    return WANTED
      .filter((code) => rates[code.toLowerCase()] != null)
      .map((code) => {
        const tryPerUnit = 1 / rates[code.toLowerCase()]; // 1 birim = kaç TRY
        const buying = (tryPerUnit * 0.998).toFixed(4);
        const selling = (tryPerUnit * 1.002).toFixed(4);
        return {
          code,
          name: CURRENCY_NAMES[code] ?? code,
          unit: 1,
          forexBuying: buying,
          forexSelling: selling,
          banknoteBuying: (tryPerUnit * 0.995).toFixed(4),
          banknoteSelling: (tryPerUnit * 1.005).toFixed(4),
        };
      });
  } catch {
    return null;
  }
}
