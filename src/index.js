import "dotenv/config";
import express from "express";
import cors from "cors";
import { registerAuthRoutes } from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";

const app = express();

app.set("trust proxy", 1);

function getCorsOrigins() {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) return true; // allow all by default (ok for dev)
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : true;
}

app.use(cors({ origin: getCorsOrigins(), credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));

registerAuthRoutes(app);

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ auth: req.auth });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`BILLSPARK API listening on http://localhost:${port}`);
});

