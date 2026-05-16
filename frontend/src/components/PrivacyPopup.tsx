"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, X } from "lucide-react";

export default function PrivacyPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("helios_privacy_acknowledged");
    if (!hasSeenPopup) {
      setTimeout(() => setIsVisible(true), 50);
    }
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem("helios_privacy_acknowledged", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel p-6 md:p-8 rounded-2xl max-w-md w-full relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={handleAcknowledge}
          className="absolute top-4 right-4 text-[#94a3b8] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-[var(--color-brand-purple)]/20 rounded-full">
            <ShieldAlert className="w-8 h-8 text-[var(--color-brand-purple-glow)]" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">Privacy Notice</h2>
        </div>
        
        <div className="space-y-4 text-sm text-[#cbd5e1] mb-8 leading-relaxed">
          <p>
            Welcome to Helios AI. We take your privacy seriously.
          </p>
          <p className="font-semibold text-white">
            Only system telemetry (CPU, RAM, Storage, Battery) is collected and displayed.
          </p>
          <p>
            We do <span className="text-[#ef4444] font-bold">NOT</span> access your personal files, browsing history, or documents. Your system hardware data is only used to provide accurate diagnostics and build recommendations.
          </p>
        </div>
        
        <button 
          onClick={handleAcknowledge}
          className="w-full py-3 bg-[var(--color-brand-purple)] hover:bg-[var(--color-brand-purple-dim)] text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)]"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}
