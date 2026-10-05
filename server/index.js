import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import authRouter from "./auth.js";
import portalRouter from "./portal.js";
import { seed } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");
const app = express();
const PORT = process.env.PORT || 5000;

const defaultData = {
  centers: [
    {
      id: "kth",
      name: "Khyber Teaching Hospital",
      city: "Peshawar",
      address: "University Road, Peshawar, Pakistan",
      mapQuery: "Khyber Teaching Hospital Peshawar Pakistan",
      phone: "+92 333 9414477",
      schedule: [
        { day: "Monday", hours: "9:00 AM - 2:00 PM", type: "Outpatient Consultation" },
        { day: "Tuesday", hours: "9:00 AM - 2:00 PM", type: "Surgical Rounds" },
        { day: "Wednesday", hours: "9:00 AM - 2:00 PM", type: "Outpatient Consultation" },
        { day: "Thursday", hours: "By Appointment", type: "Elective Surgery" },
        { day: "Friday", hours: "9:00 AM - 2:00 PM", type: "Outpatient Consultation" },
        { day: "Saturday", hours: "Closed", type: "Closed" },
        { day: "Sunday", hours: "Closed", type: "Closed" }
      ]
    },
    {
      id: "northwest-general",
      name: "Northwest General Hospital & Research Center",
      city: "Peshawar",
      address: "Hayatabad, Peshawar, Pakistan",
      mapQuery: "Northwest General Hospital Peshawar Pakistan",
      phone: "+92 91 111 583 583",
      schedule: [
        { day: "Monday", hours: "4:00 PM - 7:00 PM", type: "Consultation" },
        { day: "Tuesday", hours: "4:00 PM - 7:00 PM", type: "Consultation" },
        { day: "Wednesday", hours: "4:00 PM - 7:00 PM", type: "Consultation" },
        { day: "Thursday", hours: "4:00 PM - 7:00 PM", type: "Consultation" },
        { day: "Friday", hours: "By Appointment", type: "Surgical Follow-up" },
        { day: "Saturday", hours: "Closed", type: "Closed" },
        { day: "Sunday", hours: "Closed", type: "Closed" }
      ]
    }
  ],
  testimonials: []
};

async function readDb() {
  try { return JSON.parse(await fs.readFile(DATA_FILE, "utf8")); }
  catch { await fs.mkdir(DATA_DIR, { recursive: true }); await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2)); return defaultData; }
}
async function writeDb(data) { await fs.mkdir(DATA_DIR, { recursive: true }); await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2)); }

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use("/api", authRouter);
app.use("/api", portalRouter);
seed();
app.get("/api/health", (_, res) => res.json({ ok: true }));

app.get("/api/centers", async (_, res) => res.json((await readDb()).centers));
app.post("/api/centers", async (req, res) => {
  const { name, city, address, mapQuery, phone, schedule } = req.body || {};
  if (!name || !address || !mapQuery) return res.status(400).json({ message: "Name, address and mapQuery are required." });
  const db = await readDb();
  const center = { id: `${Date.now()}`, name, city: city || "", address, mapQuery, phone: phone || "", schedule: Array.isArray(schedule) ? schedule : [] };
  db.centers.push(center); await writeDb(db); res.status(201).json(center);
});
app.delete("/api/centers/:id", async (req, res) => {
  const db = await readDb();
  const before = db.centers.length;
  db.centers = db.centers.filter(c => c.id !== req.params.id);
  if (before === db.centers.length) return res.status(404).json({ message: "Center not found." });
  await writeDb(db); res.json({ ok: true });
});
app.put("/api/centers/:id", async (req, res) => {
  const db = await readDb(); const idx = db.centers.findIndex(c => c.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: "Center not found." });
  db.centers[idx] = { ...db.centers[idx], ...req.body, id: req.params.id }; await writeDb(db); res.json(db.centers[idx]);
});

app.get("/api/testimonials", async (_, res) => res.json((await readDb()).testimonials.filter(t => t.status !== "pending" && t.status !== "rejected")));
app.post("/api/testimonials", async (req, res) => {
  const { name, procedure, rating, comment } = req.body || {};
  if (!name || !comment || !rating) return res.status(400).json({ message: "Name, rating and comment are required." });
  const db = await readDb();
  const testimonial = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: name.trim(), procedure: procedure?.trim() || "Patient", rating: Math.min(5, Math.max(1, Number(rating))), comment: comment.trim(), status: "pending", featured: false, createdAt: new Date().toISOString() };
  db.testimonials.unshift(testimonial); await writeDb(db); res.status(201).json(testimonial);
});

app.listen(PORT, () => console.log(`ZarinCare API running on http://localhost:${PORT}`));
