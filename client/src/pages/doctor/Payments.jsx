import { useState } from "react";
import { Badge, Card, Empty, PageHeader, Spinner, Stat, Table, Td, btnPrimary, fmtDate, inputCls, money, useFetch } from "../../components/ui";
import { api } from "../../lib/api";
import { printDoc } from "../../lib/print";
import { useAuth } from "../../context/AuthContext";

export default function Payments() {
  const { user } = useAuth();
  const { data, loading, reload } = useFetch("/doctor/payments");
  const [invId, setInvId] = useState("");
  if (loading) return <Spinner />;
  const sum = (s) => data.filter((p) => p.status === s).reduce((a, p) => a + p.amount, 0);
  const months = Array.from({ length: 12 }, (_, m) => data.filter((p) => p.status === "paid" && new Date(p.date).getMonth() === m).reduce((a, p) => a + p.amount, 0));
  const max = Math.max(1, ...months);
  const set = async (id, status) => { await api(`/doctor/payments/${id}`, { method: "PATCH", body: { status } }); reload(); };
  const inv = data.find((p) => p.id === invId);
  return (
    <>
      <PageHeader title="Payments & Revenue" subtitle="Confirm patient payments and generate invoices." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5"><Stat label="Total Revenue" value={money(sum("paid"))} /><Stat label="Paid" value={money(sum("paid"))} tone="text-emerald-600" /><Stat label="Pending" value={money(sum("verifying") + sum("unpaid"))} tone="text-amber-600" /><Stat label="Failed" value={money(sum("failed"))} tone="text-red-600" /><Stat label="Refunded" value={money(sum("refunded"))} tone="text-purple-600" /></div>
      <Card className="mt-6"><h2 className="font-semibold">Revenue Over Time</h2>
        <div className="mt-4 flex h-40 items-end gap-1.5 sm:gap-3">{months.map((v, i) => <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1"><div className="w-full rounded-t bg-purple-500" style={{ height: `${(v / max) * 100}%`, minHeight: v ? 4 : 0 }} title={money(v)} /><span className="text-[10px] text-slate-500">{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</span></div>)}</div></Card>
      <Card className="mt-6 !p-2"><h2 className="px-3 pt-3 font-semibold">Transactions</h2>
        {data.length === 0 ? <Empty>No payments yet.</Empty> : <Table head={["Invoice", "Patient", "Date", "Amount", "Method / Txn ID", "Status", "Actions"]}>{data.map((p) => <tr key={p.id}><Td className="font-mono text-xs">{p.id}</Td><Td className="font-medium">{p.patientName}</Td><Td>{fmtDate(p.date)}</Td><Td>{money(p.amount)}</Td><Td className="text-xs"><span className="capitalize">{p.method || "—"}</span><br />{p.txnId}</Td><Td><Badge>{p.status}</Badge></Td>
          <Td><div className="flex gap-3 text-xs font-medium">{p.status === "verifying" && <><button onClick={() => set(p.id, "paid")} className="text-emerald-600">Confirm</button><button onClick={() => set(p.id, "failed")} className="text-red-600">Reject</button></>}{p.status === "paid" && <button onClick={() => set(p.id, "refunded")} className="text-purple-600">Refund</button>}</div></Td></tr>)}</Table>}</Card>
      <Card className="mt-6 !bg-purple-50 dark:!bg-purple-500/10"><h2 className="font-semibold">Invoice Generation</h2><p className="theme-muted mb-3 text-sm">Generate a professional invoice for any transaction.</p>
        <div className="flex flex-wrap gap-2"><select value={invId} onChange={(e) => setInvId(e.target.value)} className={`${inputCls()} max-w-xs`}><option value="">Select invoice</option>{data.map((p) => <option key={p.id} value={p.id}>{p.id} — {p.patientName}</option>)}</select>
          <button disabled={!inv} onClick={() => printDoc(`Invoice ${inv.id}`, [["Doctor", user.name], ["Patient", inv.patientName], ["Service", inv.service], ["Date", fmtDate(inv.date)], ["Amount", money(inv.amount)], ["Status", inv.status], ["Method", inv.method], ["Transaction ID", inv.txnId]])} className={btnPrimary}>Generate / Print</button></div></Card>
    </>
  );
}
