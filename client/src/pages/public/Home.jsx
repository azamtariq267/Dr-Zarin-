import { useState } from "react";
import { Link } from "react-router-dom";
import { btn } from "../../components/ui";
import { CalendarDays, ArrowRight, Check, ShieldCheck, Stethoscope, Scissors, Activity, Bot, Users, Clock, GraduationCap, Target, HeartHandshake, Sparkles, X } from "lucide-react";

const SPECIALTIES = [
  { icon: Stethoscope, title: "General Surgery", text: "Comprehensive surgical care for abdominal, hernia and soft-tissue conditions.", detail: "General surgery covers a broad range of planned and urgent procedures. Dr. Zarin focuses on careful diagnosis, clear explanation of options, precise technique and structured follow-up." },
  { icon: Scissors, title: "Laparoscopic Surgery", text: "Minimally invasive keyhole techniques designed for smaller scars and recovery.", detail: "Laparoscopic procedures use small incisions and a camera-assisted approach when clinically appropriate. The aim is to reduce surgical trauma while maintaining safe, effective treatment." },
  { icon: Activity, title: "Bariatric Surgery", text: "Personalized weight-loss surgery focused on long-term health outcomes.", detail: "Bariatric surgery is considered for eligible patients after a full assessment. Care includes discussion of procedure options, preparation, nutrition and long-term follow-up." },
  { icon: Bot, title: "Robotic Surgery", text: "Advanced robotic assistance for precision and control in selected procedures.", detail: "Robotic-assisted surgery can provide enhanced visualization and instrument control in selected operations. The technology is used when it offers a meaningful benefit for the individual patient." },
];

const PRINCIPLES = [
  { icon: Target, title: "Precision", text: "Every procedure is planned in detail and executed with exacting surgical technique." },
  { icon: HeartHandshake, title: "Compassion", text: "Patients are informed, heard and supported at every stage of their care." },
  { icon: Sparkles, title: "Innovation", text: "Modern minimally-invasive and robotic methods, chosen when they genuinely benefit the patient." },
];

const STATS = [
  { icon: Clock, value: "19+", label: "Years Experience" },
  { icon: Users, value: "8,000+", label: "Patients Treated" },
  { icon: GraduationCap, value: "FCPS", label: "Surgical Qualification" },
  { icon: ShieldCheck, value: "4", label: "Core Specialties" },
];

function InteractiveCard({ item, onClick }) {
  const Icon = item.icon;
  return <button type="button" onClick={onClick} className="group relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-purple-700 cursor-pointer">
    <span className="pointer-events-none absolute inset-y-0 right-0 w-full translate-x-full bg-gradient-to-l from-purple-100 via-fuchsia-50 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-0 dark:from-purple-950/70 dark:via-indigo-950/50 dark:to-transparent" />
    <span className="relative z-10 flex size-12 items-center justify-center rounded-xl bg-slate-950/5 text-slate-800 transition group-hover:bg-purple-600 group-hover:text-white dark:bg-white/10 dark:text-slate-100 dark:group-hover:bg-purple-500"><Icon size={24} strokeWidth={1.5}/></span>
    <h3 className="relative z-10 mt-5 text-lg font-semibold">{item.title}</h3>
    <p className="relative z-10 mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{item.text}</p>
    <span className="relative z-10 mt-5 inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-300">View specialty <ArrowRight size={14}/></span>
  </button>;
}

export default function Home() {
  const [selected, setSelected] = useState(null);
  return <main className="overflow-hidden">
    <section aria-labelledby="hero-title" className="relative bg-[url('/light-hero-gradient.svg')] bg-cover bg-top bg-no-repeat px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-28 lg:pt-36 dark:bg-[url('/dark-hero-gradient.svg')]">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <div className="text-center lg:text-left">
          <p className="anim-rise inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-purple-700 backdrop-blur dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-200"><span aria-hidden className="size-1.5 rounded-full bg-cyan-500"/>Advanced surgical care in Peshawar</p>
          <h1 id="hero-title" style={{ "--d": "80ms" }} className="anim-rise mt-5 text-[1.875rem] font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem] dark:text-white">Precision in surgery,<span className="block bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent dark:from-purple-300 dark:to-purple-200">compassion in care.</span></h1>
          <p style={{ "--d": "160ms" }} className="anim-rise mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg lg:mx-0 dark:text-slate-300">Prof. Dr. Muhammad Zarin is a General, Laparoscopic, Bariatric and Robotic Surgeon in Peshawar, bringing advanced surgical techniques together with patient-first care.</p>
          <div style={{ "--d": "240ms" }} className="anim-rise mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link to="/availability" className={btn("primary", "lg")}><CalendarDays size={18}/> Book an Appointment</Link>
            <Link to="/about" className={btn("outline", "lg")}>Meet Dr. Zarin <ArrowRight size={18}/></Link>
          </div>
          <ul style={{ "--d": "320ms" }} className="anim-rise mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600 lg:justify-start dark:text-slate-300">
            {["FCPS-qualified surgeon", "19+ years of experience", "8,000+ patients treated"].map((t) => <li key={t} className="inline-flex items-center gap-2"><Check size={16} className="text-cyan-600 dark:text-cyan-400"/>{t}</li>)}
          </ul>
        </div>

        <div style={{ "--d": "200ms" }} className="anim-rise relative mx-auto mb-10 w-full max-w-md sm:max-w-lg lg:mb-0 lg:max-w-none">
          <div aria-hidden className="absolute inset-0 m-auto aspect-square w-[92%] rounded-full bg-gradient-to-br from-purple-200/70 to-cyan-200/60 blur-2xl dark:from-purple-500/20 dark:to-cyan-400/10"/>
          <div className="relative mx-auto aspect-square w-[82%] max-w-[460px]">
            <div aria-hidden className="absolute -inset-3 rounded-full border border-purple-300/60 dark:border-purple-400/20"/>
            <div aria-hidden className="absolute -inset-8 rounded-full border border-dashed border-slate-300/80 dark:border-slate-700"/>
            <div className="size-full overflow-hidden rounded-full shadow-2xl ring-4 ring-white dark:ring-slate-900">
              <img src="/dr-zarin.jpeg" alt="Prof. Dr. Muhammad Zarin, surgeon" width="447" height="447" fetchPriority="high" className="size-full scale-[1.03] object-cover"/>
            </div>
            <div className="absolute -right-2 top-6 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-lg backdrop-blur sm:-right-8 dark:border-slate-700 dark:bg-slate-900/90">
              <p className="text-2xl font-semibold leading-none text-purple-700 dark:text-purple-300">19+</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">years of surgical experience</p>
              <svg aria-hidden width="46" height="16" viewBox="0 0 46 16" fill="none" className="mt-2"><path d="M0 8H13L17 2.5L23.5 14L27.5 8H46" stroke="#06B6D4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="absolute -bottom-8 left-1/2 flex w-[calc(100%+1.5rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 p-3.5 text-left shadow-lg backdrop-blur sm:left-0 sm:w-auto sm:translate-x-0 dark:border-slate-700 dark:bg-slate-900/90">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200"><GraduationCap size={20}/></span>
              <span className="min-w-0"><span className="block text-sm font-semibold text-slate-900 dark:text-white">Prof. Dr. Muhammad Zarin</span><span className="block text-xs text-slate-500 dark:text-slate-300">General · Laparoscopic · Bariatric · Robotic</span></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="border-y border-slate-200 py-12 dark:border-slate-800"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 lg:grid-cols-4 lg:px-24">{STATS.map(({icon:Icon,value,label})=><div key={label} className="text-center"><Icon className="mx-auto text-purple-500" size={21}/><p className="mt-2 text-2xl font-semibold sm:text-3xl">{value}</p><p className="mt-1 text-[10px] uppercase tracking-[.16em] text-slate-400 sm:text-xs">{label}</p></div>)}</div></section>

    <section className="prebuilt-grid py-24 px-6 md:px-16 lg:px-24 xl:px-32"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-semibold tracking-[.2em] text-purple-600 dark:text-purple-400">SPECIALTIES</p><h2 className="mt-3 text-3xl font-semibold">Advanced care, built around the patient</h2><p className="mt-3 text-slate-500 dark:text-slate-300">Hover from right to left, then click any specialty to explore its details.</p></div><div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">{SPECIALTIES.map(item=><InteractiveCard key={item.title} item={item} onClick={()=>setSelected(item)}/>)}</div></section>

    <section className="border-y border-slate-200 bg-slate-50/70 py-24 dark:border-slate-800 dark:bg-gray-950"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-semibold tracking-[.2em] text-cyan-500">GUIDING PRINCIPLES</p><h2 className="mt-3 text-3xl font-semibold">What every patient can expect</h2></div><div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-6 px-6 md:grid-cols-3 lg:px-16">{PRINCIPLES.map(item=><InteractiveCard key={item.title} item={item} onClick={()=>{}}/>)}</div></section>

    <section className="border-y border-slate-200 py-24 dark:border-slate-800"><div className="mx-auto max-w-3xl px-6 text-center"><p className="text-2xl font-semibold leading-relaxed sm:text-3xl">“The goal is not simply to perform an operation. It is to help each patient understand their options and move forward with confidence.”</p><p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-slate-400">Prof. Dr. Muhammad Zarin</p><Link to="/testimonials" className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">Read patient stories <ArrowRight size={15}/></Link></div></section>

    <section className="flex flex-col items-center justify-center px-6 py-20 text-center"><p className="text-xs font-semibold tracking-[.2em] text-purple-600 dark:text-purple-400">YOUR NEXT STEP</p><h2 className="mt-3 text-3xl font-semibold">Ready to discuss your surgical care?</h2><p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-200">Check availability, request an appointment, or contact the clinic team with your questions.</p><div className="mt-8 flex items-center gap-4"><Link to="/availability" className="rounded-full bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700">Check Availability</Link><Link to="/contact" className="rounded-full border border-slate-300 px-6 py-3 dark:border-slate-700">Contact Clinic</Link></div></section>

    {selected && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={()=>setSelected(null)}><div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={e=>e.stopPropagation()}><div className="flex items-start justify-between gap-5"><div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300">{(() => { const Icon = selected.icon; return <Icon size={24}/>; })()}</div><div><p className="text-xs uppercase tracking-widest text-purple-600">Specialty</p><h3 className="text-2xl font-semibold">{selected.title}</h3></div></div><button onClick={()=>setSelected(null)} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close"><X size={20}/></button></div><p className="mt-6 leading-7 text-slate-600 dark:text-slate-300">{selected.detail}</p><Link to="/availability" onClick={()=>setSelected(null)} className="mt-7 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 font-medium text-white">Request an appointment <ArrowRight size={16}/></Link></div></div>}
  </main>;
}
