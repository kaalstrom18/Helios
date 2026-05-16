"use client";

import { Monitor, Cpu, Battery, HardDrive } from "lucide-react";

interface SystemSpecsProps {
  system?: { hostname: string; os: string };
  cpu?: { count: number; total: number; cores: number[] };
  battery?: { percent: number; plugged_in: boolean };
  storage?: { free: number; total: number };
}

export default function SystemSpecsInfographic({ system, cpu, battery, storage }: SystemSpecsProps) {
  const freeGB = storage?.free ? (storage.free / 1024 / 1024 / 1024).toFixed(1) : "0";
  const totalGB = storage?.total ? (storage.total / 1024 / 1024 / 1024).toFixed(1) : "0";

  return (
    <div className="glass-panel rounded-2xl p-6">
      <h3 className="text-sm font-semibold mb-6 text-[#cbd5e1] border-b border-[var(--color-brand-border)] pb-3 flex items-center gap-2 tracking-wider">
        <Monitor className="w-4 h-4 text-[var(--color-brand-blue-glow)]" /> SYSTEM IDENTIFICATION
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Hostname & OS */}
        <div className="bg-[rgba(0,0,0,0.2)] p-4 rounded-xl border border-[var(--color-brand-border)] flex flex-col justify-center transition-all hover:bg-[rgba(255,255,255,0.02)]">
          <div className="text-xs text-[#94a3b8] mb-1 font-medium tracking-wider">NODE // HOSTNAME</div>
          <div className="text-[var(--color-brand-purple-glow)] font-bold text-lg truncate">
            {system?.hostname || "UNKNOWN"}
          </div>
          <div className="text-xs text-[#64748b] mt-2 font-mono">{system?.os || "Loading OS..."}</div>
        </div>

        {/* Core Architecture */}
        <div className="bg-[rgba(0,0,0,0.2)] p-4 rounded-xl border border-[var(--color-brand-border)] flex flex-col justify-center transition-all hover:bg-[rgba(255,255,255,0.02)]">
          <div className="text-xs text-[#94a3b8] mb-1 font-medium tracking-wider flex items-center gap-1">
            <Cpu className="w-3 h-3" /> ARCHITECTURE
          </div>
          <div className="text-white font-bold text-lg">
            {cpu?.count || 0} LOGICAL CORES
          </div>
          <div className="flex gap-1 mt-3 flex-wrap">
            {cpu?.cores?.map((load, i) => (
              <div 
                key={i} 
                className="w-2 h-2 rounded-sm" 
                style={{ backgroundColor: load > 80 ? '#ef4444' : load > 50 ? 'var(--color-brand-purple)' : 'var(--color-brand-blue)' }}
                title={`Core ${i}: ${load}%`}
              />
            ))}
          </div>
        </div>

        {/* Storage Summary */}
        <div className="bg-[rgba(0,0,0,0.2)] p-4 rounded-xl border border-[var(--color-brand-border)] flex flex-col justify-center transition-all hover:bg-[rgba(255,255,255,0.02)]">
          <div className="text-xs text-[#94a3b8] mb-1 font-medium tracking-wider flex items-center gap-1">
            <HardDrive className="w-3 h-3" /> PRIMARY DRIVE FREE
          </div>
          <div className="text-[var(--color-brand-blue-glow)] font-bold text-xl">
            {freeGB} <span className="text-sm font-normal">GB</span>
          </div>
          <div className="text-xs text-[#64748b] mt-1 font-mono">OF {totalGB} GB TOTAL</div>
        </div>

        {/* Power State */}
        <div className="bg-[rgba(0,0,0,0.2)] p-4 rounded-xl border border-[var(--color-brand-border)] flex flex-col justify-center transition-all hover:bg-[rgba(255,255,255,0.02)]">
          <div className="text-xs text-[#94a3b8] mb-1 font-medium tracking-wider flex items-center gap-1">
            <Battery className="w-3 h-3" /> POWER STATE
          </div>
          <div className={`font-bold text-lg ${battery?.plugged_in ? 'text-[#10b981]' : 'text-[var(--color-brand-purple-glow)]'}`}>
            {battery?.plugged_in ? "A/C CONNECTED" : "DISCHARGING"}
          </div>
          <div className="text-xs text-[#64748b] mt-1 font-mono">CAPACITY: {battery?.percent || 0}%</div>
        </div>
      </div>
    </div>
  );
}
