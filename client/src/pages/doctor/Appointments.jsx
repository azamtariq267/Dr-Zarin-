import { Fragment, useState } from "react";
import { Badge, Card, Empty, PageHeader, Spinner, Table, Tabs, Td, fmtDate, inputCls, useFetch } from "../../components/ui";
import { api } from "../../lib/api";

export default function Appointments() {
  const { data, loading, reload } = useFetch("/doctor/appointments");
  const [tab, setTab] = useState("pending"); const [date, setDate] = useState(""); const [loc, setLoc] = useState(""); const [view, setView] = useState(null);
  const centers = useFetch("/centers");
  if (loading) return <Spinner />;
  const today = new Date().toISOString().slice(0, 10);
  const rows = data.filter((a) => (tab === "all" || (tab === "upcoming" ? a.status === "confirmed" && a.date >= today : a.status === tab)) && (!date || a.date === date) && (!loc || a.center === loc));
  const act = async (id, status) => { await api(`/doctor/appointments/${id}`, { method: "PATCH", body: { status } }); reload(); };
  return (
    <>
      <PageHeader title="Appointment Management" subtitle="Manage all patient appointments." />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={[["all", "All"], ["upcoming", "Upcoming"], ["pending", "Pending"], ["completed", "Completed"], ["cancelled", "Cancelled"]]} value={tab} onChange={setTab} />
        <div className="flex flex-wrap gap-2"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls()} /><select value={loc} onChange={(e) => setLoc(e.target.value)} className={inputCls()}><option value="">All Locations</option>{centers.data?.map((c) => <option key={c.id}>{c.name}</option>)}</select></div>
      </div>
      <Card className="!p-2">{rows.length === 0 ? <Empty>No appointments.</Empty> : (
        <Table head={["Patient", "Appt ID", "Date", "Time", "Type", "Location", "Status", "Actions"]}>{rows.map((a) => (
          <Fragment key={a.id}><tr><Td className="font-medium">{a.patientName}</Td><Td className="font-mono text-xs">{a.id}</Td><Td>{fmtDate(a.date)}</Td><Td>{a.time}</Td><Td>{a.type}</Td><Td className="max-w-[180px] truncate">{a.center}</Td><Td><Badge>{a.status}</Badge></Td>
            <Td><div className="flex gap-3 text-xs font-medium"><button onClick={() => setView(view === a.id ? null : a.id)} className="text-purple-600">View</button>
              {a.status === "pending" && <><button onClick={() => act(a.id, "confirmed")} className="text-emerald-600">Approve</button><button onClick={() => act(a.id, "cancelled")} className="text-red-600">Decline</button></>}
              {a.status === "confirmed" && <button onClick={() => act(a.id, "completed")} className="text-slate-600 dark:text-slate-300">Mark done</button>}</div></Td></tr>
            {view === a.id && <tr><Td colSpan={8} className="bg-slate-50 text-sm dark:bg-slate-800/40">Patient message: {a.notes || "—"}</Td></tr>}</Fragment>))}</Table>)}
      </Card>
    </>
  );
}
