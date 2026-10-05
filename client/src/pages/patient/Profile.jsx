import { useState } from "react";
import { Alert, Card, Field, PageHeader, Tabs, btnPrimary, inputCls } from "../../components/ui";
import PasswordInput from "../../components/PasswordInput";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState("personal");
  const [name, setName] = useState(user.name); const [p, setP] = useState({ notify: { email: true, whatsapp: true, reminders: true }, ...user.profile });
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const [pw, setPw] = useState({ current: "", next: "" });
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });
  const save = async () => { setErr(""); try { setUser(await api("/patient/profile", { method: "PUT", body: { name, profile: p } })); setMsg("Saved."); } catch (e) { setErr(e.message); } };
  const changePw = async () => { setErr(""); setMsg(""); try { await api("/me/password", { method: "POST", body: pw }); setPw({ current: "", next: "" }); setMsg("Password changed."); } catch (e) { setErr(e.message); } };
  const Save = <button onClick={save} className={btnPrimary}>Save changes</button>;
  const tog = (k, l) => <label key={k} className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 text-sm last:border-0 dark:border-slate-800">{l}<input type="checkbox" checked={!!p.notify?.[k]} onChange={(e) => setP({ ...p, notify: { ...p.notify, [k]: e.target.checked } })} className="size-4 accent-purple-600" /></label>;
  return (
    <>
      <PageHeader title="My Profile" subtitle="Manage your personal and medical information." />
      <Tabs tabs={[["personal", "Personal"], ["medical", "Medical"], ["security", "Security"], ["notifications", "Notifications"]]} value={tab} onChange={(t) => { setTab(t); setMsg(""); setErr(""); }} />
      <Card className="max-w-3xl space-y-4">
        {tab === "personal" && <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls()} /></Field>
          <Field label="Date of birth"><input type="date" value={p.dob || ""} onChange={set("dob")} className={inputCls()} /></Field>
          <Field label="Email" hint="Verified — can't be changed here"><input value={user.email} disabled className={`${inputCls()} opacity-60`} /></Field>
          <Field label="Phone" hint="Verified — can't be changed here"><input value={user.phone} disabled className={`${inputCls()} opacity-60`} /></Field>
          <Field label="Gender"><select value={p.gender || ""} onChange={set("gender")} className={inputCls()}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></Field>
          <Field label="City"><input value={p.city || ""} onChange={set("city")} className={inputCls()} /></Field>
          <div className="sm:col-span-2"><Field label="Address"><input value={p.address || ""} onChange={set("address")} className={inputCls()} /></Field></div></div>}
        {tab === "medical" && <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Blood group"><select value={p.bloodGroup || ""} onChange={set("bloodGroup")} className={inputCls()}><option value="">Select</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => <option key={b}>{b}</option>)}</select></Field>
          <Field label="Allergies"><input value={p.allergies || ""} onChange={set("allergies")} placeholder="e.g. Penicillin" className={inputCls()} /></Field>
          <div className="sm:col-span-2"><Field label="Existing conditions"><textarea rows={2} value={p.conditions || ""} onChange={set("conditions")} className={inputCls()} /></Field></div>
          <Field label="Emergency contact name"><input value={p.emergencyName || ""} onChange={set("emergencyName")} className={inputCls()} /></Field>
          <Field label="Emergency contact phone"><input value={p.emergencyPhone || ""} onChange={set("emergencyPhone")} className={inputCls()} /></Field></div>}
        {tab === "security" && <div className="grid gap-4 sm:max-w-sm">
          <Field label="Current password"><PasswordInput value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" /></Field>
          <Field label="New password"><PasswordInput value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" /></Field>
          <button onClick={changePw} className={btnPrimary}>Change password</button></div>}
        {tab === "notifications" && <div>{tog("email", "Email notifications")}{tog("whatsapp", "WhatsApp notifications")}{tog("reminders", "Appointment reminders")}</div>}
        <Alert tone="green">{msg}</Alert><Alert>{err}</Alert>
        {tab !== "security" && Save}
      </Card>
    </>
  );
}
