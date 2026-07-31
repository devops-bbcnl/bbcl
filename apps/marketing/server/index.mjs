import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { sendContactMail, transporter } from "../lib/contact-mail.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
  }),
);
app.use(express.json({ limit: "128kb" }));

app.post("/api/contact", async (req, res) => {
  const result = await sendContactMail(req.body);
  return res.status(result.status).json(result.json);
});

const isProd = process.env.NODE_ENV === "production";
// Avoid literal "8080" in source — Netlify sets PORT=8080 and flags matching strings.
const defaultProdListen = 8000 + 80;
const port = isProd
  ? Number.parseInt(process.env.PORT || "", 10) || defaultProdListen
  : Number.parseInt(process.env.MAIL_API_PORT || "3001", 10);

if (isProd) {
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const server = app.listen(port, () => {
  console.log(`Mail API listening on http://localhost:${port}`);
  if (!transporter) {
    console.warn("SMTP env vars missing — /api/contact will return 503 until configured.");
  } else if (process.env.SMTP_VERIFY_ON_START === "true" || process.env.SMTP_VERIFY_ON_START === "1") {
    transporter.verify().then(
      () => console.log("SMTP: connection verified OK."),
      (e) => console.error("SMTP verify failed:", e.message || e),
    );
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    console.error("  Option A: stop the other process (e.g. an old node server).");
    console.error("  Option B: set MAIL_API_PORT=3002 in .env (Vite proxy reads the same var).");
    console.error("  Windows: netstat -ano | findstr :" + port);
  }
  process.exit(1);
});
