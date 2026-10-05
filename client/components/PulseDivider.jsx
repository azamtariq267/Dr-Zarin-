import React from "react";

export default function PulseDivider({ label, dark = false, align = "center" }) {
  const justify = align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";
  return (
    <div className={`flex items-center gap-3 ${justify}`}>
      <span className={`h-px w-8 sm:w-14 ${dark ? "bg-white/20" : "bg-white/20"}`} />
      <svg width="46" height="16" viewBox="0 0 46 16" fill="none" aria-hidden="true">
        <path d="M0 8H13L17 2.5L23.5 14L27.5 8H46" stroke={dark ? "#5FC3D1" : "#5FC3D1"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {label && <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.22em] text-[#5FC3D1]">{label}</span>}
      <span className={`h-px w-8 sm:w-14 ${dark ? "bg-white/20" : "bg-white/20"}`} />
    </div>
  );
}
