// Opens a printable page; the user can "Save as PDF" from the print dialog.
export function printDoc(title, rows) {
  const w = window.open("", "_blank");
  if (!w) return alert("Allow pop-ups to download.");
  const esc = (s) => String(s ?? "—").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  w.document.write(`<html><head><title>${esc(title)}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{color:#7e22ce;font-size:22px}table{border-collapse:collapse;width:100%;max-width:560px}td{border-bottom:1px solid #ddd;padding:8px 4px}td:first-child{color:#666;width:40%}</style></head><body><h1>ZarinCare — ${esc(title)}</h1><table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table></body></html>`);
  w.document.close(); w.focus(); setTimeout(() => w.print(), 300);
}
export function downloadIcs(a) {
  const d = a.date.replace(/-/g, ""); const [t, ap] = a.time.split(" "); let [h, m] = t.split(":").map(Number);
  if (ap === "PM" && h < 12) h += 12; if (ap === "AM" && h === 12) h = 0;
  const st = `${d}T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `SUMMARY:Appointment with ${a.doctorName}`, `LOCATION:${a.center}`, `DTSTART:${st}`, `DURATION:PT30M`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); link.download = `${a.id}.ics`; link.click();
}
