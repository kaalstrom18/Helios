"use client";

import { Activity, Wrench, Cpu } from "lucide-react";

export type ViewState = "dashboard" | "troubleshooter" | "advisor";

interface NavigationProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const tabs = [
    { id: "dashboard", label: "System Analyzer", icon: Activity },
    { id: "troubleshooter", label: "Troubleshooter", icon: Wrench },
    { id: "advisor", label: "Build Advisor", icon: Cpu },
  ] as const;

  return (
    <div className="flex gap-2 mb-2 p-1 bg-[var(--color-brand-card)] rounded-xl border border-[var(--color-brand-border)] w-full sm:w-fit mx-auto sm:mx-0 overflow-x-auto whitespace-nowrap snap-x">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id as ViewState)}
            className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm transition-all rounded-lg relative ${
              isActive 
                ? "bg-[var(--color-brand-purple)] text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)]" 
                : "text-[#94a3b8] hover:text-white hover:bg-[var(--color-brand-card-hover)]"
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
