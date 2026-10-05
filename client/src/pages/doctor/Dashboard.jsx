import { Badge, Card, Empty, PageHeader, Spinner, Stat, fmtDate, money, useFetch } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading } = useFetch("/doctor/dashboard");
  if (loading || !data) return <Spinner />;
  const s = data.stats;
  const Row = ({ a }) => <div className="flex items-center justify-between gap-2 border-b border-slate-100 py-2.5 last:border-0 dark:border-slate-800"><div><p className="text-sm font-medium">{a.patientName}</p><p className="theme-muted text-xs">{fmtDate(a.date)} · {a.time} · {a.type}</p></div><Badge>{a.status}</Badge></div>;
  return (
    <>
      <PageHeader title={`Welcome, ${user.name}`} subtitle="Practice overview." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><Stat label="Total patients" value={s.patients} /><Stat label="Today's appointments" value={s.today} /><Stat label="Pending requests" value={s.pending} tone="text-amber-600" /><Stat label="Revenue (paid)" value={money(s.revenue)} tone="text-emerald-600" /></div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-2 font-semibold">Pending requests</h2>{data.pending.length ? data.pending.map((a) => <Row key={a.id} a={a} />) : <Empty>No pending requests.</Empty>}</Card>
        <Card><h2 className="mb-2 font-semibold">Upcoming confirmed</h2>{data.upcoming.length ? data.upcoming.map((a) => <Row key={a.id} a={a} />) : <Empty>Nothing scheduled.</Empty>}</Card>
      </div>
    </>
  );
}
