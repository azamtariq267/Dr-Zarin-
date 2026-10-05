import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { api } from "../lib/api";
import { Alert, btnPrimary, inputCls } from "./ui";

// Verifies the 6-digit code that was sent by email + WhatsApp
export default function OtpStep({ userId, sentTo, onVerified, onBack }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState(""); const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false); const [wait, setWait] = useState(30);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t); }, [wait]);

  const verify = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { onVerified(await api("/auth/otp/verify", { method: "POST", body: { userId, code: code.trim() } })); }
    catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  const resend = async () => {
    setErr(""); setInfo("");
    try { await api("/auth/otp/resend", { method: "POST", body: { userId } }); setInfo("A new code was sent."); setWait(30); } catch (e2) { setErr(e2.message); }
  };
  return (
    <form onSubmit={verify} className="space-y-4">
      <div className="grid size-12 place-items-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/15"><MailCheck size={22} /></div>
      <div>
        <h2 className="text-xl font-semibold sm:text-2xl">Verify your account</h2>
        <p className="theme-muted mt-1 text-sm">We sent a 6-digit code to <b>{sentTo?.email}</b> by email and to <b>{sentTo?.phone}</b> on WhatsApp.</p>
      </div>
      <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" className={`${inputCls(err)} text-center text-2xl tracking-[.5em]`} autoFocus />
      <Alert>{err}</Alert><Alert tone="green">{info}</Alert>
      <button className={`${btnPrimary} w-full`} disabled={code.length !== 6 || busy}>{busy ? "Verifying…" : "Verify"}</button>
      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="text-slate-500 hover:underline">Back</button>
        <button type="button" onClick={resend} disabled={wait > 0} className="font-medium text-purple-600 hover:underline disabled:text-slate-400 disabled:no-underline dark:text-purple-400">{wait > 0 ? `Resend in ${wait}s` : "Resend code"}</button>
      </div>
    </form>
  );
}
