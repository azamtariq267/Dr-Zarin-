import { useState } from "react";
import { Badge, Card, Empty, PageHeader, Spinner, Table, Td, fmtDate, initials, inputCls, useFetch } from "../../components/ui";

export default function Patients() {
  const { data, loading } = useFetch("/doctor/patients");
  const [q, setQ] = useState(""); const [st, setSt] = useState(""); const [g, setG] = useState("");
  if (loading) return <Spinner />;
  const rows = data.filter((p) => (!q || `${p.name} ${p.phone} ${p.code}`.toLowerCase().includes(q.toLowerCase())) && (!st || p.status === st) && (!g || p.gender === g));
  return (
    <>
      <PageHeader title="Patient Management" subtitle="View and manage all registered patients." />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, phone, or patient ID…" className={inputCls()} />
        <select value={st} onChange={(e) => setSt(e.target.value)} className={inputCls()}><option value="">All Statuses</option><option>Active</option><option>Inactive</option></select>
        <select value={g} onChange={(e) => setG(e.target.value)} className={inputCls()}><option value="">All Genders</option><option>Male</option><option>Female</option><option>Other</option></select>
      </div>
      <Card className="!p-2"><h2 className="px-3 pt-3 font-semibold">Patients ({rows.length})</h2>
        {rows.length === 0 ? <Empty>No patients yet. They appear once they book with you.</Empty> : (
          <Table head={["Patient ID", "Name", "Contact", "Last Visit", "Next Appointment", "Status"]}>{rows.map((p) => <tr key={p.id}><Td className="font-mono text-xs">{p.code}</Td><Td><span className="flex items-center gap-2 font-medium"><span className="grid size-8 place-items-center rounded-full bg-purple-100 text-xs text-purple-700">{initials(p.name)}</span>{p.name}</span></Td><Td>{p.phone}</Td><Td>{fmtDate(p.lastVisit)}</Td><Td>{fmtDate(p.nextAppointment)}</Td><Td><Badge>{p.status}</Badge></Td></tr>)}</Table>)}
      </Card>
    </>
  );
}
