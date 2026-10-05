import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");
fs.mkdirSync(dir, { recursive: true });
const FILE = path.join(dir, "app.json");
const empty = { users: [], otps: [], resets: [], appointments: [], records: [], prescriptions: [], tests: [], payments: [], notifications: [] };

// JSON-file store. Swap for PostgreSQL/MongoDB later by replacing db/save.
export const db = fs.existsSync(FILE) ? { ...empty, ...JSON.parse(fs.readFileSync(FILE, "utf8")) } : { ...empty };
export const save = () => fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
export const uid = (p = "") => p + crypto.randomBytes(6).toString("hex");
export const sha = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");
export const DATA_DIR = dir;
