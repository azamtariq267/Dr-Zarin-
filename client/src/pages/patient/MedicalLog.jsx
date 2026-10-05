import { FileText } from "lucide-react";
import { Badge, Card, Empty, PageHeader, Spinner, btnGhost, fmtDate, useFetch } from "../../components/ui";
import { printDoc } from "../../lib/print";

export default function MedicalLog() {
  const rec = useFetch("/patient/records"); const rx = useFetch("/patient/prescriptions");
  if (rec.loading || rx.loading) return <Spinner />;
  return (
    <>
      <PageHeader title="Medical Log" subtitle="Your visit history, diagnoses and documents." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {rec.data.length === 0 ? <Card><Empty>No medical records yet. They appear after your visits.</Empty></Card> : rec.data.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-wrap items-center justify-between gap-2"><Badge tone="purple">{r.type}</Badge><span className="theme-muted text-xs">{fmtDate(r.date)}</span></div>
              {[["Diagnosis", r.diagnosis], ["Treatment", r.treatment], ["Notes", r.notes]].map(([k, v]) => v && <div key={k} className="mt-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{k}</p><p className="text-sm">{v}</p></div>)}
            </Card>))}
        </div>
        <div className="space-y-3">
          <h2 className="font-semibold">Documents</h2>
          {rx.data.length === 0 ? <Card><Empty>No documents.</Empty></Card> : rx.data.map((p) => (
            <Card key={p.id}><div className="flex items-start gap-3"><FileText size={20} className="mt-0.5 text-slate-400" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">Prescription — {p.medicine}</p><p className="theme-muted text-xs">{fmtDate(p.date)}</p></div></div>
              <button onClick={() => printDoc("Prescription", [["Medicine", p.medicine], ["Dosage", p.dosage], ["Frequency", p.frequency], ["Duration", p.duration], ["Date", fmtDate(p.date)], ["Doctor", p.doctor]])} className={`${btnGhost} mt-3 w-full !py-1.5`}>Download</button></Card>))}
        </div>
      </div>
    </>
  );
}
