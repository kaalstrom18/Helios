"use client";

import { motion } from "framer-motion";

interface RamProps {
  total: number;
  used: number;
  available: number;
  percent: number;
}

export default function RamInfographic({ total, used, available, percent }: RamProps) {
  // Convert from bytes to GB
  const toGB = (bytes: number) => (bytes / 1024 / 1024 / 1024).toFixed(1);
  
  const totalGB = toGB(total || 1);
  const usedGB = toGB(used || 0);
  const availableGB = toGB(available || 0);

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-6 relative overflow-hidden transition-all hover:bg-[var(--color-brand-card-hover)]">
      <h3 className="text-sm font-semibold mb-6 tracking-wider flex justify-between">
        <span className="text-glow-purple text-[var(--color-brand-purple-glow)]">RAM ALLOCATION</span>
        <span className="text-white bg-[var(--color-brand-purple)] px-3 py-1 rounded-full text-xs shadow-[0_0_10px_var(--color-brand-purple-dim)]">{percent}% USED</span>
      </h3>
      
      {/* Visual Bar */}
      <div className="h-4 w-full bg-[rgba(0,0,0,0.3)] rounded-full overflow-hidden flex relative border border-[var(--color-brand-border)]">
        <motion.div 
          className="h-full bg-[var(--color-brand-purple)] shadow-[0_0_15px_var(--color-brand-purple)]"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <div className="absolute top-0 left-0 w-full h-full flex items-center px-2">
          {/* Subtle grid lines for aesthetic */}
          <div className="w-1/4 h-full border-r border-[rgba(255,255,255,0.05)]"></div>
          <div className="w-1/4 h-full border-r border-[rgba(255,255,255,0.05)]"></div>
          <div className="w-1/4 h-full border-r border-[rgba(255,255,255,0.05)]"></div>
        </div>
      </div>

      {/* Legend & Stats */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6 text-sm">
        <div>
          <div className="text-[#94a3b8] text-xs font-medium mb-1 tracking-wider">CONSUMED</div>
          <div className="text-[var(--color-brand-purple-glow)] font-bold text-lg">{usedGB} <span className="text-xs font-normal">GB</span></div>
        </div>
        <div className="text-right">
          <div className="text-[#94a3b8] text-xs font-medium mb-1 tracking-wider">AVAILABLE</div>
          <div className="text-[#3b82f6] font-bold text-lg text-glow-blue">{availableGB} <span className="text-xs font-normal">GB</span></div>
        </div>
        <div className="sm:text-right sm:border-l border-[var(--color-brand-border)] sm:pl-6">
          <div className="text-[#94a3b8] text-xs font-medium mb-1 tracking-wider">CAPACITY</div>
          <div className="text-white font-bold text-lg">{totalGB} <span className="text-xs font-normal">GB</span></div>
        </div>
      </div>
    </div>
  );
}
