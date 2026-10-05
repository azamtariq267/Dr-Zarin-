import { Link } from "react-router-dom";
import { Badge, Card, Empty, PageHeader, Spinner, Stat, btnPrimary, fmtDate, useFetch } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

export default function Overview() {
  const { user } = useAuth();
  const { data, loading } = useFetch("/patient/overview");
  if (loading || !data) return <Spinner />;
  const c = data.counts;
  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} subtitle="Here's a summary of your care." action={<Link to="/patient/appointments" className={btnPrimary}>+ Book Appointment</Link>} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Appointments" value={c.appointments} /><Stat label="Active prescriptions" value={c.prescriptions} />
        <Stat label="Test results" value={c.tests} /><Stat label="Invoices due" value={c.due} tone={c.due ? "text-amber-600" : ""} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-3 font-semibold">Upcoming appointments</h2>
          {data.upcoming.length === 0 ? <Empty>No upcoming appointments.</Empty> : data.upcoming.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 border-b border-slate-100 py-2.5 last:border-0 dark:border-slate-800">
              <div><p className="text-sm font-medium">{fmtDate(a.date)} · {a.time}</p><p className="theme-muted text-xs">{a.type} · {a.center}</p></div><Badge>{a.status}</Badge>
            </div>))}
        </Card>
        <Card><h2 className="mb-3 font-semibold">Recent prescriptions</h2>
          {data.prescriptions.length === 0 ? <Empty>No prescriptions yet.</Empty> : data.prescriptions.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-2 border-b border-slate-100 py-2.5 last:border-0 dark:border-slate-800">
              <div><p className="text-sm font-medium">{p.medicine}</p><p className="theme-muted text-xs">{p.dosage} · {p.frequency}</p></div><Badge>{p.status}</Badge>
            </div>))}
        </Card>
      </div>
    </>
  );
}
