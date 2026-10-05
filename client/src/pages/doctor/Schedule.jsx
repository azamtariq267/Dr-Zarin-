import { useEffect, useState } from "react";
import { Alert, Card, PageHeader, Spinner, btnPrimary, inputCls, useFetch } from "../../components/ui";
import { api } from "../../lib/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const def = (d) => ({ on: !["Saturday", "Sunday"].includes(d), center: "", start: "09:00", end: "14:00", brk: "" });

export default function Schedule() {
  const sched = useFetch("/doctor/schedule"); const centers = useFetch("/centers");
  const [s, setS] = useState(null); const [msg, setMsg] = useState("");
  useEffect(() => { if (sched.data) setS(Object.fromEntries(DAYS.map((d) => [d, { ...def(d), ...sched.data[d] }]))); }, [sched.data]);
  if (!s || centers.loading) return <Spinner />;
  const up = (d, k, v) => setS({ ...s, [d]: { ...s[d], [k]: v } });
  const save = async () => { await api("/doctor/schedule", { method: "PUT", body: s }); setMsg("Schedule saved."); };
  return (
    <>
      <PageHeader title="Schedule Management" subtitle="Set your availability. Patients can only book on days that are switched on." />
      <div className="space-y-3">{DAYS.map((d) => (
        <Card key={d} className={s[d].on ? "" : "opacity-60"}>
          <div className="grid items-center gap-3 md:grid-cols-[150px_auto_1fr]">
            <div><p className="font-semibold">{d}</p><p className={`text-xs ${s[d].on ? "text-emerald-600" : "text-slate-400"}`}>{s[d].on ? "Available" : "Unavailable"}</p></div>
            <button onClick={() => up(d, "on", !s[d].on)} role="switch" aria-checked={s[d].on} aria-label={`Toggle ${d}`} className={`relative h-6 w-11 rounded-full transition ${s[d].on ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"}`}><span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${s[d].on ? "left-[22px]" : "left-0.5"}`} /></button>
            {s[d].on ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><select value={s[d].center} onChange={(e) => up(d, "center", e.target.value)} className={`${inputCls()} col-span-2 sm:col-span-1`}><option value="">Location</option>{centers.data?.map((c) => <option key={c.id}>{c.name}</option>)}</select>
              {[["start", "Start"], ["end", "End"], ["brk", "Break"]].map(([k, l]) => <label key={k} className="text-xs text-slate-500">{l}<input type="time" value={s[d][k]} onChange={(e) => up(d, k, e.target.value)} className={inputCls()} /></label>)}</div> : <p className="theme-muted text-sm italic">Not available on {d}</p>}
          </div></Card>))}</div>
      <div className="mt-4 flex items-center gap-3"><button onClick={save} className={btnPrimary}>Save Schedule</button><Alert tone="green">{msg}</Alert></div>
    </>
  );
}
