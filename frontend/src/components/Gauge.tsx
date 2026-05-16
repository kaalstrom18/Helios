"use client";

import { motion } from "framer-motion";

interface GaugeProps {
  label: string;
  value: number; // 0 to 100
  colorClass: "brand-purple" | "brand-blue";
}

export default function Gauge({ label, value, colorClass }: GaugeProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  const strokeColor = colorClass === "brand-purple" ? "var(--color-brand-purple)" : "var(--color-brand-blue)";
  const shadowColor = colorClass === "brand-purple" ? "var(--color-brand-purple-glow)" : "var(--color-brand-blue-glow)";

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-2xl relative overflow-hidden transition-all hover:bg-[var(--color-brand-card-hover)]">
      <h3 className={`text-sm font-semibold mb-4 tracking-wider ${colorClass === "brand-purple" ? "text-glow-purple text-[var(--color-brand-purple-glow)]" : "text-glow-blue text-[var(--color-brand-blue-glow)]"}`}>
        {label}
      </h3>
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
            fill="transparent"
          />
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 10px ${shadowColor})`
            }}
          />
        </svg>
        <div className="text-3xl font-bold text-white z-10">
          {Math.round(value)}%
        </div>
      </div>
    </div>
  );
}
