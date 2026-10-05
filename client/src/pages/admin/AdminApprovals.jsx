import { useEffect, useState } from "react";
import { API_BASE, api } from "../../lib/api";
import { Alert, Badge, Card, btnGhost, btnPrimary, inputCls } from "../../components/ui";

function KycImg({ file, adminKey }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let url;
    fetch(`${API_BASE}/admin/kyc/${file}`, { headers: { "x-admin-key": adminKey } }).then((r) => r.blob()).then((b) => setSrc((url = URL.createObjectURL(b))));
    return () => url && URL.revokeObjectURL(url);
  }, [file, adminKey]);
  return src ? <a href={src} target="_blank" rel="noreferrer"><img src={src} alt="" className="h-32 w-full rounded-lg object-cover" /></a> : <div className="h-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />;
}

export default function AdminApprovals() {
  const [key, setKey] = useState(sessionStorage.getItem("zc_admin") || "");
  const [list, setList] = useState(null); const [err, setErr] = useState("");
  const load = async (k = key) => {
    setErr("");
    try { setList(await api("/admin/doctors", { headers: { "x-admin-key": k } })); sessionStorage.setItem("zc_admin", k); } catch (e) { setErr(e.message); setList(null); }
  };
  const act = async (id, action) => { await api(`/admin/doctors/${id}/${action}`, { method: "POST", headers: { "x-admin-key": key } }); load(); };
  useEffect(() => { if (key) load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Doctor verification (admin)</h1>
      <p className="theme-muted mt-1 text-sm">Check each PMDC number on the official PMDC website, compare the CNIC and live photo, then approve or reject.</p>
      <div className="mt-5 flex max-w-md gap-2"><input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Admin key" className={inputCls()} /><button onClick={() => load()} className={btnPrimary}>Load</button></div>
      <div className="mt-3"><Alert>{err}</Alert></div>
      <div className="mt-6 space-y-4">
        {list?.map((d) => (
          <Card key={d.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><p className="font-semibold">{d.name} <span className="theme-muted font-normal">· PMDC {d.pmdc}</span></p><p className="theme-muted text-sm">{d.specialization} · {d.email} · {d.phone} · OTP {d.verified ? "verified" : "not verified"}</p></div>
              <Badge>{d.status}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">{["cnicFront", "cnicBack", "selfie"].map((k) => <div key={k}><p className="mb-1 text-xs text-slate-500">{k === "selfie" ? "Live photo" : k === "cnicFront" ? "CNIC front" : "CNIC back"}</p><KycImg file={d.kyc[k]} adminKey={key} /></div>)}</div>
            {d.status === "pending" && <div className="mt-4 flex gap-2"><button onClick={() => act(d.id, "approve")} className={btnPrimary}>Approve</button><button onClick={() => act(d.id, "reject")} className={btnGhost}>Reject</button></div>}
          </Card>
        ))}
        {list?.length === 0 && <p className="theme-muted text-sm">No doctor registrations yet.</p>}
      </div>
    </div>
  );
}
