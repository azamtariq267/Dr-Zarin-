import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../../components/AuthShell";
import { Alert, Field, btnPrimary, inputCls } from "../../components/ui";
import { api } from "../../lib/api";

export default function ForgotPassword() {
  const [f, setF] = useState({ phone: "", email: "" });
  const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) || f.phone.replace(/\D/g, "").length < 10) return setErr("Enter your registered phone number and email.");
    setBusy(true);
    try { setMsg((await api("/auth/forgot", { method: "POST", body: f })).message); } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  return (
    <AuthShell>
      <h2 className="text-xl font-semibold sm:text-2xl">Forgot password?</h2>
      <p className="theme-muted mt-1 text-sm">Enter the phone number and email you registered with. If they match, we'll email you a reset link.</p>
      {msg ? (
        <div className="mt-5 space-y-4"><Alert tone="green">{msg}</Alert><p className="theme-muted text-sm">The link is valid for 30 minutes. Check your spam folder if you don't see it.</p></div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          <Field label="Phone number" required><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="0300 1234567" inputMode="tel" className={inputCls()} /></Field>
          <Field label="Email" required><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@example.com" className={inputCls()} /></Field>
          <Alert>{err}</Alert>
          <button className={`${btnPrimary} w-full`} disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
        </form>
      )}
      <p className="mt-5 text-center text-sm"><Link to="/login" className="font-medium text-purple-600 dark:text-purple-400">Back to login</Link></p>
    </AuthShell>
  );
}
