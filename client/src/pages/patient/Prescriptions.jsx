import { Badge, Card, Empty, PageHeader, Spinner, Table, Td, btnGhost, btnPrimary, fmtDate, useFetch } from "../../components/ui";
import { printDoc } from "../../lib/print";

export default function Prescriptions() {
  const { data, loading } = useFetch("/patient/prescriptions");
  if (loading) return <Spinner />;
  const dl = (p) => printDoc("Prescription", [["ID", p.id], ["Medicine", p.medicine], ["Dosage", p.dosage], ["Frequency", p.frequency], ["Duration", p.duration], ["Date", fmtDate(p.date)], ["Doctor", p.doctor], ["Status", p.status]]);
  const active = data.filter((p) => p.status === "Active");
  return (
    <>
      <PageHeader title="Prescriptions" subtitle="Your prescribed medication history." />
      <Card className="!p-2"><h2 className="px-3 pt-3 font-semibold">Prescription History <span className="theme-muted text-xs font-normal">· {data.length}</span></h2>
        {data.length === 0 ? <Empty>No prescriptions yet.</Empty> : <Table head={["ID", "Medicine", "Dosage", "Frequency", "Duration", "Date", "Doctor", "Status", "Actions"]}>
          {data.map((p) => <tr key={p.id}><Td className="font-mono text-xs">{p.id}</Td><Td className="font-medium">{p.medicine}</Td><Td>{p.dosage}</Td><Td>{p.frequency}</Td><Td>{p.duration}</Td><Td>{fmtDate(p.date)}</Td><Td>{p.doctor}</Td><Td><Badge>{p.status}</Badge></Td><Td><button onClick={() => dl(p)} className="text-xs font-medium text-purple-600">Download</button></Td></tr>)}
        </Table>}
      </Card>
      {active.length > 0 && <><h2 className="mb-3 mt-8 font-semibold">Active Prescriptions</h2>
        <div className="grid gap-4 md:grid-cols-2">{active.map((p) => (
          <Card key={p.id}><div className="flex justify-between"><span className="font-mono text-xs text-slate-500">{p.id}</span><Badge>{p.status}</Badge></div><h3 className="mt-2 font-semibold">{p.medicine}</h3>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">{[["Dosage", p.dosage], ["Frequency", p.frequency], ["Duration", p.duration]].map(([k, v]) => <div key={k} className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/50"><p className="theme-muted">{k}</p><p className="mt-0.5 font-medium">{v}</p></div>)}</div>
            <button onClick={() => dl(p)} className={`${btnPrimary} mt-3 w-full`}>Download PDF</button></Card>))}</div></>}
    </>
  );
}
