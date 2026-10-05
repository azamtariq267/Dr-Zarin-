import { useState } from "react";
import { CreditCard, Landmark, Lock, Smartphone } from "lucide-react";
import { Alert, Badge, Card, Empty, PageHeader, Spinner, Table, Td, btnGhost, btnPrimary, fmtDate, inputCls, money, useFetch } from "../../components/ui";
import { api } from "../../lib/api";

const METHODS = [["jazzcash", "JazzCash", "Mobile payment", Smartphone], ["easypaisa", "Easypaisa", "Mobile payment", Smartphone], ["bank", "Bank Transfer", "Direct bank transfer", Landmark], ["card", "Debit / Credit Card", "Visa, Mastercard", CreditCard]];

export default function Payments() {
  const { data, loading, reload } = useFetch("/patient/payments");
  const [inv, setInv] = useState(null); const [method, setMethod] = useState("jazzcash"); const [txn, setTxn] = useState("");
  const [err, setErr] = useState(""); const [ok, setOk] = useState(""); const [busy, setBusy] = useState(false);
  if (loading) return <Spinner />;
  const pay = async () => {
    setBusy(true); setErr("");
    try { await api(`/patient/payments/${inv.id}/pay`, { method: "POST", body: { method, txnId: txn } }); setOk("Payment submitted. The doctor will confirm it shortly."); setInv(null); setTxn(""); reload(); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const acct = inv?.accounts?.[method];
  return (
    <>
      <PageHeader title="Payments & Billing" subtitle="View invoices, payment history, and complete pending payments." />
      <Alert tone="green">{ok}</Alert>
      {inv && (
        <Card className="mb-6"><div className="mb-4 flex items-center gap-2 font-semibold"><Lock size={16} className="text-purple-600" /> Secure Payment</div>
          <div className="grid gap-6 md:grid-cols-2">
            <dl className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800/50">{[["Invoice ID", inv.id], ["Appointment", inv.appointmentId], ["Service", inv.service], ["Date", fmtDate(inv.date)], ["Amount", money(inv.amount)]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="theme-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
            <div>
              <p className="mb-2 text-sm font-medium">Select Payment Method</p>
              <div className="space-y-2">{METHODS.map(([k, l, s, Icon]) => <label key={k} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${method === k ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10" : "border-slate-200 dark:border-slate-700"}`}><input type="radio" checked={method === k} onChange={() => setMethod(k)} className="accent-purple-600" /><Icon size={17} /><span><span className="block font-medium">{l}</span><span className="theme-muted text-xs">{s}</span></span></label>)}</div>
              <p className="theme-muted mt-3 text-xs">{acct ? `Send ${money(inv.amount)} to: ${acct}. Then enter the transaction ID below.` : "Pay using your app or bank, then enter the transaction / reference ID below. The doctor confirms receipt."}</p>
              <input value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="Transaction ID" className={`${inputCls()} mt-2`} />
              <div className="mt-3"><Alert>{err}</Alert></div>
              <button onClick={pay} disabled={busy} className={`${btnPrimary} mt-3 w-full`}>{busy ? "Submitting…" : `Submit payment — ${money(inv.amount)}`}</button>
              <button onClick={() => setInv(null)} className={`${btnGhost} mt-2 w-full`}>Cancel</button>
            </div>
          </div></Card>)}
      <Card className="!p-2"><h2 className="px-3 pt-3 font-semibold">Invoices</h2>
        {data.length === 0 ? <Empty>No invoices yet. One is created when you book an appointment.</Empty> : (
          <Table head={["Invoice", "Service", "Date", "Amount", "Method", "Status", "Action"]}>{data.map((p) => <tr key={p.id}><Td className="font-mono text-xs">{p.id}</Td><Td>{p.service}</Td><Td>{fmtDate(p.date)}</Td><Td>{money(p.amount)}</Td><Td className="capitalize">{p.method || "—"}</Td><Td><Badge>{p.status}</Badge></Td><Td>{p.status === "unpaid" && <button onClick={() => { setInv(p); setOk(""); }} className="text-xs font-medium text-purple-600">Pay now</button>}</Td></tr>)}</Table>)}
      </Card>
    </>
  );
}
