import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, X } from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { initials } from "../components/ui";
import logo from "../assets/logo.png";

export default function PortalLayout({ role, links, bottom = [] }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState([]); const [bell, setBell] = useState(false);
  const dark = role === "doctor";
  useEffect(() => { api("/notifications").then(setNotes).catch(() => {}); }, []);
  const unread = notes.filter((n) => !n.read).length;
  const logout = () => { signOut(); navigate(role === "doctor" ? "/doctor-login" : "/login"); };
  const item = ({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive ? (dark ? "bg-purple-600 text-white" : "bg-purple-50 font-medium text-purple-700 dark:bg-purple-500/15 dark:text-purple-300") : dark ? "text-slate-300 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`;
  const nav = (l) => <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className={item}><l.icon size={17} />{l.label}</NavLink>;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-950">
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col p-4 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"} ${dark ? "bg-slate-900 text-white" : "border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-gray-900"}`}>
        <Link to={role === "doctor" ? "/doctor" : "/patient"} className="mb-5 flex items-center gap-3 px-1">
          <img src={logo} alt="" className="size-9 rounded-full bg-white object-contain p-1" />
          <div className="leading-tight"><p className="text-sm font-semibold">{role === "doctor" ? "Doctor Portal" : "Patient Portal"}</p><p className="text-[11px] opacity-60">ZarinCare</p></div>
        </Link>
        <div className={`mb-4 flex items-center gap-3 rounded-lg p-2.5 ${dark ? "bg-white/5" : "bg-slate-50 dark:bg-slate-800/50"}`}>
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">{initials(user?.name)}</span>
          <div className="min-w-0 leading-tight"><p className="truncate text-sm font-medium">{user?.name}</p><p className="text-xs capitalize opacity-60">{role}</p></div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">{links.map(nav)}</nav>
        <div className="space-y-1 border-t border-slate-200/20 pt-3">
          {bottom.map(nav)}
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10"><LogOut size={17} />Logout</button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-gray-950/80 sm:px-6">
          <button onClick={() => setOpen(!open)} className="rounded-md p-2 lg:hidden" aria-label="Menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/" className="text-sm font-medium text-purple-600 dark:text-purple-400">View Website</Link>
            <ThemeToggle />
            <div className="relative">
              <button onClick={() => { setBell(!bell); if (!bell && unread) api("/notifications/read", { method: "POST" }).then(() => setTimeout(() => setNotes((n) => n.map((x) => ({ ...x, read: true }))), 1500)); }} className="relative rounded-md p-2" aria-label="Notifications">
                <Bell size={19} />{unread > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-red-500" />}
              </button>
              {bell && (
                <div className="absolute right-0 mt-2 w-72 max-w-[85vw] rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  {notes.length === 0 ? <p className="theme-muted p-4 text-center text-sm">No notifications</p> : notes.slice(0, 6).map((n) => <p key={n.id} className="rounded-lg p-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">{n.text}</p>)}
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
