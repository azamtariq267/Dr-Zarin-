import { Star } from "lucide-react";
import { Badge, Card, Empty, PageHeader, Spinner, Stat, Table, Td, fmtDate, useFetch } from "../../components/ui";
import { api } from "../../lib/api";

const Stars = ({ n }) => <span className="flex text-amber-400">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={13} fill={i <= n ? "currentColor" : "none"} />)}</span>;

export default function Testimonials() {
  const { data, loading, reload } = useFetch("/doctor/testimonials");
  if (loading) return <Spinner />;
  const st = (t) => t.status || "approved"; const pending = data.filter((t) => st(t) === "pending");
  const patch = async (id, body) => { await api(`/doctor/testimonials/${id}`, { method: "PATCH", body }); reload(); };
  const del = async (id) => { if (confirm("Remove this testimonial?")) { await api(`/doctor/testimonials/${id}`, { method: "DELETE" }); reload(); } };
  return (
    <>
      <PageHeader title="Testimonials" subtitle="Approve patient reviews before they appear on your website." />
      <div className="mb-6 grid grid-cols-3 gap-4"><Stat label="Total" value={data.length} /><Stat label="Approved" value={data.filter((t) => st(t) === "approved").length} tone="text-emerald-600" /><Stat label="Pending" value={pending.length} tone="text-amber-600" /></div>
      {pending.length > 0 && <><h2 className="mb-3 font-semibold">Pending Review ({pending.length})</h2><div className="mb-6 space-y-3">{pending.map((t) => <Card key={t.id} className="!bg-amber-50 dark:!bg-amber-500/10"><div className="flex justify-between"><div><p className="font-medium">{t.name}</p><Stars n={t.rating} /></div><Badge>pending</Badge></div><p className="mt-2 text-sm italic">"{t.comment}"</p><div className="mt-3 flex gap-2"><button onClick={() => patch(t.id, { status: "approved" })} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white">Approve</button><button onClick={() => patch(t.id, { status: "rejected" })} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white">Reject</button></div></Card>)}</div></>}
      <h2 className="mb-3 font-semibold">All Testimonials</h2>
      <Card className="!p-2">{data.length === 0 ? <Empty>No testimonials yet.</Empty> : <Table head={["Patient", "Rating", "Review", "Date", "Status", "Featured", "Actions"]}>{data.map((t) => <tr key={t.id}><Td className="font-medium">{t.name}</Td><Td><Stars n={t.rating} /></Td><Td className="max-w-xs truncate">{t.comment}</Td><Td>{fmtDate(t.createdAt?.slice(0, 10))}</Td><Td><Badge>{st(t)}</Badge></Td>
        <Td><button onClick={() => patch(t.id, { featured: !t.featured })} className={`rounded-full px-2.5 py-0.5 text-xs ${t.featured ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-700"}`}>{t.featured ? "★ Featured" : "Feature"}</button></Td><Td><button onClick={() => del(t.id)} className="text-xs font-medium text-red-600">Remove</button></Td></tr>)}</Table>}</Card>
    </>
  );
}
