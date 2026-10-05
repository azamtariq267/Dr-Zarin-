import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthShell from "../../components/AuthShell";
import PasswordInput from "../../components/PasswordInput";
import { Alert, Field, btnPrimary } from "../../components/ui";
import { api } from "../../lib/api";

export default function ResetPassword() {
  const token = useSearchParams()[0].get("token") || "";
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState("");
  const [err, setErr] = useState(""); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return setErr("Password must be 8+ characters with letters and numbers.");
    if (pw !== pw2) return setErr("Passwords do not match.");
    setBusy(true);
    try { await api("/auth/reset", { method: "POST", body: { token, password: pw } }); setDone(true); } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  return (
    <AuthShell>
      <h2 className="text-xl font-semibold sm:text-2xl">Set a new password</h2>
      {done ? (
        <div className="mt-5 space-y-4"><Alert tone="green">Password updated successfully.</Alert><Link to="/login" className={`${btnPrimary} w-full`}>Go to login</Link></div>
      ) : !token ? (
        <div className="mt-5"><Alert>This reset link is missing its token. Request a new one.</Alert><p className="mt-4 text-sm"><Link to="/forgot-password" className="font-medium text-purple-600">Forgot password</Link></p></div>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field label="New password" required><PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" autoComplete="new-password" /></Field>
          <Field label="Confirm new password" required><PasswordInput value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Confirm password" autoComplete="new-password" /></Field>
          <Alert>{err}</Alert>
          <button className={`${btnPrimary} w-full`} disabled={busy}>{busy ? "Saving…" : "Update password"}</button>
        </form>
      )}
    </AuthShell>
  );
}
