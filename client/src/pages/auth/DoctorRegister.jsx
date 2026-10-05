import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, CheckCircle2, Upload } from "lucide-react";
import AuthShell from "../../components/AuthShell";
import PasswordInput from "../../components/PasswordInput";
import OtpStep from "../../components/OtpStep";
import { Alert, Field, btnGhost, btnPrimary, fileToDataUrl, inputCls } from "../../components/ui";
import { api } from "../../lib/api";

const PMDC_RE = /^\d{3,6}-[A-Za-z]$/;

function ImagePick({ label, value, onChange, error }) {
  const [busy, setBusy] = useState(false);
  const pick = async (e) => { const f = e.target.files?.[0]; if (!f) return; setBusy(true); try { onChange(await fileToDataUrl(f)); } finally { setBusy(false); } };
  return (
    <Field label={label} required error={error}>
      <label className={`flex h-36 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed text-sm text-slate-500 transition hover:border-purple-400 ${error ? "border-red-400" : "border-slate-300 dark:border-slate-700"}`}>
        {value ? <img src={value} alt={label} className="size-full object-cover" /> : <><Upload size={20} />{busy ? "Processing…" : "Tap to upload photo"}</>}
        <input type="file" accept="image/*" className="hidden" onChange={pick} />
      </label>
    </Field>
  );
}

// Live camera capture only — no file upload for the selfie
function LiveCamera({ value, onChange, error }) {
  const video = useRef(null); const stream = useRef(null);
  const [on, setOn] = useState(false); const [camErr, setCamErr] = useState("");
  const stop = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; setOn(false); };
  useEffect(() => stop, []);
  const start = async () => {
    setCamErr("");
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 720 }, audio: false });
      setOn(true); requestAnimationFrame(() => { if (video.current) video.current.srcObject = stream.current; });
    } catch { setCamErr("Camera access is blocked or unavailable. Allow camera permission (HTTPS or localhost required) and try again."); }
  };
  const snap = () => {
    const v = video.current; const c = document.createElement("canvas");
    c.width = 640; c.height = (v.videoHeight / v.videoWidth) * 640 || 480;
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    onChange(c.toDataURL("image/jpeg", 0.88)); stop();
  };
  return (
    <Field label="Live photo (taken now with your camera)" required error={error || camErr}>
      <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
        {value && !on && <img src={value} alt="Live capture" className="max-h-56 rounded-lg" />}
        {on && <video ref={video} autoPlay playsInline muted className="max-h-56 -scale-x-100 rounded-lg" />}
        {!value && !on && <div className="grid h-36 w-full place-items-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800"><Camera size={28} /></div>}
        <div className="flex gap-2">
          {on ? <button type="button" onClick={snap} className={btnPrimary}><Camera size={16} /> Capture</button>
            : <button type="button" onClick={start} className={value ? btnGhost : btnPrimary}><Camera size={16} /> {value ? "Retake" : "Open camera"}</button>}
        </div>
      </div>
    </Field>
  );
}

export default function DoctorRegister() {
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", phone: "", pmdc: "", specialization: "", hospital: "", password: "", confirm: "", cnicFront: "", cnicBack: "", selfie: "" });
  const [errors, setErrors] = useState({}); const [serverErr, setServerErr] = useState(""); const [busy, setBusy] = useState(false); const [otp, setOtp] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setV = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (ev) => {
    ev.preventDefault(); setServerErr("");
    const e = {};
    if (f.name.trim().length < 3) e.name = "Enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email";
    if (!/^(\+92|0092|0)?3\d{9}$/.test(f.phone.replace(/[\s-]/g, ""))) e.phone = "Enter a valid mobile number";
    if (!PMDC_RE.test(f.pmdc.trim())) e.pmdc = "PMDC number is required, e.g. 12345-P";
    if (!f.specialization.trim()) e.specialization = "Required";
    if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e.password = "8+ characters with letters and numbers";
    if (f.confirm !== f.password) e.confirm = "Passwords do not match";
    if (!f.cnicFront) e.cnicFront = "CNIC front is required";
    if (!f.cnicBack) e.cnicBack = "CNIC back is required";
    if (!f.selfie) e.selfie = "A live photo is required";
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try { const r = await api("/auth/register/doctor", { method: "POST", body: f }); setOtp({ userId: r.userId, sentTo: r.sentTo }); }
    catch (err) { setServerErr(err.message); } finally { setBusy(false); }
  };

  if (otp) return <AuthShell><OtpStep {...otp} onVerified={() => navigate("/doctor-pending")} onBack={() => setOtp(null)} /></AuthShell>;
  return (
    <AuthShell wide>
      <h2 className="text-xl font-semibold sm:text-2xl">Doctor Registration</h2>
      <p className="theme-muted mt-1 text-sm">Your account stays <b>pending</b> until your PMDC number and identity documents are verified.</p>
      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" required error={errors.name}><input value={f.name} onChange={set("name")} placeholder="Dr. Full Name" className={inputCls(errors.name)} /></Field>
          <Field label="PMDC Number" required error={errors.pmdc} hint="Format: 12345-P"><input value={f.pmdc} onChange={set("pmdc")} placeholder="12345-P" className={`${inputCls(errors.pmdc)} uppercase`} /></Field>
          <Field label="Email" required error={errors.email}><input type="email" value={f.email} onChange={set("email")} placeholder="doctor@example.com" className={inputCls(errors.email)} /></Field>
          <Field label="Phone (WhatsApp)" required error={errors.phone}><input value={f.phone} onChange={set("phone")} placeholder="0300 1234567" inputMode="tel" className={inputCls(errors.phone)} /></Field>
          <Field label="Specialization" required error={errors.specialization}><input value={f.specialization} onChange={set("specialization")} placeholder="e.g. General Surgeon" className={inputCls(errors.specialization)} /></Field>
          <Field label="Hospital / Clinic"><input value={f.hospital} onChange={set("hospital")} placeholder="Where you practise" className={inputCls()} /></Field>
          <Field label="Password" required error={errors.password}><PasswordInput value={f.password} onChange={set("password")} placeholder="Create a strong password" error={errors.password} autoComplete="new-password" /></Field>
          <Field label="Confirm Password" required error={errors.confirm}><PasswordInput value={f.confirm} onChange={set("confirm")} placeholder="Confirm password" error={errors.confirm} autoComplete="new-password" /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImagePick label="CNIC — front" value={f.cnicFront} onChange={setV("cnicFront")} error={errors.cnicFront} />
          <ImagePick label="CNIC — back" value={f.cnicBack} onChange={setV("cnicBack")} error={errors.cnicBack} />
        </div>
        <LiveCamera value={f.selfie} onChange={setV("selfie")} error={errors.selfie} />
        <Alert>{serverErr}</Alert>
        <button className={`${btnPrimary} w-full`} disabled={busy}>{busy ? "Submitting…" : "Submit for verification"}</button>
      </form>
      <p className="theme-muted mt-5 text-center text-sm">Already registered? <Link to="/doctor-login" className="font-medium text-purple-600 dark:text-purple-400">Doctor login</Link></p>
    </AuthShell>
  );
}

export function DoctorPending() {
  return (
    <AuthShell>
      <div className="space-y-4 text-center">
        <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
        <h2 className="text-xl font-semibold">Verification submitted</h2>
        <p className="theme-muted text-sm">Your contact details are confirmed. Our team will check your PMDC number and documents, then email you when your doctor account is approved.</p>
        <Link to="/" className={`${btnPrimary} w-full`}>Back to website</Link>
      </div>
    </AuthShell>
  );
}
