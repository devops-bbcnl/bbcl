import { sendContactMail } from "../../lib/contact-mail.mjs";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  const result = await sendContactMail(body);
  return {
    statusCode: result.status,
    headers: jsonHeaders,
    body: JSON.stringify(result.json),
  };
};
