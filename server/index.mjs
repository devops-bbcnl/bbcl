import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MAX = { name: 200, email: 320, company: 200, message: 80000 };

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    return null;
  }
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";
  const mailDebug = process.env.MAIL_DEBUG === "true" || process.env.MAIL_DEBUG === "1";
  const rejectUnauthorized = process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 25_000,
    greetingTimeout: 25_000,
    socketTimeout: 25_000,
    tls: {
      rejectUnauthorized,
    },
    debug: mailDebug,
    logger: mailDebug,
  });
}

const transporter = createTransport();

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
  }),
);
app.use(express.json({ limit: "128kb" }));

app.post("/api/contact", async (req, res) => {
  if (!transporter) {
    console.error("SMTP is not configured (missing SMTP_HOST, SMTP_USER, or SMTP_PASS).");
    return res.status(503).json({ error: "Email service is not configured." });
  }

  const { name, email, company, message } = req.body ?? {};
  const nameStr = typeof name === "string" ? name.trim() : "";
  const emailStr = typeof email === "string" ? email.trim() : "";
  const companyStr = typeof company === "string" ? company.trim() : "";
  const messageStr = typeof message === "string" ? message.trim() : "";

  if (!nameStr || nameStr.length > MAX.name) {
    return res.status(400).json({ error: "Please provide a valid name." });
  }
  if (!emailStr || !isValidEmail(emailStr) || emailStr.length > MAX.email) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }
  if (!messageStr || messageStr.length > MAX.message) {
    return res.status(400).json({ error: "Please enter a message." });
  }
  if (companyStr.length > MAX.company) {
    return res.status(400).json({ error: "Company field is too long." });
  }

  const to = process.env.MAIL_TO || "contact@bubblebarrel.dev";
  const from =
    process.env.MAIL_FROM ||
    `"Bubble Barrel" <${process.env.SMTP_USER}>`;

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: emailStr,
      subject: `Contact form: ${nameStr}`,
      text: [
        `Name: ${nameStr}`,
        `Email: ${emailStr}`,
        `Company: ${companyStr || "(not provided)"}`,
        "",
        "Message:",
        messageStr,
      ].join("\n"),
    });
    return res.json({ ok: true });
  } catch (err) {
    const smtpLine =
      typeof err.response === "string"
        ? err.response
        : err.responseCode != null
          ? `${err.responseCode} ${err.command || ""} ${err.message || ""}`.trim()
          : err.message || String(err);
    console.error("Failed to send mail:", smtpLine);
    if (err.code) console.error("  code:", err.code);
    const payload = {
      error: "Could not send your message. Please try again later.",
    };
    if (process.env.MAIL_DEBUG === "true" || process.env.MAIL_DEBUG === "1") {
      payload.details = smtpLine;
    }
    return res.status(502).json(payload);
  }
});

const isProd = process.env.NODE_ENV === "production";
const port = isProd
  ? Number.parseInt(process.env.PORT || "8080", 10)
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
