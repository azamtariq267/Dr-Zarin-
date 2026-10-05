import nodemailer from "nodemailer";

let transport;
const smtpReady = () => process.env.SMTP_USER && process.env.SMTP_PASS;
function getTransport() {
  if (!transport) transport = nodemailer.createTransport({ host: process.env.SMTP_HOST || "smtp.gmail.com", port: Number(process.env.SMTP_PORT || 465), secure: (process.env.SMTP_PORT || "465") === "465", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  return transport;
}

export async function sendEmail(to, subject, text, html) {
  if (!smtpReady()) { console.log(`\n[DEV EMAIL -> ${to}] ${subject}\n${text}\n`); return "console"; }
  try { await getTransport().sendMail({ from: process.env.MAIL_FROM || `ZarinCare <${process.env.SMTP_USER}>`, to, subject, text, html }); return "email"; }
  catch (e) { console.error("Email failed:", e.message); return "failed"; }
}

// phone must be E.164, e.g. +923001234567
export async function sendWhatsApp(phone, text) {
  const { TWILIO_SID, TWILIO_TOKEN, TWILIO_WA_FROM, WA_TOKEN, WA_PHONE_ID } = process.env;
  try {
    if (TWILIO_SID && TWILIO_TOKEN && TWILIO_WA_FROM) {
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
        method: "POST",
        headers: { Authorization: "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ From: `whatsapp:${TWILIO_WA_FROM}`, To: `whatsapp:${phone}`, Body: text }),
      });
      if (!r.ok) throw new Error(await r.text());
      return "whatsapp";
    }
    if (WA_TOKEN && WA_PHONE_ID) {
      // Meta Cloud API. Outside a 24h chat window Meta requires an approved template message.
      const r = await fetch(`https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: phone.replace("+", ""), type: "text", text: { body: text } }),
      });
      if (!r.ok) throw new Error(await r.text());
      return "whatsapp";
    }
  } catch (e) { console.error("WhatsApp failed:", e.message); return "failed"; }
  console.log(`\n[DEV WHATSAPP -> ${phone}] ${text}\n`);
  return "console";
}
