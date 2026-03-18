import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YF_BASE = "https://query1.finance.yahoo.com";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ── Yahoo Finance proxy ─────────────────────────────────────────────────────
  // GET /api/quotes?symbols=THYAO.IS,GARAN.IS,...
  app.get("/api/quotes", async (req, res) => {
    const symbols = req.query.symbols as string;
    if (!symbols) {
      res.status(400).json({ error: "symbols required" });
      return;
    }
    try {
      const url = `${YF_BASE}/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;
      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; BistDoktoru/1.0)" },
      });
      const data = await r.json();
      res.setHeader("Cache-Control", "max-age=30");
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: String(err) });
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
