import bcrypt from "bcryptjs";
import { db, save } from "./store.js";

// Demo accounts, created once on first run (disable with SEED_DEMO=false)
export function seed() {
  if (process.env.SEED_DEMO === "false" || db.users.length) return;
  const now = new Date().toISOString();
  const day = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  db.users.push(
    { id: "u_doctor_zarin", role: "doctor", name: "Prof. Dr. Muhammad Zarin", email: "doctor@zarincare.pk", phone: "+923001111111", passwordHash: bcrypt.hashSync("Doctor@123", 10), verified: true, status: "approved", pmdc: "10000-P", specialization: "General, Laparoscopic, Bariatric & Robotic Surgeon", hospital: "Northwest General Hospital, Peshawar", createdAt: now, profile: { fee: 3000, education: "MBBS, FCPS (Surgery)", experience: "19+", workplace: "Northwest General Hospital, Peshawar", location: "Peshawar, Pakistan", certificates: [], gallery: [] } },
    { id: "u_patient_demo", role: "patient", name: "Ahmed Khan", email: "patient@zarincare.pk", phone: "+923002222222", passwordHash: bcrypt.hashSync("Patient@123", 10), verified: true, createdAt: now, profile: { gender: "Male", bloodGroup: "B+", city: "Peshawar" } }
  );
  const p = "u_patient_demo", d = "u_doctor_zarin";
  db.appointments.push(
    { id: "APT-2026-001", doctorId: d, doctorName: "Prof. Dr. Muhammad Zarin", patientId: p, patientName: "Ahmed Khan", center: "Northwest General Hospital & Research Center", date: day(3), time: "04:00 PM", type: "Consultation", status: "confirmed", createdAt: now },
    { id: "APT-2026-002", doctorId: d, doctorName: "Prof. Dr. Muhammad Zarin", patientId: p, patientName: "Ahmed Khan", center: "Khyber Teaching Hospital", date: day(6), time: "10:00 AM", type: "Follow-up", status: "pending", createdAt: now },
    { id: "APT-2025-010", doctorId: d, doctorName: "Prof. Dr. Muhammad Zarin", patientId: p, patientName: "Ahmed Khan", center: "Northwest General Hospital & Research Center", date: day(-30), time: "09:00 AM", type: "Consultation", status: "completed", createdAt: now }
  );
  db.records.push({ id: "MR-1", patientId: p, doctorId: d, type: "Consultation", date: day(-30), diagnosis: "Initial consultation", treatment: "Assessment and investigations advised", notes: "Sample record" });
  db.prescriptions.push({ id: "RX-001", patientId: p, medicine: "Sample Medicine A", dosage: "500 mg", frequency: "Twice daily", duration: "7 days", date: day(-30), doctor: "Dr. Zarin", status: "Active" });
  db.tests.push({ id: "TR-1", patientId: p, name: "Complete Blood Count", date: day(-29), status: "Normal", result: "Within range" });
  db.payments.push({ id: "INV-2026-001", appointmentId: "APT-2026-001", patientId: p, patientName: "Ahmed Khan", doctorId: d, service: "Consultation", date: day(3), amount: 3000, status: "unpaid" });
  save();
  console.log("Seeded demo accounts: doctor@zarincare.pk / Doctor@123 and patient@zarincare.pk / Patient@123");
}
