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
