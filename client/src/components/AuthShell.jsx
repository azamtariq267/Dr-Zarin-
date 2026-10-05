import { Link } from "react-router-dom";
import { Check, Home } from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle";
import logo from "../assets/logo.png";

const FEATURES = ["Secure patient records", "Appointment management", "Prescription & test results", "Payment & billing"];
export const TABS = [
  { key: "login", label: "Patient Login", path: "/login" },
  { key: "register", label: "Register", path: "/register" },
  { key: "doctor", label: "Doctor Login", path: "/doctor-login" },
];

export default function AuthShell({ children, active, wide = false }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-slate-900 text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <img src="/dr-zarin.jpeg" alt="" className="absolute inset-0 size-full object-cover opacity-15 mix-blend-luminosity" />
        <Link to="/" className="relative flex items-center gap-3">
          <img src={logo} alt="ZarinCare" className="size-11 rounded-full bg-white object-contain p-1" />
          <div className="leading-tight"><p className="font-semibold">Prof. Dr. Muhammad Zarin</p><p className="text-xs text-purple-200">Consultant Surgeon</p></div>
        </Link>
        <div className="relative max-w-lg">
          <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">Your Healthcare,<br />Organized.</h1>
          <p className="mt-5 text-purple-100/90">Manage appointments, access medical records, view prescriptions, and stay connected with your healthcare provider — all in one secure platform.</p>
          <ul className="mt-8 space-y-3">{FEATURES.map((f) => <li key={f} className="flex items-center gap-3 text-sm"><span className="grid size-6 place-items-center rounded-full bg-emerald-500/30 text-emerald-300"><Check size={14} /></span>{f}</li>)}</ul>
        </div>
        <p className="relative text-xs text-purple-200/70">© {new Date().getFullYear()} ZarinCare. All rights reserved.</p>
      </aside>
      <main className="relative flex flex-col bg-slate-50 px-4 py-6 dark:bg-gray-950 sm:px-8">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-purple-600 dark:text-slate-300"><Home size={16} /> Back to website</Link>
          <ThemeToggle />
        </div>
        <div className={`m-auto w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-8">
            {active && (
              <div role="tablist" className="mb-6 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                {TABS.map((t) => <Link key={t.key} to={t.path} role="tab" aria-selected={active === t.key} className={`rounded-md px-1 py-2 text-center text-xs font-medium transition sm:text-sm ${active === t.key ? "bg-white text-purple-700 shadow-sm dark:bg-slate-950 dark:text-purple-300" : "text-slate-600 hover:text-slate-900 dark:text-slate-300"}`}>{t.label}</Link>)}
              </div>
            )}
            {children}
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">Protected by secure authentication. Your data is private.</p>
        </div>
      </main>
    </div>
  );
}
