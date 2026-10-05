import { CalendarDays, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { btn } from "../src/components/ui";
import logo from "../src/assets/logo-sm.png";

const NAV_LINKS = [
  ["Home", "/"], ["About", "/about"], ["Gallery", "/gallery"],
  ["Testimonials", "/testimonials"], ["Availability", "/availability"], ["Contact", "/contact"],
];

export default function Navbar() {
  const { pathname } = useLocation();
  // The menu is "open" only for the route it was opened on, so any navigation closes it (no effect needed)
  const [openAt, setOpenAt] = useState(null);
  const open = openAt === pathname;
  const setOpen = (v) => setOpenAt(v ? pathname : null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the menu is open: Escape closes it, page scroll is locked, resizing to desktop closes it
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpenAt(null);
    const onResize = () => window.innerWidth >= 1280 && setOpenAt(null);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ${solid ? "border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-gray-950/85" : "border-transparent bg-transparent"}`}>
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-3 rounded-lg" aria-label="ZarinCare home">
            <img src={logo} alt="" width="40" height="40" className="size-10 rounded-full bg-white object-contain p-1 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700" />
            <span className="hidden leading-tight sm:block">
              <span className="block text-base font-semibold text-slate-900 dark:text-white">Prof. Dr. Muhammad Zarin</span>
              <span className="mt-0.5 hidden text-[10px] font-medium tracking-[.14em] text-slate-500 dark:text-slate-400 2xl:block">GENERAL · LAPAROSCOPIC · BARIATRIC · ROBOTIC</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 xl:flex">
            {NAV_LINKS.map(([name, href]) => (
              <li key={href}>
                <NavLink to={href} end={href === "/"} className={({ isActive }) => `relative block rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${isActive ? "text-purple-700 dark:text-purple-300" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}>
                  {({ isActive }) => (
                    <>
                      {name}
                      <span aria-hidden className={`absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-purple-600 transition-transform duration-300 dark:bg-purple-400 ${isActive ? "scale-x-100" : "scale-x-0"}`} />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link to="/login" className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-purple-700 md:inline-flex dark:text-slate-200 dark:hover:text-purple-300">Login</Link>
            <div className="hidden md:block"><Link to="/availability" className={btn("primary")}>Book Appointment</Link></div>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-11 place-items-center rounded-lg text-slate-800 transition-colors hover:bg-slate-100 xl:hidden dark:text-white dark:hover:bg-slate-800"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile / tablet menu: a sibling of the header so the header's backdrop blur can't break `fixed` positioning */}
      <div
        id="mobile-nav"
        className={`fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-white/95 backdrop-blur-xl transition-[opacity,transform,visibility] duration-300 ease-out xl:hidden dark:bg-gray-950/95 ${open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}
      >
        <nav aria-label="Mobile" className="mx-auto max-w-lg px-4 pb-10 pt-4 sm:px-6">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {NAV_LINKS.map(([name, href]) => (
              <li key={href}>
                <NavLink to={href} end={href === "/"} className={({ isActive }) => `flex min-h-14 items-center justify-between py-3 text-lg font-medium transition-colors ${isActive ? "text-purple-700 dark:text-purple-300" : "text-slate-800 hover:text-purple-700 dark:text-slate-100 dark:hover:text-purple-300"}`}>
                  {({ isActive }) => (<>{name}{isActive && <span aria-hidden className="size-2 rounded-full bg-purple-600 dark:bg-purple-400" />}</>)}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-3">
            <Link to="/availability" className={`${btn("primary", "lg")} w-full`}><CalendarDays size={18} /> Book Appointment</Link>
            <Link to="/login" className={`${btn("outline", "lg")} w-full`}>Login</Link>
          </div>
        </nav>
      </div>
    </>
  );
}
