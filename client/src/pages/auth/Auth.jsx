import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import AuthShell, { TABS } from "../../components/AuthShell";
import PasswordInput from "../../components/PasswordInput";
import OtpStep from "../../components/OtpStep";
import { Alert, Field, btnPrimary, inputCls } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(\+92|0092|0)?3\d{9}$/;

export default function Auth() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const tab = TABS.find((t) => t.path === pathname)?.key || "login";
  const [form, setForm] = useState({ name: "", phone: "", email: "", identifier: "", password: "", confirm: "", terms: false });
  const [errors, setErrors] = useState({});
  const [serverErr, setServerErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [otp, setOtp] = useState(null); // { userId, sentTo, role }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const validate = () => {
    const e = {};
    if (tab === "register") {
      if (form.name.trim().length < 3) e.name = "Enter your full name";
      if (!PHONE_RE.test(form.phone.replace(/[\s-]/g, ""))) e.phone = "Enter a valid mobile number";
      if (!EMAIL_RE.test(form.email)) e.email = "Enter a valid email";
      if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) e.password = "8+ characters with letters and numbers";
      if (form.confirm !== form.password) e.confirm = "Passwords do not match";
      if (!form.terms) e.terms = "You must accept the terms to continue";
    } else {
      if (!form.identifier.trim()) e.identifier = tab === "doctor" ? "Enter your email or phone" : "Enter your email or phone";
      if (!form.password) e.password = "Enter your password";
    }
    return e;
  };

  const finish = (res, role) => {
    if (res.pending) { navigate("/doctor-pending"); return; }
    signIn(res.token, res.user);
    navigate(role === "doctor" ? "/doctor" : "/patient");
  };

  const submit = async (ev) => {
    ev.preventDefault(); setServerErr("");
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      if (tab === "register") {
        const r = await api("/auth/register/patient", { method: "POST", body: { name: form.name, phone: form.phone, email: form.email, password: form.password } });
        setOtp({ userId: r.userId, sentTo: r.sentTo, role: "patient" });
      } else {
        const role = tab === "doctor" ? "doctor" : "patient";
        finish(await api("/auth/login", { method: "POST", body: { identifier: form.identifier, password: form.password, role } }), role);
      }
    } catch (err) {
      if (err.data?.code === "UNVERIFIED") setOtp({ userId: err.data.userId, sentTo: { email: "your email", phone: "your WhatsApp number" }, role: tab === "doctor" ? "doctor" : "patient" });
      else if (err.data?.code === "PENDING") navigate("/doctor-pending");
      else setServerErr(err.message);
    } finally { setBusy(false); }
  };

  if (otp) return <AuthShell><OtpStep {...otp} onVerified={(r) => finish(r, otp.role)} onBack={() => setOtp(null)} /></AuthShell>;

  const heading = { login: ["Welcome Back", "Sign in to your patient account"], register: ["Create Account", "Register as a new patient"], doctor: ["Doctor Access", "Sign in to the doctor dashboard"] }[tab];
  return (
    <AuthShell active={tab}>
      <h2 className="text-xl font-semibold sm:text-2xl">{heading[0]}</h2>
      <p className="theme-muted mt-1 text-sm">{heading[1]}</p>
      {tab === "doctor" && <div className="mt-4 flex items-start gap-2 rounded-lg border border-purple-200 bg-purple-50 p-3 text-xs text-purple-800 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-200"><Lock size={14} className="mt-0.5 shrink-0" /> Restricted access — verified doctors only.</div>}
      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        {tab === "register" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" required error={errors.name}><input value={form.name} onChange={set("name")} placeholder="Your full name" autoComplete="name" className={inputCls(errors.name)} /></Field>
              <Field label="Phone (WhatsApp)" required error={errors.phone}><input value={form.phone} onChange={set("phone")} placeholder="0300 1234567" inputMode="tel" autoComplete="tel" className={inputCls(errors.phone)} /></Field>
            </div>
            <Field label="Email" required error={errors.email}><input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" className={inputCls(errors.email)} /></Field>
            <Field label="Password" required error={errors.password}><PasswordInput value={form.password} onChange={set("password")} placeholder="Create a strong password" error={errors.password} autoComplete="new-password" /></Field>
            <Field label="Confirm Password" required error={errors.confirm}><PasswordInput value={form.confirm} onChange={set("confirm")} placeholder="Confirm your password" error={errors.confirm} autoComplete="new-password" /></Field>
            <div>
              <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={form.terms} onChange={set("terms")} className="mt-0.5 size-4 accent-purple-600" /><span>I agree to the <span className="font-medium text-purple-600 dark:text-purple-400">Terms and Privacy Policy</span></span></label>
              {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms}</p>}
            </div>
          </>
        ) : (
          <>
            <Field label="Email or Phone" error={errors.identifier}><input value={form.identifier} onChange={set("identifier")} placeholder={tab === "doctor" ? "doctor@example.com" : "you@example.com or 0300 1234567"} autoComplete="username" className={inputCls(errors.identifier)} /></Field>
            <Field label={<span className="flex justify-between"><span>Password</span></span>} error={errors.password}><PasswordInput value={form.password} onChange={set("password")} placeholder="Enter your password" error={errors.password} autoComplete="current-password" /></Field>
            <div className="text-right text-sm"><Link to="/forgot-password" className="font-medium text-purple-600 hover:underline dark:text-purple-400">Forgot password?</Link></div>
          </>
        )}
        <Alert>{serverErr}</Alert>
        <button className={`${btnPrimary} w-full`} disabled={busy}>{busy ? "Please wait…" : tab === "register" ? "Create Account" : tab === "doctor" ? "Login as Doctor" : "Login"}</button>
      </form>
      <p className="theme-muted mt-5 text-center text-sm">
        {tab === "login" && <>Don't have an account? <Link to="/register" className="font-medium text-purple-600 dark:text-purple-400">Create Account</Link></>}
        {tab === "register" && <>Already registered? <Link to="/login" className="font-medium text-purple-600 dark:text-purple-400">Login</Link></>}
        {tab === "doctor" && <>New doctor? <Link to="/doctor-register" className="font-medium text-purple-600 dark:text-purple-400">Register with your PMDC number</Link></>}
      </p>
    </AuthShell>
  );
}
