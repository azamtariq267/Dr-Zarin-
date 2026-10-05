import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";

// ---- Button system ----
const BTN_BASE = "inline-flex select-none items-center justify-center gap-2 rounded-lg font-medium transition duration-200 active:scale-[.98] disabled:pointer-events-none disabled:opacity-60";
const BTN_SIZES = { md: "px-4 py-2.5 text-sm", lg: "px-6 py-3 text-base" };
const BTN_VARIANTS = {
  primary: "bg-purple-600 text-white shadow-sm hover:bg-purple-700",
  secondary: "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-500/15 dark:text-purple-200 dark:hover:bg-purple-500/25",
  outline: "border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
  ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
};
// Class-string helper for <Link>, <a> and plain <button>: className={btn("outline", "lg")}
export const btn = (variant = "primary", size = "md") => `${BTN_BASE} ${BTN_SIZES[size]} ${BTN_VARIANTS[variant]}`;
// Legacy exports (used across the portals) now share the same system
export const btnPrimary = btn("primary");
export const btnGhost = btn("outline");
export function Button({ variant = "primary", size = "md", loading = false, disabled, className = "", type = "button", children, ...rest }) {
  return (
    <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={`${btn(variant, size)} ${className}`} {...rest}>
      {loading && <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}

export const inputCls = (err) =>
  `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/40 dark:bg-slate-900 ${err ? "border-red-400" : "border-slate-200 focus:border-purple-500 dark:border-slate-700"}`;

export function Field({ label, error, required, children, hint }) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-sm font-medium">{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const TONES = {
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  gray: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  blue: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
};
const STATUS_TONE = { confirmed: "green", approved: "green", paid: "green", active: "green", normal: "green", pending: "amber", verifying: "amber", unpaid: "amber", abnormal: "red", cancelled: "red", failed: "red", rejected: "red", inactive: "gray", completed: "gray", refunded: "purple" };
export function Badge({ children, tone }) {
  const t = tone || STATUS_TONE[String(children).toLowerCase()] || "gray";
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${TONES[t]}`}>{children}</span>;
}

export const Card = ({ children, className = "" }) => <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-5 ${className}`}>{children}</div>;
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
    <div><h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>{subtitle && <p className="theme-muted mt-1 text-sm">{subtitle}</p>}</div>
    {action}
  </div>
);
export const Empty = ({ children = "Nothing here yet." }) => <p className="theme-muted py-8 text-center text-sm">{children}</p>;
export const Spinner = () => <div className="grid place-items-center py-16"><div className="size-7 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" /></div>;
export const Alert = ({ tone = "red", children }) => children ? <div className={`rounded-lg px-3 py-2 text-sm ${TONES[tone]}`}>{children}</div> : null;
export const Stat = ({ label, value, tone = "" }) => <Card><p className="theme-muted text-xs">{label}</p><p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p></Card>;

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-4 inline-flex max-w-full gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
      {tabs.map(([k, l]) => <button key={k} onClick={() => onChange(k)} className={`whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium transition ${value === k ? "bg-white text-purple-700 shadow-sm dark:bg-slate-950 dark:text-purple-300" : "text-slate-600 dark:text-slate-300"}`}>{l}</button>)}
    </div>
  );
}

// Table that scrolls horizontally on small screens
export const Table = ({ head, children }) => (
  <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm">
    <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">{head.map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead>
    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>
  </table></div>
);
export const Td = ({ children, className = "", ...rest }) => <td className={`px-3 py-3 ${className}`} {...rest}>{children}</td>;

export function useFetch(path) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true }));
    api(path).then((data) => setState({ data, loading: false, error: "" })).catch((e) => setState({ data: null, loading: false, error: e.message }));
  }, [path]);
  useEffect(load, [load]);
  return { ...state, reload: load };
}

export const fmtDate = (d) => (d ? new Date(d + (d.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
export const money = (n) => `PKR ${Number(n || 0).toLocaleString()}`;
export const initials = (n = "") => n.replace(/^(Prof\.|Dr\.)\s*/gi, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

// Downscale an image File to a JPEG data URL (keeps uploads small)
export function fileToDataUrl(file, max = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = img.width * k; c.height = img.height * k;
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = URL.createObjectURL(file);
  });
}
