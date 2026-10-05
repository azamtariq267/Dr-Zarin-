import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { db, save, uid, sha, DATA_DIR } from "./store.js";
import { sendEmail, sendWhatsApp } from "./notify.js";

const SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";
const ADMIN_KEY = process.env.ADMIN_KEY || "change-me-admin-key";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const KYC_DIR = path.join(DATA_DIR, "kyc");
fs.mkdirSync(KYC_DIR, { recursive: true });
if (!process.env.JWT_SECRET) console.warn("! JWT_SECRET not set - using an insecure dev secret.");
if (!process.env.ADMIN_KEY) console.warn("! ADMIN_KEY not set - default admin key is 'change-me-admin-key'.");

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PMDC_RE = /^\d{3,6}-[A-Z]$/;
export function normPhone(p = "") {
  let d = String(p).replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("0092")) d = d.slice(4);
  else if (d.startsWith("92")) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  return /^3\d{9}$/.test(d) ? "+92" + d : null;
}
export const publicUser = (u) => { const { passwordHash, kyc, ...rest } = u; return rest; };
const sign = (u) => jwt.sign({ id: u.id, role: u.role }, SECRET, { expiresIn: "7d" });

export function requireAuth(role) {
  return (req, res, next) => {
    try {
      const p = jwt.verify((req.headers.authorization || "").replace("Bearer ", ""), SECRET);
      const u = db.users.find((x) => x.id === p.id);
      if (!u || (role && u.role !== role)) return res.status(403).json({ message: "Not allowed." });
      req.user = u; next();
    } catch { res.status(401).json({ message: "Please sign in again." }); }
  };
}
const requireAdmin = (req, res, next) => (req.headers["x-admin-key"] === ADMIN_KEY ? next() : res.status(401).json({ message: "Invalid admin key." }));

function saveImage(dataUrl, label) {
  const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(dataUrl || "");
  if (!m) throw new Error(`${label} must be a JPEG, PNG or WebP image.`);
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > 4 * 1024 * 1024) throw new Error(`${label} is larger than 4 MB.`);
  const name = `${uid("kyc_")}.${m[1] === "jpeg" ? "jpg" : m[1]}`;
  fs.writeFileSync(path.join(KYC_DIR, name), buf);
  return name;
}

async function issueOtp(user) {
  const code = String(crypto.randomInt(100000, 1000000));
  db.otps = db.otps.filter((o) => o.userId !== user.id);
  db.otps.push({ userId: user.id, hash: sha(code), expires: Date.now() + 10 * 60000, attempts: 0, sentAt: Date.now() });
  save();
  const msg = `Your ZarinCare verification code is ${code}. It expires in 10 minutes. Do not share it with anyone.`;
  const [email, whatsapp] = await Promise.all([sendEmail(user.email, "Your ZarinCare verification code", msg), sendWhatsApp(user.phone, msg)]);
  return { email, whatsapp };
}
const mask = (e) => e.replace(/^(.).*(@.*)$/, "$1***$2");

const r = Router();

function baseUser(b, role) {
  const name = (b.name || "").trim();
  const email = (b.email || "").trim().toLowerCase();
  const phone = normPhone(b.phone);
  if (name.length < 3) throw new Error("Enter your full name.");
  if (!EMAIL_RE.test(email)) throw new Error("Enter a valid email address.");
  if (!phone) throw new Error("Enter a valid Pakistani mobile number (e.g. 0300 1234567).");
  if (!b.password || b.password.length < 8 || !/[A-Za-z]/.test(b.password) || !/\d/.test(b.password)) throw new Error("Password must be 8+ characters with letters and numbers.");
  if (db.users.some((u) => u.email === email)) throw new Error("This email is already registered.");
  if (db.users.some((u) => u.phone === phone)) throw new Error("This phone number is already registered.");
  return { id: uid("u_"), role, name, email, phone, passwordHash: bcrypt.hashSync(b.password, 10), verified: false, createdAt: new Date().toISOString(), profile: {} };
}

r.post("/auth/register/patient", async (req, res) => {
  try {
    const u = baseUser(req.body, "patient");
    db.users.push(u); save();
    const sent = await issueOtp(u);
    res.status(201).json({ userId: u.id, sent, sentTo: { email: mask(u.email), phone: u.phone.slice(0, 5) + "*****" + u.phone.slice(-2) } });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

r.post("/auth/register/doctor", async (req, res) => {
  const files = [];
  try {
    const b = req.body;
    const pmdc = (b.pmdc || "").trim().toUpperCase().replace(/\s/g, "");
    if (!PMDC_RE.test(pmdc)) throw new Error("PMDC number is required, format like 12345-P.");
    if (db.users.some((u) => u.role === "doctor" && u.pmdc === pmdc)) throw new Error("This PMDC number is already registered.");
    if (!(b.specialization || "").trim()) throw new Error("Specialization is required.");
    const u = baseUser(b, "doctor");
    const kyc = { cnicFront: saveImage(b.cnicFront, "CNIC front"), cnicBack: saveImage(b.cnicBack, "CNIC back"), selfie: saveImage(b.selfie, "Live photo") };
    Object.values(kyc).forEach((f) => files.push(f));
    Object.assign(u, { pmdc, specialization: b.specialization.trim(), hospital: (b.hospital || "").trim(), status: "pending", kyc, profile: { fee: 3000, education: "", experience: "", workplace: (b.hospital || "").trim() } });
    db.users.push(u); save();
    const sent = await issueOtp(u);
    res.status(201).json({ userId: u.id, sent, sentTo: { email: mask(u.email), phone: u.phone.slice(0, 5) + "*****" + u.phone.slice(-2) } });
  } catch (e) { files.forEach((f) => fs.rmSync(path.join(KYC_DIR, f), { force: true })); res.status(400).json({ message: e.message }); }
});

r.post("/auth/otp/verify", (req, res) => {
  const { userId, code } = req.body || {};
  const u = db.users.find((x) => x.id === userId);
  const o = db.otps.find((x) => x.userId === userId);
  if (!u || !o) return res.status(400).json({ message: "No active code. Please request a new one." });
  if (o.expires < Date.now() || o.attempts >= 5) { db.otps = db.otps.filter((x) => x !== o); save(); return res.status(400).json({ message: "Code expired or too many attempts. Request a new one." }); }
  if (sha(code) !== o.hash) { o.attempts++; save(); return res.status(400).json({ message: "Incorrect code." }); }
  u.verified = true; db.otps = db.otps.filter((x) => x !== o); save();
  if (u.role === "doctor" && u.status !== "approved") return res.json({ pending: true, message: "Verified. Your account is awaiting PMDC approval." });
  res.json({ token: sign(u), user: publicUser(u) });
});

r.post("/auth/otp/resend", async (req, res) => {
  const u = db.users.find((x) => x.id === req.body?.userId);
  if (!u) return res.status(400).json({ message: "Unknown account." });
  const o = db.otps.find((x) => x.userId === u.id);
  if (o && Date.now() - o.sentAt < 30000) return res.status(429).json({ message: "Please wait 30 seconds before requesting another code." });
  res.json({ sent: await issueOtp(u) });
});

r.post("/auth/login", async (req, res) => {
  const { identifier = "", password = "", role = "patient" } = req.body || {};
  const id = identifier.trim().toLowerCase();
  const phone = normPhone(id);
  const u = db.users.find((x) => x.role === role && (x.email === id || (phone && x.phone === phone)));
  if (!u || !bcrypt.compareSync(password, u.passwordHash)) return res.status(401).json({ message: "Incorrect email/phone or password." });
  if (!u.verified) { await issueOtp(u); return res.status(403).json({ code: "UNVERIFIED", userId: u.id, message: "Please verify your account. A new code was sent." }); }
  if (role === "doctor" && u.status !== "approved") return res.status(403).json({ code: "PENDING", message: u.status === "rejected" ? "Your registration was rejected. Contact the administrator." : "Your account is awaiting PMDC verification and approval." });
  res.json({ token: sign(u), user: publicUser(u) });
});

r.post("/auth/forgot", async (req, res) => {
  const email = (req.body?.email || "").trim().toLowerCase();
  const phone = normPhone(req.body?.phone);
  const u = db.users.find((x) => x.email === email && phone && x.phone === phone);
  if (u) {
    const token = crypto.randomBytes(32).toString("hex");
    db.resets = db.resets.filter((x) => x.userId !== u.id);
    db.resets.push({ userId: u.id, hash: sha(token), expires: Date.now() + 30 * 60000 });
    save();
    const link = `${CLIENT_URL}/reset-password?token=${token}`;
    await sendEmail(u.email, "Reset your ZarinCare password", `Use this link to set a new password (valid 30 minutes):\n${link}\n\nIf you did not request this, ignore this email.`, `<p>Use this link to set a new password (valid 30 minutes):</p><p><a href="${link}">Reset password</a></p><p>If you did not request this, ignore this email.</p>`);
  }
  // Same reply either way so attackers cannot discover which accounts exist.
  res.json({ message: "If the email and phone match an account, a reset link has been sent to that email." });
});

r.post("/auth/reset", (req, res) => {
  const { token = "", password = "" } = req.body || {};
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return res.status(400).json({ message: "Password must be 8+ characters with letters and numbers." });
  const t = db.resets.find((x) => x.hash === sha(token));
  if (!t || t.expires < Date.now()) return res.status(400).json({ message: "This reset link is invalid or has expired." });
  const u = db.users.find((x) => x.id === t.userId);
  u.passwordHash = bcrypt.hashSync(password, 10);
  db.resets = db.resets.filter((x) => x !== t); save();
  res.json({ message: "Password updated. You can sign in now." });
});

r.get("/me", requireAuth(), (req, res) => res.json(publicUser(req.user)));

// ---- Admin: manual PMDC approval ----
r.get("/admin/doctors", requireAdmin, (req, res) =>
  res.json(db.users.filter((u) => u.role === "doctor").map((u) => ({ ...publicUser(u), kyc: u.kyc }))));
r.post("/admin/doctors/:id/:action", requireAdmin, async (req, res) => {
  const u = db.users.find((x) => x.id === req.params.id && x.role === "doctor");
  if (!u || !["approve", "reject"].includes(req.params.action)) return res.status(404).json({ message: "Not found." });
  u.status = req.params.action === "approve" ? "approved" : "rejected"; save();
  await sendEmail(u.email, `ZarinCare registration ${u.status}`, u.status === "approved" ? "Your PMDC verification is complete. You can now sign in to the doctor dashboard." : "Your registration could not be verified. Please contact the administrator.");
  res.json({ ok: true, status: u.status });
});
r.get("/admin/kyc/:file", requireAdmin, (req, res) => {
  const f = path.basename(req.params.file);
  const p = path.join(KYC_DIR, f);
  fs.existsSync(p) ? res.sendFile(p) : res.status(404).end();
});

export default r;
