import { useState } from "react";
import { Alert, Card, Field, PageHeader, btnPrimary, inputCls } from "../../components/ui";
import PasswordInput from "../../components/PasswordInput";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function Settings() {
  const { user, setUser } = useAuth();
  const [s, setS] = useState({ email: true, whatsapp: true, autoConfirm: false, accounts: {}, ...user.profile.settings });
  const [pw, setPw] = useState({ current: "", next: "" }); const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const acc = (k) => (e) => setS({ ...s, accounts: { ...s.accounts, [k]: e.target.value } });
  const save = async () => { setErr(""); try { setUser(await api("/doctor/profile", { method: "PUT", body: { profile: { settings: s } } })); setMsg("Settings saved."); } catch (e) { setErr(e.message); } };
  const changePw = async () => { setErr(""); setMsg(""); try { await api("/me/password", { method: "POST", body: pw }); setPw({ current: "", next: "" }); setMsg("Password changed."); } catch (e) { setErr(e.message); } };
  const tog = (k, l) => <label className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 text-sm last:border-0 dark:border-slate-800">{l}<input type="checkbox" checked={!!s[k]} onChange={(e) => setS({ ...s, [k]: e.target.checked })} className="size-4 accent-purple-600" /></label>;
  return (
    <>
      <PageHeader title="Settings" subtitle="Notifications, payments and security." />
      <div className="max-w-3xl space-y-4">
        <Card><h2 className="mb-2 font-semibold">Preferences</h2>{tog("email", "Email notifications")}{tog("whatsapp", "WhatsApp notifications")}{tog("autoConfirm", "Automatically confirm new appointments")}</Card>
        <Card><h2 className="mb-1 font-semibold">Payment accounts</h2><p className="theme-muted mb-3 text-sm">Shown to patients when they pay an invoice.</p><div className="grid gap-3 sm:grid-cols-3">
          <Field label="JazzCash number"><input value={s.accounts.jazzcash || ""} onChange={acc("jazzcash")} className={inputCls()} /></Field><Field label="Easypaisa number"><input value={s.accounts.easypaisa || ""} onChange={acc("easypaisa")} className={inputCls()} /></Field><Field label="Bank (title / IBAN)"><input value={s.accounts.bank || ""} onChange={acc("bank")} className={inputCls()} /></Field></div></Card>
        <button onClick={save} className={btnPrimary}>Save settings</button>
        <Card><h2 className="mb-3 font-semibold">Change password</h2><div className="grid gap-3 sm:max-w-sm"><Field label="Current password"><PasswordInput value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field><Field label="New password"><PasswordInput value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field><button onClick={changePw} className={btnPrimary}>Change password</button></div></Card>
        <Alert tone="green">{msg}</Alert><Alert>{err}</Alert>
      </div>
    </>
  );
}
