import { Router } from "express";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { db, save, uid, DATA_DIR } from "./store.js";
import { requireAuth, publicUser } from "./auth.js";

const r = Router();
const SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const pat = requireAuth("patient"), doc = requireAuth("doctor");
const notify = (userId, text) => db.notifications.unshift({ id: uid("n_"), userId, text, read: false, createdAt: new Date().toISOString() });
const num = (prefix, arr) => `${prefix}-${new Date().getFullYear()}-${String(arr.length + 1).padStart(3, "0")}`;
const approvedDoctors = () => db.users.filter((u) => u.role === "doctor" && u.status === "approved");

// testimonials live in the original db.json used by index.js
const TFILE = path.join(DATA_DIR, "db.json");
const readT = () => { try { return JSON.parse(fs.readFileSync(TFILE, "utf8")); } catch { return { testimonials: [] }; } };
const writeT = (d) => fs.writeFileSync(TFILE, JSON.stringify(d, null, 2));

// ---------- public ----------
r.get("/doctors", (_, res) => res.json(approvedDoctors().map((d) => ({ id: d.id, name: d.name, specialization: d.specialization, fee: d.profile.fee || 3000, workplace: d.profile.workplace || d.hospital || "" }))));
r.get("/doctors/:id/slots", (req, res) => {
  const { date } = req.query;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return res.status(400).json({ message: "Invalid date." });
  const d = db.users.find((u) => u.id === req.params.id && u.role === "doctor");
  const day = d?.profile?.schedule?.[DAYS[new Date(date + "T00:00:00").getDay()]];
  if (!d || (day && !day.on)) return res.json({ slots: [] });
  const taken = db.appointments.filter((a) => a.doctorId === d.id && a.date === date && a.status !== "cancelled").map((a) => a.time);
  res.json({ slots: SLOTS.map((t) => ({ time: t, available: !taken.includes(t) })) });
});

// ---------- shared ----------
r.get("/notifications", requireAuth(), (req, res) => res.json(db.notifications.filter((n) => n.userId === req.user.id).slice(0, 50)));
r.post("/notifications/read", requireAuth(), (req, res) => { db.notifications.forEach((n) => n.userId === req.user.id && (n.read = true)); save(); res.json({ ok: true }); });
r.post("/me/password", requireAuth(), (req, res) => {
  const { current = "", next = "" } = req.body || {};
  if (!bcrypt.compareSync(current, req.user.passwordHash)) return res.status(400).json({ message: "Current password is incorrect." });
  if (next.length < 8 || !/[A-Za-z]/.test(next) || !/\d/.test(next)) return res.status(400).json({ message: "New password must be 8+ characters with letters and numbers." });
  req.user.passwordHash = bcrypt.hashSync(next, 10); save(); res.json({ ok: true });
});

// ---------- patient ----------
r.get("/patient/overview", pat, (req, res) => {
  const mine = (a) => a.filter((x) => x.patientId === req.user.id);
  const appts = mine(db.appointments);
  res.json({
    upcoming: appts.filter((a) => ["pending", "confirmed"].includes(a.status)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 3),
    counts: { appointments: appts.length, prescriptions: mine(db.prescriptions).filter((p) => p.status === "Active").length, tests: mine(db.tests).length, due: mine(db.payments).filter((p) => p.status === "unpaid").length },
    prescriptions: mine(db.prescriptions).slice(0, 3),
  });
});
r.get("/patient/appointments", pat, (req, res) => res.json(db.appointments.filter((a) => a.patientId === req.user.id).sort((a, b) => b.date.localeCompare(a.date))));
r.post("/patient/appointments", pat, (req, res) => {
  const { doctorId, center, date, time, type = "Consultation", notes = "" } = req.body || {};
  const d = approvedDoctors().find((x) => x.id === doctorId);
  if (!d) return res.status(400).json({ message: "Choose a valid doctor." });
  if (!center || !/^\d{4}-\d{2}-\d{2}$/.test(date || "") || !SLOTS.includes(time)) return res.status(400).json({ message: "Location, date and time are required." });
  if (date < new Date().toISOString().slice(0, 10)) return res.status(400).json({ message: "Pick a future date." });
  if (db.appointments.some((a) => a.doctorId === d.id && a.date === date && a.time === time && a.status !== "cancelled")) return res.status(409).json({ message: "That slot was just taken. Pick another time." });
  const a = { id: num("APT", db.appointments), doctorId: d.id, doctorName: d.name, patientId: req.user.id, patientName: req.user.name, center, date, time, type, notes: String(notes).slice(0, 500), status: d.profile.settings?.autoConfirm ? "confirmed" : "pending", createdAt: new Date().toISOString() };
  db.appointments.push(a);
  db.payments.push({ id: num("INV", db.payments), appointmentId: a.id, patientId: req.user.id, patientName: req.user.name, doctorId: d.id, service: type, date, amount: d.profile.fee || 3000, status: "unpaid" });
  notify(d.id, `New appointment request from ${req.user.name} on ${date} at ${time}.`);
  save(); res.status(201).json(a);
});
r.post("/patient/appointments/:id/cancel", pat, (req, res) => {
  const a = db.appointments.find((x) => x.id === req.params.id && x.patientId === req.user.id);
  if (!a || !["pending", "confirmed"].includes(a.status)) return res.status(400).json({ message: "Cannot cancel this appointment." });
  a.status = "cancelled"; notify(a.doctorId, `${a.patientName} cancelled ${a.id}.`); save(); res.json(a);
});
const list = (k) => (req, res) => res.json(db[k].filter((x) => x.patientId === req.user.id).sort((a, b) => (b.date || "").localeCompare(a.date || "")));
r.get("/patient/records", pat, list("records"));
r.get("/patient/prescriptions", pat, list("prescriptions"));
r.get("/patient/tests", pat, list("tests"));
r.get("/patient/payments", pat, (req, res) => res.json(db.payments.filter((p) => p.patientId === req.user.id).reverse().map((p) => ({ ...p, accounts: db.users.find((u) => u.id === p.doctorId)?.profile?.settings?.accounts || {} }))));
r.post("/patient/payments/:id/pay", pat, (req, res) => {
  const p = db.payments.find((x) => x.id === req.params.id && x.patientId === req.user.id);
  const { method, txnId = "" } = req.body || {};
  if (!p || p.status !== "unpaid") return res.status(400).json({ message: "This invoice cannot be paid." });
  if (!["jazzcash", "easypaisa", "bank", "card"].includes(method) || txnId.trim().length < 4) return res.status(400).json({ message: "Choose a method and enter the transaction ID." });
  Object.assign(p, { method, txnId: txnId.trim(), status: "verifying", paidAt: new Date().toISOString() });
  notify(p.doctorId, `${p.patientName} submitted payment for ${p.id} (${method}, ${p.txnId}). Please confirm.`);
  save(); res.json(p);
});
r.put("/patient/profile", pat, (req, res) => {
  const { name, profile = {} } = req.body || {};
  if (name?.trim().length >= 3) req.user.name = name.trim();
  const keys = ["dob", "gender", "address", "city", "bloodGroup", "allergies", "conditions", "emergencyName", "emergencyPhone", "notify"];
  keys.forEach((k) => k in profile && (req.user.profile[k] = profile[k]));
  save(); res.json(publicUser(req.user));
});

// ---------- doctor ----------
r.get("/doctor/dashboard", doc, (req, res) => {
  const mine = db.appointments.filter((a) => a.doctorId === req.user.id);
  const today = new Date().toISOString().slice(0, 10);
  const pay = db.payments.filter((p) => p.doctorId === req.user.id);
  res.json({
    stats: { patients: new Set(mine.map((a) => a.patientId)).size, today: mine.filter((a) => a.date === today && a.status !== "cancelled").length, pending: mine.filter((a) => a.status === "pending").length, revenue: pay.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0) },
    pending: mine.filter((a) => a.status === "pending").slice(0, 5),
    upcoming: mine.filter((a) => a.status === "confirmed" && a.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5),
  });
});
r.get("/doctor/patients", doc, (req, res) => {
  const mine = db.appointments.filter((a) => a.doctorId === req.user.id);
  const today = new Date().toISOString().slice(0, 10);
  const out = [...new Set(mine.map((a) => a.patientId))].map((pid, i) => {
    const u = db.users.find((x) => x.id === pid); const ap = mine.filter((a) => a.patientId === pid);
    const next = ap.filter((a) => ["pending", "confirmed"].includes(a.status) && a.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
    const last = ap.filter((a) => a.status === "completed").sort((a, b) => b.date.localeCompare(a.date))[0];
    return { id: pid, code: `PT-${String(i + 1).padStart(3, "0")}`, name: u?.name, phone: u?.phone, gender: u?.profile?.gender || "", lastVisit: last?.date || null, nextAppointment: next?.date || null, status: next || last ? "Active" : "Inactive" };
  });
  res.json(out);
});
r.get("/doctor/appointments", doc, (req, res) => res.json(db.appointments.filter((a) => a.doctorId === req.user.id).sort((a, b) => b.date.localeCompare(a.date))));
r.patch("/doctor/appointments/:id", doc, (req, res) => {
  const a = db.appointments.find((x) => x.id === req.params.id && x.doctorId === req.user.id);
  const st = req.body?.status;
  if (!a || !["confirmed", "cancelled", "completed"].includes(st)) return res.status(400).json({ message: "Invalid request." });
  a.status = st; notify(a.patientId, `Your appointment ${a.id} is ${st === "cancelled" ? "declined" : st}.`); save(); res.json(a);
});
r.get("/doctor/schedule", doc, (req, res) => res.json(req.user.profile.schedule || {}));
r.put("/doctor/schedule", doc, (req, res) => { req.user.profile.schedule = req.body || {}; save(); res.json(req.user.profile.schedule); });

r.get("/doctor/testimonials", doc, (_, res) => res.json(readT().testimonials));
r.patch("/doctor/testimonials/:id", doc, (req, res) => {
  const d = readT(); const t = d.testimonials.find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ message: "Not found." });
  if (["approved", "rejected"].includes(req.body?.status)) t.status = req.body.status;
  if (typeof req.body?.featured === "boolean") t.featured = req.body.featured;
  writeT(d); res.json(t);
});
r.delete("/doctor/testimonials/:id", doc, (req, res) => { const d = readT(); d.testimonials = d.testimonials.filter((x) => x.id !== req.params.id); writeT(d); res.json({ ok: true }); });

r.get("/doctor/payments", doc, (req, res) => res.json(db.payments.filter((p) => p.doctorId === req.user.id).reverse()));
r.patch("/doctor/payments/:id", doc, (req, res) => {
  const p = db.payments.find((x) => x.id === req.params.id && x.doctorId === req.user.id);
  const st = req.body?.status;
  if (!p || !["paid", "failed", "refunded", "unpaid"].includes(st)) return res.status(400).json({ message: "Invalid request." });
  p.status = st; notify(p.patientId, `Payment ${p.id} marked ${st}.`); save(); res.json(p);
});

r.get("/doctor/profile", doc, (req, res) => res.json(publicUser(req.user)));
r.put("/doctor/profile", doc, (req, res) => {
  const { name, phone, profile = {} } = req.body || {};
  if (name?.trim().length >= 3) req.user.name = name.trim();
  ["fee", "education", "experience", "workplace", "location", "bio", "certificates", "gallery", "settings"].forEach((k) => k in profile && (req.user.profile[k] = profile[k]));
  req.user.profile.fee = Number(req.user.profile.fee) || 3000;
  save(); res.json(publicUser(req.user));
});

export default r;
