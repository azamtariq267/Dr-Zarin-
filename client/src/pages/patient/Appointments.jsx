import { Fragment, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Alert, Badge, Card, Empty, PageHeader, Spinner, Table, Tabs, Td, btnGhost, btnPrimary, fmtDate, inputCls, useFetch } from "../../components/ui";
import { api } from "../../lib/api";
import { downloadIcs } from "../../lib/print";

const STEPS = ["Location", "Date", "Time", "Details", "Confirm"];
const TYPES = ["Consultation", "Follow-up", "Pre-operative Assessment", "Post-operative Review"];

function Wizard({ onClose, onDone }) {
  const doctors = useFetch("/doctors"); const centers = useFetch("/centers");
  const [step, setStep] = useState(0); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [done, setDone] = useState(null);
  const [f, setF] = useState({ doctorId: "", center: "", date: "", time: "", type: TYPES[0], notes: "" });
  const [slots, setSlots] = useState([]);
  const doctor = doctors.data?.find((d) => d.id === f.doctorId);
  useEffect(() => { if (doctors.data?.length && !f.doctorId) setF((p) => ({ ...p, doctorId: doctors.data[0].id })); }, [doctors.data, f.doctorId]);
  useEffect(() => { if (f.doctorId && f.date) api(`/doctors/${f.doctorId}/slots?date=${f.date}`).then((r) => setSlots(r.slots)).catch(() => setSlots([])); }, [f.doctorId, f.date]);
  const today = new Date().toISOString().slice(0, 10);

  const next = () => {
    setErr("");
    if (step === 0 && (!f.doctorId || !f.center)) return setErr("Choose a doctor and a location.");
    if (step === 1 && (!f.date || f.date < today)) return setErr("Pick a date from today onwards.");
    if (step === 2 && !f.time) return setErr("Pick a time slot.");
    setStep(step + 1);
  };
  const confirm = async () => {
    setBusy(true); setErr("");
    try { const a = await api("/patient/appointments", { method: "POST", body: f }); setDone(a); onDone(); } catch (e) { setErr(e.message); if (e.status === 409) setStep(2); } finally { setBusy(false); }
  };

  if (done) return (
    <Card className="mx-auto mb-6 max-w-md text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600"><Check size={28} /></div>
      <h2 className="mt-3 text-xl font-semibold">Appointment Booked!</h2>
      <p className="theme-muted text-sm">{done.status === "confirmed" ? "Your appointment is confirmed." : "Your request was sent. The doctor will confirm it shortly."}</p>
      <dl className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4 text-left text-sm dark:bg-slate-800/50">
        {[["Appointment ID", done.id], ["Doctor", done.doctorName], ["Location", done.center], ["Date", fmtDate(done.date)], ["Time", done.time], ["Status", <Badge key="s">{done.status}</Badge>]].map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="theme-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
      </dl>
      <div className="mt-4 space-y-2"><button onClick={() => downloadIcs(done)} className={`${btnPrimary} w-full`}>Add to Calendar</button><button onClick={onClose} className={`${btnGhost} w-full`}>Return to Appointments</button></div>
    </Card>
  );

  return (
    <Card className="mb-6">
      <h2 className="font-semibold">Book New Appointment</h2>
      <ol className="my-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {STEPS.map((s, i) => <li key={s} className="flex items-center gap-1.5"><span className={`grid size-6 place-items-center rounded-full text-[11px] font-semibold ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-500 dark:bg-slate-700"}`}>{i < step ? <Check size={12} /> : i + 1}</span><span className={i === step ? "font-medium" : "theme-muted"}>{s}</span>{i < 4 && <span className="mx-1 h-px w-4 bg-slate-300 dark:bg-slate-600" />}</li>)}
      </ol>
      {step === 0 && (<div className="space-y-3">
        <label className="block text-sm font-medium">Doctor
          <select value={f.doctorId} onChange={(e) => setF({ ...f, doctorId: e.target.value })} className={`${inputCls()} mt-1.5`}>{doctors.data?.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}</select></label>
        <p className="text-sm font-medium">Select Location</p>
        <div className="grid gap-3 sm:grid-cols-2">{centers.data?.map((c) => (
          <button key={c.id} type="button" onClick={() => setF({ ...f, center: c.name })} className={`rounded-lg border p-3 text-left text-sm transition ${f.center === c.name ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10" : "border-slate-200 dark:border-slate-700"}`}><p className="font-medium">{c.name}</p><p className="theme-muted text-xs">{c.address}</p></button>))}</div>
      </div>)}
      {step === 1 && <label className="block text-sm font-medium">Select Date<input type="date" min={today} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value, time: "" })} className={`${inputCls()} mt-1.5`} /></label>}
      {step === 2 && (<div><p className="mb-2 text-sm font-medium">Select Time Slot</p>
        {slots.length === 0 ? <Empty>The doctor is not available on this date. Go back and pick another.</Empty> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{slots.map((s) => <button key={s.time} disabled={!s.available} onClick={() => setF({ ...f, time: s.time })} className={`rounded-lg border py-2.5 text-sm transition disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${f.time === s.time ? "border-purple-500 bg-purple-50 font-medium text-purple-700 dark:bg-purple-500/10" : "border-slate-200 dark:border-slate-700"}`}>{s.time}</button>)}</div>}</div>)}
      {step === 3 && (<div className="space-y-3">
        <label className="block text-sm font-medium">Appointment type<select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className={`${inputCls()} mt-1.5`}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className="block text-sm font-medium">Reason / message<textarea rows={3} maxLength={500} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Briefly describe your concern" className={`${inputCls()} mt-1.5`} /></label></div>)}
      {step === 4 && <dl className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800/50">{[["Doctor", doctor?.name], ["Location", f.center], ["Date", fmtDate(f.date)], ["Time", f.time], ["Type", f.type], ["Consultation fee", `PKR ${(doctor?.fee || 0).toLocaleString()}`]].map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="theme-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>}
      <div className="mt-3"><Alert>{err}</Alert></div>
      <div className="mt-4 flex justify-between gap-2">
        <button onClick={step === 0 ? onClose : () => setStep(step - 1)} className={btnGhost}>{step === 0 ? "Cancel" : "Back"}</button>
        {step < 4 ? <button onClick={next} className={btnPrimary}>Next</button> : <button onClick={confirm} disabled={busy} className={btnPrimary}>{busy ? "Booking…" : "Confirm Booking"}</button>}
      </div>
    </Card>
  );
}

export default function Appointments() {
  const { data, loading, reload } = useFetch("/patient/appointments");
  const [tab, setTab] = useState("upcoming"); const [book, setBook] = useState(false); const [view, setView] = useState(null);
  const shown = data?.filter((a) => (tab === "upcoming" ? ["pending", "confirmed"].includes(a.status) : a.status === tab)) || [];
  const cancel = async (a, rebook) => {
    if (!confirm(rebook ? "Cancel this appointment and choose a new time?" : "Cancel this appointment?")) return;
    await api(`/patient/appointments/${a.id}/cancel`, { method: "POST" }); reload(); if (rebook) setBook(true);
  };
  return (
    <>
      <PageHeader title="My Appointments" subtitle="Manage and book your appointments." action={!book && <button onClick={() => setBook(true)} className={btnPrimary}>+ Book Appointment</button>} />
      {book && <Wizard onClose={() => setBook(false)} onDone={reload} />}
      <Tabs tabs={[["upcoming", "Upcoming"], ["completed", "Completed"], ["cancelled", "Cancelled"]]} value={tab} onChange={setTab} />
      <Card className="!p-2">
        {loading ? <Spinner /> : shown.length === 0 ? <Empty>No {tab} appointments.</Empty> : (
          <Table head={["Appointment ID", "Doctor", "Date", "Time", "Type", "Status", "Actions"]}>
            {shown.map((a) => (<Fragment key={a.id}>
              <tr>
                <Td className="font-mono text-xs">{a.id}</Td><Td><p className="font-medium">{a.doctorName}</p><p className="theme-muted text-xs">{a.center}</p></Td>
                <Td>{fmtDate(a.date)}</Td><Td>{a.time}</Td><Td>{a.type}</Td><Td><Badge>{a.status}</Badge></Td>
                <Td><div className="flex gap-3 text-xs font-medium"><button onClick={() => setView(view === a.id ? null : a.id)} className="text-purple-600">View</button>
                  {["pending", "confirmed"].includes(a.status) && <><button onClick={() => cancel(a, true)} className="text-slate-600 dark:text-slate-300">Reschedule</button><button onClick={() => cancel(a)} className="text-red-600">Cancel</button></>}</div></Td>
              </tr>
              {view === a.id && <tr><Td className="bg-slate-50 text-sm dark:bg-slate-800/40" colSpan={7}>Location: {a.center} · Reason: {a.notes || "—"}</Td></tr>}
            </Fragment>))}
          </Table>)}
      </Card>
    </>
  );
}
