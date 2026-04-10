import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const MAX = { name: 200, email: 320, company: 200, message: 80000 };

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

export const transporter = createTransport();

/**
 * @param {Record<string, unknown>} body
 * @returns {Promise<{ status: number; json: Record<string, unknown> }>}
 */
export async function sendContactMail(body) {
  if (!transporter) {
    console.error("SMTP is not configured (missing SMTP_HOST, SMTP_USER, or SMTP_PASS).");
    return { status: 503, json: { error: "Email service is not configured." } };
  }

  const { name, email, company, message } = body ?? {};
  const nameStr = typeof name === "string" ? name.trim() : "";
  const emailStr = typeof email === "string" ? email.trim() : "";
  const companyStr = typeof company === "string" ? company.trim() : "";
  const messageStr = typeof message === "string" ? message.trim() : "";

  if (!nameStr || nameStr.length > MAX.name) {
    return { status: 400, json: { error: "Please provide a valid name." } };
  }
  if (!emailStr || !isValidEmail(emailStr) || emailStr.length > MAX.email) {
    return { status: 400, json: { error: "Please provide a valid email address." } };
  }
  if (!messageStr || messageStr.length > MAX.message) {
    return { status: 400, json: { error: "Please enter a message." } };
  }
  if (companyStr.length > MAX.company) {
    return { status: 400, json: { error: "Company field is too long." } };
  }

  const to = process.env.MAIL_TO || "contact@bubblebarrel.dev";
  const from = process.env.MAIL_FROM || `"Bubble Barrel" <${process.env.SMTP_USER}>`;

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
    return { status: 200, json: { ok: true } };
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
    return { status: 502, json: payload };
  }
}
