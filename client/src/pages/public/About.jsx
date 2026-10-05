import React from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Award,
  Building2,
  HeartHandshake,
  Target,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import PulseDivider from "../../../components/PulseDivider";
import logo from "../../assets/logo.png";

const TIMELINE = [
  {
    year: "MBBS",
    title: "Medical Degree",
    text: "Foundational medical training, graduating with distinction before entering surgical residency.",
    icon: GraduationCap,
  },
  {
    year: "FCPS",
    title: "Fellowship in General Surgery",
    text: "Postgraduate surgical fellowship, with focused training in advanced abdominal and laparoscopic procedures.",
    icon: Award,
  },
  {
    year: "Advanced Training",
    title: "Bariatric &amp; Robotic Surgery",
    text: "Specialized training in bariatric surgery and robotic-assisted surgical systems.",
    icon: Sparkles,
  },
  {
    year: "Present",
    title: "Northwest General Hospital, Peshawar",
    text: "Practicing as a General, Laparoscopic, Bariatric and Robotic Surgeon.",
    icon: Building2,
  },
];

const VALUES = [
  {
    icon: Target,
    title: "Precision",
    text: "Every procedure is planned in detail and executed with exacting surgical technique.",
  },
  {
    icon: HeartHandshake,
    title: "Compassion",
    text: "Patients are informed, heard and supported at every stage of their care.",
  },
  {
    icon: Sparkles,
    title: "Innovation",
    text: "Modern minimally-invasive and robotic methods, chosen when they genuinely benefit the patient.",
  },
];

const About = () => {
  return (
    <div>
      {/* Intro */}
      <section className="mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <PulseDivider label="About Dr. Zarin" align="left" />
            <h1 className="font-display mt-6 text-3xl font-semibold leading-tight text-slate-800 dark:text-white sm:text-4xl lg:text-5xl">
              A surgeon focused on outcomes, not just operations.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Prof. Dr. Muhammad Zarin is a General, Laparoscopic, Bariatric and Robotic
              Surgeon practicing at Northwest General Hospital, Peshawar. His approach
              combines rigorous surgical planning with plain-language communication, so
              patients understand their condition, their options and what recovery will
              actually look like.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Over the course of his practice, he has treated thousands of patients across
              general, minimally invasive, weight-loss and robotic-assisted surgery &mdash;
              always guided by the same three principles: precision, compassion and
              innovation.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-purple-600 px-7 py-3.5 text-sm font-semibold text-slate-800 dark:text-white transition hover:bg-purple-700"
            >
              Get in Touch
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative flex h-72 w-72 items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-900/30 sm:h-96 sm:w-96">
              <img src={logo} alt="Prof. Dr. Muhammad Zarin" className="h-56 w-56 object-contain sm:h-72 sm:w-72" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 dark:bg-slate-900/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <PulseDivider label="Guiding Principles" />
            <h2 className="font-display mt-5 text-3xl font-semibold text-slate-800 dark:text-white">
              What every patient can expect
            </h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-purple-500/60"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-950/5 text-slate-800 transition-colors duration-300 group-hover:bg-purple-600 group-hover:text-white dark:bg-white/10 dark:text-white dark:group-hover:bg-purple-500">
                  <Icon size={22} />
                </div>
                <h3 className="font-display mt-5 text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <PulseDivider label="Education &amp; Experience" />
          <h2 className="font-display mt-5 text-3xl font-semibold text-slate-800 dark:text-white">
            Training built for complex surgery
          </h2>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-6 top-0 h-full w-px bg-slate-200 dark:bg-slate-800 sm:left-1/2" />
          <div className="flex flex-col gap-12">
            {TIMELINE.map(({ year, title, text, icon: Icon }, i) => (
              <div
                key={title}
                className={`relative flex flex-col gap-4 sm:flex-row sm:items-center ${
                  i % 2 === 1 ? "sm:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 pl-16 sm:pl-0">
                  <div
                    className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-6 shadow-sm ${
                      i % 2 === 1 ? "sm:text-left" : "sm:text-right"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-purple-600 dark:text-purple-400">
                      {year}
                    </p>
                    <h3 className="font-display mt-1 text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-300">{text}</p>
                  </div>
                </div>
                <div className="absolute left-6 top-6 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-purple-600 text-slate-800 dark:text-white sm:left-1/2 sm:top-1/2 sm:-translate-y-1/2">
                  <Icon size={14} />
                </div>
                <div className="hidden flex-1 sm:block" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
