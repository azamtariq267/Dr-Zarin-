import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import logo from "../src/assets/logo.png";

const LINKS = [
  ["Home", "/"], ["About", "/about"], ["Gallery", "/gallery"],
  ["Testimonials", "/testimonials"], ["Availability", "/availability"], ["Contact", "/contact"],
];

export default function Footer() {
  return (
    <footer className="relative mt-40 w-full px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="pointer-events-none absolute -top-20 right-0 h-80 w-full max-w-4xl rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/10" />
      <div className="relative flex flex-col justify-between gap-10 border-b border-gray-200 pb-8 dark:border-slate-700 md:flex-row">
        <div className="md:max-w-xl">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="ZarinCare" className="size-10 rounded-full bg-white object-contain p-1 shadow-sm dark:bg-slate-800" />
            <div><p className="text-lg font-semibold">ZarinCare</p><p className="text-[9px] tracking-wide text-slate-500 dark:text-slate-400">PROF. DR. MUHAMMAD ZARIN</p></div>
          </Link>
          <p className="mt-6 text-sm leading-7 text-slate-500 dark:text-slate-300">Prof. Dr. Muhammad Zarin provides general, laparoscopic, bariatric and robotic surgical care in Peshawar, combining advanced techniques with patient-first communication.</p>
        </div>
        <div className="flex flex-1 items-start gap-16 md:justify-end">
          <div><h2 className="mb-5 font-semibold">Explore</h2><ul className="space-y-2">{LINKS.map(([name, href]) => <li key={href}><Link to={href} className="text-sm transition hover:text-purple-600 dark:hover:text-purple-400">{name}</Link></li>)}</ul></div>
          <div><h2 className="mb-5 font-semibold">Get in touch</h2><div className="space-y-3 text-sm text-slate-500 dark:text-slate-300"><p><MapPin className="mr-2 inline size-4"/>Peshawar, Pakistan</p><p><Phone className="mr-2 inline size-4"/>+92 333 9414477</p><p><Mail className="mr-2 inline size-4"/>contact@zarincare.com</p></div></div>
        </div>
      </div>
      <p className="pb-5 pt-4 text-center text-xs text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} ZarinCare · Prof. Dr. Muhammad Zarin. All rights reserved.</p>
    </footer>
  );
}
