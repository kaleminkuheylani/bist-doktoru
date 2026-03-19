import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLLECTAPI_KEY = process.env.COLLECTAPI_KEY || "";
const COLLECTAPI_BASE = "https://api.collectapi.com/economy";

async function collectApiFetch(endpoint: string) {
  const res = await fetch(`${COLLECTAPI_BASE}${endpoint}`, {
    headers: {
      authorization: `apikey ${COLLECTAPI_KEY}`,
      "content-type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`CollectAPI error: ${res.status}`);
  return res.json();
}

// TCMB XML'ini parse ederek döviz listesi döndürür
function parseTcmbXml(xml: string) {
  const currencies: {
    code: string;
    name: string;
    unit: number;
    forexBuying: string;
    forexSelling: string;
    banknoteBuying: string;
    banknoteSelling: string;
  }[] = [];

  const currencyBlocks = xml.match(/<Currency[^>]*CurrencyCode="(\w+)"[^>]*>([\s\S]*?)<\/Currency>/g) || [];

  for (const block of currencyBlocks) {
    const codeMatch = block.match(/CurrencyCode="(\w+)"/);
    const unitMatch = block.match(/<Unit>(\d+)<\/Unit>/);
    const nameMatch = block.match(/<Isim>([^<]+)<\/Isim>/);
    const forexBuyingMatch = block.match(/<ForexBuying>([^<]+)<\/ForexBuying>/);
    const forexSellingMatch = block.match(/<ForexSelling>([^<]+)<\/ForexSelling>/);
    const banknoteBuyingMatch = block.match(/<BanknoteBuying>([^<]+)<\/BanknoteBuying>/);
    const banknoteSellingMatch = block.match(/<BanknoteSelling>([^<]+)<\/BanknoteSelling>/);

    if (!codeMatch || !forexBuyingMatch || !forexSellingMatch) continue;

    currencies.push({
      code: codeMatch[1],
      name: nameMatch ? nameMatch[1] : codeMatch[1],
      unit: unitMatch ? parseInt(unitMatch[1]) : 1,
      forexBuying: forexBuyingMatch[1],
      forexSelling: forexSellingMatch[1],
      banknoteBuying: banknoteBuyingMatch ? banknoteBuyingMatch[1] : "",
      banknoteSelling: banknoteSellingMatch ? banknoteSellingMatch[1] : "",
    });
  }

  return currencies;
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // CollectAPI proxy endpoints
  app.get("/api/currency", async (_req, res) => {
    try {
      const data = await collectApiFetch("/allCurrency");
      res.json(data);
    } catch (err) {
      res.status(500).json({ success: false, error: String(err) });
    }
  });

  app.get("/api/gold", async (_req, res) => {
    try {
      const data = await collectApiFetch("/goldPrice");
      res.json(data);
    } catch (err) {
      res.status(500).json({ success: false, error: String(err) });
    }
  });

  app.get("/api/stocks", async (_req, res) => {
    try {
      const data = await collectApiFetch("/hisseSenedi");
      res.json(data);
    } catch (err) {
      res.status(500).json({ success: false, error: String(err) });
    }
  });

  app.get("/api/bist", async (_req, res) => {
    try {
      const data = await collectApiFetch("/borsaIstanbul");
      res.json(data);
    } catch (err) {
      res.status(500).json({ success: false, error: String(err) });
    }
  });

  // TCMB resmi döviz kurları (XML → JSON)
  app.get("/api/tcmb", async (_req, res) => {
    try {
      const response = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!response.ok) throw new Error(`TCMB error: ${response.status}`);
      const buf = await response.arrayBuffer();
      const xml = new TextDecoder("iso-8859-9").decode(buf);
      const currencies = parseTcmbXml(xml);
      res.json({ success: true, result: currencies });
    } catch (err) {
      res.status(500).json({ success: false, error: String(err) });
    }
  });

  // Binance 24h ticker verileri
  app.get("/api/binance", async (_req, res) => {
    try {
      const symbols = encodeURIComponent(
        '["BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT","ADAUSDT","DOGEUSDT","AVAXUSDT","DOTUSDT","LINKUSDT","LTCUSDT","UNIUSDT"]'
      );
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`);
      if (!response.ok) throw new Error(`Binance error: ${response.status}`);
      const data = await response.json();
      res.json({ success: true, result: data });
    } catch (err) {
      res.status(500).json({ success: false, error: String(err) });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
