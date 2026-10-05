import { Bell } from "lucide-react";
import { Card, Empty, PageHeader, Spinner, btnGhost, useFetch } from "../../components/ui";
import { api } from "../../lib/api";

export default function Notifications() {
  const { data, loading, reload } = useFetch("/notifications");
  if (loading) return <Spinner />;
  return (
    <>
      <PageHeader title="Notifications" subtitle="Appointment requests, payments and updates." action={data.some((n) => !n.read) && <button onClick={async () => { await api("/notifications/read", { method: "POST" }); reload(); }} className={btnGhost}>Mark all read</button>} />
      <Card className="max-w-3xl !p-2">{data.length === 0 ? <Empty>You're all caught up.</Empty> : data.map((n) => <div key={n.id} className="flex items-start gap-3 border-b border-slate-100 p-3 last:border-0 dark:border-slate-800"><Bell size={16} className={`mt-0.5 shrink-0 ${n.read ? "text-slate-400" : "text-purple-600"}`} /><div><p className={`text-sm ${n.read ? "" : "font-medium"}`}>{n.text}</p><p className="theme-muted text-xs">{new Date(n.createdAt).toLocaleString()}</p></div></div>)}</Card>
    </>
  );
}
